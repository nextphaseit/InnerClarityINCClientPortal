"use client"

import type React from "react"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { Bell, Calendar, CreditCard, Home, LayoutDashboard, MessageCircle, Settings, User } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navigationItems = [
  { name: "Home", href: "/portal", icon: Home },
  { name: "Dashboard", href: "/portal/dashboard", icon: LayoutDashboard },
  { name: "Appointments", href: "/portal/appointments", icon: Calendar },
  { name: "Messages", href: "/portal/messages", icon: MessageCircle },
  { name: "Notifications", href: "/portal/notifications", icon: Bell },
  { name: "Billing", href: "/portal/billing", icon: CreditCard },
  { name: "Settings", href: "/portal/settings", icon: Settings },
]

interface PatientLayoutClientProps {
  children: React.ReactNode
}

export const PatientLayoutClient: React.FC<PatientLayoutClientProps> = ({ children }) => {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="h-full">
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <MenuIcon className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-full sm:w-60">
          <div className="flex flex-col h-full">
            <div className="px-4 py-6">
              <Link href="/portal">
                <h1 className="font-bold text-lg">Patient Portal</h1>
              </Link>
              <Separator className="my-2" />
            </div>
            <div className="flex-1">
              <nav className="grid gap-6 px-4">
                {navigationItems.map((item) => (
                  <Link key={item.name} href={item.href}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "justify-start gap-2 w-full",
                        pathname === item.href ? "bg-secondary hover:bg-secondary/80" : "hover:bg-secondary/50",
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </Button>
                  </Link>
                ))}
              </nav>
            </div>
            <div className="p-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 w-full justify-start">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/avatars/01.png" />
                      <AvatarFallback>OM</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col text-left">
                      <span className="font-semibold">Olivia Martin</span>
                      <span className="text-sm text-muted-foreground">olivia.martin@email.com</span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      <div className="md:pl-60">
        <main className="h-full">{children}</main>
      </div>
    </div>
  )
}

import { MenuIcon } from "lucide-react"
import Link from "next/link"
