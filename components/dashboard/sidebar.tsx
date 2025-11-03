"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X, Inbox, Users, BarChart3, Settings, ChevronLeft, Pencil, Clock } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import TwilioNumberBadge from "@/components/dashboard/twilio-number-badge"

interface SidebarProps {
  onComposeClick?: () => void
}

export default function Sidebar({ onComposeClick }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { user, signOut } = useAuth()

  // Debug: Log user image on mount/update
  useEffect(() => {
    if (user) {
      console.log("User data:", { name: user.name, email: user.email, image: user.image })
    }
  }, [user])

  const handleSignOut = async () => {
    try {
      await signOut()
      window.location.href = "/"
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  const getUserInitials = () => {
    if (user?.name) {
      return user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    }
    if (user?.email) {
      return user.email[0].toUpperCase()
    }
    return "U"
  }

  const getUserDisplayName = () => {
    return user?.name || user?.email || "User"
  }

  const navItems = [
    { icon: Inbox, label: "Inbox", href: "/dashboard" },
    { icon: Users, label: "Contacts", href: "/dashboard/contacts" },
    { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
    { icon: Clock, label: "Automations", href: "/dashboard/automations" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  ]

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg p-2 hover:bg-white/20 transition-colors"
      >
        {isOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
      </button>

      {/* Sidebar */}
      <div
        className={`${
          isOpen ? (isCollapsed ? "w-20" : "w-64") : "w-0"
        } transition-all duration-300 bg-white/5 backdrop-blur-xl border-r border-white/20 flex flex-col p-6 overflow-hidden md:w-auto md:flex`}
        style={{ minWidth: isOpen ? (isCollapsed ? "80px" : "256px") : "0" }}
      >
        {/* Logo */}
        <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-2"} mb-8`}>
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0">
            <span className="text-black font-bold text-sm">⚡</span>
          </div>
          {!isCollapsed && <span className="text-white font-semibold text-lg">Unify</span>}
        </div>

        {!isCollapsed && (
          <button
            onClick={onComposeClick}
            className="w-full flex items-center justify-center gap-2 bg-black hover:bg-black/80 text-white font-semibold px-4 py-4 rounded-lg transition-colors text-sm mb-4"
          >
            <Pencil className="w-4 h-4" />
            Compose
          </button>
        )}
        {isCollapsed && (
          <button
            onClick={onComposeClick}
            className="w-full flex items-center justify-center bg-black hover:bg-black/80 text-white font-semibold px-4 py-4 rounded-lg transition-colors text-sm mb-4"
            title="Compose"
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}

        {/* Twilio Trial Number Badge */}
        {!isCollapsed && <TwilioNumberBadge />}

        {/* Navigation */}
        <nav className="space-y-2 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center ${
                  isCollapsed ? "justify-center" : "gap-3"
                } px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200`}
                title={isCollapsed ? item.label : ""}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="pt-4 border-t border-white/10 space-y-2">
          {/* Profile Section */}
          {user && (
            <div
              className={`flex items-center ${
                isCollapsed ? "justify-center" : "gap-3"
              } px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200 mb-2`}
            >
              <Avatar className="w-8 h-8 flex-shrink-0">
                {user.image && user.image.trim() !== "" && (
                  <AvatarImage 
                    src={user.image} 
                    alt={getUserDisplayName()}
                    onError={(e) => {
                      console.error("Failed to load avatar image:", user.image)
                      // Hide the image element on error, fallback will show
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                )}
                <AvatarFallback className="bg-white/20 text-white text-xs font-semibold">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">{getUserDisplayName()}</p>
                  {user.email && user.name && (
                    <p className="text-white/60 text-xs truncate">{user.email}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="w-full bg-black hover:bg-black/80 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
          >
            {isCollapsed ? "SO" : "Sign Out"}
          </button>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
            title={isCollapsed ? "Expand" : "Collapse"}
          >
            <ChevronLeft className={`w-4 h-4 transition-transform ${isCollapsed ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>
    </>
  )
}
