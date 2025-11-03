/**
 * React Query hooks for messages
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import type { Message, MessageChannel, MessageStatus } from "@/types/message"

const API_BASE = "/api"

// Fetch messages
export function useMessages(filters?: {
  contactId?: string
  channel?: MessageChannel
  status?: MessageStatus
  threadId?: string
  limit?: number
  offset?: number
}) {
  return useQuery({
    queryKey: ["messages", filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.contactId) params.append("contactId", filters.contactId)
      if (filters?.channel) params.append("channel", filters.channel)
      if (filters?.status) params.append("status", filters.status)
      if (filters?.threadId) params.append("threadId", filters.threadId)
      if (filters?.limit) params.append("limit", filters.limit.toString())
      if (filters?.offset) params.append("offset", filters.offset.toString())

      const res = await fetch(`${API_BASE}/messages?${params}`)
      if (!res.ok) throw new Error("Failed to fetch messages")
      return res.json()
    },
  })
}

// Send message
export function useSendMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      contactId: string
      channel: MessageChannel
      content: string
      htmlContent?: string
      mediaUrls?: string[]
      scheduledFor?: string
    }) => {
      const res = await fetch(`${API_BASE}/messages/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Failed to send message")
      }
      return res.json()
    },
    onMutate: async (variables) => {
      // Optimistic update for messages list
      await queryClient.cancelQueries({ queryKey: ["messages"] })
      const previousMessages = queryClient.getQueryData<any>(["messages"]) || null

      const optimisticMessage = {
        id: `temp_${Date.now()}`,
        channel: variables.channel,
        direction: "OUTBOUND",
        status: variables.scheduledFor ? "SCHEDULED" : "SENT",
        contactId: variables.contactId,
        content: variables.content,
        htmlContent: variables.htmlContent,
        mediaUrls: variables.mediaUrls || [],
        createdAt: new Date().toISOString(),
        sentAt: variables.scheduledFor ? null : new Date().toISOString(),
        _optimistic: true,
      }

      if (previousMessages && Array.isArray(previousMessages.messages)) {
        queryClient.setQueryData(["messages"], {
          ...previousMessages,
          messages: [optimisticMessage, ...previousMessages.messages],
        })
      }

      return { previousMessages }
    },
    onSuccess: (_, variables) => {
      // Invalidate messages queries to refetch
      queryClient.invalidateQueries({ queryKey: ["messages"] })
      queryClient.invalidateQueries({ queryKey: ["contacts", variables.contactId] })
      queryClient.invalidateQueries({ queryKey: ["contacts"] })
      // Force refetch to update UI immediately
      queryClient.refetchQueries({ queryKey: ["contacts"] })
      queryClient.refetchQueries({ queryKey: ["messages"] })
    },
    onError: (_err, _vars, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(["messages"], context.previousMessages)
      }
    },
  })
}

