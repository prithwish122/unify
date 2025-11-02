/**
 * API Route: Twilio Numbers
 * GET: Fetch all Twilio phone numbers
 * POST: Buy a new phone number
 */

import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { auth } from "@/lib/auth"
import { getTwilioNumbers, buyTwilioNumber } from "@/lib/integrations"

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
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

    // Fetch from database (cached)
    const dbNumbers = await prisma.twilioNumber.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })

    // Also fetch from Twilio API to sync
    try {
      const twilioNumbers = await getTwilioNumbers()

      // Sync with database
      for (const num of twilioNumbers) {
        await prisma.twilioNumber.upsert({
          where: { sid: num.sid },
          update: {
            phoneNumber: num.number,
            friendlyName: num.friendlyName,
          },
          create: {
            phoneNumber: num.number,
            friendlyName: num.friendlyName,
            sid: num.sid,
            status: "active",
          },
        })
      }

      // Return updated list
      const updated = await prisma.twilioNumber.findMany({
        orderBy: {
          createdAt: "desc",
        },
      })

      return NextResponse.json({ numbers: updated })
    } catch (error) {
      // If Twilio API fails, return cached DB data
      console.error("Twilio API error:", error)
      return NextResponse.json({ numbers: dbNumbers })
    }
  } catch (error) {
    console.error("Get Twilio numbers error:", error)
    return NextResponse.json(
      { error: "Failed to fetch numbers", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

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
    const { areaCode } = body

    // Buy number from Twilio
    const result = await buyTwilioNumber(areaCode)

    // Save to database
    const number = await prisma.twilioNumber.create({
      data: {
        phoneNumber: result.number,
        sid: result.sid,
        status: "active",
      },
    })

    return NextResponse.json({ number }, { status: 201 })
  } catch (error) {
    console.error("Buy Twilio number error:", error)
    return NextResponse.json(
      { error: "Failed to buy number", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

