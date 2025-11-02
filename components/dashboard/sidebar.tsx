"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, Inbox, Users, BarChart3, Settings, ChevronLeft, Pencil } from "lucide-react"

interface SidebarProps {
  onComposeClick?: () => void
}

export default function Sidebar({ onComposeClick }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [isCollapsed, setIsCollapsed] = useState(false)

  const navItems = [
    { icon: Inbox, label: "Inbox", href: "/dashboard" },
    { icon: Users, label: "Contacts", href: "/dashboard/contacts" },
    { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
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
            className="w-full flex items-center justify-center gap-2 bg-black hover:bg-black/80 text-white font-semibold px-4 py-4 rounded-lg transition-colors text-sm mb-6"
          >
            <Pencil className="w-4 h-4" />
            Compose
          </button>
        )}
        {isCollapsed && (
          <button
            onClick={onComposeClick}
            className="w-full flex items-center justify-center bg-black hover:bg-black/80 text-white font-semibold px-4 py-4 rounded-lg transition-colors text-sm mb-6"
            title="Compose"
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}

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
          <button className="w-full bg-black hover:bg-black/80 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm">
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
