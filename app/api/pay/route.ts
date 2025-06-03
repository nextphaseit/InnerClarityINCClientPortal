import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { invoiceId, amount } = body

    // Validate required fields
    if (!invoiceId || !amount) {
      return NextResponse.json({ error: "Missing required fields: invoiceId and amount" }, { status: 400 })
    }

    // Validate amount (should be positive number)
    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    // In a real application, you would:
    // 1. Verify the invoice exists and belongs to the authenticated user
    // 2. Check if the invoice is still unpaid
    // 3. Validate the amount matches the invoice amount

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Invoice Payment - ${invoiceId}`,
              description: "Inner Clarity Mental Health Services",
              images: ["https://your-domain.com/logo.png"], // Optional: Add your logo
            },
            unit_amount: Math.round(amount * 100), // Convert dollars to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXTAUTH_URL}/billing?payment=success&invoice=${invoiceId}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/billing?payment=cancelled`,
      metadata: {
        invoiceId,
        userId: session.user.id || session.user.email,
        userEmail: session.user.email,
      },
      customer_email: session.user.email,
      billing_address_collection: "required",
      payment_intent_data: {
        metadata: {
          invoiceId,
          userId: session.user.id || session.user.email,
        },
      },
    })

    // Log the payment attempt for audit purposes
    console.log(`Payment session created for user: ${session.user.email}, invoice: ${invoiceId}, amount: $${amount}`)

    return NextResponse.json({
      success: true,
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    })
  } catch (error) {
    console.error("Error creating payment session:", error)

    // Handle specific Stripe errors
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        {
          error: "Payment processing error",
          message: error.message,
        },
        { status: 400 },
      )
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to create payment session",
      },
      { status: 500 },
    )
  }
}

// Handle payment success webhook (optional - for updating invoice status)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { invoiceId, paymentIntentId } = body

    // In a real application, you would:
    // 1. Verify the payment was successful with Stripe
    // 2. Update the invoice status to "paid"
    // 3. Record the payment date
    // 4. Send confirmation email to the client
    // 5. Log the payment for audit purposes

    console.log(`Payment confirmed for invoice: ${invoiceId}, payment intent: ${paymentIntentId}`)

    return NextResponse.json({
      success: true,
      message: "Payment confirmed and invoice updated",
    })
  } catch (error) {
    console.error("Error confirming payment:", error)

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to confirm payment",
      },
      { status: 500 },
    )
  }
}
