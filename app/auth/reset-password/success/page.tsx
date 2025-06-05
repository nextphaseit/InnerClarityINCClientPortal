"use client"

import Link from "next/link"
import { CheckCircle, Shield, ExternalLink } from "lucide-react"

export default function ResetPasswordSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-purple-100">
        <div className="text-center">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 w-16 h-16 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>

          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Password Reset Complete</h1>
          <p className="text-gray-600 mb-6">
            Your password has been successfully reset. You can now sign in with your new password.
          </p>

          {/* Next Steps */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-800 font-medium mb-2">What's Next?</p>
            <ul className="text-sm text-green-700 space-y-1 text-left">
              <li>• Use your new password to sign in</li>
              <li>• Update your password manager</li>
              <li>• Consider enabling two-factor authentication</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <Link
              href="/auth/signin"
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all inline-block text-center"
            >
              Sign In Now
            </Link>

            <a
              href="https://account.microsoft.com/security"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors inline-flex items-center justify-center space-x-2"
            >
              <span>Manage Microsoft Account</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          {/* Support */}
          <div className="mt-6 text-sm text-gray-500">
            Need help? Contact{" "}
            <a href="mailto:support@innerclarityinc.com" className="text-purple-600 hover:text-purple-700">
              support@innerclarityinc.com
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
