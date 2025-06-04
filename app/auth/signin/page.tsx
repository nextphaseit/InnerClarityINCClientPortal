"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn } from "next-auth/react"
import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const signInResponse = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (signInResponse?.error) {
        toast.error("Invalid credentials")
      } else {
        toast.success("Signed in successfully!")
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Error signing in:", error)
      toast.error("An error occurred while signing in.")
    }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <Card className="w-[450px] bg-white shadow-md rounded-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Sign In</CardTitle>
          <CardDescription className="text-sm text-gray-500 text-center">
            Enter your email and password to sign in
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="m@example.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={handleSubmit}>Sign In</Button>
        </CardFooter>
        <div className="text-center text-gray-500 text-sm py-2">
          For assistance, please contact:
          <br />
          Phone: (984) 274-3723
          <br />
          Email: support@innerclarityinc.com
          <br />
          Address: 508 River Dell Townes Ave, Clayton, NC
        </div>
      </Card>
    </div>
  )
}
