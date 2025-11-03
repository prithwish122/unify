/**
 * Enhanced Composer Panel with Tiptap Rich Text Editor
 * Supports cross-channel messaging, scheduling, and media attachments
 */

"use client"

import { useState } from "react"
import { X, Send, Paperclip, Clock, Loader2 } from "lucide-react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { useSendMessage } from "@/hooks/use-messages"
import { useContacts, useUpsertContact } from "@/hooks/use-contacts"
import type { MessageChannel } from "@/types/message"

interface ComposerPanelProps {
  onClose: () => void
  contactId?: string // Pre-select a contact
  channel?: MessageChannel // Pre-select a channel
}

export default function ComposerPanelEnhanced({ onClose, contactId: initialContactId, channel: initialChannel }: ComposerPanelProps) {
  const [selectedChannel, setSelectedChannel] = useState<MessageChannel>(initialChannel || "WHATSAPP")
  const [selectedContactId, setSelectedContactId] = useState<string | undefined>(initialContactId)
  const [directPhoneNumber, setDirectPhoneNumber] = useState<string>("")
  const [useDirectPhone, setUseDirectPhone] = useState<boolean>(false)
  const [showSchedule, setShowSchedule] = useState(false)
  const [scheduleTime, setScheduleTime] = useState("")
  const [mediaUrls, setMediaUrls] = useState<string[]>([])

  const { mutate: sendMessage, isPending } = useSendMessage()
  const { data: contactsData } = useContacts({ limit: 50 })
  const { mutate: upsertContact } = useUpsertContact()
  const [showCreateContact, setShowCreateContact] = useState(false)
  const [newContactName, setNewContactName] = useState("")
  const [newContactEmail, setNewContactEmail] = useState("")
  const [newContactPhone, setNewContactPhone] = useState("")

  // Tiptap editor
  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    immediatelyRender: false, // Fix SSR hydration error
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none focus:outline-none p-3 min-h-[150px]",
      },
    },
  })

  const channels: { value: MessageChannel; label: string }[] = [
    { value: "WHATSAPP", label: "WhatsApp" },
    { value: "SMS", label: "SMS" },
    { value: "EMAIL", label: "Email" },
  ]

  const handleSend = async () => {
    if (!editor) return

    const content = editor.getText()
    const htmlContent = editor.getHTML()

    if (!content.trim()) return

    // Determine recipient: either selected contact or direct phone number
    let finalContactId: string | undefined = selectedContactId

    // If using direct phone number, create or find contact
    if (useDirectPhone && directPhoneNumber.trim()) {
      const phoneNumber = directPhoneNumber.trim().startsWith("+") 
        ? directPhoneNumber.trim() 
        : `+${directPhoneNumber.trim()}`

      try {
        // Try to find existing contact by phone
        const contacts = contactsData?.contacts || []
        const existingContact = contacts.find((c: any) => {
          const contactPhone = c.phone || ""
          return contactPhone === phoneNumber || 
                 contactPhone.replace(/^\+/, "") === phoneNumber.replace(/^\+/, "")
        })

        if (existingContact) {
          finalContactId = existingContact.id
        } else {
          // Create new contact with phone number
          await new Promise<void>((resolve, reject) => {
            upsertContact(
              {
                phone: phoneNumber,
                name: phoneNumber, // Use phone as name if no name provided
              },
              {
                onSuccess: (data: any) => {
                  finalContactId = data?.contact?.id || data?.contact?.id || data?.id
                  resolve()
                },
                onError: (error) => {
                  reject(error)
                },
              },
            )
          })
        }
      } catch (error) {
        console.error("Error creating/finding contact:", error)
        alert(error instanceof Error ? error.message : "Failed to create contact")
        return
      }
    }

    if (!finalContactId) {
      alert("Please select a contact or enter a phone number")
      return
    }

    sendMessage(
      {
        contactId: finalContactId,
        channel: selectedChannel,
        content: content.trim(),
        htmlContent: htmlContent !== "<p></p>" && htmlContent.trim() ? htmlContent : undefined,
        mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
        scheduledFor: showSchedule && scheduleTime ? new Date(scheduleTime).toISOString() : undefined,
      },
      {
        onSuccess: () => {
          editor.commands.clearContent()
          setMediaUrls([])
          setScheduleTime("")
          setShowSchedule(false)
          setDirectPhoneNumber("")
          setUseDirectPhone(false)
          // Show success message
          alert("Message sent successfully!")
          onClose()
        },
        onError: (error) => {
          console.error("Send message error:", error)
          const errorMessage = error instanceof Error ? error.message : "Failed to send message"
          alert(`Error: ${errorMessage}`)
        },
      },
    )
  }

  const contacts = contactsData?.contacts || []

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl flex flex-col h-full overflow-hidden w-[680px] max-w-[90vw]">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-white/10">
        <h3 className="text-white font-semibold">Compose Message</h3>
        <button
          onClick={onClose}
          className="text-white/50 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Contact Selection */}
        <div>
          <label className="block text-white/70 text-xs font-medium mb-2">To:</label>
          <div className="flex gap-2 mb-2">
            {!useDirectPhone ? (
              <>
                <select
                  value={selectedContactId || ""}
                  onChange={(e) => {
                    setSelectedContactId(e.target.value || undefined)
                    setUseDirectPhone(false)
                  }}
                  className="flex-1 bg-white/10 border border-white/20 rounded-lg p-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
                >
                  <option value="">Select contact...</option>
                  {contacts.map((contact: any) => (
                    <option key={contact.id} value={contact.id}>
                      {contact.name || contact.email || contact.phone || contact.id}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => setUseDirectPhone(true)}
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs transition-colors"
                  title="Enter phone number directly"
                >
                  📱
                </button>
              </>
            ) : (
              <>
                <input
                  type="tel"
                  value={directPhoneNumber}
                  onChange={(e) => setDirectPhoneNumber(e.target.value)}
                  placeholder="+919674155763"
                  className="flex-1 bg-white/10 border border-white/20 rounded-lg p-2 text-white text-sm placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
                <button
                  onClick={() => {
                    setUseDirectPhone(false)
                    setDirectPhoneNumber("")
                  }}
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs transition-colors"
                  title="Use contact list"
                >
                  ←
                </button>
              </>
            )}
            <button
              onClick={() => setShowCreateContact(!showCreateContact)}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs transition-colors"
              title="Create new contact"
            >
              +
            </button>
          </div>
          {showCreateContact && (
            <div className="mt-2 p-3 bg-white/5 rounded-lg space-y-2 border border-white/10">
              <input
                type="text"
                placeholder="Name"
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded p-2 text-white text-xs placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              <input
                type="email"
                placeholder="Email"
                value={newContactEmail}
                onChange={(e) => setNewContactEmail(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded p-2 text-white text-xs placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              <input
                type="tel"
                placeholder="Phone (+1234567890)"
                value={newContactPhone}
                onChange={(e) => setNewContactPhone(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded p-2 text-white text-xs placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              <button
                onClick={async () => {
                  if (!newContactName && !newContactEmail && !newContactPhone) {
                    alert("Please enter at least name, email, or phone")
                    return
                  }
                  upsertContact(
                    {
                      name: newContactName || undefined,
                      email: newContactEmail || undefined,
                      phone: newContactPhone || undefined,
                    },
                    {
                      onSuccess: (data) => {
                        setSelectedContactId(data.contact?.id || data.contact.id)
                        setShowCreateContact(false)
                        setNewContactName("")
                        setNewContactEmail("")
                        setNewContactPhone("")
                      },
                      onError: (error) => {
                        alert(error instanceof Error ? error.message : "Failed to create contact")
                      },
                    },
                  )
                }}
                className="w-full px-3 py-2 bg-white hover:bg-white/90 text-black font-semibold rounded text-xs transition-colors"
              >
                Create Contact
              </button>
            </div>
          )}
        </div>

        {/* Channel Selector */}
        <div className="flex gap-2">
          {channels.map((channel) => (
            <button
              key={channel.value}
              onClick={() => setSelectedChannel(channel.value)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                selectedChannel === channel.value
                  ? "bg-white text-black"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {channel.label}
            </button>
          ))}
        </div>

        {/* Rich Text Editor */}
        {editor && (
          <div className="bg-white/10 border border-white/20 rounded-lg min-h-[220px] overflow-auto">
            <EditorContent editor={editor} />
          </div>
        )}
        {!editor && (
          <div className="bg-white/10 border border-white/20 rounded-lg min-h-[220px] flex items-center justify-center text-white/50 text-sm">
            Loading editor...
          </div>
        )}

        {/* Media Attachments */}
        {mediaUrls.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {mediaUrls.map((url, index) => (
              <div key={index} className="relative">
                <img src={url} alt={`Attachment ${index + 1}`} className="w-20 h-20 object-cover rounded" loading="lazy" decoding="async" />
                <button
                  onClick={() => setMediaUrls(mediaUrls.filter((_, i) => i !== index))}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Schedule Input */}
        {showSchedule && (
          <div>
            <label className="block text-white/70 text-xs font-medium mb-2">Schedule for:</label>
            <input
              type="datetime-local"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-white/30 text-sm"
            />
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="border-t border-white/10 p-4 flex items-center gap-2">
        <button
          title="Attach file"
          className="flex items-center justify-center p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          onClick={() => {
            const input = document.createElement("input")
            input.type = "file"
            input.accept = "image/*"
            input.onchange = async (e) => {
              const file = (e.target as HTMLInputElement).files?.[0]
              if (!file) return
              try {
                const formData = new FormData()
                formData.append("file", file)
                const res = await fetch("/api/upload", { method: "POST", body: formData })
                const json = await res.json()
                if (!res.ok) throw new Error(json?.error || "Upload failed")
                setMediaUrls([...mediaUrls, json.url])
              } catch (err: any) {
                alert(err?.message || "Failed to upload media. Configure Cloudinary env vars to enable uploads.")
              }
            }
            input.click()
          }}
        >
          <Paperclip className="w-4 h-4" />
        </button>
        <button
          onClick={() => setShowSchedule(!showSchedule)}
          title="Schedule message"
          className={`flex items-center justify-center p-2 rounded-lg transition-colors ${
            showSchedule ? "bg-white/20 text-white" : "bg-white/10 hover:bg-white/20 text-white"
          }`}
        >
          <Clock className="w-4 h-4" />
        </button>
        <button
          onClick={handleSend}
          disabled={!editor?.getText().trim() || (!selectedContactId && (!useDirectPhone || !directPhoneNumber.trim())) || isPending}
          className="ml-auto flex items-center gap-2 px-3 py-2 bg-white hover:bg-white/90 text-black font-semibold rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          Send
        </button>
      </div>
    </div>
  )
}

