"use client"

import { useState } from "react"
import { X, Phone, Send, Lock, Unlock } from "lucide-react"
import type { Contact } from "@/types/contact"

interface ContactModalProps {
  contact: Contact
  onClose: () => void
}

export default function ContactModal({ contact, onClose }: ContactModalProps) {
  const [activeTab, setActiveTab] = useState("messages")
  const [isPrivateNote, setIsPrivateNote] = useState(false)
  const [noteText, setNoteText] = useState("")

  const messages = [
    { id: 1, sender: "them", text: "Hey, how are you?", time: "10:00 AM" },
    { id: 2, sender: "you", text: "Good! How about you?", time: "10:02 AM" },
    { id: 3, sender: "them", text: "Great! Can you check the proposal?", time: "10:05 AM" },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl w-full max-w-2xl max-h-96 flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{contact.avatar}</span>
            <div>
              <h2 className="text-white font-semibold">{contact.name}</h2>
              <p className="text-white/50 text-sm">{contact.channel.toUpperCase()}</p>
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
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-2 text-sm font-medium transition-colors ${
                activeTab === tab ? "text-white border-b-2 border-white" : "text-white/50 hover:text-white/70"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "messages" ? (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === "you" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.sender === "you" ? "bg-white/20 text-white" : "bg-white/10 text-white/90"
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <p className="text-xs text-white/50 mt-1">{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
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
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add a note..."
                className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 resize-none text-sm"
                rows={4}
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-white/10 p-6 flex gap-3 justify-end">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm">
            <Phone className="w-4 h-4" />
            Call
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-white/90 text-black font-semibold rounded-lg transition-colors text-sm">
            <Send className="w-4 h-4" />
            Reply
          </button>
        </div>
      </div>
    </div>
  )
}
