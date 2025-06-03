import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json()
    const { invoiceId, amount } = body

    // Validate required fields
    if (!invoiceId || !amount) {
      return NextResponse.json({ error: "Missing required fields: invoiceId and amount" }, { status: 400 })
    }

    // Validate amount is a positive number
    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 })
    }

    // Convert amount from dollars to cents (rounded)
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
              name: `Invoice ${invoiceId}`,
              description: "Inner Clarity Mental Health Services",
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
        originalAmount: amount.toString(),
      },
    })

    // Return the session URL for redirect
    return NextResponse.json({
      url: session.url,
    })
  } catch (error) {
    console.error("Stripe error:", error)

    // Handle Stripe-specific errors
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json({ error: "Failed to create payment session", details: error.message }, { status: 500 })
    }

    // Handle other errors
    return NextResponse.json({ error: "Failed to create payment session" }, { status: 500 })
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json({ error: "Method not allowed. Use POST." }, { status: 405 })
}

export async function PUT() {
  return NextResponse.json({ error: "Method not allowed. Use POST." }, { status: 405 })
}

export async function DELETE() {
  return NextResponse.json({ error: "Method not allowed. Use POST." }, { status: 405 })
}
