"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Send, MessageCircle, Clock, User, Paperclip } from "lucide-react"
import { PortalNavigation } from "@/components/portal-navigation"

interface Message {
  id: string
  staffName: string
  staffRole: string
  content: string
  timestamp: Date
  isFromStaff: boolean
  isRead: boolean
}

interface MessageThread {
  id: string
  subject: string
  lastMessage: Date
  unreadCount: number
  messages: Message[]
}

export default function MessagesPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [messageThreads, setMessageThreads] = useState<MessageThread[]>([])
  const [selectedThread, setSelectedThread] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)

  // Mock message data
  const mockThreads: MessageThread[] = [
    {
      id: "thread-1",
      subject: "Appointment Follow-up",
      lastMessage: new Date("2024-01-15T14:30:00"),
      unreadCount: 1,
      messages: [
        {
          id: "msg-1",
          staffName: "Dr. Sarah Johnson",
          staffRole: "Licensed Therapist",
          content:
            "Hi! I wanted to follow up on our session yesterday. How are you feeling about the coping strategies we discussed?",
          timestamp: new Date("2024-01-14T10:00:00"),
          isFromStaff: true,
          isRead: true,
        },
        {
          id: "msg-2",
          staffName: "You",
          staffRole: "Patient",
          content:
            "Thank you for checking in! I've been practicing the breathing exercises and they're really helping with my anxiety.",
          timestamp: new Date("2024-01-14T15:30:00"),
          isFromStaff: false,
          isRead: true,
        },
        {
          id: "msg-3",
          staffName: "Dr. Sarah Johnson",
          staffRole: "Licensed Therapist",
          content:
            "That's wonderful to hear! Keep practicing those techniques. I'd like to schedule a check-in next week to see how you're progressing.",
          timestamp: new Date("2024-01-15T14:30:00"),
          isFromStaff: true,
          isRead: false,
        },
      ],
    },
    {
      id: "thread-2",
      subject: "Insurance and Billing",
      lastMessage: new Date("2024-01-12T11:15:00"),
      unreadCount: 0,
      messages: [
        {
          id: "msg-4",
          staffName: "Maria Rodriguez",
          staffRole: "Patient Coordinator",
          content:
            "Hello! I wanted to let you know that your insurance has approved coverage for your upcoming sessions. You'll have a $25 copay per visit.",
          timestamp: new Date("2024-01-12T09:00:00"),
          isFromStaff: true,
          isRead: true,
        },
        {
          id: "msg-5",
          staffName: "You",
          staffRole: "Patient",
          content: "Perfect, thank you for handling that! When will I receive the updated billing information?",
          timestamp: new Date("2024-01-12T11:15:00"),
          isFromStaff: false,
          isRead: true,
        },
      ],
    },
    {
      id: "thread-3",
      subject: "Wellness Resources",
      lastMessage: new Date("2024-01-10T16:45:00"),
      unreadCount: 0,
      messages: [
        {
          id: "msg-6",
          staffName: "Dr. Michael Chen",
          staffRole: "Clinical Director",
          content:
            "I've compiled some additional resources that might be helpful for your journey. These include meditation apps and local support groups.",
          timestamp: new Date("2024-01-10T16:45:00"),
          isFromStaff: true,
          isRead: true,
        },
      ],
    },
  ]

  useEffect(() => {
    checkUserSession()
  }, [])

  const checkUserSession = async () => {
    try {
      console.log("🔐 Checking user session...")

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error) {
        console.error("❌ Session error:", error)
        router.push("/auth/login?message=Please sign in to access your messages")
        return
      }

      if (!user) {
        console.log("❌ No user session found")
        router.push("/auth/login?message=Please sign in to access your messages")
        return
      }

      console.log("✅ User session verified:", user.email)
      setUser(user)
      setMessageThreads(mockThreads)

      // Auto-select first thread if available
      if (mockThreads.length > 0) {
        setSelectedThread(mockThreads[0].id)
      }
    } catch (error) {
      console.error("❌ Unexpected error checking session:", error)
      router.push("/auth/login?message=An error occurred. Please sign in again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || !selectedThread) return

    setIsSending(true)

    try {
      // Mock sending message - in real implementation, this would call Supabase
      console.log("📤 Sending message:", newMessage)

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Add message to selected thread
      const updatedThreads = messageThreads.map((thread) => {
        if (thread.id === selectedThread) {
          const newMsg: Message = {
            id: `msg-${Date.now()}`,
            staffName: "You",
            staffRole: "Patient",
            content: newMessage.trim(),
            timestamp: new Date(),
            isFromStaff: false,
            isRead: true,
          }

          return {
            ...thread,
            messages: [...thread.messages, newMsg],
            lastMessage: new Date(),
          }
        }
        return thread
      })

      setMessageThreads(updatedThreads)
      setNewMessage("")

      console.log("✅ Message sent successfully")
    } catch (error) {
      console.error("❌ Error sending message:", error)
    } finally {
      setIsSending(false)
    }
  }

  const formatMessageTime = (date: Date) => {
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (diffInHours < 168) {
      // 7 days
      return date.toLocaleDateString([], { weekday: "short", hour: "2-digit", minute: "2-digit" })
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
    }
  }

  const selectedThreadData = messageThreads.find((thread) => thread.id === selectedThread)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PortalNavigation />

      <div className="lg:ml-64 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <MessageCircle className="h-8 w-8 mr-3 text-teal-600" />
              Messages
            </h1>
            <p className="text-gray-600">Secure communication with your care team</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="flex h-[600px]">
              {/* Message Threads Sidebar */}
              <div className="w-1/3 border-r border-gray-200 bg-gray-50">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
                </div>

                <div className="overflow-y-auto h-full">
                  {messageThreads.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>No messages yet</p>
                    </div>
                  ) : (
                    messageThreads.map((thread) => (
                      <button
                        key={thread.id}
                        onClick={() => setSelectedThread(thread.id)}
                        className={`w-full p-4 text-left border-b border-gray-200 hover:bg-white transition-colors ${
                          selectedThread === thread.id ? "bg-white border-l-4 border-l-teal-500" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-900 truncate">{thread.subject}</h3>
                            <p className="text-xs text-gray-500 mt-1 truncate">
                              {thread.messages[thread.messages.length - 1]?.content}
                            </p>
                            <div className="flex items-center mt-2 text-xs text-gray-400">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatMessageTime(thread.lastMessage)}
                            </div>
                          </div>
                          {thread.unreadCount > 0 && (
                            <span className="bg-teal-500 text-white text-xs rounded-full px-2 py-1 ml-2">
                              {thread.unreadCount}
                            </span>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Message Content */}
              <div className="flex-1 flex flex-col">
                {selectedThreadData ? (
                  <>
                    {/* Thread Header */}
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                      <h3 className="text-lg font-semibold text-gray-900">{selectedThreadData.subject}</h3>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {selectedThreadData.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.isFromStaff ? "justify-start" : "justify-end"}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                              message.isFromStaff ? "bg-gray-100 text-gray-900" : "bg-teal-500 text-white"
                            }`}
                          >
                            <div className="flex items-center space-x-2 mb-1">
                              <User className="h-4 w-4" />
                              <span className="text-sm font-medium">{message.staffName}</span>
                              {message.isFromStaff && <span className="text-xs opacity-75">{message.staffRole}</span>}
                            </div>
                            <p className="text-sm">{message.content}</p>
                            <div className="text-xs opacity-75 mt-2">{formatMessageTime(message.timestamp)}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* New Message Form */}
                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                      <form onSubmit={handleSendMessage} className="flex space-x-3">
                        <div className="flex-1">
                          <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            disabled={isSending}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                            rows={3}
                          />
                        </div>
                        <div className="flex flex-col space-y-2">
                          <button
                            type="button"
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                            title="Attach file"
                          >
                            <Paperclip className="h-5 w-5" />
                          </button>
                          <button
                            type="submit"
                            disabled={!newMessage.trim() || isSending}
                            className="p-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {isSending ? (
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                              <Send className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg">Select a conversation to start messaging</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
