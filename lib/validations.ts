/**
 * Zod Validation Schemas
 * Type-safe validation for API routes
 */

import { z } from "zod"

/**
 * Message Channel Enum
 */
export const MessageChannelSchema = z.enum(["SMS", "WHATSAPP", "EMAIL", "TWITTER", "FACEBOOK"])

/**
 * Contact Status Enum
 */
export const ContactStatusSchema = z.enum(["UNREAD", "ACTIVE", "CLOSED"])

/**
 * Message Status Enum
 */
export const MessageStatusSchema = z.enum(["PENDING", "SENT", "DELIVERED", "READ", "FAILED", "SCHEDULED"])

/**
 * Send Message Request Schema
 */
export const SendMessageSchema = z.object({
  contactId: z.string().min(1, "Contact ID is required"),
  channel: MessageChannelSchema,
  content: z.string().min(1, "Message content is required"),
  htmlContent: z.string().optional(),
  mediaUrls: z.array(z.string().url()).optional(),
  scheduledFor: z.string().datetime().optional(),
})

/**
 * Create Contact Schema
 */
export const CreateContactSchema = z.object({
  name: z.string().min(1, "Name is required").optional().or(z.literal("")),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")
    .optional()
    .or(z.literal("")),
  socialHandles: z
    .object({
      twitter: z.string().optional(),
      facebook: z.string().optional(),
    })
    .optional(),
  avatar: z.string().url("Invalid avatar URL").optional().or(z.literal("")),
})

/**
 * Update Contact Schema
 */
export const UpdateContactSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")
    .optional()
    .or(z.literal("")),
  socialHandles: z
    .object({
      twitter: z.string().optional(),
      facebook: z.string().optional(),
    })
    .optional(),
  avatar: z.string().url("Invalid avatar URL").optional().or(z.literal("")),
  status: ContactStatusSchema.optional(),
})

/**
 * Create Note Schema
 */
export const CreateNoteSchema = z.object({
  contactId: z.string().min(1, "Contact ID is required"),
  content: z.string().min(1, "Note content is required"),
  isPrivate: z.boolean().default(false),
  parentId: z.string().optional(),
  mentions: z.array(z.string()).optional(),
})

/**
 * Query Parameters Schema
 */
export const QueryParamsSchema = z.object({
  status: ContactStatusSchema.optional(),
  search: z.string().optional(),
  channel: MessageChannelSchema.optional(),
  limit: z.coerce.number().int().positive().max(100).default(50),
  offset: z.coerce.number().int().nonnegative().default(0),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
})

/**
 * Twilio Configuration Schema
 */
export const TwilioConfigSchema = z.object({
  accountSid: z.string().min(1, "Account SID is required"),
  authToken: z.string().min(1, "Auth token is required"),
  defaultFrom: z.string().optional(),
  whatsappFrom: z.string().optional(),
})

/**
 * Email Configuration Schema
 */
export const EmailConfigSchema = z.object({
  apiKey: z.string().min(1, "API key is required"),
  fromEmail: z.string().email("Invalid from email").optional(),
})

/**
 * Merge Contacts Schema
 */
export const MergeContactsSchema = z.object({
  primaryId: z.string().min(1, "Primary contact ID is required"),
  secondaryId: z.string().min(1, "Secondary contact ID is required"),
})

/**
 * Analytics Export Schema
 */
export const AnalyticsExportSchema = z.object({
  format: z.enum(["csv", "pdf"]).default("csv"),
  type: z.enum(["summary", "messages"]).default("summary").optional(),
  // Accept date-only (YYYY-MM-DD) or full ISO datetime strings
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

