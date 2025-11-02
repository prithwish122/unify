/**
 * Enhanced Settings Page - Uses real Twilio API data
 */

"use client"

import { useState } from "react"
import Sidebar from "@/components/dashboard/sidebar"
import { Save, ShoppingCart, Plus, Copy, Check, Loader2, RefreshCw } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/hooks/use-auth"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("account")
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const { user, refreshSession } = useAuth()
  const queryClient = useQueryClient()

  // Fetch Twilio numbers
  const { data: numbersData, isLoading: numbersLoading } = useQuery({
    queryKey: ["twilio-numbers"],
    queryFn: async () => {
      const res = await fetch("/api/twilio/numbers")
      if (!res.ok) throw new Error("Failed to fetch Twilio numbers")
      return res.json()
    },
    enabled: user?.role === "ADMIN",
  })

  // Buy number mutation
  const buyNumberMutation = useMutation({
    mutationFn: async (areaCode?: string) => {
      const res = await fetch("/api/twilio/numbers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ areaCode }),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to buy number")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["twilio-numbers"] })
      alert("Number purchased successfully!")
    },
    onError: (error) => {
      alert(error instanceof Error ? error.message : "Failed to buy number")
    },
  })

  // Setup Twilio integration mutation
  const setupTwilioMutation = useMutation({
    mutationFn: async (config: {
      accountSid: string
      authToken: string
      defaultFrom?: string
      whatsappFrom?: string
    }) => {
      const res = await fetch("/api/twilio/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to setup Twilio")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["twilio-numbers"] })
      alert("Twilio integration configured successfully!")
    },
    onError: (error) => {
      alert(error instanceof Error ? error.message : "Failed to setup Twilio")
    },
  })

  const [twilioConfig, setTwilioConfig] = useState({
    accountSid: "AC77e2920c6126a87f1ef347a8104ef23d",
    authToken: "fdb203ed4a2c47d0d3c0390f3484e584",
    defaultFrom: "+17627284329",
    whatsappFrom: "whatsapp:+14155238886",
  })

  const twilioNumbers = numbersData?.numbers || []

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleSetupTwilio = () => {
    setupTwilioMutation.mutate(twilioConfig)
  }

  const handleBuyNumber = () => {
    const areaCode = prompt("Enter area code (optional, e.g., 415):")
    buyNumberMutation.mutate(areaCode || undefined)
  }

  const isAdmin = user?.role === "ADMIN"

  return (
    <main className="min-h-screen">
      {/* Fixed background */}
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

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-white/5 backdrop-blur-xl border-b border-white/20 px-6 py-6">
            <h1 className="text-white text-3xl font-bold">Settings</h1>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-4xl mx-auto">
              {/* Tabs */}
              <div className="flex gap-4 mb-6 border-b border-white/10">
                {["account", "twilio"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-3 px-4 text-sm font-medium transition-colors ${
                      activeTab === tab
                        ? "text-white border-b-2 border-white"
                        : "text-white/50 hover:text-white/70"
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
                          defaultValue={user?.name || ""}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                        />
                      </div>
                      <div>
                        <label className="block text-white/70 text-sm font-medium mb-2">Email</label>
                        <input
                          type="email"
                          defaultValue={user?.email || ""}
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
                  {/* Setup Form */}
                  {!isAdmin && (
                    <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-lg p-6">
                      <p className="text-white/70 text-sm mb-4">
                        Admin access required to manage Twilio integration
                      </p>
                      <p className="text-white/50 text-xs mb-4">
                        If you just set yourself as admin, please refresh your session.
                      </p>
                      <button
                        onClick={refreshSession}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Refresh Session
                      </button>
                    </div>
                  )}

                  {isAdmin && (
                    <>
                      <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-lg p-6">
                        <div className="flex items-start justify-between mb-6">
                          <div>
                            <h3 className="text-white font-semibold">Twilio Integration</h3>
                            <p className="text-white/70 text-sm mt-1">
                              Configure your Twilio account credentials
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-white/70 text-sm font-medium mb-2">
                              Account SID
                            </label>
                            <input
                              type="text"
                              value={twilioConfig.accountSid}
                              onChange={(e) =>
                                setTwilioConfig({ ...twilioConfig, accountSid: e.target.value })
                              }
                              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                              placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                            />
                          </div>
                          <div>
                            <label className="block text-white/70 text-sm font-medium mb-2">Auth Token</label>
                            <input
                              type="password"
                              value={twilioConfig.authToken}
                              onChange={(e) =>
                                setTwilioConfig({ ...twilioConfig, authToken: e.target.value })
                              }
                              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                              placeholder="Your auth token"
                            />
                          </div>
                          <div>
                            <label className="block text-white/70 text-sm font-medium mb-2">
                              Default From Number
                            </label>
                            <input
                              type="text"
                              value={twilioConfig.defaultFrom}
                              onChange={(e) =>
                                setTwilioConfig({ ...twilioConfig, defaultFrom: e.target.value })
                              }
                              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                              placeholder="+17627284329"
                            />
                          </div>
                          <div>
                            <label className="block text-white/70 text-sm font-medium mb-2">
                              WhatsApp From Number
                            </label>
                            <input
                              type="text"
                              value={twilioConfig.whatsappFrom}
                              onChange={(e) =>
                                setTwilioConfig({ ...twilioConfig, whatsappFrom: e.target.value })
                              }
                              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                              placeholder="whatsapp:+14155238886"
                            />
                          </div>
                          <button
                            onClick={handleSetupTwilio}
                            disabled={setupTwilioMutation.isPending}
                            className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-white/90 text-black font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {setupTwilioMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Save className="w-4 h-4" />
                            )}
                            Save Twilio Configuration
                          </button>
                        </div>
                      </div>

                      {/* Phone Numbers */}
                      <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-white font-semibold text-sm">Phone Numbers</h4>
                          <button
                            onClick={handleBuyNumber}
                            disabled={buyNumberMutation.isPending}
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm disabled:opacity-50"
                          >
                            {buyNumberMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Plus className="w-4 h-4" />
                            )}
                            Buy Number
                          </button>
                        </div>

                        {numbersLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-white" />
                          </div>
                        ) : twilioNumbers.length === 0 ? (
                          <div className="text-center py-8 text-white/50 text-sm">
                            No phone numbers found. Buy one to get started.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {twilioNumbers.map((num: any) => (
                              <div
                                key={num.id}
                                className="bg-white/10 border border-white/20 rounded-lg p-4 flex items-center justify-between"
                              >
                                <div>
                                  <p className="text-white font-medium">{num.phoneNumber}</p>
                                  {num.friendlyName && (
                                    <p className="text-white/50 text-xs mt-1">{num.friendlyName}</p>
                                  )}
                                  <p className="text-white/50 text-xs mt-1">
                                    Added {new Date(num.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="flex items-center gap-4">
                                  <span
                                    className={`text-xs font-medium px-3 py-1 rounded ${
                                      num.status === "active"
                                        ? "bg-green-500/20 text-green-300"
                                        : "bg-gray-500/20 text-gray-300"
                                    }`}
                                  >
                                    {num.status}
                                  </span>
                                  <button
                                    onClick={() => copyToClipboard(num.phoneNumber, num.id)}
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
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

