"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"

interface NotificationBadgeProps {
  count: number
  className?: string
}

export function NotificationBadge({ count, className = "" }: NotificationBadgeProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (count > 0) {
      setIsAnimating(true)
      const timer = setTimeout(() => setIsAnimating(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [count])

  if (count === 0) {
    return <Bell className={`h-5 w-5 ${className}`} />
  }

  return (
    <div className="relative">
      <Bell className={`h-5 w-5 ${className} ${isAnimating ? "animate-pulse" : ""}`} />
      <span
        className={`
          absolute -top-2 -right-2 inline-flex items-center justify-center 
          px-1.5 py-0.5 text-xs font-bold leading-none text-white 
          bg-red-500 rounded-full min-w-[18px] h-[18px]
          ${isAnimating ? "animate-bounce" : ""}
        `}
      >
        {count > 99 ? "99+" : count}
      </span>
    </div>
  )
}
