/**
 * Setup Script: Initialize Twilio Integration
 * Run this script to configure Twilio integration in the database
 */

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function setupTwilio() {
  // Get credentials from environment or use provided ones
  const accountSid = process.env.TWILIO_ACCOUNT_SID || "AC77e2920c6126a87f1ef347a8104ef23d"
  const authToken = process.env.TWILIO_AUTH_TOKEN || "fdb203ed4a2c47d0d3c0390f3484e584"
  const defaultFrom = process.env.TWILIO_DEFAULT_FROM || "+17627284329"
  const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886"

  try {
    console.log("Setting up Twilio integration...")

    // Upsert Twilio integration
    const integration = await prisma.integration.upsert({
      where: { provider: "twilio" },
      update: {
        config: {
          accountSid,
          authToken,
          defaultFrom,
          whatsappFrom,
        },
        isActive: true,
      },
      create: {
        provider: "twilio",
        config: {
          accountSid,
          authToken,
          defaultFrom,
          whatsappFrom,
        },
        isActive: true,
      },
    })

    console.log("✅ Twilio integration configured successfully!")
    console.log(`   Provider: ${integration.provider}`)
    console.log(`   Account SID: ${accountSid.substring(0, 10)}...`)
    console.log(`   Default From: ${defaultFrom}`)
    console.log(`   WhatsApp From: ${whatsappFrom}`)
    console.log(`   Status: ${integration.isActive ? "Active" : "Inactive"}`)

    // Fetch and sync phone numbers
    try {
      const twilio = require("twilio")
      const client = twilio(accountSid, authToken)
      const numbers = await client.incomingPhoneNumbers.list()

      console.log(`\n📞 Syncing ${numbers.length} phone number(s)...`)

      for (const num of numbers) {
        await prisma.twilioNumber.upsert({
          where: { sid: num.sid },
          update: {
            phoneNumber: num.phoneNumber || "",
            friendlyName: num.friendlyName || null,
            status: "active",
          },
          create: {
            phoneNumber: num.phoneNumber || "",
            friendlyName: num.friendlyName || null,
            sid: num.sid,
            status: "active",
          },
        })
        console.log(`   ✅ Synced: ${num.phoneNumber} (${num.friendlyName || "No name"})`)
      }

      console.log("\n✅ Twilio setup complete!")
    } catch (error) {
      console.warn("⚠️  Could not fetch phone numbers from Twilio API (this is okay if credentials are incorrect)")
      console.warn(`   Error: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  } catch (error) {
    console.error("❌ Failed to setup Twilio integration:")
    console.error(error instanceof Error ? error.message : "Unknown error")
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

setupTwilio()

