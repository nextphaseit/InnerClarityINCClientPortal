import { type NextRequest, NextResponse } from "next/server"
import { Client } from "@microsoft/microsoft-graph-client"
import type { AuthenticationProvider } from "@microsoft/microsoft-graph-client"

// Simple auth provider for Microsoft Graph
class SimpleAuthProvider implements AuthenticationProvider {
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
    const { searchParams } = new URL(request.url)
    const accessToken = searchParams.get("access_token")

    if (!accessToken) {
      return NextResponse.json({ error: "Access token required" }, { status: 401 })
    }

    const authProvider = new SimpleAuthProvider(accessToken)
    const graphClient = Client.initWithMiddleware({ authProvider })

    // Example: Get user profile
    const user = await graphClient.api("/me").get()

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        displayName: user.displayName,
        mail: user.mail,
        userPrincipalName: user.userPrincipalName,
      },
    })
  } catch (error) {
    console.error("Microsoft Graph API error:", error)
    return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { accessToken, action, data } = await request.json()

    if (!accessToken) {
      return NextResponse.json({ error: "Access token required" }, { status: 401 })
    }

    const authProvider = new SimpleAuthProvider(accessToken)
    const graphClient = Client.initWithMiddleware({ authProvider })

    let result

    switch (action) {
      case "send_email":
        result = await graphClient.api("/me/sendMail").post({
          message: {
            subject: data.subject,
            body: {
              contentType: "Text",
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

      case "create_calendar_event":
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

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error("Microsoft Graph API error:", error)
    return NextResponse.json({ error: "API request failed" }, { status: 500 })
  }
}
