import { type NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import Stripe from "stripe"

// Initialize Stripe with proper error handling
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-06-20",
    })
  : null

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!stripe) {
      console.error("Stripe not configured - missing STRIPE_SECRET_KEY")
      return NextResponse.json({ error: "Payment processing not available" }, { status: 503 })
    }

    // Verify authentication
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse request body
    let body
    try {
      body = await request.json()
    } catch (error) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const { invoiceId, amount } = body

    // Validate required fields
    if (!invoiceId || !amount) {
      return NextResponse.json({ error: "Missing required fields: invoiceId and amount" }, { status: 400 })
    }

    // Validate amount
    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 })
    }

    // Convert amount to cents
    const unitAmountCents = Math.round(amount * 100)

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Inner Clarity Inc. - Invoice ${invoiceId}`,
              description: "Mental Health Services",
            },
            unit_amount: unitAmountCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/billing?success=true&invoice=${invoiceId}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/billing?canceled=true`,
      metadata: {
        invoiceId: invoiceId.toString(),
        userId: token.sub!,
        tenantId: token.tenantId || "inner-clarity",
        originalAmount: amount.toString(),
      },
      customer_email: token.email || undefined,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Stripe payment error:", error)

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json({ error: "Payment processing failed", details: error.message }, { status: 500 })
    }

    return NextResponse.json({ error: "Payment processing failed" }, { status: 500 })
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json({ error: "Method not allowed. Use POST." }, { status: 405 })
}
