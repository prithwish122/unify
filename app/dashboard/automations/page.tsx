/**
 * Scheduled Automations Page
 * Manage scheduled message templates and recurring automations
 */

"use client"

import { useState } from "react"
import Sidebar from "@/components/dashboard/sidebar"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@/hooks/use-auth"
import { useContacts, useUpsertContact } from "@/hooks/use-contacts"
import { Calendar, Clock, Play, Pause, Trash2, Plus, MessageSquare, User } from "lucide-react"
import { format } from "date-fns"

export default function AutomationsPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showCreateContact, setShowCreateContact] = useState(false)
  const [newAutomation, setNewAutomation] = useState({
    name: "",
    template: "",
    channel: "WHATSAPP",
    contactId: "",
    recurrence: "once" as "once" | "daily" | "weekly",
    recurrenceTime: "",
    cronExpression: "",
    nextRunAt: "",
  })
  const [newContact, setNewContact] = useState({
    name: "",
    email: "",
    phone: "",
  })

  // Fetch contacts for dropdown
  const { data: contactsData } = useContacts({ limit: 100 })
  const contacts = contactsData?.contacts || []
  const { mutate: upsertContact } = useUpsertContact()

  // Fetch scheduled automations
  const { data: automationsData, isLoading } = useQuery({
    queryKey: ["scheduled-automations"],
    queryFn: async () => {
      const res = await fetch("/api/automations")
      if (!res.ok) throw new Error("Failed to fetch automations")
      return res.json()
    },
  })

  const automations = automationsData?.automations || []

  // Create automation mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/automations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        const errorMessage = error.error || error.details || "Failed to create automation"
        const errorDetails = error.details
          ? typeof error.details === "string"
            ? error.details
            : Array.isArray(error.details)
              ? error.details.map((e: any) => `${e.path?.join(".") || ""}: ${e.message || ""}`).join(", ")
              : JSON.stringify(error.details)
          : ""
        throw new Error(errorDetails ? `${errorMessage}: ${errorDetails}` : errorMessage)
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-automations"] })
      setShowCreateModal(false)
      setNewAutomation({ name: "", template: "", channel: "WHATSAPP", contactId: "", recurrence: "once", recurrenceTime: "", cronExpression: "", nextRunAt: "" })
      alert("Automation created successfully!")
    },
    onError: (error) => {
      console.error("Create automation error:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to create automation"
      alert(`Error: ${errorMessage}`)
    },
  })

  // Toggle automation mutation
  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await fetch(`/api/automations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to update automation")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-automations"] })
    },
  })

  // Delete automation mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/automations/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to delete automation")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduled-automations"] })
      alert("Automation deleted successfully!")
    },
  })

  const handleCreate = () => {
    if (!newAutomation.name || !newAutomation.template || !newAutomation.nextRunAt) {
      alert("Please fill in all required fields")
      return
    }

    // Convert recurrence to cron if needed
    let cronExpression = newAutomation.cronExpression
    if (newAutomation.recurrence === "daily" && newAutomation.recurrenceTime) {
      const [hours, minutes] = newAutomation.recurrenceTime.split(":").map(Number)
      cronExpression = `${minutes} ${hours} * * *` // Daily at specified time
    } else if (newAutomation.recurrence === "weekly" && newAutomation.recurrenceTime) {
      const [hours, minutes] = newAutomation.recurrenceTime.split(":").map(Number)
      const dayOfWeek = new Date(newAutomation.nextRunAt).getDay()
      cronExpression = `${minutes} ${hours} * * ${dayOfWeek}` // Weekly on same day
    }

    // Ensure nextRunAt is valid and in the future
    const nextRunDate = new Date(newAutomation.nextRunAt)
    if (isNaN(nextRunDate.getTime())) {
      alert("Please enter a valid date and time")
      return
    }
    const now = new Date()
    const buffer = new Date(now.getTime() + 60000) // 1 minute buffer
    if (nextRunDate < buffer) {
      alert("The scheduled time must be at least 1 minute in the future")
      return
    }

    createMutation.mutate({
      name: newAutomation.name.trim(),
      template: newAutomation.template.trim(),
      channel: newAutomation.channel,
      contactId: newAutomation.contactId && newAutomation.contactId.trim() !== "" ? newAutomation.contactId.trim() : undefined,
      recurrence: newAutomation.recurrence,
      recurrenceTime: newAutomation.recurrenceTime && newAutomation.recurrenceTime.trim() !== "" ? newAutomation.recurrenceTime.trim() : undefined,
      cronExpression: cronExpression && cronExpression.trim() !== "" ? cronExpression.trim() : undefined,
      nextRunAt: nextRunDate.toISOString(),
    })
  }

  const handleCreateContact = () => {
    if (!newContact.name && !newContact.email && !newContact.phone) {
      alert("Please enter at least name, email, or phone")
      return
    }

    upsertContact(
      {
        name: newContact.name || undefined,
        email: newContact.email || undefined,
        phone: newContact.phone || undefined,
      },
      {
        onSuccess: (data: any) => {
          const contactId = data?.contact?.id || data.contact?.id || data?.id
          setNewAutomation({ ...newAutomation, contactId })
          setShowCreateContact(false)
          setNewContact({ name: "", email: "", phone: "" })
          queryClient.invalidateQueries({ queryKey: ["contacts"] })
        },
        onError: (error) => {
          alert(error instanceof Error ? error.message : "Failed to create contact")
        },
      },
    )
  }

  const getChannelBadge = (channel: string) => {
    const badges: { [key: string]: { text: string; color: string } } = {
      WHATSAPP: { text: "WhatsApp", color: "bg-green-500/20 text-green-300" },
      SMS: { text: "SMS", color: "bg-blue-500/20 text-blue-300" },
      EMAIL: { text: "Email", color: "bg-purple-500/20 text-purple-300" },
    }
    return badges[channel] || { text: channel, color: "bg-gray-500/20 text-gray-300" }
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
          <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">Scheduled Automations</h1>
                <p className="text-white/60 text-sm">Create and manage automated message schedules</p>
              </div>
              <div className="flex items-center gap-2">
                {user?.role === "ADMIN" && (
                  <button
                    onClick={async () => {
                      if (confirm("This will process any automations that are due. Continue?")) {
                        try {
                          const res = await fetch("/api/cron/scheduled-messages", {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                            },
                          })
                          const data = await res.json()
                          if (res.ok) {
                            alert(`Success! ${data.message || "Processed automations"}`)
                            queryClient.invalidateQueries({ queryKey: ["scheduled-automations"] })
                          } else {
                            alert(`Error: ${data.error || "Failed to process"}`)
                          }
                        } catch (error) {
                          alert(`Error: ${error instanceof Error ? error.message : "Failed"}`)
                        }
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                    title="Manually trigger cron job (Admin only)"
                  >
                    <Clock className="w-4 h-4" />
                    Run Now
                  </button>
                )}
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-black/80 text-white font-semibold rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  New Automation
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-white/70">Loading automations...</div>
              </div>
            ) : automations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-white/50">
                <MessageSquare className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg mb-2">No automations yet</p>
                <p className="text-sm opacity-70">Create your first automation to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {automations.map((automation: any) => {
                  const badge = getChannelBadge(automation.channel)
                  return (
                    <div
                      key={automation.id}
                      className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-white font-semibold mb-1">{automation.name}</h3>
                          <span className={`text-xs font-medium px-2 py-1 rounded ${badge.color}`}>
                            {badge.text}
                          </span>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            automation.isActive
                              ? "bg-green-500/20 text-green-300"
                              : "bg-gray-500/20 text-gray-300"
                          }`}
                        >
                          {automation.isActive ? "Active" : "Paused"}
                        </span>
                      </div>

                      <p className="text-white/70 text-sm mb-3 line-clamp-2">{automation.template}</p>

                      <div className="space-y-2 mb-4">
                        {automation.contact && (
                          <div className="flex items-center gap-2 text-white/60 text-xs">
                            <User className="w-3 h-3" />
                            <span>To: {automation.contact.name || automation.contact.email || automation.contact.phone}</span>
                          </div>
                        )}
                        {!automation.contact && (
                          <div className="flex items-center gap-2 text-white/60 text-xs">
                            <User className="w-3 h-3" />
                            <span>To: All Active Contacts</span>
                          </div>
                        )}
                        {automation.recurrence && (
                          <div className="flex items-center gap-2 text-white/60 text-xs">
                            <Clock className="w-3 h-3" />
                            <span>
                              {automation.recurrence === "daily"
                                ? `Daily at ${automation.recurrenceTime || "scheduled time"}`
                                : automation.recurrence === "weekly"
                                  ? `Weekly at ${automation.recurrenceTime || "scheduled time"}`
                                  : "One-time"}
                            </span>
                          </div>
                        )}
                        {automation.cronExpression && !automation.recurrence && (
                          <div className="flex items-center gap-2 text-white/60 text-xs">
                            <Clock className="w-3 h-3" />
                            <span>Cron: {automation.cronExpression}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-white/60 text-xs">
                          <Calendar className="w-3 h-3" />
                          <span>Next: {format(new Date(automation.nextRunAt), "MMM d, yyyy h:mm a")}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            toggleMutation.mutate({ id: automation.id, isActive: !automation.isActive })
                          }
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded transition-colors text-sm"
                        >
                          {automation.isActive ? (
                            <>
                              <Pause className="w-4 h-4" />
                              Pause
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4" />
                              Resume
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this automation?")) {
                              deleteMutation.mutate(automation.id)
                            }
                          }}
                          className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Create New Automation</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={newAutomation.name}
                  onChange={(e) => setNewAutomation({ ...newAutomation, name: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                  placeholder="e.g., Daily Check-in"
                />
              </div>

              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">Message Template</label>
                <textarea
                  value={newAutomation.template}
                  onChange={(e) => setNewAutomation({ ...newAutomation, template: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 h-24"
                  placeholder="Enter message content..."
                />
              </div>

              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">Channel</label>
                <select
                  value={newAutomation.channel}
                  onChange={(e) => setNewAutomation({ ...newAutomation, channel: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                >
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="SMS">SMS</option>
                  <option value="EMAIL">Email</option>
                </select>
              </div>

              {/* Contact Selection */}
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Recipient (Optional - leave empty for all contacts)
                </label>
                <div className="flex gap-2">
                  <select
                    value={newAutomation.contactId}
                    onChange={(e) => setNewAutomation({ ...newAutomation, contactId: e.target.value })}
                    className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                  >
                    <option value="">All Active Contacts</option>
                    {contacts.map((contact: any) => (
                      <option key={contact.id} value={contact.id}>
                        {contact.name || contact.email || contact.phone || contact.id}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setShowCreateContact(!showCreateContact)}
                    className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                    title="Add new contact"
                  >
                    <User className="w-4 h-4" />
                  </button>
                </div>
                {showCreateContact && (
                  <div className="mt-2 p-3 bg-white/5 rounded-lg space-y-2 border border-white/10">
                    <input
                      type="text"
                      placeholder="Name"
                      value={newContact.name}
                      onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded p-2 text-white text-xs placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={newContact.email}
                      onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded p-2 text-white text-xs placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                    />
                    <input
                      type="tel"
                      placeholder="Phone (+1234567890)"
                      value={newContact.phone}
                      onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded p-2 text-white text-xs placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                    />
                    <button
                      onClick={handleCreateContact}
                      className="w-full px-3 py-2 bg-white hover:bg-white/90 text-black font-semibold rounded text-xs transition-colors"
                    >
                      Create Contact
                    </button>
                  </div>
                )}
              </div>

              {/* Recurrence Type */}
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">Schedule Type</label>
                <select
                  value={newAutomation.recurrence}
                  onChange={(e) =>
                    setNewAutomation({
                      ...newAutomation,
                      recurrence: e.target.value as "once" | "daily" | "weekly",
                    })
                  }
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                >
                  <option value="once">One-time</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>

              {/* Time Picker for Recurring */}
              {(newAutomation.recurrence === "daily" || newAutomation.recurrence === "weekly") && (
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">Time</label>
                  <input
                    type="time"
                    value={newAutomation.recurrenceTime}
                    onChange={(e) =>
                      setNewAutomation({ ...newAutomation, recurrenceTime: e.target.value })
                    }
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                  />
                  <p className="text-white/50 text-xs mt-1">
                    Messages will be sent {newAutomation.recurrence === "daily" ? "every day" : "every week"} at this time
                  </p>
                </div>
              )}

              {/* Advanced Cron Expression (Optional) */}
              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  Advanced: Cron Expression (Optional)
                </label>
                <input
                  type="text"
                  value={newAutomation.cronExpression}
                  onChange={(e) =>
                    setNewAutomation({ ...newAutomation, cronExpression: e.target.value })
                  }
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                  placeholder="0 9 * * * (overrides schedule type)"
                />
                <p className="text-white/50 text-xs mt-1">
                  Advanced users only. Format: minute hour day month weekday
                </p>
              </div>

              <div>
                <label className="block text-white/70 text-sm font-medium mb-2">
                  {newAutomation.recurrence === "once" ? "Send Date & Time" : "First Run Date & Time"}
                </label>
                <input
                  type="datetime-local"
                  value={newAutomation.nextRunAt}
                  onChange={(e) => setNewAutomation({ ...newAutomation, nextRunAt: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={handleCreate}
                disabled={createMutation.isPending}
                className="flex-1 px-4 py-2 bg-black hover:bg-black/80 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                {createMutation.isPending ? "Creating..." : "Create"}
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

