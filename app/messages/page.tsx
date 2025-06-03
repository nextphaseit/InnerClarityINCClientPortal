"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import { useAuth } from "@/components/auth-provider"
import { MessageSquare, Send, Search, Plus, Paperclip, Shield } from "lucide-react"

export default function MessagesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")

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

  // Mock messages data
  const messages = [
    {
      id: "1",
      from: "Dr. Sarah Johnson",
      subject: "Follow-up on your session",
      preview: "Thank you for completing your homework assignment...",
      timestamp: "2 hours ago",
      unread: true,
      content:
        "Thank you for completing your homework assignment. I noticed some great progress in your anxiety management techniques. Let's discuss this further in our next session.",
    },
    {
      id: "2",
      from: "Inner Clarity Admin",
      subject: "Insurance verification complete",
      preview: "Your insurance has been successfully verified...",
      timestamp: "1 day ago",
      unread: false,
      content:
        "Your insurance has been successfully verified and your coverage is active. You can now schedule appointments with full coverage benefits.",
    },
    {
      id: "3",
      from: "Dr. Michael Chen",
      subject: "Appointment reminder",
      preview: "This is a reminder for your upcoming appointment...",
      timestamp: "2 days ago",
      unread: false,
      content:
        "This is a reminder for your upcoming appointment on January 22nd at 10:30 AM. Please arrive 10 minutes early for check-in.",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Messages</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Secure communication with your healthcare providers.
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Message
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Message List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-gray-400" />
                  <Input placeholder="Search messages..." className="border-0 focus-visible:ring-0" />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-0">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                        selectedMessage === message.id ? "bg-clarity-blue-50 dark:bg-clarity-blue-950/20" : ""
                      }`}
                      onClick={() => setSelectedMessage(message.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p
                              className={`text-sm font-medium ${message.unread ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"}`}
                            >
                              {message.from}
                            </p>
                            {message.unread && <div className="h-2 w-2 bg-clarity-blue-500 rounded-full"></div>}
                          </div>
                          <p
                            className={`text-sm ${message.unread ? "font-medium text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"}`}
                          >
                            {message.subject}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 truncate">{message.preview}</p>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-500">{message.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Message Content */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{messages.find((m) => m.id === selectedMessage)?.subject}</CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        From: {messages.find((m) => m.id === selectedMessage)?.from}
                      </p>
                    </div>
                    <Badge variant="outline">{messages.find((m) => m.id === selectedMessage)?.timestamp}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="prose dark:prose-invert max-w-none">
                    <p>{messages.find((m) => m.id === selectedMessage)?.content}</p>
                  </div>

                  {/* Reply Section */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-4">Reply</h3>
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Type your reply..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        rows={4}
                      />
                      <div className="flex items-center justify-between">
                        <Button variant="outline" size="sm">
                          <Paperclip className="mr-2 h-4 w-4" />
                          Attach File
                        </Button>
                        <Button>
                          <Send className="mr-2 h-4 w-4" />
                          Send Reply
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Select a message to read</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Choose a message from the list to view its contents and reply.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* HIPAA Notice */}
        <Card className="mt-8 hipaa-secure">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-clarity-blue-600" />
              <div>
                <p className="text-sm font-medium">Secure Messaging</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  All messages are encrypted and HIPAA compliant. Only you and your healthcare providers can access this
                  communication.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
