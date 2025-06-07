"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useSession } from "next-auth/react"
import { MessageSquare, Send, Plus, Loader2, Mail, Calendar, User, Shield, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Message {
  id: string
  subject: string
  body: string
  from: string
  to: string
  date: string
  status: "read" | "unread"
  isFromAdmin: boolean
}

export default function MessageCenterPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [isMessageOpen, setIsMessageOpen] = useState(false)
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [messageSent, setMessageSent] = useState(false)

  // New message form state
  const [newMessage, setNewMessage] = useState({
    subject: "",
    body: "",
  })

  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  useEffect(() => {
    if (hasMounted && session?.user) {
      fetchMessages()
    }
  }, [session, hasMounted])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/messages")

      if (!response.ok) {
        throw new Error("Failed to fetch messages")
      }

      const data = await response.json()
      setMessages(data.messages || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      console.error("Error fetching messages:", err)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.subject.trim() || !newMessage.body.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both subject and message fields.",
        variant: "destructive",
      })
      return
    }

    try {
      setSending(true)
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: newMessage.subject,
          body: newMessage.body,
          to: "Admin",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully.",
      })

      // Reset form and close modal
      setNewMessage({ subject: "", body: "" })
      setIsNewMessageOpen(false)

      // Show confirmation and refresh messages
      setMessageSent(true)
      fetchMessages()

      // Reset confirmation after 5 seconds
      setTimeout(() => {
        setMessageSent(false)
      }, 5000)
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to send message",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  const openMessage = (message: Message) => {
    setSelectedMessage(message)
    setIsMessageOpen(true)

    // Mark as read if unread
    if (message.status === "unread") {
      markAsRead(message.id)
    }
  }

  const markAsRead = async (messageId: string) => {
    try {
      await fetch(`/api/messages/${messageId}/read`, {
        method: "PATCH",
      })

      // Update local state
      setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, status: "read" as const } : msg)))
    } catch (err) {
      console.error("Error marking message as read:", err)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: string) => {
    return status === "unread"
      ? "bg-blue-100 text-blue-800 border-blue-200"
      : "bg-gray-100 text-gray-600 border-gray-200"
  }

  const unreadCount = messages.filter((msg) => msg.status === "unread").length

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Sign In Required</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Please sign in to view your messages.</p>
          <Button onClick={() => router.push("/auth/signin")}>Sign In</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Message Center</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Secure communication with your healthcare team
              {unreadCount > 0 && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {unreadCount} unread
                </span>
              )}
            </p>
          </div>

          <Dialog open={isNewMessageOpen} onOpenChange={setIsNewMessageOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                New Message
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <Send className="mr-2 h-5 w-5 text-blue-600" />
                  Send New Message
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="to">To</Label>
                  <Input id="to" value="Admin" disabled className="bg-gray-50 dark:bg-gray-800" />
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    placeholder="Enter message subject..."
                    value={newMessage.subject}
                    onChange={(e) => setNewMessage((prev) => ({ ...prev, subject: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="body">Message</Label>
                  <Textarea
                    id="body"
                    placeholder="Type your message here..."
                    rows={6}
                    value={newMessage.body}
                    onChange={(e) => setNewMessage((prev) => ({ ...prev, body: e.target.value }))}
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setIsNewMessageOpen(false)} disabled={sending}>
                    Cancel
                  </Button>
                  <Button onClick={sendMessage} disabled={sending} className="bg-blue-600 hover:bg-blue-700">
                    {sending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {messageSent && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center dark:bg-green-900/20 dark:border-green-800">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <p className="text-green-800 dark:text-green-200">
              Your message has been sent successfully. We'll respond as soon as possible.
            </p>
            <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setMessageSent(false)}>
              Dismiss
            </Button>
          </div>
        )}

        {/* Main Content */}
        <Card className="shadow-lg rounded-xl border-0">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-gray-50 dark:from-blue-950 dark:to-gray-900 rounded-t-xl">
            <CardTitle className="text-blue-800 dark:text-blue-200 flex items-center">
              <MessageSquare className="mr-2 h-5 w-5" />
              Messages
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              /* Loading State */
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">Loading messages...</p>
                </div>
              </div>
            ) : error ? (
              /* Error State */
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="text-red-500 mb-4">
                    <Mail className="h-12 w-12 mx-auto" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">Error loading messages</p>
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  <Button variant="outline" onClick={fetchMessages} className="mt-4">
                    Try Again
                  </Button>
                </div>
              </div>
            ) : messages.length === 0 ? (
              /* Empty State */
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No messages yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Start a conversation with your healthcare team.
                  </p>
                  <Button onClick={() => setIsNewMessageOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Send Your First Message
                  </Button>
                </div>
              </div>
            ) : (
              /* Messages List */
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    onClick={() => openMessage(message)}
                    className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors ${
                      message.status === "unread" ? "bg-blue-50/50 dark:bg-blue-950/20" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-blue-600" />
                            <span
                              className={`text-sm font-medium ${
                                message.status === "unread"
                                  ? "text-gray-900 dark:text-white"
                                  : "text-gray-700 dark:text-gray-300"
                              }`}
                            >
                              {message.from}
                            </span>
                          </div>
                          <Badge className={getStatusColor(message.status)}>{message.status}</Badge>
                        </div>

                        <h3
                          className={`text-lg font-semibold mb-2 ${
                            message.status === "unread"
                              ? "text-gray-900 dark:text-white"
                              : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {message.subject}
                        </h3>

                        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">{message.body}</p>
                      </div>

                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 ml-4">
                        <Calendar className="mr-1 h-4 w-4" />
                        {formatDate(message.date)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Message Detail Modal */}
        <Dialog open={isMessageOpen} onOpenChange={setIsMessageOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
            {selectedMessage && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Mail className="mr-2 h-5 w-5 text-blue-600" />
                      {selectedMessage.subject}
                    </div>
                    <Badge className={getStatusColor(selectedMessage.status)}>{selectedMessage.status}</Badge>
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 pt-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 border-b pb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <User className="mr-1 h-4 w-4" />
                        <span>From: {selectedMessage.from}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-4 w-4" />
                        <span>{formatDate(selectedMessage.date)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="prose dark:prose-invert max-w-none">
                    <div className="whitespace-pre-wrap text-gray-900 dark:text-white">{selectedMessage.body}</div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* HIPAA Notice */}
        <Card className="mt-8 border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Secure Messaging</p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  All messages are encrypted and HIPAA compliant. Only you and your healthcare providers can access this
                  communication.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
