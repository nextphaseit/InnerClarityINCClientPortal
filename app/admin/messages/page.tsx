"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Navigation } from "@/components/navigation"
import { useAuth } from "@/components/auth-provider"
import { MessageSquare, Send, Search, Plus, Shield, Users } from "lucide-react"

export default function AdminMessagesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")

  const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState(false)
  const [isSubmittingReply, setIsSubmittingReply] = useState(false)
  const [isSubmittingNew, setIsSubmittingNew] = useState(false)
  const [newMessageForm, setNewMessageForm] = useState({
    to: "",
    subject: "",
    body: "",
  })

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
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

  // Mock conversations data
  const conversations = [
    {
      id: "1",
      client: "John Smith",
      lastMessage: "Thank you for the session notes. I'll review them before our next meeting.",
      timestamp: "2 hours ago",
      unread: 2,
      messages: [
        {
          id: "1",
          sender: "John Smith",
          content: "Hi Dr. Johnson, I wanted to follow up on our last session.",
          timestamp: "3 hours ago",
          isFromClient: true,
        },
        {
          id: "2",
          sender: "Dr. Sarah Johnson",
          content: "Hello John, thank you for reaching out. How have you been feeling since our last session?",
          timestamp: "2.5 hours ago",
          isFromClient: false,
        },
        {
          id: "3",
          sender: "John Smith",
          content: "Thank you for the session notes. I'll review them before our next meeting.",
          timestamp: "2 hours ago",
          isFromClient: true,
        },
      ],
    },
    {
      id: "2",
      client: "Jane Doe",
      lastMessage: "I've completed the anxiety assessment form you sent.",
      timestamp: "1 day ago",
      unread: 0,
      messages: [
        {
          id: "1",
          sender: "Jane Doe",
          content: "I've completed the anxiety assessment form you sent.",
          timestamp: "1 day ago",
          isFromClient: true,
        },
      ],
    },
    {
      id: "3",
      client: "Robert Wilson",
      lastMessage: "Can we reschedule our appointment for next week?",
      timestamp: "2 days ago",
      unread: 1,
      messages: [
        {
          id: "1",
          sender: "Robert Wilson",
          content: "Can we reschedule our appointment for next week?",
          timestamp: "2 days ago",
          isFromClient: true,
        },
      ],
    },
  ]

  const selectedConv = conversations.find((conv) => conv.id === selectedConversation)
  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unread, 0)

  const handleNewMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingNew(true)

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newMessageForm),
      })

      if (response.ok) {
        console.log("Message sent successfully")
        setNewMessageForm({ to: "", subject: "", body: "" })
        setIsNewMessageModalOpen(false)
        // Refresh messages list here if needed
      } else {
        console.error("Failed to send message")
      }
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsSubmittingNew(false)
    }
  }

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedConv || !newMessage.trim()) return

    setIsSubmittingReply(true)

    try {
      const response = await fetch("/api/messages/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: selectedConv.client,
          subject: `Re: ${selectedConv.messages[0]?.content || "Message"}`,
          body: newMessage,
          originalMessageId: selectedConv.id,
        }),
      })

      if (response.ok) {
        console.log("Reply sent successfully")
        setNewMessage("")
        // Add the reply to the conversation locally
        // Refresh messages here if needed
      } else {
        console.error("Failed to send reply")
      }
    } catch (error) {
      console.error("Error sending reply:", error)
    } finally {
      setIsSubmittingReply(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Message Center</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Secure communication with clients and team members.</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="bg-clarity-blue-50 text-clarity-blue-700">
              <Users className="mr-1 h-3 w-3" />
              {totalUnread} unread
            </Badge>
            <Button onClick={() => setIsNewMessageModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Message
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-gray-400" />
                  <Input placeholder="Search conversations..." className="border-0 focus-visible:ring-0" />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-0">
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                        selectedConversation === conversation.id ? "bg-clarity-blue-50 dark:bg-clarity-blue-950/20" : ""
                      }`}
                      onClick={() => setSelectedConversation(conversation.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src="/placeholder.svg" alt={conversation.client} />
                            <AvatarFallback>{conversation.client.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <p
                                className={`text-sm font-medium ${conversation.unread > 0 ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"}`}
                              >
                                {conversation.client}
                              </p>
                              {conversation.unread > 0 && (
                                <Badge variant="destructive" className="h-5 w-5 p-0 text-xs">
                                  {conversation.unread}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                              {conversation.lastMessage}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-500">{conversation.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Message Content */}
          <div className="lg:col-span-2">
            {selectedConv ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src="/placeholder.svg" alt={selectedConv.client} />
                      <AvatarFallback>{selectedConv.client.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{selectedConv.client}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Client</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Messages */}
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {selectedConv.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isFromClient ? "justify-start" : "justify-end"}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.isFromClient
                              ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                              : "bg-clarity-blue-500 text-white"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${message.isFromClient ? "text-gray-500" : "text-blue-100"}`}>
                            {message.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Reply Section */}
                  <div className="border-t pt-6">
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Type your reply..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        rows={3}
                      />
                      <div className="flex justify-end">
                        <Button onClick={handleSendReply} disabled={isSubmittingReply}>
                          <Send className="mr-2 h-4 w-4" />
                          {isSubmittingReply ? "Sending..." : "Send Reply"}
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
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Select a conversation</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Choose a conversation from the list to view messages and reply.
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
                  All messages are encrypted and HIPAA compliant. Communication logs are maintained for compliance and
                  quality assurance.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* New Message Modal */}
        {isNewMessageModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-bold mb-4">New Message</h2>
              <form onSubmit={handleNewMessage} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">To *</label>
                  <Input
                    required
                    value={newMessageForm.to}
                    onChange={(e) => setNewMessageForm({ ...newMessageForm, to: e.target.value })}
                    placeholder="Recipient name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Subject *</label>
                  <Input
                    required
                    value={newMessageForm.subject}
                    onChange={(e) => setNewMessageForm({ ...newMessageForm, subject: e.target.value })}
                    placeholder="Message subject"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Message *</label>
                  <textarea
                    required
                    className="w-full px-3 py-2 border rounded-md"
                    rows={4}
                    value={newMessageForm.body}
                    onChange={(e) => setNewMessageForm({ ...newMessageForm, body: e.target.value })}
                    placeholder="Type your message..."
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsNewMessageModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmittingNew}>
                    {isSubmittingNew ? "Sending..." : "Send Message"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
