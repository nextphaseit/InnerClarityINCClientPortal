import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

const SignInPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Sign In</h2>
        <form>
          <div className="mb-4">
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              placeholder="Email"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-6">
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              id="password"
              placeholder="Password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="flex items-center justify-between">
            <Button
              className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Sign In
            </Button>
            <Link
              href="/auth/signup"
              className="inline-block align-baseline font-bold text-sm text-purple-500 hover:text-purple-800"
            >
              Create an Account
            </Link>
          </div>
        </form>

        {/* Forgot Password Link */}
        <div className="mt-4 text-center">
          <Link href="/auth/reset-password" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
            Forgot your password?
          </Link>
        </div>

        <footer className="text-center mt-8">
          <p className="text-gray-500 text-xs">&copy; {new Date().getFullYear()} Your Company. All rights reserved.</p>
        </footer>
      </div>
    </div>
  )
}

export default SignInPage
