/**
 * API Route: Scheduled Automations
 * GET: Fetch all scheduled automations
 * POST: Create new automation
 */

import { NextRequest, NextResponse } from "next/server"
import { PrismaClient, MessageChannel } from "@prisma/client"
import { auth } from "@/lib/auth"
import { z } from "zod"

const prisma = new PrismaClient()

const CreateAutomationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  template: z.string().min(1, "Template is required"),
  channel: z.enum(["SMS", "WHATSAPP", "EMAIL"]),
  contactId: z.string().optional().or(z.literal("")),
  cronExpression: z.string().optional().or(z.literal("")),
  recurrence: z.enum(["once", "daily", "weekly"]).optional(),
  recurrenceTime: z.string().optional().or(z.literal("")),
  nextRunAt: z.string(),
})

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const automations = await prisma.scheduledMessage.findMany({
      where: {
        createdById: session.user.id,
      },
      include: {
        contact: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        nextRunAt: "asc",
      },
    })

    return NextResponse.json({ automations })
  } catch (error) {
    console.error("Get automations error:", error)
    return NextResponse.json(
      { error: "Failed to fetch automations", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validation = CreateAutomationSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid automation data", details: validation.error.errors },
        { status: 400 },
      )
    }

    const { name, template, channel, contactId, cronExpression, recurrence, recurrenceTime, nextRunAt } =
      validation.data

    // Validate contact exists if provided (and not empty string)
    // Convert undefined/empty strings to null for Prisma
    const finalContactId = contactId && contactId.trim() !== "" ? contactId.trim() : null
    if (finalContactId) {
      const contact = await prisma.contact.findUnique({
        where: { id: finalContactId },
      })
      if (!contact) {
        return NextResponse.json({ error: "Contact not found" }, { status: 404 })
      }
    }

    // Validate and parse nextRunAt
    let parsedNextRunAt: Date
    try {
      // Handle datetime-local format (YYYY-MM-DDTHH:mm) or ISO string
      parsedNextRunAt = new Date(nextRunAt)
      if (isNaN(parsedNextRunAt.getTime())) {
        return NextResponse.json(
          { error: "Invalid date format for nextRunAt", details: `Received: ${nextRunAt}` },
          { status: 400 },
        )
      }
      // Ensure date is in the future (with 1 minute buffer for cron jobs)
      const now = new Date()
      const buffer = new Date(now.getTime() + 60000) // 1 minute buffer
      if (parsedNextRunAt < buffer) {
        return NextResponse.json(
          { error: "Next run time must be at least 1 minute in the future" },
          { status: 400 },
        )
      }
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid date format", details: error instanceof Error ? error.message : "Unknown error" },
        { status: 400 },
      )
    }

    // Validate user ID exists
    if (!session.user.id) {
      return NextResponse.json({ error: "Invalid user session" }, { status: 401 })
    }

    // Prepare data for Prisma - ensure all optional fields are null (not undefined)
    // Convert channel string to Prisma enum
    let channelEnum: MessageChannel
    if (channel === "SMS") {
      channelEnum = MessageChannel.SMS
    } else if (channel === "WHATSAPP") {
      channelEnum = MessageChannel.WHATSAPP
    } else if (channel === "EMAIL") {
      channelEnum = MessageChannel.EMAIL
    } else {
      return NextResponse.json({ error: `Invalid channel: ${channel}` }, { status: 400 })
    }

    // Build the data object, conditionally including contact relation
    const automationData: any = {
      name: name.trim(),
      template: template.trim(),
      channel: channelEnum,
      cronExpression: (cronExpression && cronExpression.trim() !== "") ? cronExpression.trim() : null,
      recurrence: recurrence ?? null,
      recurrenceTime: (recurrenceTime && recurrenceTime.trim() !== "") ? recurrenceTime.trim() : null,
      nextRunAt: parsedNextRunAt,
      isActive: true,
      createdBy: {
        connect: {
          id: session.user.id,
        },
      },
    }

    // Add contact relation if provided
    if (finalContactId) {
      automationData.contact = {
        connect: {
          id: finalContactId,
        },
      }
    }

    console.log("Creating automation with data:", JSON.stringify({
      ...automationData,
      channel: channelEnum,
      nextRunAt: automationData.nextRunAt.toISOString(),
      createdBy: { connect: { id: session.user.id } },
      contact: finalContactId ? { connect: { id: finalContactId } } : null,
    }, null, 2))

    const automation = await prisma.scheduledMessage.create({
      data: automationData,
    })

    return NextResponse.json({ automation }, { status: 201 })
  } catch (error) {
    console.error("Create automation error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const errorDetails = error instanceof Error ? error.stack : undefined
    
    // Check if it's a Prisma error
    if (error && typeof error === 'object' && 'code' in error) {
      console.error("Prisma error code:", (error as any).code)
      console.error("Prisma error meta:", (error as any).meta)
    }
    
    return NextResponse.json(
      { 
        error: "Failed to create automation", 
        details: errorMessage,
        ...(errorDetails && { stack: errorDetails })
      },
      { status: 500 },
    )
  }
}

