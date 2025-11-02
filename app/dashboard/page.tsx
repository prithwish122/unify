"use client"

import { useState } from "react"
import Sidebar from "@/components/dashboard/sidebar"
import KanbanBoard from "@/components/dashboard/kanban-board"
import ContactModal from "@/components/dashboard/contact-modal"
import ComposerPanel from "@/components/dashboard/composer-panel"
import SearchBar from "@/components/dashboard/search-bar"
import LoginModal from "@/components/dashboard/login-modal"

export default function DashboardPage() {
  const [selectedContact, setSelectedContact] = useState(null)
  const [showComposer, setShowComposer] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterChannel, setFilterChannel] = useState("all")
  const [showLoginModal, setShowLoginModal] = useState(true)

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

      {/* Login Modal */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </main>
  )
}
