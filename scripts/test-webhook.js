// Test script to verify webhook endpoint
// Run with: node scripts/test-webhook.js

const testWebhook = async () => {
  const webhookUrl = "http://localhost:3000/api/stripe/webhook"

  console.log("🧪 Testing webhook endpoint...")

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        test: "webhook connectivity",
      }),
    })

    console.log("📡 Response status:", response.status)

    if (response.status === 400) {
      console.log("✅ Webhook endpoint is responding (expected 400 for missing signature)")
    } else {
      console.log("⚠️ Unexpected response status")
    }
  } catch (error) {
    console.error("❌ Webhook test failed:", error)
  }
}

testWebhook()
