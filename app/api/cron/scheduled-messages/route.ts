/**
 * API Route: Process Scheduled Messages
 * Background job/cron endpoint to process scheduled messages
 * Should be called periodically (e.g., every minute) by a cron service
 */

import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { sendMessage } from "@/lib/integrations"

const prisma = new PrismaClient()

/**
 * POST /api/cron/scheduled-messages
 * Process scheduled messages that are due to be sent
 */
export async function POST(req: NextRequest) {
  try {
    // Optional: Verify cron secret for security
    const authHeader = req.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET || "secret"
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const now = new Date()

    // Find all scheduled messages that are due
    const scheduledMessages = await prisma.message.findMany({
      where: {
        status: "SCHEDULED",
        scheduledFor: {
          lte: now, // Due to be sent
        },
      },
      include: {
        contact: true,
      },
      take: 50, // Process up to 50 at a time
    })

    const results = {
      processed: 0,
      sent: 0,
      failed: 0,
      errors: [] as string[],
    }

    for (const message of scheduledMessages) {
      try {
        results.processed++

        // Determine recipient based on channel
        let to: string | undefined
        if (message.channel === "SMS" || message.channel === "WHATSAPP") {
          if (!message.contact.phone) {
            throw new Error("Contact has no phone number")
          }
          to = message.contact.phone.startsWith("+") ? message.contact.phone : `+${message.contact.phone}`
        } else if (message.channel === "EMAIL") {
          if (!message.contact.email) {
            throw new Error("Contact has no email address")
          }
          to = message.contact.email
        } else {
          throw new Error(`Unsupported channel: ${message.channel}`)
        }

        // Send the message
        const result = await sendMessage({
          to,
          content: message.content,
          htmlContent: message.htmlContent || undefined,
          mediaUrls: message.mediaUrls || [],
          channel: message.channel.toLowerCase() as any,
        })

        // Update message status
        await prisma.message.update({
          where: { id: message.id },
          data: {
            status: "SENT",
            externalId: result.externalId,
            sentAt: new Date(),
            metadata: {
              ...((message.metadata as any) || {}),
              externalMessageId: result.messageId,
            },
          },
        })

        // Update contact status
        await prisma.contact.update({
          where: { id: message.contactId },
          data: {
            lastContactAt: new Date(),
            status: "ACTIVE",
          },
        })

        results.sent++
      } catch (error) {
        results.failed++
        const errorMessage = error instanceof Error ? error.message : "Unknown error"
        results.errors.push(`Message ${message.id}: ${errorMessage}`)

        // Update message status to FAILED
        await prisma.message.update({
          where: { id: message.id },
          data: {
            status: "FAILED",
            metadata: {
              ...((message.metadata as any) || {}),
              error: errorMessage,
              failedAt: new Date().toISOString(),
            },
          },
        })
      }
    }

    return NextResponse.json({
      success: true,
      ...results,
      message: `Processed ${results.processed} scheduled messages: ${results.sent} sent, ${results.failed} failed`,
    })
  } catch (error) {
    console.error("Cron error:", error)
    return NextResponse.json(
      {
        error: "Failed to process scheduled messages",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

/**
 * GET /api/cron/scheduled-messages
 * Health check and info endpoint
 */
export async function GET(req: NextRequest) {
  try {
    const now = new Date()

    // Count scheduled messages
    const scheduledCount = await prisma.message.count({
      where: {
        status: "SCHEDULED",
        scheduledFor: {
          gte: now, // Not yet due
        },
      },
    })

    const dueCount = await prisma.message.count({
      where: {
        status: "SCHEDULED",
        scheduledFor: {
          lte: now, // Due to be sent
        },
      },
    })

    return NextResponse.json({
      success: true,
      scheduled: scheduledCount,
      due: dueCount,
      message: `Scheduled messages: ${scheduledCount} pending, ${dueCount} due`,
    })
  } catch (error) {
    console.error("Cron info error:", error)
    return NextResponse.json(
      {
        error: "Failed to get scheduled messages info",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

