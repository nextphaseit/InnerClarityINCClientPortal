import { type NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { Client } from "@microsoft/microsoft-graph-client"

// Simple auth provider for Microsoft Graph
class TokenAuthProvider {
  private accessToken: string

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  async getAccessToken(): Promise<string> {
    return this.accessToken
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    if (!token || token.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action") || "profile"

    // Check if we have an access token
    if (!token.accessToken) {
      return NextResponse.json({ error: "No access token available" }, { status: 401 })
    }

    const authProvider = new TokenAuthProvider(token.accessToken as string)
    const graphClient = Client.initWithMiddleware({ authProvider })

    let result

    switch (action) {
      case "profile":
        result = await graphClient.api("/me").get()
        break

      case "calendar":
        result = await graphClient.api("/me/events").top(10).get()
        break

      case "messages":
        result = await graphClient.api("/me/messages").top(10).get()
        break

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error("Microsoft Graph API error:", error)
    return NextResponse.json({ error: "Failed to fetch data from Microsoft Graph" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    if (!token || token.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!token.accessToken) {
      return NextResponse.json({ error: "No access token available" }, { status: 401 })
    }

    let body
    try {
      body = await request.json()
    } catch (error) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const { action, data } = body

    const authProvider = new TokenAuthProvider(token.accessToken as string)
    const graphClient = Client.initWithMiddleware({ authProvider })

    let result

    switch (action) {
      case "send_email":
        if (!data.to || !data.subject || !data.body) {
          return NextResponse.json({ error: "Missing required email fields" }, { status: 400 })
        }

        result = await graphClient.api("/me/sendMail").post({
          message: {
            subject: data.subject,
            body: {
              contentType: "HTML",
              content: data.body,
            },
            toRecipients: [
              {
                emailAddress: {
                  address: data.to,
                },
              },
            ],
          },
        })
        break

      case "create_event":
        if (!data.subject || !data.startTime || !data.endTime) {
          return NextResponse.json({ error: "Missing required event fields" }, { status: 400 })
        }

        result = await graphClient.api("/me/events").post({
          subject: data.subject,
          start: {
            dateTime: data.startTime,
            timeZone: "UTC",
          },
          end: {
            dateTime: data.endTime,
            timeZone: "UTC",
          },
          attendees: data.attendees?.map((email: string) => ({
            emailAddress: { address: email },
          })),
        })
        break

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error("Microsoft Graph API error:", error)
    return NextResponse.json({ error: "Failed to perform action" }, { status: 500 })
  }
}
