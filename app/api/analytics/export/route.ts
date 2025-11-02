/**
 * API Route: Export Analytics
 * Export analytics data as CSV or PDF
 */

import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { auth } from "@/lib/auth"
import { AnalyticsExportSchema } from "@/lib/validations"

const prisma = new PrismaClient()

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
async function generateCSVReport(startDate?: Date, endDate?: Date): Promise<string> {
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
    date: msg.createdAt.toISOString(),
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

    const { format, startDate, endDate } = validation.data

    const start = startDate ? new Date(startDate) : undefined
    const end = endDate ? new Date(endDate) : undefined

    if (format === "csv") {
      const csv = await generateCSVReport(start, end)
      const filename = `analytics-export-${new Date().toISOString().split("T")[0]}.csv`

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
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

