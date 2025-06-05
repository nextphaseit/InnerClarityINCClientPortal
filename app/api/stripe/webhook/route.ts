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

    // Handle only checkout.session.completed events
    if (event.type === "checkout.session.completed") {
      console.log("💳 Processing checkout.session.completed event")

      const session = event.data.object as Stripe.Checkout.Session

      // Extract required data from the session
      const { customer_email, amount_total, payment_status, payment_intent, created } = session

      console.log("📊 Session data:", {
        customer_email,
        amount_total,
        payment_status,
        payment_intent,
        created,
        session_id: session.id,
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

      try {
        // Find the patient profile by email
        console.log("🔍 Looking up patient by email:", customer_email)

        const { data: profile, error: profileError } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("email", customer_email)
          .single()

        if (profileError || !profile) {
          console.error("❌ Patient profile not found:", profileError)
          // Still log the payment but without patient_id
          console.log("⚠️ Proceeding without patient_id")
        }

        // Prepare payment data
        const paymentData = {
          id: payment_intent as string, // Use payment_intent as primary key
          patient_id: profile?.id || null,
          email: customer_email,
          amount: amount_total / 100, // Convert from cents to dollars
          currency: session.currency || "usd",
          status: payment_status || "succeeded",
          payment_status: payment_status,
          stripe_payment_intent_id: payment_intent as string,
          stripe_checkout_session_id: session.id,
          description: `Payment for checkout session ${session.id}`,
          created_at: new Date(created * 1000).toISOString(), // Convert Unix timestamp
          updated_at: new Date().toISOString(),
        }

        console.log("💾 Inserting payment record:", paymentData)

        // Insert payment record into Supabase
        const { data: payment, error: paymentError } = await supabaseAdmin
          .from("payments")
          .insert(paymentData)
          .select()
          .single()

        if (paymentError) {
          console.error("❌ Failed to insert payment:", paymentError)

          // If it's a duplicate key error, try to update instead
          if (paymentError.code === "23505") {
            console.log("🔄 Payment already exists, updating instead")

            const { data: updatedPayment, error: updateError } = await supabaseAdmin
              .from("payments")
              .update({
                status: payment_status || "succeeded",
                payment_status: payment_status,
                updated_at: new Date().toISOString(),
              })
              .eq("stripe_payment_intent_id", payment_intent as string)
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

        // If we have a patient_id, update any related invoices
        if (profile?.id && session.metadata?.invoice_id) {
          console.log("📄 Updating related invoice:", session.metadata.invoice_id)

          const { error: invoiceError } = await supabaseAdmin
            .from("invoices")
            .update({
              status: "paid",
              paid_date: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("invoice_number", session.metadata.invoice_id)
            .eq("patient_id", profile.id)

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
          },
          { status: 200 },
        )
      } catch (dbError) {
        console.error("❌ Database operation failed:", dbError)
        return NextResponse.json({ error: "Database operation failed" }, { status: 500 })
      }
    } else {
      // Log other event types but don't process them
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
