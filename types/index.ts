export interface User {
  id: string
  email: string
  name: string
  role: "client" | "admin"
  avatar?: string
  createdAt: Date
  lastLogin?: Date
}

export interface Appointment {
  id: string
  clientId: string
  providerId: string
  date: Date
  duration: number
  type: "therapy" | "consultation" | "follow-up"
  status: "scheduled" | "completed" | "cancelled" | "no-show"
  notes?: string
  meetingLink?: string
}

export interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  timestamp: Date
  read: boolean
  attachments?: string[]
}

export interface Document {
  id: string
  clientId: string
  name: string
  type: "insurance" | "id" | "intake" | "other"
  url: string
  uploadedAt: Date
  size: number
}

export interface Invoice {
  id: string
  clientId: string
  amount: number
  description: string
  status: "pending" | "paid" | "overdue"
  dueDate: Date
  paidAt?: Date
}

export interface AuditLog {
  id: string
  userId: string
  action: string
  resource: string
  timestamp: Date
  ipAddress: string
  userAgent: string
  details?: Record<string, any>
}
