import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white">404</h1>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">Page Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400">The page you're looking for doesn't exist</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Oops! Page Not Found</CardTitle>
            <CardDescription>
              The page you're trying to access might have been moved, deleted, or doesn't exist.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Link>
              </Button>

              <Button asChild variant="outline" className="w-full">
                <Link href="/auth/signin">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Sign In
                </Link>
              </Button>
            </div>

            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              <p>Need help? Contact support at:</p>
              <p className="font-medium">support@innerclarityinc.com</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
