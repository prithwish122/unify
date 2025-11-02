"use client"

import { Search } from "lucide-react"

interface SearchBarProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  filterChannel: string
  setFilterChannel: (channel: string) => void
}

export default function SearchBar({ searchQuery, setSearchQuery, filterChannel, setFilterChannel }: SearchBarProps) {
  const channels = [
    { value: "all", label: "All Channels" },
    { value: "whatsapp", label: "WhatsApp" },
    { value: "sms", label: "SMS" },
    { value: "email", label: "Email" },
  ]

  return (
    <div className="bg-white/5 backdrop-blur-xl border-b border-white/20 px-6 py-4">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        {/* Search Input */}
        <div className="flex-1 w-full relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
          />
        </div>

        {/* Channel Filter */}
        <select
          value={filterChannel}
          onChange={(e) => setFilterChannel(e.target.value)}
          className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-white/30 transition-all cursor-pointer"
        >
          {channels.map((channel) => (
            <option key={channel.value} value={channel.value} className="bg-black text-white">
              {channel.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
