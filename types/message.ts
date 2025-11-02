/**
 * TypeScript types for messages, contacts, and related entities
 */

export type MessageChannel = "SMS" | "WHATSAPP" | "EMAIL" | "TWITTER" | "FACEBOOK"
export type MessageDirection = "INBOUND" | "OUTBOUND"
export type MessageStatus = "PENDING" | "SENT" | "DELIVERED" | "READ" | "FAILED" | "SCHEDULED"
export type ContactStatus = "UNREAD" | "ACTIVE" | "CLOSED"

export interface Message {
  id: string
  channel: MessageChannel
  direction: MessageDirection
  status: MessageStatus
  threadId?: string | null
  contactId: string
  content: string
  htmlContent?: string | null
  mediaUrls: string[]
  externalId?: string | null
  scheduledFor?: Date | null
  sentAt?: Date | null
  deliveredAt?: Date | null
  readAt?: Date | null
  metadata?: Record<string, any> | null
  createdAt: Date
  updatedAt: Date
  contact?: Contact
}

export interface Contact {
  id: string
  name?: string | null
  email?: string | null
  phone?: string | null
  socialHandles?: Record<string, string> | null
  avatar?: string | null
  status: ContactStatus
  lastContactAt?: Date | null
  mergedWithId?: string | null
  metadata?: Record<string, any> | null
  createdAt: Date
  updatedAt: Date
  messages?: Message[]
  notes?: Note[]
}

export interface Note {
  id: string
  contactId: string
  authorId: string
  parentId?: string | null
  content: string
  isPrivate: boolean
  mentions: string[]
  createdAt: Date
  updatedAt: Date
  author?: {
    id: string
    name?: string | null
    email: string
    image?: string | null
  }
  replies?: Note[]
}

export interface ScheduledMessage {
  id: string
  name: string
  template: string
  channel: MessageChannel
  cronExpression?: string | null
  nextRunAt: Date
  isActive: boolean
  createdById: string
  createdAt: Date
  updatedAt: Date
}

export interface TwilioNumber {
  id: string
  phoneNumber: string
  friendlyName?: string | null
  sid: string
  status: string
  capabilities?: Record<string, boolean> | null
  createdAt: Date
  updatedAt: Date
}

