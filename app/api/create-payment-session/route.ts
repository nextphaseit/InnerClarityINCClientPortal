import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { amount, description, invoiceId, patientId } = await request.json()

    if (!amount || !patientId) {
      return NextResponse.json({ error: "Amount and patient ID are required" }, { status: 400 })
    }

    // Get patient profile for customer info
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", patientId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: "Patient profile not found" }, { status: 404 })
    }

    // Create or get Stripe customer
    let stripeCustomer
    const existingCustomers = await stripe.customers.list({
      email: profile.email,
      limit: 1,
    })

    if (existingCustomers.data.length > 0) {
      stripeCustomer = existingCustomers.data[0]
    } else {
      stripeCustomer = await stripe.customers.create({
        email: profile.email,
        name: profile.full_name || profile.email,
        metadata: {
          patient_id: patientId,
        },
      })
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomer.id,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: description || "Medical Services Payment",
              description: invoiceId ? `Invoice: ${invoiceId}` : "Payment for medical services",
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXTAUTH_URL}/portal/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/portal/billing?canceled=true`,
      metadata: {
        patient_id: patientId,
        invoice_id: invoiceId || "",
      },
    })

    // Store payment record in database
    const { error: paymentError } = await supabase.from("payments").insert({
      patient_id: patientId,
      stripe_session_id: session.id,
      amount: amount,
      status: "pending",
      description: description || "Medical Services Payment",
      invoice_id: invoiceId,
    })

    if (paymentError) {
      console.error("Error storing payment record:", paymentError)
    }

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error("Error creating payment session:", error)
    return NextResponse.json({ error: "Failed to create payment session" }, { status: 500 })
  }
}
