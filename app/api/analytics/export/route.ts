/**
 * API Route: Export Analytics
 * Export analytics data as CSV or PDF
 */

import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { auth } from "@/lib/auth"
import { AnalyticsExportSchema } from "@/lib/validations"

const prisma = new PrismaClient()

export const dynamic = "force-dynamic"

/**
 * Convert data to CSV format
 */
function toCSV(data: any[], headers: string[]): string {
  const rows = [headers.join(",")]
  for (const row of data) {
    const values = headers.map((header) => {
      const value = row[header] ?? ""
      // Escape commas and quotes in CSV
      if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value
    })
    rows.push(values.join(","))
  }
  return rows.join("\n")
}

/**
 * Generate CSV report
 */
function formatDateOnly(d: Date): string {
  // Force text in Excel by prefixing apostrophe; keeps display without ######
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `'${yyyy}-${mm}-${dd}`
}

function formatDateTime(d: Date): string {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  const hh = String(d.getHours()).padStart(2, "0")
  const mi = String(d.getMinutes()).padStart(2, "0")
  return `'${yyyy}-${mm}-${dd} ${hh}:${mi}`
}

async function generateMessagesCSV(startDate?: Date, endDate?: Date): Promise<string> {
  const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const end = endDate || new Date()

  // Get messages data
  const messages = await prisma.message.findMany({
    where: {
      createdAt: {
        gte: start,
        lte: end,
      },
    },
    include: {
      contact: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  // Format messages for CSV
  const csvData = messages.map((msg) => ({
    date: formatDateTime(new Date(msg.createdAt)),
    channel: msg.channel,
    direction: msg.direction,
    status: msg.status,
    contact_name: msg.contact.name || "",
    contact_email: msg.contact.email || "",
    contact_phone: msg.contact.phone || "",
    content: msg.content.replace(/\n/g, " ").substring(0, 100), // First 100 chars
    has_media: msg.mediaUrls.length > 0 ? "Yes" : "No",
  }))

  return toCSV(csvData, [
    "date",
    "channel",
    "direction",
    "status",
    "contact_name",
    "contact_email",
    "contact_phone",
    "content",
    "has_media",
  ])
}

async function generateSummaryCSV(startDate?: Date, endDate?: Date): Promise<string> {
  // Normalize range
  const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  start.setHours(0, 0, 0, 0)
  const end = endDate || new Date()
  end.setHours(23, 59, 59, 999)

  // Channel volume
  const channelVolume = await prisma.message.groupBy({
    by: ["channel"],
    where: { createdAt: { gte: start, lte: end } },
    _count: { id: true },
  })

  const totalMessages = await prisma.message.count({ where: { createdAt: { gte: start, lte: end } } })
  const activeContacts = await prisma.contact.count({ where: { lastContactAt: { gte: start, lte: end } } })

  // Response time by day
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

  const avgResponseTime = responseTimeData.length > 0
    ? responseTimeData.reduce((s, r) => s + Number(r.avgMinutes), 0) / responseTimeData.length
    : 0

  // Message volume per day
  const messageVolumeDaily = await prisma.$queryRaw<Array<{ day: Date; count: number }>>`
    SELECT DATE(m."createdAt") as day, COUNT(*)::int as count
    FROM message m
    WHERE m."createdAt" BETWEEN ${start} AND ${end}
    GROUP BY DATE(m."createdAt")
    ORDER BY day ASC
  `

  // Build CSV with sections
  const lines: string[] = []
  lines.push("Metric,Value")
  lines.push(`Avg Response (min),${Math.round(avgResponseTime * 10) / 10}`)
  lines.push(`Total Messages,${totalMessages}`)
  lines.push(`Active Contacts,${activeContacts}`)
  lines.push("")
  lines.push("Channel,Count")
  for (const row of channelVolume) {
    lines.push(`${row.channel},${row._count.id}`)
  }
  lines.push("")
  lines.push("Date,Messages")
  for (const v of messageVolumeDaily) {
    const day = formatDateOnly(new Date(v.day))
    lines.push(`${day},${Number(v.count)}`)
  }
  return lines.join("\n")
}

/**
 * GET /api/analytics/export
 * Export analytics data
 */
export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = req.nextUrl.searchParams
    const queryParams = {
      format: searchParams.get("format") || "csv",
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
    }

    // Validate query parameters
    const validation = AnalyticsExportSchema.safeParse(queryParams)
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid parameters", details: validation.error.errors },
        { status: 400 },
      )
    }

    const { format, type = "summary", startDate, endDate } = validation.data

    const start = startDate ? new Date(startDate) : undefined
    const end = endDate ? new Date(endDate) : undefined

    if (format === "csv") {
      const csv = type === "messages" ? await generateMessagesCSV(start, end) : await generateSummaryCSV(start, end)
      const filename = `analytics-export-${new Date().toISOString().split("T")[0]}.csv`

      // Prepend UTF-8 BOM so Excel opens UTF-8 correctly
      return new NextResponse("\uFEFF" + csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      })
    } else if (format === "pdf") {
      // PDF generation would require a library like pdfkit or puppeteer
      // For now, return JSON with a note that PDF is not yet implemented
      return NextResponse.json(
        {
          error: "PDF export not yet implemented",
          message: "Please use CSV format for now. PDF export coming soon.",
        },
        { status: 501 },
      )
    }

    return NextResponse.json({ error: "Invalid format" }, { status: 400 })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json(
      { error: "Failed to export analytics", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

