import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import Stripe from "stripe"

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export async function POST(request: NextRequest) {
  try {
    console.log("🔐 Creating customer portal session...")

    // Initialize Supabase client
    const supabase = createRouteHandlerClient({ cookies })

    // Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("❌ Authentication failed:", authError)
      return NextResponse.json({ error: "Unauthorized - Please log in" }, { status: 401 })
    }

    console.log("✅ User authenticated:", user.email)

    // Get user's profile to find Stripe customer ID
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("stripe_customer_id, email")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.error("❌ Error fetching user profile:", profileError)
    }

    // Use email from profile or auth user
    const customerEmail = profile?.email || user.email

    if (!customerEmail) {
      console.error("❌ No email found for user")
      return NextResponse.json({ error: "User email not found" }, { status: 400 })
    }

    let customerId = profile?.stripe_customer_id

    // If no customer ID in profile, try to find or create Stripe customer
    if (!customerId) {
      console.log("🔍 No customer ID found, searching Stripe for existing customer...")

      // Search for existing customer by email
      const existingCustomers = await stripe.customers.list({
        email: customerEmail,
        limit: 1,
      })

      if (existingCustomers.data.length > 0) {
        customerId = existingCustomers.data[0].id
        console.log("✅ Found existing Stripe customer:", customerId)

        // Update profile with found customer ID
        await supabase.from("profiles").update({ stripe_customer_id: customerId }).eq("id", user.id)
      } else {
        console.log("🆕 Creating new Stripe customer...")

        // Create new Stripe customer
        const customer = await stripe.customers.create({
          email: customerEmail,
          metadata: {
            supabase_user_id: user.id,
          },
        })

        customerId = customer.id
        console.log("✅ Created new Stripe customer:", customerId)

        // Update profile with new customer ID
        await supabase.from("profiles").update({ stripe_customer_id: customerId }).eq("id", user.id)
      }
    }

    if (!customerId) {
      console.error("❌ Failed to get or create Stripe customer")
      return NextResponse.json({ error: "Failed to create customer portal session" }, { status: 500 })
    }

    console.log("🎫 Creating billing portal session for customer:", customerId)

    // Create the billing portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXTAUTH_URL || "https://patients.nextphaseit.org"}/portal/billing`,
    })

    console.log("✅ Portal session created successfully:", portalSession.id)

    return NextResponse.json({
      url: portalSession.url,
      success: true,
    })
  } catch (error) {
    console.error("❌ Error creating customer portal session:", error)

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        {
          error: `Stripe error: ${error.message}`,
          type: error.type,
        },
        { status: 500 },
      )
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// Handle GET requests (optional - for testing)
export async function GET() {
  return NextResponse.json(
    {
      error: "Method not allowed. Use POST to create a customer portal session.",
    },
    { status: 405 },
  )
}
