"use client"

import { useState } from "react"
import { X, Send, Paperclip, Clock } from "lucide-react"

interface ComposerPanelProps {
  onClose: () => void
}

export default function ComposerPanel({ onClose }: ComposerPanelProps) {
  const [message, setMessage] = useState("")
  const [selectedChannel, setSelectedChannel] = useState("whatsapp")
  const [scheduleTime, setScheduleTime] = useState("")
  const [showSchedule, setShowSchedule] = useState(false)

  const channels = ["whatsapp", "sms", "email"]

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl flex flex-col h-full overflow-hidden w-96">
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
        {/* Channel Selector */}
        <div className="flex gap-2">
          {channels.map((channel) => (
            <button
              key={channel}
              onClick={() => setSelectedChannel(channel)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                selectedChannel === channel ? "bg-white text-black" : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {channel.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Editor */}
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 resize-none text-sm"
          rows={8}
        />

        {/* Schedule Input */}
        {showSchedule && (
          <input
            type="datetime-local"
            value={scheduleTime}
            onChange={(e) => setScheduleTime(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-white/30 text-sm"
          />
        )}
      </div>

      {/* Footer Actions */}
      <div className="border-t border-white/10 p-4 flex items-center gap-2">
        <button
          title="Attach file"
          className="flex items-center justify-center p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
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
          onClick={onClose}
          disabled={!message.trim()}
          className="ml-auto flex items-center gap-2 px-3 py-2 bg-white hover:bg-white/90 text-black font-semibold rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
          Send
        </button>
      </div>
    </div>
  )
}
