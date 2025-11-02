/**
 * Empty State Component
 * Shows when there are no contacts or messages
 */

"use client"

import { Inbox, MessageCircle } from "lucide-react"

interface EmptyStateProps {
  type: "contacts" | "messages"
  message?: string
}

export default function EmptyState({ type, message }: EmptyStateProps) {
  const defaultMessage = type === "contacts" 
    ? "No conversations yet. Send a message to get started!"
    : "No messages yet. Start a conversation!"

  return (
    <div className="flex flex-col items-center justify-center h-64 text-white/50">
      {type === "contacts" ? (
        <Inbox className="w-12 h-12 mb-4 opacity-50" />
      ) : (
        <MessageCircle className="w-12 h-12 mb-4 opacity-50" />
      )}
      <p className="text-sm">{message || defaultMessage}</p>
    </div>
  )
}

