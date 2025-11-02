"use client"

import Sidebar from "@/components/dashboard/sidebar"

export default function ContactsPage() {
  const contacts = [
    { id: 1, name: "Sarah Johnson", channels: ["WhatsApp", "Email"], lastContact: "2 hours ago" },
    { id: 2, name: "Mike Chen", channels: ["SMS", "WhatsApp"], lastContact: "1 day ago" },
    { id: 3, name: "Emma Wilson", channels: ["Email"], lastContact: "3 days ago" },
    { id: 4, name: "David Lee", channels: ["WhatsApp"], lastContact: "1 week ago" },
  ]

  return (
    <main className="min-h-screen">
      <div
        className="fixed inset-0 -z-10"
        style={{
          backgroundImage: "url('/background.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      />

      <div className="flex h-screen overflow-hidden">
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-white/5 backdrop-blur-xl border-b border-white/20 px-6 py-6">
            <h1 className="text-white text-3xl font-bold">Contacts</h1>
          </div>

          {/* Contacts List */}
          <div className="flex-1 overflow-auto p-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="text-left px-6 py-4 text-white font-semibold text-sm">Name</th>
                    <th className="text-left px-6 py-4 text-white font-semibold text-sm">Channels</th>
                    <th className="text-left px-6 py-4 text-white font-semibold text-sm">Last Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((contact) => (
                    <tr key={contact.id} className="border-b border-white/10 hover:bg-white/10 transition-colors">
                      <td className="px-6 py-4 text-white">{contact.name}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {contact.channels.map((channel) => (
                            <span key={channel} className="bg-white/20 text-white text-xs px-2 py-1 rounded">
                              {channel}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white/70 text-sm">{contact.lastContact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
