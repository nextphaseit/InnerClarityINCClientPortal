"use client"

import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import ProtectedRoute from "@/components/protected-route"
import { LogOut, User, Mail, Calendar } from "lucide-react"

export default function DashboardPage() {
  const { data: session } = useSession()

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
              <CardDescription>Your account details from Microsoft Entra ID</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={session?.user?.image || ""} />
                  <AvatarFallback>{session?.user?.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">{session?.user?.name || "Unknown User"}</h3>
                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                    <Mail className="h-4 w-4" />
                    <span>{session?.user?.email || "No email"}</span>
                  </div>
                  <Badge variant="secondary">{session?.provider || "Unknown Provider"}</Badge>
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
                  <p className="text-gray-600 dark:text-gray-400 break-all">{session?.user?.id || "N/A"}</p>
                </div>
                <div>
                  <span className="font-medium">Provider:</span>
                  <p className="text-gray-600 dark:text-gray-400">{session?.provider || "N/A"}</p>
                </div>
                <div>
                  <span className="font-medium">Access Token:</span>
                  <p className="text-gray-600 dark:text-gray-400 break-all">
                    {session?.accessToken ? "Present" : "Not available"}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Expires At:</span>
                  <p className="text-gray-600 dark:text-gray-400">
                    {session?.expiresAt ? new Date(session.expiresAt * 1000).toLocaleString() : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
