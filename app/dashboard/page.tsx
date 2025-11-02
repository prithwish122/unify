"use client"

import { useState, useEffect } from "react"
import Sidebar from "@/components/dashboard/sidebar"
import KanbanBoard from "@/components/dashboard/kanban-board"
import ContactModal from "@/components/dashboard/contact-modal"
import ComposerPanel from "@/components/dashboard/composer-panel"
import SearchBar from "@/components/dashboard/search-bar"
import LoginModal from "@/components/dashboard/login-modal"
import { useAuth } from "@/hooks/use-auth"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  const [selectedContact, setSelectedContact] = useState(null)
  const [showComposer, setShowComposer] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterChannel, setFilterChannel] = useState("all")
  const { isAuthenticated, isLoading } = useAuth()
  
  // Show login modal if not authenticated (only after loading completes)
  const showLoginModal = !isLoading && !isAuthenticated

  // Hide modal when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // User just logged in, refresh the page state
    }
  }, [isAuthenticated])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
          <p className="text-white/70">Loading...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: "url('/background.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      />

      {/* Only show dashboard content if authenticated */}
      {isAuthenticated && (
        <>
          <div className="flex h-screen overflow-hidden">
            <Sidebar onComposeClick={() => setShowComposer(true)} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Search/Filter Bar */}
              <SearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                filterChannel={filterChannel}
                setFilterChannel={setFilterChannel}
              />

              {/* Kanban Board */}
              <div className="flex-1 overflow-auto p-6">
                <KanbanBoard onContactClick={setSelectedContact} searchQuery={searchQuery} filterChannel={filterChannel} />
              </div>
            </div>
          </div>

          {showComposer && (
            <div className="fixed bottom-6 right-6 z-40 w-96 max-h-96 shadow-lg">
              <ComposerPanel onClose={() => setShowComposer(false)} />
            </div>
          )}

          {/* Contact Profile Modal */}
          {selectedContact && <ContactModal contact={selectedContact} onClose={() => setSelectedContact(null)} />}
        </>
      )}

      {/* Login Modal - shown when not authenticated */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => {
          // Prevent closing if not authenticated - user must log in
          if (!isAuthenticated) return
        }} 
      />
    </main>
  )
}
