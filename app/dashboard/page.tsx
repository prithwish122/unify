"use client"

import { useState, useEffect } from "react"
import Sidebar from "@/components/dashboard/sidebar"
import KanbanBoardEnhanced from "@/components/dashboard/kanban-board-enhanced"
import ContactModalEnhanced from "@/components/dashboard/contact-modal-enhanced"
import ComposerPanelEnhanced from "@/components/dashboard/composer-panel-enhanced"
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
                <KanbanBoardEnhanced onContactClick={setSelectedContact} searchQuery={searchQuery} filterChannel={filterChannel} />
              </div>
            </div>
          </div>

          {showComposer && (
            <div className="fixed bottom-6 right-6 z-40 w-96 max-h-[600px] shadow-lg">
              <ComposerPanelEnhanced
                onClose={() => setShowComposer(false)}
                contactId={selectedContact?.id}
                channel={selectedContact?.channel?.toUpperCase() as any}
              />
            </div>
          )}

          {/* Contact Profile Modal */}
          {selectedContact && (
            <ContactModalEnhanced contact={selectedContact} onClose={() => setSelectedContact(null)} />
          )}
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
