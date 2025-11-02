/**
 * Enhanced Kanban Board - Uses real data from API
 * Fetches contacts and messages, updates status on drag
 */

"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useContacts } from "@/hooks/use-contacts"
import KanbanColumn from "./kanban-column"
import type { Contact as ContactType } from "@/types/contact"
import { formatDistanceToNow } from "date-fns"

interface KanbanBoardProps {
  onContactClick: (contact: ContactType) => void
  searchQuery: string
  filterChannel: string
}

// Helper to convert ContactStatus to kanban column key
function statusToColumn(status: string): "unread" | "active" | "closed" {
  if (status === "UNREAD") return "unread"
  if (status === "ACTIVE") return "active"
  return "closed"
}

// Helper to convert kanban column to ContactStatus
function columnToStatus(column: string): "UNREAD" | "ACTIVE" | "CLOSED" {
  if (column === "unread") return "UNREAD"
  if (column === "active") return "ACTIVE"
  return "CLOSED"
}

// Get channel badge from message channel
function getChannelFromContact(contact: any): "whatsapp" | "sms" | "email" {
  // Get last message channel
  if (contact.messages && contact.messages.length > 0) {
    const lastMessage = contact.messages[0]
    const channel = lastMessage.channel?.toLowerCase()
    if (channel === "whatsapp") return "whatsapp"
    if (channel === "sms") return "sms"
    if (channel === "email") return "email"
  }
  return "whatsapp" // Default
}

export default function KanbanBoardEnhanced({ onContactClick, searchQuery, filterChannel }: KanbanBoardProps) {
  // Fetch contacts with their latest messages
  const { data: contactsData, isLoading, refetch } = useContacts({ limit: 100 })
  const contacts = contactsData?.contacts || []

  // Organize contacts by status
  const [cards, setCards] = useState<{ [key: string]: ContactType[] }>({
    unread: [],
    active: [],
    closed: [],
  })

  // Update cards when contacts data changes
  useEffect(() => {
    if (contacts.length > 0) {
      const organized: { [key: string]: ContactType[] } = {
        unread: [],
        active: [],
        closed: [],
      }

      contacts.forEach((contact: any) => {
        // Get last message
        const lastMessage = contact.messages?.[0] || null
        const lastMessageText = lastMessage?.content || "No messages yet"

        // Get timestamp
        const lastContactAt = contact.lastContactAt ? new Date(contact.lastContactAt) : new Date()
        const timestamp = formatDistanceToNow(lastContactAt, { addSuffix: true })

        // Get channel from last message or default
        const channel = getChannelFromContact(contact)

        // Create contact card
        const card: ContactType = {
          id: contact.id,
          name: contact.name || contact.email || contact.phone || "Unknown",
          lastMessage: lastMessageText,
          channel,
          timestamp,
          status: contact.status?.toLowerCase() || "unread",
          avatar: contact.avatar || "👤",
        }

        // Filter by search query
        const matchesSearch =
          !searchQuery ||
          card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          card.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())

        // Filter by channel
        const matchesChannel = filterChannel === "all" || card.channel === filterChannel.toLowerCase()

        if (matchesSearch && matchesChannel) {
          const column = statusToColumn(contact.status || "UNREAD")
          organized[column].push(card)
        }
      })

      setCards(organized)
    }
  }, [contacts, searchQuery, filterChannel])

  const handleDragStart = (e: React.DragEvent, sourceColumn: string, cardId: string) => {
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("cardId", cardId)
    e.dataTransfer.setData("sourceColumn", sourceColumn)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = async (e: React.DragEvent, targetColumn: string) => {
    e.preventDefault()
    const cardId = e.dataTransfer.getData("cardId")
    const sourceColumn = e.dataTransfer.getData("sourceColumn")

    if (sourceColumn !== targetColumn) {
      // Update contact status in database
      try {
        const newStatus = columnToStatus(targetColumn)

        const response = await fetch(`/api/contacts/${cardId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Failed to update contact status")
        }

        // Update local state optimistically
        setCards((prev) => {
          const sourceCards = [...prev[sourceColumn]]
          const targetCards = [...prev[targetColumn]]
          const cardToMove = sourceCards.find((c) => c.id === cardId)

          if (cardToMove) {
            sourceCards.splice(
              sourceCards.findIndex((c) => c.id === cardId),
              1,
            )
            targetCards.push({ ...cardToMove, status: targetColumn })
          }

          return {
            ...prev,
            [sourceColumn]: sourceCards,
            [targetColumn]: targetCards,
          }
        })

        // Refetch to ensure sync
        refetch()
      } catch (error) {
        console.error("Failed to update contact status:", error)
        alert(error instanceof Error ? error.message : "Failed to update contact status. Please try again.")
      }
    }
  }

  const columns = [
    { key: "unread", title: "Unread", color: "from-blue-500/20 to-blue-600/10" },
    { key: "active", title: "Active / Scheduled", color: "from-purple-500/20 to-purple-600/10" },
    { key: "closed", title: "Closed / Replied", color: "from-green-500/20 to-green-600/10" },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white/70">Loading contacts...</div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {columns.map((column) => (
        <KanbanColumn
          key={column.key}
          title={column.title}
          cards={cards[column.key]}
          columnKey={column.key}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onCardClick={onContactClick}
          color={column.color}
          searchQuery={searchQuery}
          filterChannel={filterChannel}
        />
      ))}
    </div>
  )
}

