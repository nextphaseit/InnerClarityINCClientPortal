import { Badge } from "@/components/ui/badge"

interface StatusBadgeProps {
  status: string
  type?: "appointment" | "document" | "form" | "message"
}

export function StatusBadge({ status, type = "appointment" }: StatusBadgeProps) {
  const getStatusStyle = () => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "confirmed":
      case "approved":
      case "reviewed":
        return "bg-green-100 text-green-800 border-green-200"
      case "cancelled":
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "uploaded":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "submitted":
        return "bg-indigo-100 text-indigo-800 border-indigo-200"
      case "draft":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return <Badge className={`${getStatusStyle()} capitalize`}>{status}</Badge>
}
