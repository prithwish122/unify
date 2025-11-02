/**
 * Script to set a user as ADMIN
 * Usage: npm run set-admin <email>
 */

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function setAdmin(email?: string) {
  try {
    const userEmail = email || process.argv[2]

    if (!userEmail) {
      console.error("❌ Error: Email is required")
      console.log("Usage: npm run set-admin <email>")
      console.log("Example: npm run set-admin user@example.com")
      process.exit(1)
    }

    console.log(`Setting user ${userEmail} as ADMIN...`)

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
    })

    if (!user) {
      console.error(`❌ Error: User with email ${userEmail} not found`)
      console.log("\nAvailable users:")
      const users = await prisma.user.findMany({
        select: { email: true, name: true, role: true },
      })
      users.forEach((u) => {
        console.log(`  - ${u.email} (${u.name || "No name"}) - Role: ${u.role}`)
      })
      process.exit(1)
    }

    // Update user role to ADMIN
    const updatedUser = await prisma.user.update({
      where: { email: userEmail },
      data: { role: "ADMIN" },
    })

    console.log(`✅ Success! User ${updatedUser.email} is now ADMIN`)
    console.log(`   Name: ${updatedUser.name || "No name"}`)
    console.log(`   Email: ${updatedUser.email}`)
    console.log(`   Role: ${updatedUser.role}`)
  } catch (error) {
    console.error("❌ Error setting user as admin:")
    console.error(error instanceof Error ? error.message : "Unknown error")
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

setAdmin()

