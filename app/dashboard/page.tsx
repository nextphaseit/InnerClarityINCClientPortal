"use client"

export const dynamic = "force-dynamic"

import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import ProtectedRoute from "@/components/protected-route"
import { LogOut, User, Mail, Calendar } from "lucide-react"

export default function DashboardPage() {
  // Use safer destructuring pattern to prevent build errors
  const session = useSession()
  const sessionData = session?.data
  const status = session?.status || "loading"

  // Handle loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Handle unauthenticated state
  if (!sessionData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => (window.location.href = "/auth/signin")} className="w-full">
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" })
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <Button onClick={handleSignOut} variant="outline">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>

          {/* User Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Profile Information</span>
              </CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={sessionData.user?.image || ""} />
                  <AvatarFallback>{sessionData.user?.name?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">{sessionData.user?.name || "Unknown User"}</h3>
                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                    <Mail className="h-4 w-4" />
                    <span>{sessionData.user?.email || "No email"}</span>
                  </div>
                  <Badge variant="secondary">{sessionData.user?.role || "User"}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Session Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Session Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">User ID:</span>
                  <p className="text-gray-600 dark:text-gray-400 break-all">{sessionData.user?.id || "N/A"}</p>
                </div>
                <div>
                  <span className="font-medium">Provider:</span>
                  <p className="text-gray-600 dark:text-gray-400">{sessionData.user?.provider || "N/A"}</p>
                </div>
                <div>
                  <span className="font-medium">Role:</span>
                  <p className="text-gray-600 dark:text-gray-400">{sessionData.user?.role || "N/A"}</p>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <p className="text-green-600 dark:text-green-400">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and navigation</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-20 flex flex-col space-y-2"
                onClick={() => (window.location.href = "/admin/dashboard")}
              >
                <User className="h-6 w-6" />
                <span>Admin Portal</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col space-y-2"
                onClick={() => (window.location.href = "/portal/dashboard")}
              >
                <Calendar className="h-6 w-6" />
                <span>Patient Portal</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col space-y-2"
                onClick={() => (window.location.href = "/profile")}
              >
                <Mail className="h-6 w-6" />
                <span>Profile Settings</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
