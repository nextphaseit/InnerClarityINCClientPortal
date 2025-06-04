"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { PortalNavigation } from "@/components/portal-navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save, User, Phone, MapPin, Shield } from "lucide-react"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface Profile {
  id: string
  full_name: string
  phone: string
  address: string
  city: string
  state: string
  zip: string
  insurance_provider: string
  insurance_id: string
  emergency_contact_name: string
  emergency_contact_phone: string
  emergency_contact_relationship: string
  date_of_birth: string
  updated_at: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const router = useRouter()

  useEffect(() => {
    checkAuthAndLoadProfile()
  }, [])

  const checkAuthAndLoadProfile = async () => {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        router.push("/auth/login")
        return
      }

      setUser(user)

      // Load profile data
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (profileError && profileError.code !== "PGRST116") {
        console.error("Error loading profile:", profileError)
      } else if (profileData) {
        setProfile(profileData)
      } else {
        // Create default profile
        const defaultProfile: Partial<Profile> = {
          id: user.id,
          full_name: user.user_metadata?.full_name || "",
          phone: "",
          address: "",
          city: "",
          state: "",
          zip: "",
          insurance_provider: "",
          insurance_id: "",
          emergency_contact_name: "",
          emergency_contact_phone: "",
          emergency_contact_relationship: "",
          date_of_birth: "",
        }
        setProfile(defaultProfile as Profile)
      }
    } catch (error) {
      console.error("Error:", error)
      router.push("/auth/login")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!profile || !user) return

    setSaving(true)
    setMessage("")

    try {
      const { error } = await supabase.from("profiles").upsert({
        ...profile,
        updated_at: new Date().toISOString(),
      })

      if (error) {
        throw error
      }

      setMessage("Profile updated successfully!")
      setTimeout(() => setMessage(""), 3000)
    } catch (error) {
      console.error("Error saving profile:", error)
      setMessage("Error saving profile. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const updateProfile = (field: keyof Profile, value: string) => {
    if (!profile) return
    setProfile({ ...profile, [field]: value })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PortalNavigation />

      <div className="lg:ml-64 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
            <p className="text-gray-600">Manage your personal information and preferences</p>
          </div>

          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.includes("Error") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
              }`}
            >
              {message}
            </div>
          )}

          <div className="space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Personal Information
                </CardTitle>
                <CardDescription>Update your basic personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      value={profile?.full_name || ""}
                      onChange={(e) => updateProfile("full_name", e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="date_of_birth">Date of Birth</Label>
                    <Input
                      id="date_of_birth"
                      type="date"
                      value={profile?.date_of_birth || ""}
                      onChange={(e) => updateProfile("date_of_birth", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profile?.phone || ""}
                    onChange={(e) => updateProfile("phone", e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Address Information
                </CardTitle>
                <CardDescription>Your current residential address</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    value={profile?.address || ""}
                    onChange={(e) => updateProfile("address", e.target.value)}
                    placeholder="123 Main Street"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={profile?.city || ""}
                      onChange={(e) => updateProfile("city", e.target.value)}
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={profile?.state || ""}
                      onChange={(e) => updateProfile("state", e.target.value)}
                      placeholder="State"
                    />
                  </div>
                  <div>
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input
                      id="zip"
                      value={profile?.zip || ""}
                      onChange={(e) => updateProfile("zip", e.target.value)}
                      placeholder="12345"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Insurance Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Insurance Information
                </CardTitle>
                <CardDescription>Your health insurance details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="insurance_provider">Insurance Provider</Label>
                    <Input
                      id="insurance_provider"
                      value={profile?.insurance_provider || ""}
                      onChange={(e) => updateProfile("insurance_provider", e.target.value)}
                      placeholder="Blue Cross Blue Shield"
                    />
                  </div>
                  <div>
                    <Label htmlFor="insurance_id">Insurance ID</Label>
                    <Input
                      id="insurance_id"
                      value={profile?.insurance_id || ""}
                      onChange={(e) => updateProfile("insurance_id", e.target.value)}
                      placeholder="ABC123456789"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="h-5 w-5 mr-2" />
                  Emergency Contact
                </CardTitle>
                <CardDescription>Person to contact in case of emergency</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emergency_contact_name">Contact Name</Label>
                    <Input
                      id="emergency_contact_name"
                      value={profile?.emergency_contact_name || ""}
                      onChange={(e) => updateProfile("emergency_contact_name", e.target.value)}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergency_contact_phone">Contact Phone</Label>
                    <Input
                      id="emergency_contact_phone"
                      value={profile?.emergency_contact_phone || ""}
                      onChange={(e) => updateProfile("emergency_contact_phone", e.target.value)}
                      placeholder="(555) 987-6543"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="emergency_contact_relationship">Relationship</Label>
                  <Input
                    id="emergency_contact_relationship"
                    value={profile?.emergency_contact_relationship || ""}
                    onChange={(e) => updateProfile("emergency_contact_relationship", e.target.value)}
                    placeholder="Spouse, Parent, Sibling, etc."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving} className="bg-teal-600 hover:bg-teal-700">
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
