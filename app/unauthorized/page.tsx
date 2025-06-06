"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 backdrop-blur-sm bg-white/95">
        <CardHeader className="space-y-4 text-center pb-6">
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-orange-700 rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold text-slate-800">Access Denied</CardTitle>
            <CardDescription className="text-slate-600">
              You don't have permission to access this resource
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pb-8 text-center">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              This area is restricted to administrators only. If you believe you should have access, please contact your
              system administrator.
            </p>
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/auth/signin">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Link>
            </Button>
          </div>

          <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
            <p className="font-medium mb-1">Need Help?</p>
            <p>Contact support@nextphaseit.org</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
