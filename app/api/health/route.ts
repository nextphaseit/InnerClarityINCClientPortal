import { NextResponse } from "next/server"
import { validateProductionConfig } from "@/lib/env-config"

export async function GET() {
  try {
    // Validate configuration
    validateProductionConfig()

    const healthCheck = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      version: "1.0.0",
      services: {
        database: "connected", // Add actual DB check
        auth: "configured",
        payments: "configured",
      },
    }

    return NextResponse.json(healthCheck)
  } catch (error) {
    console.error("Health check failed:", error)

    return NextResponse.json(
      {
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
