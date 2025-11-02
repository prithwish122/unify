"use client"

import { useState } from "react"
import Sidebar from "@/components/dashboard/sidebar"
import { Save, ShoppingCart, Plus, Copy, Check } from "lucide-react"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("account")
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const twilioNumbers = [
    { id: "1", number: "+1 (555) 123-4567", status: "Active", created: "2024-01-15" },
    { id: "2", number: "+1 (555) 234-5678", status: "Active", created: "2024-01-20" },
    { id: "3", number: "+1 (555) 345-6789", status: "Inactive", created: "2024-01-10" },
  ]

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

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
            <h1 className="text-white text-3xl font-bold">Settings</h1>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-4xl">
              {/* Tabs */}
              <div className="flex gap-4 mb-6 border-b border-white/20">
                {["account", "twilio", "notifications"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-4 px-2 text-sm font-medium transition-colors ${
                      activeTab === tab ? "text-white border-b-2 border-white" : "text-white/50 hover:text-white/70"
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* Account Settings */}
              {activeTab === "account" && (
                <div className="space-y-6">
                  <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-lg p-6">
                    <h3 className="text-white font-semibold mb-6">Account Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-white/70 text-sm font-medium mb-2">Full Name</label>
                        <input
                          type="text"
                          defaultValue="John Doe"
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                        />
                      </div>
                      <div>
                        <label className="block text-white/70 text-sm font-medium mb-2">Email</label>
                        <input
                          type="email"
                          defaultValue="john@example.com"
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                        />
                      </div>
                      <div>
                        <label className="block text-white/70 text-sm font-medium mb-2">Company</label>
                        <input
                          type="text"
                          defaultValue="Acme Inc."
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                        />
                      </div>
                    </div>
                    <button className="flex items-center gap-2 mt-6 px-6 py-2 bg-white hover:bg-white/90 text-black font-semibold rounded-lg transition-colors">
                      <Save className="w-4 h-4" />
                      Save Changes
                    </button>
                  </div>
                </div>
              )}

              {/* Twilio Settings */}
              {activeTab === "twilio" && (
                <div className="space-y-6">
                  {/* Trial Info */}
                  <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h3 className="text-white font-semibold">Twilio Integration</h3>
                        <p className="text-white/70 text-sm mt-1">Manage your Twilio trial account and phone numbers</p>
                      </div>
                    </div>

                    <div className="bg-white/10 rounded-lg p-4 mb-6 border border-white/20">
                      <p className="text-white/70 text-sm">
                        <span className="font-semibold text-white">Twilio Status:</span> Trial Account
                      </p>
                      <p className="text-white/70 text-sm mt-2">
                        <span className="font-semibold text-white">Account SID:</span>{" "}
                        ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
                      </p>
                    </div>

                    {/* Phone Numbers */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-white font-semibold text-sm">Phone Numbers</h4>
                        <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm">
                          <Plus className="w-4 h-4" />
                          Add Number
                        </button>
                      </div>

                      <div className="space-y-3">
                        {twilioNumbers.map((num) => (
                          <div
                            key={num.id}
                            className="bg-white/10 border border-white/20 rounded-lg p-4 flex items-center justify-between"
                          >
                            <div>
                              <p className="text-white font-medium">{num.number}</p>
                              <p className="text-white/50 text-xs mt-1">Added {num.created}</p>
                            </div>
                            <div className="flex items-center gap-4">
                              <span
                                className={`text-xs font-medium px-3 py-1 rounded ${
                                  num.status === "Active"
                                    ? "bg-green-500/20 text-green-300"
                                    : "bg-gray-500/20 text-gray-300"
                                }`}
                              >
                                {num.status}
                              </span>
                              <button
                                onClick={() => copyToClipboard(num.number, num.id)}
                                className="text-white/70 hover:text-white transition-colors"
                              >
                                {copiedId === num.id ? (
                                  <Check className="w-4 h-4 text-green-400" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Buy Numbers */}
                    <div className="border-t border-white/10 pt-6">
                      <h4 className="text-white font-semibold text-sm mb-4">Upgrade Your Trial</h4>
                      <p className="text-white/70 text-sm mb-4">
                        Get access to more phone numbers, higher message limits, and production features.
                      </p>
                      <button className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-white/90 text-black font-semibold rounded-lg transition-colors">
                        <ShoppingCart className="w-4 h-4" />
                        Buy Now - Explore Plans
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Settings */}
              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-lg p-6">
                    <h3 className="text-white font-semibold mb-6">Notification Preferences</h3>
                    <div className="space-y-4">
                      {[
                        { label: "New Messages", enabled: true },
                        { label: "Assignment Changes", enabled: true },
                        { label: "Scheduled Messages", enabled: false },
                        { label: "Weekly Summary", enabled: true },
                      ].map((notif, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-4 bg-white/10 rounded-lg border border-white/20"
                        >
                          <span className="text-white text-sm">{notif.label}</span>
                          <input type="checkbox" defaultChecked={notif.enabled} className="w-4 h-4 cursor-pointer" />
                        </div>
                      ))}
                    </div>
                    <button className="flex items-center gap-2 mt-6 px-6 py-2 bg-white hover:bg-white/90 text-black font-semibold rounded-lg transition-colors">
                      <Save className="w-4 h-4" />
                      Save Preferences
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
