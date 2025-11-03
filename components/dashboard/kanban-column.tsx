"use client"

import type React from "react"
import { useState } from "react"

import { MessageCircle } from "lucide-react"
import type { Contact } from "@/types/contact"

interface KanbanColumnProps {
  title: string
  cards: Contact[]
  columnKey: string
  onDragStart: (e: React.DragEvent, column: string, cardId: string) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent, column: string) => void
  onCardClick: (contact: Contact) => void
  color: string
  searchQuery: string
  filterChannel: string
}

const getChannelBadge = (channel: string) => {
  const badges: { [key: string]: { text: string; color: string } } = {
    whatsapp: { text: "WhatsApp", color: "bg-green-500/20 text-green-300" },
    sms: { text: "SMS", color: "bg-blue-500/20 text-blue-300" },
    email: { text: "Email", color: "bg-purple-500/20 text-purple-300" },
  }
  return badges[channel] || { text: "Other", color: "bg-gray-500/20 text-gray-300" }
}

export default function KanbanColumn({
  title,
  cards,
  columnKey,
  onDragStart,
  onDragOver,
  onDrop,
  onCardClick,
  color,
  searchQuery,
  filterChannel,
}: KanbanColumnProps) {
  const filteredCards = cards.filter((card) => {
    const matchesSearch =
      card.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesChannel = filterChannel === "all" || card.channel === filterChannel
    return matchesSearch && matchesChannel
  })

  const [isDraggingOver, setIsDraggingOver] = useState(false)

  return (
    <div
      onDragOver={(e) => {
        onDragOver(e)
        setIsDraggingOver(true)
      }}
      onDragLeave={(e) => {
        // Only set false if we're leaving the column entirely, not a child element
        if (e.currentTarget === e.target) {
          setIsDraggingOver(false)
        }
      }}
      onDrop={(e) => {
        setIsDraggingOver(false)
        onDrop(e, columnKey)
      }}
      className={`bg-white/5 backdrop-blur-xl border ${isDraggingOver ? 'border-white/50 border-2' : 'border-white/20'} rounded-lg p-4 min-h-96 flex flex-col transition-all duration-200`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
        <h3 className="text-white font-semibold text-sm">{title}</h3>
        <span className="bg-white/10 text-white/70 text-xs font-medium px-2 py-1 rounded">{filteredCards.length}</span>
      </div>

      {/* Cards Container */}
      <div className="flex-1 space-y-3 overflow-y-auto pr-2">
        {filteredCards.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-white/50 text-sm">No conversations</div>
        ) : (
          filteredCards.map((card) => {
            const badge = getChannelBadge(card.channel)
            return (
              <div
                key={card.id}
                draggable={true}
                onDragStart={(e) => {
                  e.dataTransfer.effectAllowed = "move"
                  onDragStart(e, columnKey, card.id)
                }}
                onDragEnd={(e) => {
                  // Reset cursor
                  e.currentTarget.style.opacity = "1"
                }}
                onClick={() => onCardClick(card)}
                className="bg-white/10 hover:bg-white/15 border border-white/20 rounded-lg p-3 cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-lg select-none"
                style={{ cursor: "grab" }}
              >
                {/* Contact Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{card.avatar}</span>
                    <div>
                      <p className="text-white font-semibold text-sm">{card.name}</p>
                      <p className="text-white/50 text-xs">{card.timestamp}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded ${badge.color}`}>{badge.text}</span>
                </div>

                {/* Message Preview */}
                <p className="text-white/70 text-xs line-clamp-2">{card.lastMessage}</p>

                {/* Status Indicator */}
                <div className="flex items-center gap-2 mt-3">
                  <MessageCircle className="w-3 h-3 text-white/50" />
                  <div className="flex-1 h-1 bg-white/10 rounded-full">
                    <div className="h-full bg-white/30 rounded-full w-1/3"></div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
