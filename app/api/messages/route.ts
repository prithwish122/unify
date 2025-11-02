/**
 * API Route: Get Messages
 * Fetch messages with filters (contact, channel, status, etc.)
 */

import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { auth } from "@/lib/auth"

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = req.nextUrl.searchParams
    const contactId = searchParams.get("contactId")
    const channel = searchParams.get("channel")
    const status = searchParams.get("status")
    const threadId = searchParams.get("threadId")
    const limit = parseInt(searchParams.get("limit") || "50", 10)
    const offset = parseInt(searchParams.get("offset") || "0", 10)

    const where: any = {}

    if (contactId) {
      where.contactId = contactId
    }

    if (channel) {
      where.channel = channel
    }

    if (status) {
      where.status = status
    }

    if (threadId) {
      where.threadId = threadId
    }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        include: {
          contact: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
        skip: offset,
      }),
      prisma.message.count({ where }),
    ])

    return NextResponse.json({
      messages,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })
  } catch (error) {
    console.error("Get messages error:", error)
    return NextResponse.json(
      { error: "Failed to fetch messages", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

