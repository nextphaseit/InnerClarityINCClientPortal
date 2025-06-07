"use client"

export const dynamic = "force-dynamic"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Save, User, Phone, MapPin, Shield, AlertCircle, Camera, Upload, Loader2 } from "lucide-react"

interface Profile {
  id: string
  user_id?: string
  client_id?: string
  email?: string
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
  avatar_url?: string
  updated_at: string
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (status !== "loading") {
      if (!session) {
        router.push("/portal/auth/signin")
      } else if (session?.user) {
        loadProfile()
      }
    }
  }, [session, status, router])

  const loadProfile = async () => {
    if (!session?.user?.id) return

    try {
      setLoading(true)
      console.log("Loading profile for user:", session.user.id)

      // Try to get profile by id first
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single()

      if (profileError) {
        console.log("No profile found with id match, trying alternative columns")

        // Try alternative columns
        const { data: altProfileData, error: altProfileError } = await supabase
          .from("profiles")
          .select("*")
          .or(`user_id.eq.${session.user.id},client_id.eq.${session.user.id}`)
          .single()

        if (altProfileError) {
          console.log("No profile found with any column match, creating default")
          await createDefaultProfile()
        } else if (altProfileData) {
          console.log("Profile found with alternative column match")
          setProfile(altProfileData)
        }
      } else if (profileData) {
        console.log("Profile found with id match")
        setProfile(profileData)
      } else {
        console.log("No profile found, creating default")
        await createDefaultProfile()
      }
    } catch (error) {
      console.error("Error loading profile:", error)
      setError("Unable to connect to database.")
      await createDefaultProfile()
    } finally {
      setLoading(false)
    }
  }

  const createDefaultProfile = async () => {
    if (!session?.user) return

    const defaultProfile: Profile = {
      id: session.user.id,
      user_id: session.user.id,
      client_id: session.user.id,
      email: session.user.email || "",
      full_name: session.user.name || session.user.email?.split("@")[0] || "",
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
      avatar_url: session.user.image,
      updated_at: new Date().toISOString(),
    }

    try {
      console.log("Creating default profile:", defaultProfile)

      // Try to insert the default profile
      const { error: insertError } = await supabase.from("profiles").insert(defaultProfile)

      if (insertError) {
        console.error("Error creating default profile:", insertError)
      } else {
        console.log("Default profile created successfully")
      }
    } catch (error) {
      console.error("Error inserting profile:", error)
    }

    setProfile(defaultProfile)
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !session?.user?.id) return

    setUploading(true)
    setError("")

    try {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("File size must be less than 5MB")
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        throw new Error("File must be an image")
      }

      // Simple file name to avoid path issues
      const fileExt = file.name.split(".").pop()
      const fileName = `avatar-${Date.now()}.${fileExt}`

      console.log("🔄 Uploading file:", fileName)

      // Upload with simpler path
      const { data: uploadData, error: uploadError } = await supabase.storage.from("avatars").upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
      })

      if (uploadError) {
        console.error("❌ Upload error:", uploadError)
        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      console.log("✅ Upload successful:", uploadData)

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(fileName)

      console.log("🔗 Public URL:", publicUrl)

      // Update profile with new avatar URL
      const updatedProfile = { ...profile, avatar_url: publicUrl }
      setProfile(updatedProfile)

      // Save to database
      const { error: updateError } = await supabase.from("profiles").upsert({
        ...updatedProfile,
        updated_at: new Date().toISOString(),
      })

      if (updateError) {
        console.error("❌ Profile update error:", updateError)
        throw new Error(`Profile update failed: ${updateError.message}`)
      }

      console.log("✅ Profile updated successfully")
      setMessage("Profile picture uploaded successfully!")
      setTimeout(() => setMessage(""), 3000)
    } catch (error: any) {
      console.error("❌ Error uploading image:", error)
      setError(`Error uploading image: ${error.message || "Please try again."}`)
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!profile || !session?.user?.id) return

    setSaving(true)
    setMessage("")
    setError("")

    try {
      console.log("Saving profile:", profile)

      const { error: saveError } = await supabase.from("profiles").upsert({
        ...profile,
        updated_at: new Date().toISOString(),
      })

      if (saveError) {
        console.error("❌ Save error:", saveError)
        throw new Error(`Save failed: ${saveError.message}`)
      }

      console.log("✅ Profile saved successfully")
      setMessage("Profile updated successfully!")
      setTimeout(() => setMessage(""), 3000)
    } catch (error: any) {
      console.error("Error saving profile:", error)
      setError(`Error saving profile: ${error.message || "Please try again."}`)
    } finally {
      setSaving(false)
    }
  }

  const updateProfile = (field: keyof Profile, value: string) => {
    if (!profile) return
    setProfile({ ...profile, [field]: value })
  }

  // Handle loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-teal-600" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    )
  }

  // Handle unauthenticated state
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-lg">
          <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">Please sign in to view your profile.</p>
          <Button onClick={() => router.push("/portal/auth/signin")} className="bg-teal-600 hover:bg-teal-700">
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Profile Settings</h1>
          <p className="text-slate-600">Manage your personal information and preferences</p>
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {message && (
          <div className="mb-6 p-4 rounded-lg bg-green-50 text-green-700 border border-green-200">{message}</div>
        )}

        <div className="space-y-6">
          {/* Profile Picture */}
          <Card className="backdrop-blur-sm bg-white/70 border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-slate-800">
                <Camera className="h-5 w-5 mr-2" />
                Profile Picture
              </CardTitle>
              <CardDescription>Upload a profile picture to personalize your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  {profile?.avatar_url ? (
                    <Image
                      src={profile.avatar_url || "/placeholder.svg"}
                      alt="Profile picture"
                      width={100}
                      height={100}
                      className="rounded-full object-cover border-4 border-white shadow-lg"
                      onError={() => {
                        // Fallback if image fails to load
                        setProfile((prev) => (prev ? { ...prev, avatar_url: undefined } : null))
                      }}
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                      <User className="h-12 w-12 text-white" />
                    </div>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    </div>
                  )}
                </div>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    variant="outline"
                    className="bg-white/50"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? "Uploading..." : "Upload Picture"}
                  </Button>
                  <p className="text-sm text-slate-500 mt-2">JPG, PNG or GIF. Max size 5MB.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card className="backdrop-blur-sm bg-white/70 border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-slate-800">
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
                    className="bg-white/50"
                  />
                </div>
                <div>
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input
                    id="date_of_birth"
                    type="date"
                    value={profile?.date_of_birth || ""}
                    onChange={(e) => updateProfile("date_of_birth", e.target.value)}
                    className="bg-white/50"
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
                  className="bg-white/50"
                />
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card className="backdrop-blur-sm bg-white/70 border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-slate-800">
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
                  className="bg-white/50"
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
                    className="bg-white/50"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={profile?.state || ""}
                    onChange={(e) => updateProfile("state", e.target.value)}
                    placeholder="State"
                    className="bg-white/50"
                  />
                </div>
                <div>
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input
                    id="zip"
                    value={profile?.zip || ""}
                    onChange={(e) => updateProfile("zip", e.target.value)}
                    placeholder="12345"
                    className="bg-white/50"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Insurance Information */}
          <Card className="backdrop-blur-sm bg-white/70 border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-slate-800">
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
                    className="bg-white/50"
                  />
                </div>
                <div>
                  <Label htmlFor="insurance_id">Insurance ID</Label>
                  <Input
                    id="insurance_id"
                    value={profile?.insurance_id || ""}
                    onChange={(e) => updateProfile("insurance_id", e.target.value)}
                    placeholder="ABC123456789"
                    className="bg-white/50"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card className="backdrop-blur-sm bg-white/70 border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-slate-800">
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
                    className="bg-white/50"
                  />
                </div>
                <div>
                  <Label htmlFor="emergency_contact_phone">Contact Phone</Label>
                  <Input
                    id="emergency_contact_phone"
                    value={profile?.emergency_contact_phone || ""}
                    onChange={(e) => updateProfile("emergency_contact_phone", e.target.value)}
                    placeholder="(555) 987-6543"
                    className="bg-white/50"
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
                  className="bg-white/50"
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} className="bg-teal-600 hover:bg-teal-700 text-white">
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
  )
}
