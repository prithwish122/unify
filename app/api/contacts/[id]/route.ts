/**
 * API Route: Get Single Contact with messages and notes
 * PATCH: Update contact status or other fields
 */

import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { auth } from "@/lib/auth"

const prisma = new PrismaClient()

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const contactId = params.id

    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
      include: {
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 100,
        },
        notes: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
            replies: {
              include: {
                author: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            messages: true,
            notes: true,
          },
        },
      },
    })

    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 })
    }

    return NextResponse.json({ contact })
  } catch (error) {
    console.error("Get contact error:", error)
    return NextResponse.json(
      { error: "Failed to fetch contact", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const contactId = params.id
    const body = await req.json()

    // Update contact
    const contact = await prisma.contact.update({
      where: { id: contactId },
      data: {
        ...(body.status && { status: body.status }),
        ...(body.name && { name: body.name }),
        ...(body.email && { email: body.email }),
        ...(body.phone && { phone: body.phone }),
      },
    })

    return NextResponse.json({ contact })
  } catch (error) {
    console.error("Update contact error:", error)
    return NextResponse.json(
      { error: "Failed to update contact", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
