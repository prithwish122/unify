/**
 * API Route: Notes
 * GET: Fetch notes for a contact
 * POST: Create a new note
 */

import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { auth } from "@/lib/auth"
import { CreateNoteSchema } from "@/lib/validations"

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

    if (!contactId) {
      return NextResponse.json({ error: "contactId is required" }, { status: 400 })
    }

    const where: any = { contactId }

    // Filter out private notes if user is not the author
    if (session.user.role !== "ADMIN") {
      where.OR = [
        { isPrivate: false },
        { authorId: session.user.id },
      ]
    }

    const notes = await prisma.note.findMany({
      where,
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
    })

    return NextResponse.json({ notes })
  } catch (error) {
    console.error("Get notes error:", error)
    return NextResponse.json(
      { error: "Failed to fetch notes", details: error instanceof Error ? error.message : "Unknown error" },
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

    // Validate request body
    const validation = CreateNoteSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid note data", details: validation.error.errors },
        { status: 400 },
      )
    }

    const { contactId, content, isPrivate, parentId, mentions } = validation.data

    // Verify contact exists
    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
    })

    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 })
    }

    // Create note
    const note = await prisma.note.create({
      data: {
        contactId,
        authorId: session.user.id,
        content,
        isPrivate: isPrivate || false,
        parentId: parentId || null,
        mentions: mentions || [],
      },
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
    })

    return NextResponse.json({ note }, { status: 201 })
  } catch (error) {
    console.error("Create note error:", error)
    return NextResponse.json(
      { error: "Failed to create note", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

