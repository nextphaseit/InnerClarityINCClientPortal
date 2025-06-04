import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const config = {
      auth0: {
        configured: !!(process.env.AUTH0_CLIENT_ID && process.env.AUTH0_CLIENT_SECRET && process.env.AUTH0_DOMAIN),
        domain: process.env.AUTH0_DOMAIN ? `${process.env.AUTH0_DOMAIN}` : null,
        clientId: process.env.AUTH0_CLIENT_ID ? "***configured***" : null,
      },
      microsoft: {
        configured: !!(
          process.env.MICROSOFT_CLIENT_ID &&
          process.env.MICROSOFT_CLIENT_SECRET &&
          process.env.MICROSOFT_TENANT_ID
        ),
        tenantId: process.env.MICROSOFT_TENANT_ID ? "***configured***" : null,
        clientId: process.env.MICROSOFT_CLIENT_ID ? "***configured***" : null,
      },
      nextauth: {
        url: process.env.NEXTAUTH_URL || "not configured",
        secret: process.env.NEXTAUTH_SECRET ? "***configured***" : "not configured",
      },
    }

    console.log("🔧 Auth configuration check:", config)

    return NextResponse.json({
      success: true,
      config,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Config check error:", error)
    return NextResponse.json({ error: "Configuration check failed" }, { status: 500 })
  }
}
