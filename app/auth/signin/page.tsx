"use client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Heart, ArrowRight } from "lucide-react"

export default function AuthPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-slate-800">Inner Clarity Inc</h1>
          <p className="text-xl text-slate-600">Choose your portal to continue</p>
        </div>

        {/* Portal Selection */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Patient Portal Card */}
          <Card className="shadow-xl border-0 hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] cursor-pointer group">
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-green-600 to-teal-700 rounded-3xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <Heart className="h-10 w-10 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-slate-800">Patient Portal</CardTitle>
              <CardDescription className="text-slate-600 text-lg">
                Access your health records, appointments, and secure messaging
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  View appointment history
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Secure messaging with providers
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Access health documents
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  Manage billing and payments
                </li>
              </ul>
              <Button
                onClick={() => router.push("/portal/auth/signin")}
                className="w-full h-12 bg-gradient-to-r from-green-600 to-teal-700 hover:from-green-700 hover:to-teal-800 text-white shadow-lg"
                size="lg"
              >
                Patient Sign In
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Admin Portal Card */}
          <Card className="shadow-xl border-0 hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] cursor-pointer group">
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <Shield className="h-10 w-10 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-slate-800">Admin Portal</CardTitle>
              <CardDescription className="text-slate-600 text-lg">
                Manage clients, appointments, and practice operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Client management system
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Appointment scheduling
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Document management
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  Practice analytics
                </li>
              </ul>
              <Button
                onClick={() => router.push("/admin/login")}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-lg"
                size="lg"
              >
                Admin Sign In
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center space-y-4 pt-8">
          <div className="bg-white border-l-4 border-l-teal-500 rounded-lg p-4 max-w-md mx-auto">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-teal-600" />
              <div>
                <p className="text-sm font-medium">HIPAA Compliant</p>
                <p className="text-xs text-slate-600">Your privacy and security are protected</p>
              </div>
            </div>
          </div>

          <div className="text-center text-slate-500 text-xs leading-relaxed">
            <p className="font-medium mb-1">Need assistance?</p>
            <p>Phone: (984) 274-3723 • Email: support@innerclarityinc.com</p>
            <p>Address: 508 River Dell Townes Ave, Clayton, NC</p>
          </div>
        </div>
      </div>
    </div>
  )
}
