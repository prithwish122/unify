/**
 * Enhanced Contact Modal - Uses real API data
 * Shows message history timeline, notes section, quick actions
 */

"use client"

import { useState } from "react"
import { X, Phone, Send, Lock, Unlock, Loader2 } from "lucide-react"
import { useContact } from "@/hooks/use-contacts"
import { useMessages } from "@/hooks/use-messages"
import { formatDistanceToNow, format } from "date-fns"
import type { Contact as ContactType } from "@/types/contact"
import NoteEditorWithMentions from "@/components/dashboard/note-editor-with-mentions"

interface ContactModalProps {
  contact: ContactType
  onClose: () => void
}

export default function ContactModalEnhanced({ contact, onClose }: ContactModalProps) {
  const [activeTab, setActiveTab] = useState<"messages" | "notes">("messages")
  const [isPrivateNote, setIsPrivateNote] = useState(false)
  const [noteText, setNoteText] = useState("")
  const [isSubmittingNote, setIsSubmittingNote] = useState(false)

  // Fetch full contact data with messages and notes
  const { data: contactData, isLoading } = useContact(contact.id)
  const { data: messagesData } = useMessages({ contactId: contact.id, limit: 100 })

  const fullContact = contactData?.contact
  const messages = messagesData?.messages || []
  const notes = fullContact?.notes || []

  const handleSendNote = async () => {
    if (!noteText.trim()) return

    setIsSubmittingNote(true)
    try {
      // Extract mentions from text (format: @username)
      const mentionRegex = /@(\w+)/g
      const mentions: string[] = []
      let match
      while ((match = mentionRegex.exec(noteText)) !== null) {
        // Fetch user ID from name/email
        try {
          const userRes = await fetch(`/api/users?search=${encodeURIComponent(match[1])}`)
          if (userRes.ok) {
            const userData = await userRes.json()
            if (userData.users && userData.users.length > 0) {
              mentions.push(userData.users[0].id)
            }
          }
        } catch (e) {
          console.error("Error fetching user for mention:", e)
        }
      }

      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactId: contact.id,
          content: noteText,
          isPrivate: isPrivateNote,
          mentions: mentions,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create note")
      }

      // Clear note and refetch
      setNoteText("")
      // The query will automatically refetch due to cache invalidation
      window.location.reload() // Force refresh to show new note
    } catch (error) {
      console.error("Create note error:", error)
      alert(error instanceof Error ? error.message : "Failed to create note")
    } finally {
      setIsSubmittingNote(false)
    }
  }

  const handleQuickAction = async (action: "call" | "reply") => {
    if (action === "reply") {
      // Close modal and trigger composer - we'll use a custom event
      onClose()
      // Dispatch custom event to open composer
      window.dispatchEvent(
        new CustomEvent("openComposer", {
          detail: {
            contactId: contact.id,
            channel: contact.channel,
          },
        }),
      )
    } else if (action === "call") {
      // TODO: Implement calling functionality
      if (fullContact?.phone) {
        window.location.href = `tel:${fullContact.phone}`
      } else {
        alert("No phone number available for this contact")
      }
    }
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
          <Loader2 className="w-8 h-8 animate-spin text-white mx-auto" />
          <p className="text-white/70 mt-4">Loading contact...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{fullContact?.avatar || contact.avatar || "👤"}</span>
            <div>
              <h2 className="text-white font-semibold">{fullContact?.name || contact.name || "Unknown"}</h2>
              <p className="text-white/50 text-sm">
                {fullContact?.email || contact.email || fullContact?.phone || contact.phone || "No contact info"}
              </p>
              <p className="text-white/50 text-xs mt-1">
                {fullContact?.phone && `Phone: ${fullContact.phone}`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 px-6 pt-4 border-b border-white/10">
          {["messages", "notes"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`pb-3 px-2 text-sm font-medium transition-colors ${
                activeTab === tab ? "text-white border-b-2 border-white" : "text-white/50 hover:text-white/70"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === "messages" && messages.length > 0 && (
                <span className="ml-2 text-xs">({messages.length})</span>
              )}
              {tab === "notes" && notes.length > 0 && (
                <span className="ml-2 text-xs">({notes.length})</span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "messages" ? (
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-white/50 text-sm py-8">No messages yet</div>
              ) : (
                messages.map((msg: any) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.direction === "OUTBOUND" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        msg.direction === "OUTBOUND"
                          ? "bg-white/20 text-white"
                          : "bg-white/10 text-white/90"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium opacity-70">
                          {msg.direction === "OUTBOUND" ? "You" : fullContact?.name || "Contact"}
                        </span>
                        <span className="text-xs opacity-50">•</span>
                        <span className="text-xs opacity-50">
                          {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      {msg.mediaUrls && msg.mediaUrls.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {msg.mediaUrls.map((url: string, idx: number) => (
                            <img
                              key={idx}
                              src={url}
                              alt={`Attachment ${idx + 1}`}
                              className="max-w-full h-auto rounded"
                            />
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-white/50 mt-1">
                        {format(new Date(msg.createdAt), "MMM d, yyyy h:mm a")}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Notes list */}
              {notes.length > 0 && (
                <div className="space-y-3 mb-4">
                  {notes.map((note: any) => (
                    <div
                      key={note.id}
                      className={`bg-white/5 rounded-lg p-3 ${note.isPrivate ? "border border-white/10" : ""}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-white/70 text-xs font-medium">
                            {note.author?.name || note.author?.email || "Unknown"}
                          </span>
                          {note.isPrivate && <Lock className="w-3 h-3 text-white/50" />}
                        </div>
                        <span className="text-white/50 text-xs">
                          {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-white/90 text-sm whitespace-pre-wrap">{note.content}</p>
                      {note.replies && note.replies.length > 0 && (
                        <div className="mt-2 ml-4 space-y-2 border-l border-white/10 pl-3">
                          {note.replies.map((reply: any) => (
                            <div key={reply.id} className="bg-white/5 rounded p-2">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-white/70 text-xs">
                                  {reply.author?.name || reply.author?.email || "Unknown"}
                                </span>
                                <span className="text-white/50 text-xs">
                                  {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                                </span>
                              </div>
                              <p className="text-white/90 text-xs">{reply.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Add note form */}
              <div className="border-t border-white/10 pt-4">
                <div className="flex items-center gap-2 mb-4">
                  <button
                    onClick={() => setIsPrivateNote(!isPrivateNote)}
                    className="flex items-center gap-2 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    {isPrivateNote ? (
                      <Lock className="w-4 h-4 text-white" />
                    ) : (
                      <Unlock className="w-4 h-4 text-white/50" />
                    )}
                    <span className="text-xs text-white">{isPrivateNote ? "Private" : "Public"} Note</span>
                  </button>
                </div>
                <NoteEditorWithMentions
                  value={noteText}
                  onChange={setNoteText}
                  placeholder="Add a note... Use @ to mention someone"
                  onMention={(userId) => {
                    // Mention is automatically included in the text
                    console.log("Mentioned user:", userId)
                  }}
                />
                <button
                  onClick={handleSendNote}
                  disabled={!noteText.trim() || isSubmittingNote}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-white/90 text-black font-semibold rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingNote ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Add Note
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-white/10 p-6 flex gap-3 justify-end">
          <button
            onClick={() => handleQuickAction("call")}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm"
          >
            <Phone className="w-4 h-4" />
            Call
          </button>
          <button
            onClick={() => handleQuickAction("reply")}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-white/90 text-black font-semibold rounded-lg transition-colors text-sm"
          >
            <Send className="w-4 h-4" />
            Reply
          </button>
        </div>
      </div>
    </div>
  )
}

