"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Navigation } from "@/components/navigation"
import { useAuth } from "@/components/auth-provider"
import { Settings, Bell, Shield, Lock, Save } from "lucide-react"

export default function SettingsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    appointmentReminders: true,
    marketingEmails: false,
    twoFactorAuth: false,
    sessionTimeout: "30",
    language: "en",
    timezone: "America/New_York",
    theme: "system",
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/signin")
      return
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-clarity-blue-500"></div>
      </div>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle settings update
    console.log("Updating settings:", settings)
  }

  const handleSwitchChange = (field: string, value: boolean) => {
    setSettings((prev) => ({ ...prev, [field]: value }))
  }

  const handleSelectChange = (field: string, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your account preferences and security settings.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Receive notifications via email</p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(value) => handleSwitchChange("emailNotifications", value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="smsNotifications">SMS Notifications</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Receive notifications via text message</p>
                </div>
                <Switch
                  id="smsNotifications"
                  checked={settings.smsNotifications}
                  onCheckedChange={(value) => handleSwitchChange("smsNotifications", value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="appointmentReminders">Appointment Reminders</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Get reminders before your appointments</p>
                </div>
                <Switch
                  id="appointmentReminders"
                  checked={settings.appointmentReminders}
                  onCheckedChange={(value) => handleSwitchChange("appointmentReminders", value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="marketingEmails">Marketing Communications</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receive updates about new features and services
                  </p>
                </div>
                <Switch
                  id="marketingEmails"
                  checked={settings.marketingEmails}
                  onCheckedChange={(value) => handleSwitchChange("marketingEmails", value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Switch
                  id="twoFactorAuth"
                  checked={settings.twoFactorAuth}
                  onCheckedChange={(value) => handleSwitchChange("twoFactorAuth", value)}
                />
              </div>

              <div>
                <Label htmlFor="sessionTimeout">Session Timeout</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Automatically sign out after period of inactivity
                </p>
                <Select
                  value={settings.sessionTimeout}
                  onValueChange={(value) => handleSelectChange("sessionTimeout", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4">
                <Button variant="outline">
                  <Lock className="mr-2 h-4 w-4" />
                  Change Password
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="language">Language</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Choose your preferred language</p>
                <Select value={settings.language} onValueChange={(value) => handleSelectChange("language", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="timezone">Timezone</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Set your local timezone for appointments
                </p>
                <Select value={settings.timezone} onValueChange={(value) => handleSelectChange("timezone", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                    <SelectItem value="America/Chicago">Central Time</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="theme">Theme</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Choose your preferred theme</p>
                <Select value={settings.theme} onValueChange={(value) => handleSelectChange("theme", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </Button>
          </div>
        </form>

        {/* HIPAA Notice */}
        <Card className="mt-8 hipaa-secure">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-clarity-blue-600" />
              <div>
                <p className="text-sm font-medium">Privacy & Security</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  All settings and preferences are stored securely and comply with HIPAA regulations. Your privacy is
                  our priority.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
