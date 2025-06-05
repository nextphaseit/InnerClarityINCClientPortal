import { Loader2 } from "lucide-react"

export default function SignInLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-purple-600" />
        <p className="text-lg font-medium text-gray-700">Loading authentication...</p>
      </div>
    </div>
  )
}
