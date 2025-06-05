"use client"

import Link from "next/link"
import { ArrowLeft, Shield, ExternalLink, Info, CheckCircle } from "lucide-react"

export default function PasswordResetGuidePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 w-16 h-16 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Password Reset Guide</h1>
          <p className="text-gray-600">Complete guide to resetting your Microsoft account password for Inner Clarity</p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden">
          <div className="p-8">
            {/* Method 1: Self-Service Reset */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                Method 1: Self-Service Password Reset (Recommended)
              </h2>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-green-800">
                  <strong>Best Option:</strong> Use Microsoft's self-service password reset if you have it set up.
                </p>
              </div>
              <ol className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full mr-3 mt-0.5">
                    1
                  </span>
                  <div>
                    <p className="font-medium">Go to Microsoft Sign-In Page</p>
                    <p className="text-sm text-gray-600">
                      Visit the Microsoft sign-in page and click "Forgot my password"
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full mr-3 mt-0.5">
                    2
                  </span>
                  <div>
                    <p className="font-medium">Enter Your Work Email</p>
                    <p className="text-sm text-gray-600">
                      Use your @innerclarity.org, @innerclarityinc.com, or @nextphaseit.org email
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full mr-3 mt-0.5">
                    3
                  </span>
                  <div>
                    <p className="font-medium">Complete Verification</p>
                    <p className="text-sm text-gray-600">
                      Use your phone, alternate email, or authenticator app to verify your identity
                    </p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full mr-3 mt-0.5">
                    4
                  </span>
                  <div>
                    <p className="font-medium">Create New Password</p>
                    <p className="text-sm text-gray-600">
                      Follow Microsoft's password requirements and create a strong password
                    </p>
                  </div>
                </li>
              </ol>
              <div className="mt-4">
                <a
                  href="https://account.microsoft.com/account/Account"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <span>Go to Microsoft Account</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Method 2: IT Support */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Info className="h-5 w-5 text-blue-500 mr-2" />
                Method 2: Contact IT Support
              </h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>If self-service doesn't work:</strong> Contact your IT administrator for assistance.
                </p>
              </div>
              <div className="space-y-3 text-gray-700">
                <div className="flex items-start">
                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full mr-3 mt-0.5">
                    1
                  </span>
                  <div>
                    <p className="font-medium">Email IT Support</p>
                    <p className="text-sm text-gray-600">
                      Send an email to{" "}
                      <a href="mailto:support@innerclarityinc.com" className="text-purple-600 hover:text-purple-700">
                        support@innerclarityinc.com
                      </a>
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full mr-3 mt-0.5">
                    2
                  </span>
                  <div>
                    <p className="font-medium">Provide Information</p>
                    <p className="text-sm text-gray-600">
                      Include your full name, work email, and employee ID if available
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full mr-3 mt-0.5">
                    3
                  </span>
                  <div>
                    <p className="font-medium">Verify Identity</p>
                    <p className="text-sm text-gray-600">
                      Be prepared to verify your identity through approved methods
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Password Requirements</h2>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-800 font-medium mb-2">
                  Your new password must meet these requirements:
                </p>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• At least 8 characters long</li>
                  <li>• Contains uppercase and lowercase letters</li>
                  <li>• Contains at least one number</li>
                  <li>• Contains at least one special character</li>
                  <li>• Cannot be a previously used password</li>
                  <li>• Cannot contain your name or email</li>
                </ul>
              </div>
            </div>

            {/* Security Tips */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Security Best Practices</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h3 className="font-medium text-purple-900 mb-2">Strong Passwords</h3>
                  <ul className="text-sm text-purple-800 space-y-1">
                    <li>• Use a unique password</li>
                    <li>• Consider a passphrase</li>
                    <li>• Use a password manager</li>
                  </ul>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-medium text-green-900 mb-2">Two-Factor Authentication</h3>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Enable 2FA on your account</li>
                    <li>• Use Microsoft Authenticator</li>
                    <li>• Keep backup codes safe</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/auth/reset-password"
                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-all text-center"
              >
                Start Password Reset
              </Link>
              <Link
                href="/auth/signin"
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors text-center inline-flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
