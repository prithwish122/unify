/**
 * Integration Factory - Abstract channel-specific implementations
 * Supports: SMS, WhatsApp (Twilio), Email (Resend), Social Media (Twitter, Facebook)
 */

import { PrismaClient } from "@prisma/client"
import twilio from "twilio"

const prisma = new PrismaClient()

export type ChannelType = "sms" | "whatsapp" | "email" | "twitter" | "facebook"

export interface SendMessagePayload {
  to: string
  from?: string
  content: string
  htmlContent?: string
  mediaUrls?: string[]
  channel: ChannelType
}

export interface MessageSender {
  send(payload: SendMessagePayload): Promise<{ messageId: string; externalId?: string }>
  getNumbers?(): Promise<Array<{ number: string; sid: string; friendlyName?: string }>>
  buyNumber?(areaCode?: string): Promise<{ number: string; sid: string }>
}

/**
 * Twilio Sender - Handles SMS and WhatsApp via Twilio API
 */
class TwilioSender implements MessageSender {
  private client: twilio.Twilio
  private accountSid: string
  private authToken: string
  private defaultFrom?: string
  private whatsappFrom?: string

  constructor(config: { accountSid: string; authToken: string; defaultFrom?: string; whatsappFrom?: string }) {
    this.accountSid = config.accountSid
    this.authToken = config.authToken
    this.defaultFrom = config.defaultFrom
    this.whatsappFrom = config.whatsappFrom || `whatsapp:+14155238886` // Twilio Sandbox
    this.client = twilio(config.accountSid, config.authToken)
  }

  async send(payload: SendMessagePayload): Promise<{ messageId: string; externalId: string }> {
    const { to, from, content, mediaUrls, channel } = payload

    if (channel === "whatsapp") {
      const message = await this.client.messages.create({
        from: this.whatsappFrom,
        to: to.startsWith("whatsapp:") ? to : `whatsapp:${to}`,
        body: content,
        mediaUrl: mediaUrls && mediaUrls.length > 0 ? mediaUrls : undefined,
      })

      return {
        messageId: message.sid,
        externalId: message.sid,
      }
    } else if (channel === "sms") {
      const fromNumber = from || this.defaultFrom
      if (!fromNumber) {
        throw new Error("No 'from' number specified for SMS")
      }

      const message = await this.client.messages.create({
        from: fromNumber,
        to,
        body: content,
        mediaUrl: mediaUrls && mediaUrls.length > 0 ? mediaUrls : undefined,
      })

      return {
        messageId: message.sid,
        externalId: message.sid,
      }
    }

    throw new Error(`Unsupported channel: ${channel}`)
  }

  async getNumbers(): Promise<Array<{ number: string; sid: string; friendlyName?: string }>> {
    const numbers = await this.client.incomingPhoneNumbers.list()
    return numbers.map((num) => ({
      number: num.phoneNumber || "",
      sid: num.sid,
      friendlyName: num.friendlyName || undefined,
    }))
  }

  async buyNumber(areaCode?: string): Promise<{ number: string; sid: string }> {
    const availableNumbers = await this.client.availablePhoneNumbers("US")
      .local.list({ areaCode, limit: 1 })

    if (availableNumbers.length === 0) {
      throw new Error("No available numbers found")
    }

    const phoneNumber = availableNumbers[0].phoneNumber || ""
    const number = await this.client.incomingPhoneNumbers.create({
      phoneNumber,
    })

    return {
      number: phoneNumber,
      sid: number.sid,
    }
  }
}

/**
 * Email Sender - Handles email via Resend API (optional)
 */
class EmailSender implements MessageSender {
  private apiKey?: string

  constructor(config?: { apiKey: string }) {
    this.apiKey = config?.apiKey
  }

  async send(payload: SendMessagePayload): Promise<{ messageId: string; externalId?: string }> {
    if (!this.apiKey) {
      throw new Error("Resend API key not configured")
    }

    // TODO: Implement Resend API integration
    // For now, return a mock response
    return {
      messageId: `email_${Date.now()}`,
      externalId: undefined,
    }
  }
}

/**
 * Get Twilio configuration from database or environment variables
 */
async function getTwilioConfig(): Promise<{
  accountSid: string
  authToken: string
  defaultFrom?: string
  whatsappFrom?: string
} | null> {
  // First try to get from database
  const integration = await prisma.integration.findUnique({
    where: { provider: "twilio" },
  })

  if (integration && integration.isActive) {
    const config = integration.config as {
      accountSid: string
      authToken: string
      defaultFrom?: string
      whatsappFrom?: string
    }
    return config
  }

  // Fallback to environment variables
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const defaultFrom = process.env.TWILIO_DEFAULT_FROM
  const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM

  if (accountSid && authToken) {
    return {
      accountSid,
      authToken,
      defaultFrom,
      whatsappFrom,
    }
  }

  return null
}

/**
 * Factory function to create channel-specific senders
 */
export async function createSender(channel: ChannelType): Promise<MessageSender> {
  if (channel === "sms" || channel === "whatsapp") {
    const config = await getTwilioConfig()
    if (!config) {
      throw new Error("Twilio integration not configured. Please set up Twilio credentials.")
    }
    return new TwilioSender(config)
  }

  if (channel === "email") {
    const integration = await prisma.integration.findUnique({
      where: { provider: "email" },
    })
    const config = integration?.config as { apiKey?: string } | undefined
    return new EmailSender(config)
  }

  // Twitter and Facebook - TODO: Implement OAuth and API integrations
  throw new Error(`Channel ${channel} not yet implemented`)
}

/**
 * Send message across any channel
 */
export async function sendMessage(payload: SendMessagePayload): Promise<{ messageId: string; externalId?: string }> {
  const sender = await createSender(payload.channel)
  return sender.send(payload)
}

/**
 * Get available phone numbers from Twilio
 */
export async function getTwilioNumbers(): Promise<Array<{ number: string; sid: string; friendlyName?: string }>> {
  const config = await getTwilioConfig()
  if (!config) {
    throw new Error("Twilio integration not configured")
  }

  const sender = new TwilioSender(config)
  if (sender.getNumbers) {
    return sender.getNumbers()
  }

  return []
}

/**
 * Buy a new phone number from Twilio
 */
export async function buyTwilioNumber(areaCode?: string): Promise<{ number: string; sid: string }> {
  const config = await getTwilioConfig()
  if (!config) {
    throw new Error("Twilio integration not configured")
  }

  const sender = new TwilioSender(config)
  if (sender.buyNumber) {
    return sender.buyNumber(areaCode)
  }

  throw new Error("Buy number not supported")
}
