import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { patientId, billingCycle = "monthly" } = await request.json()

    if (!patientId) {
      return NextResponse.json({ error: "Patient ID is required" }, { status: 400 })
    }

    // Get patient profile
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

    // Create Stripe customer portal session for autopay setup
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomer.id,
      return_url: `${process.env.NEXTAUTH_URL}/portal/billing?autopay=setup`,
    })

    // Store or update autopay settings
    const { error: autopayError } = await supabase.from("autopay_settings").upsert({
      patient_id: patientId,
      stripe_customer_id: stripeCustomer.id,
      billing_cycle: billingCycle,
      is_active: false, // Will be activated after customer sets up payment method
    })

    if (autopayError) {
      console.error("Error storing autopay settings:", autopayError)
    }

    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    console.error("Error setting up autopay:", error)
    return NextResponse.json({ error: "Failed to setup autopay" }, { status: 500 })
  }
}
