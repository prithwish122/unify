/**
 * API Route: Merge Contacts
 * Merge two contacts together (handles duplicate merging)
 */

import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { auth } from "@/lib/auth"
import { MergeContactsSchema } from "@/lib/validations"
import { mergeContacts } from "@/lib/contact-utils"

const prisma = new PrismaClient()

/**
 * POST /api/contacts/merge
 * Merge two contacts
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check permissions (only EDITOR and ADMIN can merge)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user || (user.role !== "EDITOR" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const body = await req.json()

    // Validate request body
    const validation = MergeContactsSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid merge data", details: validation.error.errors },
        { status: 400 },
      )
    }

    const { primaryId, secondaryId } = validation.data

    // Verify contacts exist
    const primary = await prisma.contact.findUnique({ where: { id: primaryId } })
    const secondary = await prisma.contact.findUnique({ where: { id: secondaryId } })

    if (!primary) {
      return NextResponse.json({ error: "Primary contact not found" }, { status: 404 })
    }

    if (!secondary) {
      return NextResponse.json({ error: "Secondary contact not found" }, { status: 404 })
    }

    // Prevent merging with already merged contacts
    if (secondary.mergedWithId) {
      return NextResponse.json(
        { error: "Secondary contact is already merged with another contact" },
        { status: 400 },
      )
    }

    // Merge contacts
    await mergeContacts(primaryId, secondaryId)

    // Get updated primary contact
    const mergedContact = await prisma.contact.findUnique({
      where: { id: primaryId },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        notes: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: {
          select: {
            messages: true,
            notes: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      contact: mergedContact,
      message: "Contacts merged successfully",
    })
  } catch (error) {
    console.error("Merge contacts error:", error)
    return NextResponse.json(
      { error: "Failed to merge contacts", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

