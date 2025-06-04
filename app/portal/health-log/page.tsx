"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { PortalNavigation } from "@/components/portal-navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Heart, Plus, TrendingUp, Calendar, Smile, Frown, Meh } from "lucide-react"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface HealthLog {
  id: string
  patient_id: string
  date: string
  category: "mood" | "anxiety" | "sleep" | "energy" | "symptoms" | "medication"
  value: number | string
  notes?: string
  created_at: string
}

export default function HealthLogPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [healthLogs, setHealthLogs] = useState<HealthLog[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState("")
  const router = useRouter()

  const [logForm, setLogForm] = useState({
    date: new Date().toISOString().split("T")[0],
    category: "mood" as HealthLog["category"],
    value: "",
    notes: "",
  })

  // Mock health logs data
  const mockHealthLogs: HealthLog[] = [
    {
      id: "1",
      patient_id: "user-id",
      date: "2024-02-10",
      category: "mood",
      value: 7,
      notes: "Feeling much better today after therapy session",
      created_at: "2024-02-10T18:00:00Z",
    },
    {
      id: "2",
      patient_id: "user-id",
      date: "2024-02-10",
      category: "anxiety",
      value: 4,
      notes: "Anxiety levels lower than yesterday",
      created_at: "2024-02-10T18:05:00Z",
    },
    {
      id: "3",
      patient_id: "user-id",
      date: "2024-02-09",
      category: "sleep",
      value: 6,
      notes: "Slept 6 hours, woke up a few times",
      created_at: "2024-02-09T08:00:00Z",
    },
    {
      id: "4",
      patient_id: "user-id",
      date: "2024-02-09",
      category: "mood",
      value: 5,
      notes: "Average day, some ups and downs",
      created_at: "2024-02-09T20:00:00Z",
    },
    {
      id: "5",
      patient_id: "user-id",
      date: "2024-02-08",
      category: "energy",
      value: 8,
      notes: "High energy levels today, very productive",
      created_at: "2024-02-08T19:00:00Z",
    },
  ]

  const categories = [
    { value: "mood", label: "Mood", scale: "1-10 (1=Very Low, 10=Excellent)" },
    { value: "anxiety", label: "Anxiety", scale: "1-10 (1=None, 10=Severe)" },
    { value: "sleep", label: "Sleep Hours", scale: "Hours of sleep" },
    { value: "energy", label: "Energy Level", scale: "1-10 (1=Exhausted, 10=Energetic)" },
    { value: "symptoms", label: "Symptoms", scale: "1-10 (1=None, 10=Severe)" },
    { value: "medication", label: "Medication", scale: "Taken/Not Taken" },
  ]

  useEffect(() => {
    checkAuthAndLoadLogs()
  }, [])

  const checkAuthAndLoadLogs = async () => {
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

      // In a real app, load from Supabase
      // const { data, error } = await supabase
      //   .from('health_logs')
      //   .select('*')
      //   .eq('patient_id', user.id)
      //   .order('date', { ascending: false })

      setHealthLogs(mockHealthLogs)
    } catch (error) {
      console.error("Error:", error)
      router.push("/auth/login")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSubmitting(true)
    setMessage("")

    try {
      // In a real app, save to Supabase
      // const { error } = await supabase.from('health_logs').insert({
      //   patient_id: user.id,
      //   date: logForm.date,
      //   category: logForm.category,
      //   value: logForm.category === 'medication' ? logForm.value : parseFloat(logForm.value),
      //   notes: logForm.notes
      // })

      const newLog: HealthLog = {
        id: Date.now().toString(),
        patient_id: user.id,
        date: logForm.date,
        category: logForm.category,
        value: logForm.category === "medication" ? logForm.value : Number.parseFloat(logForm.value),
        notes: logForm.notes,
        created_at: new Date().toISOString(),
      }

      setHealthLogs([newLog, ...healthLogs])
      setMessage("Health log entry added successfully!")
      setShowAddForm(false)
      setLogForm({
        date: new Date().toISOString().split("T")[0],
        category: "mood",
        value: "",
        notes: "",
      })
    } catch (error) {
      console.error("Error saving health log:", error)
      setMessage("Error saving health log. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const getMoodIcon = (value: number) => {
    if (value >= 7) return <Smile className="h-5 w-5 text-green-500" />
    if (value >= 4) return <Meh className="h-5 w-5 text-yellow-500" />
    return <Frown className="h-5 w-5 text-red-500" />
  }

  const getCategoryBadge = (category: HealthLog["category"]) => {
    const colors = {
      mood: "bg-blue-100 text-blue-800",
      anxiety: "bg-red-100 text-red-800",
      sleep: "bg-purple-100 text-purple-800",
      energy: "bg-green-100 text-green-800",
      symptoms: "bg-orange-100 text-orange-800",
      medication: "bg-gray-100 text-gray-800",
    }

    return <Badge className={colors[category]}>{categories.find((c) => c.value === category)?.label}</Badge>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  const getRecentTrend = (category: HealthLog["category"]) => {
    const categoryLogs = healthLogs
      .filter((log) => log.category === category && typeof log.value === "number")
      .slice(0, 7)
      .reverse()

    if (categoryLogs.length < 2) return null

    const recent = categoryLogs[categoryLogs.length - 1].value as number
    const previous = categoryLogs[categoryLogs.length - 2].value as number
    const trend = recent - previous

    return {
      direction: trend > 0 ? "up" : trend < 0 ? "down" : "stable",
      value: Math.abs(trend),
    }
  }

  const groupedLogs = healthLogs.reduce(
    (acc, log) => {
      if (!acc[log.date]) {
        acc[log.date] = []
      }
      acc[log.date].push(log)
      return acc
    },
    {} as Record<string, HealthLog[]>,
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <PortalNavigation />

      <div className="lg:ml-64 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Health Log</h1>
              <p className="text-slate-600">Track your daily mood, symptoms, and wellness</p>
            </div>
            <Button onClick={() => setShowAddForm(!showAddForm)} className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
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

          {/* Add Entry Form */}
          {showAddForm && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Add Health Log Entry</CardTitle>
                <CardDescription>Record your daily health and wellness data</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={logForm.date}
                        onChange={(e) => setLogForm({ ...logForm, date: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <select
                        id="category"
                        value={logForm.category}
                        onChange={(e) => setLogForm({ ...logForm, category: e.target.value as HealthLog["category"] })}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        required
                      >
                        {categories.map((category) => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="value">Value ({categories.find((c) => c.value === logForm.category)?.scale})</Label>
                    {logForm.category === "medication" ? (
                      <select
                        id="value"
                        value={logForm.value}
                        onChange={(e) => setLogForm({ ...logForm, value: e.target.value })}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select...</option>
                        <option value="Taken">Taken</option>
                        <option value="Not Taken">Not Taken</option>
                        <option value="Partial">Partial</option>
                      </select>
                    ) : (
                      <Input
                        id="value"
                        type="number"
                        min={logForm.category === "sleep" ? 0 : 1}
                        max={logForm.category === "sleep" ? 24 : 10}
                        step={logForm.category === "sleep" ? 0.5 : 1}
                        value={logForm.value}
                        onChange={(e) => setLogForm({ ...logForm, value: e.target.value })}
                        required
                      />
                    )}
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={logForm.notes}
                      onChange={(e) => setLogForm({ ...logForm, notes: e.target.value })}
                      placeholder="Any additional notes about your day or symptoms"
                      rows={3}
                    />
                  </div>

                  <div className="flex space-x-3">
                    <Button type="submit" disabled={submitting} className="bg-teal-600 hover:bg-teal-700">
                      {submitting ? "Saving..." : "Save Entry"}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {["mood", "anxiety", "energy"].map((category) => {
              const recentLog = healthLogs.find((log) => log.category === category && typeof log.value === "number")
              const trend = getRecentTrend(category as HealthLog["category"])

              return (
                <Card key={category}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium capitalize">{category}</CardTitle>
                    <Heart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      <div className="text-2xl font-bold">{recentLog ? recentLog.value : "--"}</div>
                      {category === "mood" &&
                        recentLog &&
                        typeof recentLog.value === "number" &&
                        getMoodIcon(recentLog.value)}
                      {trend && (
                        <div
                          className={`flex items-center text-xs ${
                            trend.direction === "up"
                              ? "text-green-600"
                              : trend.direction === "down"
                                ? "text-red-600"
                                : "text-gray-600"
                          }`}
                        >
                          <TrendingUp className={`h-3 w-3 mr-1 ${trend.direction === "down" ? "rotate-180" : ""}`} />
                          {trend.value}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {recentLog ? `Last updated ${formatDate(recentLog.date)}` : "No recent data"}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Health Log Entries */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Entries</CardTitle>
              <CardDescription>Your health tracking history</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(groupedLogs).length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No health logs yet</h3>
                  <p className="text-gray-500 mb-4">Start tracking your daily wellness</p>
                  <Button onClick={() => setShowAddForm(true)} className="bg-teal-600 hover:bg-teal-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Entry
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedLogs)
                    .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                    .map(([date, logs]) => (
                      <div key={date}>
                        <div className="flex items-center space-x-2 mb-3">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <h3 className="font-medium text-gray-900">{formatDate(date)}</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {logs.map((log) => (
                            <div key={log.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                {getCategoryBadge(log.category)}
                                <div className="flex items-center space-x-1">
                                  <span className="text-lg font-semibold">{log.value}</span>
                                  {log.category === "mood" && typeof log.value === "number" && getMoodIcon(log.value)}
                                </div>
                              </div>
                              {log.notes && <p className="text-sm text-gray-600 mt-2">{log.notes}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
