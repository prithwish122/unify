"use client"

import type React from "react"

import { useState } from "react"
import KanbanColumn from "./kanban-column"
import type { Contact } from "@/types/contact"

interface KanbanBoardProps {
  onContactClick: (contact: Contact) => void
  searchQuery: string
  filterChannel: string
}

export default function KanbanBoard({ onContactClick, searchQuery, filterChannel }: KanbanBoardProps) {
  const [cards, setCards] = useState<{ [key: string]: Contact[] }>({
    unread: [
      {
        id: "1",
        name: "Sarah Johnson",
        lastMessage: "Hey, can you check the proposal?",
        channel: "whatsapp",
        timestamp: "2 min ago",
        status: "unread",
        avatar: "🧑‍💼",
      },
      {
        id: "2",
        name: "Mike Chen",
        lastMessage: "Meeting at 3 PM today",
        channel: "sms",
        timestamp: "15 min ago",
        status: "unread",
        avatar: "🧑‍💻",
      },
    ],
    active: [
      {
        id: "3",
        name: "Emma Wilson",
        lastMessage: "Thanks for the update!",
        channel: "email",
        timestamp: "1 hour ago",
        status: "active",
        avatar: "👩‍🔬",
      },
      {
        id: "4",
        name: "David Lee",
        lastMessage: "Project is on schedule",
        channel: "whatsapp",
        timestamp: "3 hours ago",
        status: "active",
        avatar: "👨‍🎨",
      },
    ],
    closed: [
      {
        id: "5",
        name: "Lisa Anderson",
        lastMessage: "Perfect, thanks!",
        channel: "sms",
        timestamp: "Yesterday",
        status: "closed",
        avatar: "👩‍💼",
      },
    ],
  })

  const handleDragStart = (e: React.DragEvent, sourceColumn: string, cardId: string) => {
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("cardId", cardId)
    e.dataTransfer.setData("sourceColumn", sourceColumn)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, targetColumn: string) => {
    e.preventDefault()
    const cardId = e.dataTransfer.getData("cardId")
    const sourceColumn = e.dataTransfer.getData("sourceColumn")

    if (sourceColumn !== targetColumn) {
      setCards((prev) => {
        const sourceCards = [...prev[sourceColumn]]
        const targetCards = [...prev[targetColumn]]
        const cardToMove = sourceCards.find((c) => c.id === cardId)

        if (cardToMove) {
          sourceCards.splice(
            sourceCards.findIndex((c) => c.id === cardId),
            1,
          )
          targetCards.push(cardToMove)
        }

        return {
          ...prev,
          [sourceColumn]: sourceCards,
          [targetColumn]: targetCards,
        }
      })
    }
  }

  const columns = [
    { key: "unread", title: "Unread", color: "from-blue-500/20 to-blue-600/10" },
    { key: "active", title: "Active / Scheduled", color: "from-purple-500/20 to-purple-600/10" },
    { key: "closed", title: "Closed / Replied", color: "from-green-500/20 to-green-600/10" },
  ]

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
