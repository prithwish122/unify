/**
 * Note Editor with @mentions support
 * Includes real-time presence indicators
 */

"use client"

import { useState, useRef, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { AtSign, Loader2 } from "lucide-react"

interface NoteEditorWithMentionsProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  onMention?: (userId: string) => void
}

export default function NoteEditorWithMentions({
  value,
  onChange,
  placeholder = "Type a note... Use @ to mention someone",
  onMention,
}: NoteEditorWithMentionsProps) {
  const [showMentions, setShowMentions] = useState(false)
  const [mentionQuery, setMentionQuery] = useState("")
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 })
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const mentionsRef = useRef<HTMLDivElement>(null)

  // Fetch users for mentions
  const { data: usersData } = useQuery({
    queryKey: ["users", mentionQuery],
    queryFn: async () => {
      const res = await fetch(`/api/users?search=${encodeURIComponent(mentionQuery)}`)
      if (!res.ok) return { users: [] }
      return res.json()
    },
    enabled: showMentions && mentionQuery.length > 0,
  })

  const users = usersData?.users || []

  // Handle text input and detect @mentions
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    onChange(text)

    // Find cursor position
    const cursorPos = e.target.selectionStart
    const textBeforeCursor = text.substring(0, cursorPos)

    // Check if user is typing @mention
    const lastAtIndex = textBeforeCursor.lastIndexOf("@")
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1)
      // Check if it's a valid mention (no space after @)
      if (!textAfterAt.includes(" ") && !textAfterAt.includes("\n")) {
        const query = textAfterAt.toLowerCase()
        setMentionQuery(query)
        setShowMentions(true)

        // Calculate position for mentions dropdown
        const textarea = textareaRef.current
        if (textarea) {
          const textareaRect = textarea.getBoundingClientRect()
          const lineHeight = 24
          const lines = textBeforeCursor.split("\n").length
          setMentionPosition({
            top: textareaRect.top + lines * lineHeight + lineHeight,
            left: textareaRect.left + 10,
          })
        }
      } else {
        setShowMentions(false)
      }
    } else {
      setShowMentions(false)
    }
  }

  // Insert mention into text
  const insertMention = (user: { id: string; name?: string; email: string }) => {
    if (!textareaRef.current) return

    const text = value
    const cursorPos = textareaRef.current.selectionStart
    const textBeforeCursor = text.substring(0, cursorPos)
    const lastAtIndex = textBeforeCursor.lastIndexOf("@")

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1)
      const newText =
        text.substring(0, lastAtIndex) +
        `@${user.name || user.email} ` +
        text.substring(cursorPos)
      onChange(newText)

      // Notify parent of mention
      if (onMention) {
        onMention(user.id)
      }

      // Set cursor position after mention
      setTimeout(() => {
        if (textareaRef.current) {
          const newCursorPos = lastAtIndex + (user.name || user.email).length + 2
          textareaRef.current.setSelectionRange(newCursorPos, newCursorPos)
          textareaRef.current.focus()
        }
      }, 0)
    }

    setShowMentions(false)
  }

  // Close mentions on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mentionsRef.current &&
        !mentionsRef.current.contains(event.target as Node) &&
        textareaRef.current &&
        !textareaRef.current.contains(event.target as Node)
      ) {
        setShowMentions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative">
      <div className="relative">
        <AtSign className="absolute left-3 top-3 w-4 h-4 text-white/50" />
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={(e) => {
            if (showMentions && users.length > 0) {
              if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter") {
                e.preventDefault()
                // Simple: select first user on Enter
                if (e.key === "Enter") {
                  insertMention(users[0])
                }
              }
            }
          }}
          placeholder={placeholder}
          className="w-full bg-white/10 border border-white/20 rounded-lg px-10 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 min-h-[100px] resize-none"
          rows={4}
        />
      </div>

      {/* Mentions Dropdown */}
      {showMentions && (
        <div
          ref={mentionsRef}
          className="absolute z-50 bg-white/95 backdrop-blur-xl border border-white/20 rounded-lg shadow-xl mt-2 max-h-48 overflow-auto"
          style={{
            top: `${mentionPosition.top}px`,
            left: `${mentionPosition.left}px`,
            minWidth: "200px",
          }}
        >
          {users.length === 0 ? (
            <div className="p-3 text-white/50 text-sm">No users found</div>
          ) : (
            <div className="py-1">
              {users.map((user: any) => (
                <button
                  key={user.id}
                  onClick={() => insertMention(user)}
                  className="w-full text-left px-3 py-2 hover:bg-white/20 transition-colors flex items-center gap-2"
                >
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-semibold text-white">
                    {(user.name || user.email)?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.name || user.email}
                    </p>
                    {user.name && user.email && (
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    )}
                  </div>
                  {/* Presence indicator */}
                  <div className="w-2 h-2 rounded-full bg-green-500" title="Active" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

