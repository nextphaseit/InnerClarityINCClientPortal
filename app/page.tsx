import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-blue-50 to-white">
      <div className="text-center space-y-6 max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">NextPhase IT Admin Portal</h1>
        <p className="text-xl text-gray-600">Secure administrative access for NextPhase IT and Inner Clarity Inc</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
            <Link href="/admin/login">Admin Login</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/admin/dashboard">Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
