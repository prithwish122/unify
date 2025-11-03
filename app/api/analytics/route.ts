/**
 * API Route: Analytics Data
 * Returns metrics for response time, channel volume, etc.
 */

import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"
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
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // Build inclusive date range covering entire days in local time
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Default: 30 days ago
    start.setHours(0, 0, 0, 0)
    const end = endDate ? new Date(endDate) : new Date()
    end.setHours(23, 59, 59, 999)

    // Response time calculation (average time between inbound and outbound messages in a thread)
    const responseTimeData = await prisma.$queryRaw<Array<{ day: Date; avgMinutes: number }>>`
      SELECT 
        DATE(m1."createdAt") as day,
        AVG(EXTRACT(EPOCH FROM (m2."createdAt" - m1."createdAt")) / 60) as "avgMinutes"
      FROM message m1
      INNER JOIN message m2 ON m1."threadId" = m2."threadId"
      WHERE m1."direction" = 'INBOUND'
        AND m2."direction" = 'OUTBOUND'
        AND m1."createdAt" > m2."createdAt"
        AND m1."createdAt" BETWEEN ${start} AND ${end}
      GROUP BY DATE(m1."createdAt")
      ORDER BY day ASC
    `

    // Channel volume
    const channelVolume = await prisma.message.groupBy({
      by: ["channel"],
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      _count: {
        id: true,
      },
    })

    // Total messages
    const totalMessages = await prisma.message.count({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    })

    // Message volume per day (trend)
    const messageVolumeDaily = await prisma.$queryRaw<Array<{ day: Date; count: number }>>`
      SELECT DATE(m."createdAt") as day, COUNT(*)::int as count
      FROM message m
      WHERE m."createdAt" BETWEEN ${start} AND ${end}
      GROUP BY DATE(m."createdAt")
      ORDER BY day ASC
    `

    // Active contacts
    const activeContacts = await prisma.contact.count({
      where: {
        lastContactAt: {
          gte: start,
          lte: end,
        },
      },
    })

    // Average response time (simplified)
    const avgResponseTime = responseTimeData.length > 0
      ? responseTimeData.reduce((sum, item) => sum + Number(item.avgMinutes), 0) / responseTimeData.length
      : 0

    return NextResponse.json({
      avgResponseTime: Math.round(avgResponseTime * 10) / 10, // Round to 1 decimal
      totalMessages,
      activeContacts,
      channelVolume: channelVolume.map((item) => ({
        channel: item.channel,
        count: item._count.id,
      })),
      responseTimeData: responseTimeData.map((item) => ({
        time: item.day,
        avg: Math.round(Number(item.avgMinutes) * 10) / 10,
      })),
      messageVolumeDaily: messageVolumeDaily.map((item) => ({
        date: item.day,
        count: Number(item.count),
      })),
    })
  } catch (error) {
    console.error("Analytics error:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

