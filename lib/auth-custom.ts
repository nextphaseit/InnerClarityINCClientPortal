import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "your-secret-key-here-make-it-long-and-secure")

export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "client"
}

// Production-ready user database simulation
// In production, replace with actual database queries
const users: User[] = [
  {
    id: "admin-1",
    email: "admin@innerclarity.com",
    name: "Dr. Sarah Johnson",
    role: "admin",
  },
  {
    id: "client-1",
    email: "client@example.com",
    name: "John Smith",
    role: "client",
  },
  {
    id: "client-2",
    email: "jane@example.com",
    name: "Jane Doe",
    role: "client",
  },
  {
    id: "demo-admin",
    email: "demo.admin@innerclarity.com",
    name: "Demo Administrator",
    role: "admin",
  },
  {
    id: "demo-client",
    email: "demo.client@innerclarity.com",
    name: "Demo Client",
    role: "client",
  },
]

export async function authenticate(email: string, password: string): Promise<User | null> {
  try {
    // Demo authentication - in production, use proper password hashing (bcrypt, etc.)
    if (password === "password123" || password === "demo123") {
      const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
      return user || null
    }
    return null
  } catch (error) {
    console.error("Authentication error:", error)
    return null
  }
}

export async function createSession(user: User) {
  try {
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(secret)

    const cookieStore = await cookies()
    cookieStore.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    })

    return token
  } catch (error) {
    console.error("Session creation error:", error)
    throw error
  }
}

export async function getSession(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("session")?.value

    if (!token) return null

    const { payload } = await jwtVerify(token, secret)

    // Reconstruct user from payload
    const user: User = {
      id: payload.userId as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as "admin" | "client",
    }

    return user
  } catch (error) {
    console.error("Session verification error:", error)
    return null
  }
}

export async function destroySession() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete("session")
  } catch (error) {
    console.error("Session destruction error:", error)
    throw error
  }
}

export async function refreshSession(user: User) {
  try {
    await createSession(user)
  } catch (error) {
    console.error("Session refresh error:", error)
    throw error
  }
}
