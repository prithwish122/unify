/**
 * API Route: Single Automation
 * PATCH: Update automation (toggle active, etc.)
 * DELETE: Delete automation
 */

import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { auth } from "@/lib/auth"

const prisma = new PrismaClient()

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } },
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = params instanceof Promise ? await params : params
    const automationId = resolvedParams.id

    const body = await req.json()
    const { isActive } = body

    // Verify ownership
    const automation = await prisma.scheduledMessage.findUnique({
      where: { id: automationId },
    })

    if (!automation) {
      return NextResponse.json({ error: "Automation not found" }, { status: 404 })
    }

    if (automation.createdById !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const updated = await prisma.scheduledMessage.update({
      where: { id: automationId },
      data: { isActive },
    })

    return NextResponse.json({ automation: updated })
  } catch (error) {
    console.error("Update automation error:", error)
    return NextResponse.json(
      { error: "Failed to update automation", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } },
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const resolvedParams = params instanceof Promise ? await params : params
    const automationId = resolvedParams.id

    // Verify ownership
    const automation = await prisma.scheduledMessage.findUnique({
      where: { id: automationId },
    })

    if (!automation) {
      return NextResponse.json({ error: "Automation not found" }, { status: 404 })
    }

    if (automation.createdById !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.scheduledMessage.delete({
      where: { id: automationId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete automation error:", error)
    return NextResponse.json(
      { error: "Failed to delete automation", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

