import { type NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get("stripe-signature")

    if (!signature) {
      console.error("Missing Stripe signature")
      return NextResponse.json({ error: "Missing signature" }, { status: 400 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error("Webhook signature verification failed:", err)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutSessionCompleted(session)
        break

      case "payment_intent.succeeded":
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentIntentSucceeded(paymentIntent)
        break

      case "payment_intent.payment_failed":
        const failedPayment = event.data.object as Stripe.PaymentIntent
        await handlePaymentIntentFailed(failedPayment)
        break

      case "customer.subscription.created":
      case "customer.subscription.updated":
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionChange(subscription)
        break

      case "customer.subscription.deleted":
        const deletedSubscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(deletedSubscription)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    // Update payment record
    const { error: paymentError } = await supabase
      .from("payments")
      .update({
        stripe_payment_intent_id: session.payment_intent as string,
        status: "succeeded",
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_session_id", session.id)

    if (paymentError) {
      console.error("Error updating payment record:", paymentError)
    }

    // Update invoice status if applicable
    if (session.metadata?.invoice_id) {
      const { error: invoiceError } = await supabase
        .from("invoices")
        .update({
          status: "paid",
          paid_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("invoice_number", session.metadata.invoice_id)

      if (invoiceError) {
        console.error("Error updating invoice:", invoiceError)
      }
    }

    console.log("Checkout session completed:", session.id)
  } catch (error) {
    console.error("Error handling checkout session completed:", error)
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    const { error } = await supabase
      .from("payments")
      .update({
        status: "succeeded",
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_payment_intent_id", paymentIntent.id)

    if (error) {
      console.error("Error updating payment status:", error)
    }

    console.log("Payment succeeded:", paymentIntent.id)
  } catch (error) {
    console.error("Error handling payment intent succeeded:", error)
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    const { error } = await supabase
      .from("payments")
      .update({
        status: "failed",
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_payment_intent_id", paymentIntent.id)

    if (error) {
      console.error("Error updating payment status:", error)
    }

    console.log("Payment failed:", paymentIntent.id)
  } catch (error) {
    console.error("Error handling payment intent failed:", error)
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  try {
    const customer = await stripe.customers.retrieve(subscription.customer as string)

    if (customer.deleted) {
      console.error("Customer was deleted")
      return
    }

    const patientId = customer.metadata?.patient_id

    if (!patientId) {
      console.error("No patient ID found in customer metadata")
      return
    }

    const { error } = await supabase
      .from("autopay_settings")
      .update({
        stripe_subscription_id: subscription.id,
        is_active: subscription.status === "active",
        next_payment_date: new Date(subscription.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("patient_id", patientId)

    if (error) {
      console.error("Error updating autopay settings:", error)
    }

    console.log("Subscription updated:", subscription.id)
  } catch (error) {
    console.error("Error handling subscription change:", error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const customer = await stripe.customers.retrieve(subscription.customer as string)

    if (customer.deleted) {
      console.error("Customer was deleted")
      return
    }

    const patientId = customer.metadata?.patient_id

    if (!patientId) {
      console.error("No patient ID found in customer metadata")
      return
    }

    const { error } = await supabase
      .from("autopay_settings")
      .update({
        is_active: false,
        stripe_subscription_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq("patient_id", patientId)

    if (error) {
      console.error("Error updating autopay settings:", error)
    }

    console.log("Subscription deleted:", subscription.id)
  } catch (error) {
    console.error("Error handling subscription deletion:", error)
  }
}
