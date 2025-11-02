/**
 * Twilio Webhook Handler
 * Receives inbound SMS/WhatsApp messages from Twilio
 */

import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { sendMessage } from "@/lib/integrations"
import twilio from "twilio"

const prisma = new PrismaClient()

// Verify Twilio webhook signature (optional but recommended)
function verifyTwilioSignature(req: NextRequest): boolean {
  const twilioSignature = req.headers.get("x-twilio-signature")
  const url = req.url

  // TODO: Implement signature verification
  // For development, you can skip this, but in production, verify using:
  // twilio.validateRequest(authToken, signature, url, params)
  return true
}

/**
 * POST /api/webhooks/twilio
 * Handle inbound messages from Twilio (SMS/WhatsApp)
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const body = Object.fromEntries(formData.entries())

    // Verify webhook signature (in production)
    // if (!verifyTwilioSignature(req)) {
    //   return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    // }

    const {
      From: from,
      To: to,
      Body: bodyText,
      MessageSid: messageSid,
      NumMedia: numMedia,
      AccountSid: accountSid,
    } = body

    // Determine channel from "To" number format
    // WhatsApp messages come from whatsapp:+number format
    const channel = to?.toString().startsWith("whatsapp:") ? "WHATSAPP" : "SMS"

    // Extract media URLs if any
    const mediaUrls: string[] = []
    const numMediaInt = parseInt(numMedia?.toString() || "0", 10)
    for (let i = 0; i < numMediaInt; i++) {
      const mediaUrl = formData.get(`MediaUrl${i}`)?.toString()
      if (mediaUrl) {
        mediaUrls.push(mediaUrl)
      }
    }

    // Extract phone number (remove whatsapp: prefix if present)
    const phoneNumber = from?.toString().replace(/^whatsapp:/, "").replace(/^\+/, "")

    // Find or create contact
    let contact = await prisma.contact.findFirst({
      where: { phone: phoneNumber },
    })

    if (!contact) {
      contact = await prisma.contact.create({
        data: {
          phone: phoneNumber,
          name: phoneNumber, // Default to phone number if name not available
          status: "UNREAD",
          lastContactAt: new Date(),
        },
      })
    } else {
      // Update last contact time
      await prisma.contact.update({
        where: { id: contact.id },
        data: { lastContactAt: new Date(), status: "UNREAD" },
      })
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        channel: channel as any,
        direction: "INBOUND",
        status: "DELIVERED",
        contactId: contact.id,
        content: bodyText?.toString() || "",
        mediaUrls,
        externalId: messageSid?.toString(),
        sentAt: new Date(),
        deliveredAt: new Date(),
        metadata: {
          accountSid,
          from,
          to,
        },
      },
    })

    // Generate thread ID if first message
    let threadId = message.threadId
    if (!threadId) {
      threadId = `thread_${contact.id}_${Date.now()}`
      await prisma.message.update({
        where: { id: message.id },
        data: { threadId },
      })
    }

    return NextResponse.json({ success: true, messageId: message.id })
  } catch (error) {
    console.error("Twilio webhook error:", error)
    return NextResponse.json(
      { error: "Failed to process webhook", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

/**
 * GET /api/webhooks/twilio
 * Handle Twilio webhook verification (status callbacks)
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const messageStatus = searchParams.get("MessageStatus")
    const messageSid = searchParams.get("MessageSid")

    if (messageSid && messageStatus) {
      // Update message status in database
      const message = await prisma.message.findFirst({
        where: { externalId: messageSid },
      })

      if (message) {
        const statusMap: Record<string, any> = {
          sent: "SENT",
          delivered: "DELIVERED",
          read: "READ",
          failed: "FAILED",
        }

        const updateData: any = {
          status: statusMap[messageStatus.toLowerCase()] || "SENT",
        }

        if (messageStatus.toLowerCase() === "sent") {
          updateData.sentAt = new Date()
        } else if (messageStatus.toLowerCase() === "delivered") {
          updateData.deliveredAt = new Date()
        } else if (messageStatus.toLowerCase() === "read") {
          updateData.readAt = new Date()
        }

        await prisma.message.update({
          where: { id: message.id },
          data: updateData,
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Twilio status callback error:", error)
    return NextResponse.json({ error: "Failed to process status callback" }, { status: 500 })
  }
}

