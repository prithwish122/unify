/**
 * API Route: Get Single Contact with messages and notes
 * PATCH: Update contact status or other fields
 */

import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { auth } from "@/lib/auth"
import { UpdateContactSchema } from "@/lib/validations"

const prisma = new PrismaClient()

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Handle async params (Next.js 15)
    const resolvedParams = params instanceof Promise ? await params : params
    const contactId = resolvedParams.id

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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Handle async params (Next.js 15)
    const resolvedParams = params instanceof Promise ? await params : params
    const contactId = resolvedParams.id

    const body = await req.json()

    // Validate request body
    const validation = UpdateContactSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid contact data", details: validation.error.errors },
        { status: 400 },
      )
    }

    // Check if contact exists
    const existingContact = await prisma.contact.findUnique({
      where: { id: contactId },
    })

    if (!existingContact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 })
    }

    // Build update data - only include fields that are provided
    const updateData: any = {}
    if (validation.data.status !== undefined) {
      updateData.status = validation.data.status
    }
    if (validation.data.name !== undefined) {
      updateData.name = validation.data.name
    }
    if (validation.data.email !== undefined) {
      updateData.email = validation.data.email
    }
    if (validation.data.phone !== undefined) {
      updateData.phone = validation.data.phone
    }
    if (validation.data.avatar !== undefined) {
      updateData.avatar = validation.data.avatar
    }
    if (validation.data.socialHandles !== undefined) {
      updateData.socialHandles = validation.data.socialHandles
    }

    // If no fields to update, return current contact
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ contact: existingContact })
    }

    // Update contact
    const contact = await prisma.contact.update({
      where: { id: contactId },
      data: updateData,
    })

    return NextResponse.json({ contact })
  } catch (error: any) {
    console.error("Update contact error:", error)
    
    // Handle Prisma specific errors
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 })
    }
    
    return NextResponse.json(
      { 
        error: "Failed to update contact", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 },
    )
  }
}
