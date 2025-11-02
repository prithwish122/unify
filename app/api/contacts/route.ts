/**
 * API Route: Contacts
 * GET: Fetch contacts with filters
 * POST: Create new contact
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
    const status = searchParams.get("status")
    const search = searchParams.get("search")
    const limit = parseInt(searchParams.get("limit") || "50", 10)
    const offset = parseInt(searchParams.get("offset") || "0", 10)

    const where: any = {}

    if (status) {
      where.status = status
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ]
    }

    // Check if contact table exists, if not return empty array
    let contacts: any[] = []
    let total = 0

    try {
      const result = await Promise.all([
        prisma.contact.findMany({
          where,
          include: {
            _count: {
              select: {
                messages: true,
              },
            },
          },
          orderBy: {
            lastContactAt: "desc",
          },
          take: limit,
          skip: offset,
        }),
        prisma.contact.count({ where }),
      ])
      contacts = result[0]
      total = result[1]
    } catch (error: any) {
      // If table doesn't exist (P2021), return empty results
      if (error.code === "P2021") {
        console.warn("Contact table does not exist yet. Please run: npm run db:push")
        contacts = []
        total = 0
      } else {
        throw error
      }
    }

    return NextResponse.json({
      contacts,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })
  } catch (error) {
    console.error("Get contacts error:", error)
    return NextResponse.json(
      { error: "Failed to fetch contacts", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { name, email, phone, socialHandles, avatar } = body

    // Check for duplicate
    let contact
    if (email) {
      contact = await prisma.contact.findUnique({
        where: { email },
      })
    } else if (phone) {
      contact = await prisma.contact.findFirst({
        where: { phone },
      })
    }

    if (contact) {
      // Update existing contact
      contact = await prisma.contact.update({
        where: { id: contact.id },
        data: {
          name: name || contact.name,
          email: email || contact.email,
          phone: phone || contact.phone,
          socialHandles: socialHandles || contact.socialHandles,
          avatar: avatar || contact.avatar,
        },
      })

      return NextResponse.json({ contact, created: false })
    }

    // Create new contact
    contact = await prisma.contact.create({
      data: {
        name,
        email,
        phone,
        socialHandles,
        avatar,
        status: "UNREAD",
      },
    })

    return NextResponse.json({ contact, created: true }, { status: 201 })
  } catch (error) {
    console.error("Create contact error:", error)
    return NextResponse.json(
      { error: "Failed to create contact", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

