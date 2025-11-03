/**
 * API Route: Process Scheduled Messages
 * Background job/cron endpoint to process scheduled messages
 * Should be called periodically (e.g., every minute) by a cron service
 */

import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { sendMessage } from "@/lib/integrations"
import { auth } from "@/lib/auth"

const prisma = new PrismaClient()

/**
 * POST /api/cron/scheduled-messages
 * Process scheduled messages that are due to be sent
 */
export async function POST(req: NextRequest) {
  try {
    // Verify cron secret OR allow admin users for testing
    const authHeader = req.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET || "secret"
    
    // Check if user is admin (for manual testing from UI)
    const session = await auth.api.getSession({ headers: req.headers })
    const isAdmin = session?.user?.role === "ADMIN"
    
    // Allow if admin OR correct bearer token
    if (!isAdmin && authHeader !== `Bearer ${cronSecret}`) {
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

    // Also process ScheduledMessage automations
    const activeAutomations = await prisma.scheduledMessage.findMany({
      where: {
        isActive: true,
        nextRunAt: {
          lte: now,
        },
      },
      include: {
        createdBy: true,
      },
      take: 20,
    })

    const results = {
      processed: 0,
      sent: 0,
      failed: 0,
      errors: [] as string[],
      automationsProcessed: 0,
    }

    // Process scheduled messages
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

    // Process automations (template-based scheduled messages)
    for (const automation of activeAutomations) {
      try {
        results.automationsProcessed++

        // Get contacts to send to
        let contactsToSend: any[] = []
        
        if (automation.contactId) {
          // Single contact automation
          const contact = await prisma.contact.findUnique({
            where: { id: automation.contactId },
          })
          if (contact) {
            contactsToSend = [contact]
          }
        } else {
          // Send to all contacts (in production, add filtering criteria)
          contactsToSend = await prisma.contact.findMany({
            where: {
              status: { in: ["UNREAD", "ACTIVE"] },
            },
            take: 100, // Limit to prevent overload
          })
        }

        // Send message to each contact
        let sentCount = 0
        for (const contact of contactsToSend) {
          try {
            // Determine recipient based on channel
            let to: string | undefined
            if (automation.channel === "SMS" || automation.channel === "WHATSAPP") {
              if (!contact.phone) {
                continue // Skip contacts without phone
              }
              to = contact.phone.startsWith("+") ? contact.phone : `+${contact.phone}`
            } else if (automation.channel === "EMAIL") {
              if (!contact.email) {
                continue // Skip contacts without email
              }
              to = contact.email
            } else {
              continue // Unsupported channel
            }

            // Send the message
            const result = await sendMessage({
              to,
              content: automation.template,
              channel: automation.channel.toLowerCase() as any,
            })

            // Create message record
            await prisma.message.create({
              data: {
                channel: automation.channel as any,
                direction: "OUTBOUND",
                status: "SENT",
                contactId: contact.id,
                content: automation.template,
                externalId: result.externalId,
                sentAt: new Date(),
                metadata: {
                  automationId: automation.id,
                  externalMessageId: result.messageId,
                },
              },
            })

            // Update contact
            await prisma.contact.update({
              where: { id: contact.id },
              data: {
                lastContactAt: new Date(),
                status: "ACTIVE",
              },
            })

            sentCount++
            results.sent++
          } catch (contactError) {
            results.failed++
            results.errors.push(
              `Automation ${automation.id} to ${contact.id}: ${contactError instanceof Error ? contactError.message : "Unknown error"}`,
            )
          }
        }

        // Update nextRunAt based on recurrence
        let nextRun: Date | null = null
        
        if (automation.recurrence === "daily" && automation.recurrenceTime) {
          // Schedule for same time tomorrow
          nextRun = new Date(now)
          nextRun.setDate(nextRun.getDate() + 1)
          const [hours, minutes] = automation.recurrenceTime.split(":").map(Number)
          nextRun.setHours(hours, minutes, 0, 0)
        } else if (automation.recurrence === "weekly" && automation.recurrenceTime) {
          // Schedule for same time next week
          nextRun = new Date(now)
          nextRun.setDate(nextRun.getDate() + 7)
          const [hours, minutes] = automation.recurrenceTime.split(":").map(Number)
          nextRun.setHours(hours, minutes, 0, 0)
        } else if (automation.cronExpression) {
          // Fallback to cron expression (simple: next day)
          nextRun = new Date(now)
          nextRun.setDate(nextRun.getDate() + 1)
        }

        if (nextRun && (automation.recurrence || automation.cronExpression)) {
          await prisma.scheduledMessage.update({
            where: { id: automation.id },
            data: { nextRunAt: nextRun },
          })
        } else {
          // One-time automation, deactivate after first run
          await prisma.scheduledMessage.update({
            where: { id: automation.id },
            data: { isActive: false },
          })
        }
      } catch (error) {
        results.errors.push(
          `Automation ${automation.id}: ${error instanceof Error ? error.message : "Unknown error"}`,
        )
      }
    }

    return NextResponse.json({
      success: true,
      ...results,
      message: `Processed ${results.processed} scheduled messages and ${results.automationsProcessed} automations: ${results.sent} sent, ${results.failed} failed`,
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

