import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"

const secret = new TextEncoder().encode("your-secret-key-here-make-it-long-and-secure")

export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "client"
}

// Mock user database
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
]

export async function authenticate(email: string, password: string): Promise<User | null> {
  // Simple password check - in production, use proper password hashing
  if (password === "password123") {
    const user = users.find((u) => u.email === email)
    return user || null
  }
  return null
}

export async function createSession(user: User) {
  const token = await new SignJWT({ userId: user.id, email: user.email, role: user.role })
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
  })

  return token
}

export async function getSession(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("session")?.value

    if (!token) return null

    const { payload } = await jwtVerify(token, secret)
    const user = users.find((u) => u.id === payload.userId)

    return user || null
  } catch (error) {
    return null
  }
}

export async function destroySession() {
  const cookieStore = await cookies()
  cookieStore.delete("session")
}
