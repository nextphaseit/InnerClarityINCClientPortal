# Stripe Webhook Setup Guide

## 🔧 Environment Configuration

Add these environment variables to your `.env.local`:

\`\`\`bash
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
\`\`\`

## 🌐 Webhook Endpoint

**URL:** `https://your-domain.com/api/stripe/webhook`
**Method:** `POST`
**Events:** `checkout.session.completed`

## 🛠️ Setup with Stripe CLI (Development)

1. Install Stripe CLI:
\`\`\`bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows
scoop install stripe

# Linux
wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_X.X.X_linux_x86_64.tar.gz
\`\`\`

2. Login to Stripe:
\`\`\`bash
stripe login
\`\`\`

3. Forward webhooks to local development:
\`\`\`bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
\`\`\`

4. Copy the webhook secret from the CLI output and add to `.env.local`

## 🌍 Setup with Stripe Dashboard (Production)

1. Go to [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter your webhook URL: `https://your-domain.com/api/stripe/webhook`
4. Select events: `checkout.session.completed`
5. Copy the webhook secret and add to your environment variables

## 🧪 Testing

1. Run the test script:
\`\`\`bash
node scripts/test-webhook.js
\`\`\`

2. Create a test checkout session and complete payment
3. Check your Supabase `payments` table for the new record
4. Monitor webhook logs in your application console

## 🔍 Debugging

- Check webhook delivery attempts in Stripe Dashboard
- Monitor application logs for webhook processing
- Verify environment variables are set correctly
- Ensure Supabase service role key has proper permissions

## 📊 Webhook Data Flow

1. Customer completes Stripe checkout
2. Stripe sends `checkout.session.completed` event
3. Webhook verifies signature and extracts data
4. System looks up patient by email
5. Payment record inserted into Supabase
6. Related invoice marked as paid (if applicable)
