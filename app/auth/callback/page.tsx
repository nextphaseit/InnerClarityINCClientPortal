"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function CallbackPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return

    if (session) {
      if (session.user?.role === "admin") {
        router.push("/admin")
      } else {
        router.push("/dashboard")
      }
    } else {
      router.push("/auth/signin")
    }
  }, [session, status, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-clarity-blue-50 to-clarity-green-50 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <Image
          src="/images/inner-clarity-logo.png"
          alt="Inner Clarity"
          width={80}
          height={80}
          className="h-20 w-auto mx-auto mb-4"
        />
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-clarity-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Completing sign in...</p>
      </div>
    </div>
  )
}
