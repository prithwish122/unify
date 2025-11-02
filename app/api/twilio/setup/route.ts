/**
 * API Route: Setup Twilio Integration
 * Initializes Twilio integration in database
 */

import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { auth } from "@/lib/auth"

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 })
    }

    const body = await req.json()
    const { accountSid, authToken, defaultFrom, whatsappFrom } = body

    if (!accountSid || !authToken) {
      return NextResponse.json({ error: "accountSid and authToken are required" }, { status: 400 })
    }

    // Upsert Twilio integration
    const integration = await prisma.integration.upsert({
      where: { provider: "twilio" },
      update: {
        config: {
          accountSid,
          authToken,
          defaultFrom,
          whatsappFrom: whatsappFrom || "whatsapp:+14155238886",
        },
        isActive: true,
      },
      create: {
        provider: "twilio",
        config: {
          accountSid,
          authToken,
          defaultFrom,
          whatsappFrom: whatsappFrom || "whatsapp:+14155238886",
        },
        isActive: true,
      },
    })

    return NextResponse.json({
      success: true,
      integration: {
        id: integration.id,
        provider: integration.provider,
        isActive: integration.isActive,
      },
    })
  } catch (error) {
    console.error("Setup Twilio error:", error)
    return NextResponse.json(
      { error: "Failed to setup Twilio", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

