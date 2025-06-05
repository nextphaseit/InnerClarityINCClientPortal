import { type NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

// Get webhook secret from environment
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

// Initialize Supabase admin client for webhook operations
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function POST(request: NextRequest) {
  console.log("🔔 Stripe webhook received")

  try {
    // Get the raw body for signature verification
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get("stripe-signature")

    // Validate webhook signature
    if (!signature) {
      console.error("❌ Missing Stripe signature")
      return NextResponse.json({ error: "Missing signature" }, { status: 400 })
    }

    if (!webhookSecret) {
      console.error("❌ Missing webhook secret in environment")
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 })
    }

    let event: Stripe.Event

    try {
      // Verify the webhook signature
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
      console.log("✅ Webhook signature verified")
    } catch (err) {
      console.error("❌ Webhook signature verification failed:", err)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    // Handle checkout.session.completed events
    if (event.type === "checkout.session.completed") {
      console.log("💳 Processing checkout.session.completed event")

      const session = event.data.object as Stripe.Checkout.Session

      // Extract required data from the session
      const { customer_email, amount_total, payment_status, payment_intent, customer, created, currency } = session

      console.log("📊 Session data:", {
        customer_email,
        amount_total,
        payment_status,
        payment_intent,
        customer,
        session_id: session.id,
        currency,
      })

      // Validate required fields
      if (!customer_email) {
        console.error("❌ Missing customer_email in session")
        return NextResponse.json({ error: "Missing customer email" }, { status: 400 })
      }

      if (!amount_total) {
        console.error("❌ Missing amount_total in session")
        return NextResponse.json({ error: "Missing amount total" }, { status: 400 })
      }

      if (!payment_intent) {
        console.error("❌ Missing payment_intent in session")
        return NextResponse.json({ error: "Missing payment intent" }, { status: 400 })
      }

      try {
        // Find the patient by email in auth.users
        console.log("🔍 Looking up patient by email:", customer_email)

        const { data: user, error: userError } = await supabaseAdmin.auth.admin.listUsers()

        if (userError) {
          console.error("❌ Error fetching users:", userError)
          return NextResponse.json({ error: "Failed to lookup user" }, { status: 500 })
        }

        // Find user by email
        const patient = user.users.find((u) => u.email === customer_email)

        if (!patient) {
          console.error("❌ Patient not found for email:", customer_email)
          // Continue without patient_id - we'll store the payment anyway
        }

        // Prepare payment data according to our new schema
        const paymentData = {
          patient_id: patient?.id || null,
          email: customer_email,
          amount: amount_total, // Already in cents from Stripe
          currency: currency || "usd",
          status: payment_status === "paid" ? "paid" : "pending",
          stripe_payment_intent: payment_intent as string,
          stripe_customer_id: customer as string,
          stripe_session_id: session.id,
          description: `Payment for checkout session ${session.id}`,
          payment_method: "card", // Default for checkout sessions
        }

        console.log("💾 Inserting payment record:", paymentData)

        // Insert payment record into Supabase using service role
        const { data: payment, error: paymentError } = await supabaseAdmin
          .from("payments")
          .insert(paymentData)
          .select()
          .single()

        if (paymentError) {
          console.error("❌ Failed to insert payment:", paymentError)

          // If it's a duplicate key error, try to update instead
          if (paymentError.code === "23505") {
            console.log("🔄 Payment already exists, updating status")

            const { data: updatedPayment, error: updateError } = await supabaseAdmin
              .from("payments")
              .update({
                status: payment_status === "paid" ? "paid" : "pending",
                updated_at: new Date().toISOString(),
              })
              .eq("stripe_payment_intent", payment_intent as string)
              .select()
              .single()

            if (updateError) {
              console.error("❌ Failed to update payment:", updateError)
              return NextResponse.json({ error: "Failed to update payment record" }, { status: 500 })
            }

            console.log("✅ Payment updated successfully:", updatedPayment)
          } else {
            return NextResponse.json({ error: "Failed to insert payment record" }, { status: 500 })
          }
        } else {
          console.log("✅ Payment inserted successfully:", payment)
        }

        // Update related invoices if metadata contains invoice info
        if (patient?.id && session.metadata?.invoice_id) {
          console.log("📄 Updating related invoice:", session.metadata.invoice_id)

          const { error: invoiceError } = await supabaseAdmin
            .from("invoices")
            .update({
              status: "paid",
              paid_date: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("invoice_number", session.metadata.invoice_id)
            .eq("patient_id", patient.id)

          if (invoiceError) {
            console.error("⚠️ Failed to update invoice:", invoiceError)
            // Don't fail the webhook for invoice update errors
          } else {
            console.log("✅ Invoice updated successfully")
          }
        }

        console.log("🎉 Webhook processed successfully")
        return NextResponse.json(
          {
            received: true,
            payment_id: payment_intent,
            status: "success",
          },
          { status: 200 },
        )
      } catch (dbError) {
        console.error("❌ Database operation failed:", dbError)
        return NextResponse.json({ error: "Database operation failed" }, { status: 500 })
      }
    }

    // Handle payment_intent.succeeded events (for additional confirmation)
    else if (event.type === "payment_intent.succeeded") {
      console.log("💰 Processing payment_intent.succeeded event")

      const paymentIntent = event.data.object as Stripe.PaymentIntent

      // Update payment status to ensure it's marked as paid
      const { error: updateError } = await supabaseAdmin
        .from("payments")
        .update({
          status: "paid",
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_payment_intent", paymentIntent.id)

      if (updateError) {
        console.error("⚠️ Failed to update payment status:", updateError)
      } else {
        console.log("✅ Payment status updated to paid")
      }

      return NextResponse.json({ received: true }, { status: 200 })
    }

    // Handle payment_intent.payment_failed events
    else if (event.type === "payment_intent.payment_failed") {
      console.log("❌ Processing payment_intent.payment_failed event")

      const paymentIntent = event.data.object as Stripe.PaymentIntent

      // Update payment status to failed
      const { error: updateError } = await supabaseAdmin
        .from("payments")
        .update({
          status: "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_payment_intent", paymentIntent.id)

      if (updateError) {
        console.error("⚠️ Failed to update payment status:", updateError)
      } else {
        console.log("✅ Payment status updated to failed")
      }

      return NextResponse.json({ received: true }, { status: 200 })
    }

    // Log other event types but don't process them
    else {
      console.log(`ℹ️ Received unhandled event type: ${event.type}`)
      return NextResponse.json(
        {
          received: true,
          message: `Event type ${event.type} not handled`,
        },
        { status: 200 },
      )
    }
  } catch (error) {
    console.error("💥 Webhook handler error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}

// Disable body parsing for webhook signature verification
export const runtime = "nodejs"
