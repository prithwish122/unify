/**
 * React Query hooks for contacts
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { Contact, ContactStatus } from "@/types/message"

const API_BASE = "/api"

// Fetch contacts
export function useContacts(filters?: {
  status?: ContactStatus
  search?: string
  limit?: number
  offset?: number
}) {
  return useQuery({
    queryKey: ["contacts", filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.status) params.append("status", filters.status)
      if (filters?.search) params.append("search", filters.search)
      if (filters?.limit) params.append("limit", filters.limit.toString())
      if (filters?.offset) params.append("offset", filters.offset.toString())

      const res = await fetch(`${API_BASE}/contacts?${params}`)
      if (!res.ok) throw new Error("Failed to fetch contacts")
      return res.json()
    },
  })
}

// Fetch single contact
export function useContact(contactId: string) {
  return useQuery({
    queryKey: ["contacts", contactId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/contacts/${contactId}`)
      if (!res.ok) throw new Error("Failed to fetch contact")
      return res.json()
    },
    enabled: !!contactId,
  })
}

// Create/Update contact
export function useUpsertContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      name?: string
      email?: string
      phone?: string
      socialHandles?: Record<string, string>
      avatar?: string
    }) => {
      const res = await fetch(`${API_BASE}/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to create/update contact")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] })
    },
  })
}

