/**
 * API Route: Send Message
 * Handles sending messages across all channels (SMS, WhatsApp, Email, etc.)
 */

import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { sendMessage } from "@/lib/integrations"
import { auth } from "@/lib/auth"

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { contactId, channel, content, htmlContent, mediaUrls, scheduledFor } = body

    if (!contactId || !channel || !content) {
      return NextResponse.json(
        { error: "Missing required fields: contactId, channel, content" },
        { status: 400 },
      )
    }

    // Get contact
    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
    })

    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 })
    }

    // Determine recipient based on channel
    let to: string | undefined
    if (channel === "SMS" || channel === "WHATSAPP") {
      if (!contact.phone) {
        return NextResponse.json({ error: "Contact has no phone number" }, { status: 400 })
      }
      to = contact.phone.startsWith("+") ? contact.phone : `+${contact.phone}`
    } else if (channel === "EMAIL") {
      if (!contact.email) {
        return NextResponse.json({ error: "Contact has no email address" }, { status: 400 })
      }
      to = contact.email
    } else {
      return NextResponse.json({ error: "Unsupported channel" }, { status: 400 })
    }

    // If scheduled, create message record but don't send yet
    if (scheduledFor) {
      const scheduledDate = new Date(scheduledFor)
      if (scheduledDate <= new Date()) {
        return NextResponse.json({ error: "Scheduled time must be in the future" }, { status: 400 })
      }

      // Create scheduled message
      const message = await prisma.message.create({
        data: {
          channel: channel as any,
          direction: "OUTBOUND",
          status: "SCHEDULED",
          contactId,
          content,
          htmlContent,
          mediaUrls: mediaUrls || [],
          scheduledFor: scheduledDate,
        },
      })

      return NextResponse.json({
        success: true,
        messageId: message.id,
        status: "scheduled",
        scheduledFor: scheduledDate,
      })
    }

    // Send immediately
    try {
      const result = await sendMessage({
        to,
        content,
        htmlContent,
        mediaUrls: mediaUrls || [],
        channel: channel.toLowerCase() as any,
      })

      // Create message record
      const message = await prisma.message.create({
        data: {
          channel: channel as any,
          direction: "OUTBOUND",
          status: "SENT",
          contactId,
          content,
          htmlContent,
          mediaUrls: mediaUrls || [],
          externalId: result.externalId,
          sentAt: new Date(),
          metadata: {
            externalMessageId: result.messageId,
          },
        },
      })

      // Update contact status
      await prisma.contact.update({
        where: { id: contactId },
        data: { lastContactAt: new Date(), status: "ACTIVE" },
      })

      return NextResponse.json({
        success: true,
        messageId: message.id,
        externalId: result.externalId,
        status: "sent",
      })
    } catch (error) {
      console.error("Send message error:", error)

      // Create message record with FAILED status
      const message = await prisma.message.create({
        data: {
          channel: channel as any,
          direction: "OUTBOUND",
          status: "FAILED",
          contactId,
          content,
          htmlContent,
          mediaUrls: mediaUrls || [],
          metadata: {
            error: error instanceof Error ? error.message : "Unknown error",
          },
        },
      })

      return NextResponse.json(
        {
          error: "Failed to send message",
          details: error instanceof Error ? error.message : "Unknown error",
          messageId: message.id,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

