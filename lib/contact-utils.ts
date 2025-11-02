/**
 * Contact Utilities
 * Functions for duplicate detection and contact management
 */

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

/**
 * Calculate Levenshtein distance between two strings
 * Used for fuzzy matching
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = []

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1, // deletion
        )
      }
    }
  }

  return matrix[str2.length][str1.length]
}

/**
 * Normalize phone number for comparison
 */
function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone) return null
  // Remove all non-digit characters
  return phone.replace(/\D/g, "")
}

/**
 * Normalize email for comparison
 */
function normalizeEmail(email: string | null | undefined): string | null {
  if (!email) return null
  return email.toLowerCase().trim()
}

/**
 * Calculate similarity score between two strings (0-1)
 */
function similarity(str1: string, str2: string): number {
  const maxLen = Math.max(str1.length, str2.length)
  if (maxLen === 0) return 1
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase())
  return 1 - distance / maxLen
}

/**
 * Check if two contacts are likely duplicates
 * Returns similarity score (0-1) where >0.7 is considered duplicate
 */
export function areContactsDuplicates(
  contact1: { name?: string | null; email?: string | null; phone?: string | null },
  contact2: { name?: string | null; email?: string | null; phone?: string | null },
): { isDuplicate: boolean; score: number; reasons: string[] } {
  const reasons: string[] = []
  let totalScore = 0
  let comparisons = 0

  // Exact email match
  const email1 = normalizeEmail(contact1.email)
  const email2 = normalizeEmail(contact2.email)
  if (email1 && email2 && email1 === email2) {
    return { isDuplicate: true, score: 1.0, reasons: ["Exact email match"] }
  }

  // Exact phone match (normalized)
  const phone1 = normalizePhone(contact1.phone)
  const phone2 = normalizePhone(contact2.phone)
  if (phone1 && phone2 && phone1 === phone2) {
    return { isDuplicate: true, score: 1.0, reasons: ["Exact phone match"] }
  }

  // Name similarity
  if (contact1.name && contact2.name) {
    const nameSim = similarity(contact1.name, contact2.name)
    if (nameSim > 0.8) {
      reasons.push(`High name similarity (${Math.round(nameSim * 100)}%)`)
    }
    totalScore += nameSim
    comparisons++
  }

  // Phone similarity (if not exact match)
  if (phone1 && phone2 && phone1 !== phone2) {
    // Check if one is substring of another (e.g., +1 vs full number)
    if (phone1.includes(phone2) || phone2.includes(phone1)) {
      const phoneSim = similarity(phone1, phone2)
      if (phoneSim > 0.7) {
        reasons.push(`Similar phone numbers (${Math.round(phoneSim * 100)}%)`)
      }
      totalScore += phoneSim
      comparisons++
    }
  }

  // Email similarity (if not exact match)
  if (email1 && email2 && email1 !== email2) {
    // Extract local and domain parts
    const [local1, domain1] = email1.split("@")
    const [local2, domain2] = email2.split("@")

    if (domain1 === domain2 && local1 && local2) {
      const localSim = similarity(local1, local2)
      if (localSim > 0.7) {
        reasons.push(`Similar emails on same domain (${Math.round(localSim * 100)}%)`)
      }
      totalScore += localSim * 0.8 // Slightly lower weight
      comparisons++
    }
  }

  const avgScore = comparisons > 0 ? totalScore / comparisons : 0
  const isDuplicate = avgScore > 0.7 || reasons.length >= 2

  return {
    isDuplicate,
    score: avgScore,
    reasons: reasons.length > 0 ? reasons : ["No significant matches"],
  }
}

/**
 * Find potential duplicates for a contact
 */
export async function findDuplicateContacts(
  contact: { name?: string | null; email?: string | null; phone?: string | null },
  excludeId?: string,
): Promise<Array<{ contact: any; score: number; reasons: string[] }>> {
  const potentialDuplicates: Array<{ contact: any; score: number; reasons: string[] }> = []

  // Get all contacts (excluding current)
  const allContacts = await prisma.contact.findMany({
    where: {
      id: excludeId ? { not: excludeId } : undefined,
      mergedWithId: null, // Don't include already merged contacts
    },
  })

  for (const otherContact of allContacts) {
    const duplicateCheck = areContactsDuplicates(contact, otherContact)
    if (duplicateCheck.isDuplicate) {
      potentialDuplicates.push({
        contact: otherContact,
        score: duplicateCheck.score,
        reasons: duplicateCheck.reasons,
      })
    }
  }

  // Sort by score descending
  potentialDuplicates.sort((a, b) => b.score - a.score)

  return potentialDuplicates
}

/**
 * Merge two contacts (keep primary, merge data from secondary)
 */
export async function mergeContacts(primaryId: string, secondaryId: string): Promise<void> {
  const primary = await prisma.contact.findUnique({ where: { id: primaryId } })
  const secondary = await prisma.contact.findUnique({ where: { id: secondaryId } })

  if (!primary || !secondary) {
    throw new Error("One or both contacts not found")
  }

  // Merge data (primary takes precedence, but fill in missing fields)
  const mergedData: any = {
    name: primary.name || secondary.name,
    email: primary.email || secondary.email,
    phone: primary.phone || secondary.phone,
    avatar: primary.avatar || secondary.avatar,
    // Merge social handles
    socialHandles: {
      ...((secondary.socialHandles as any) || {}),
      ...((primary.socialHandles as any) || {}),
    },
    // Use earlier created date
    createdAt: primary.createdAt < secondary.createdAt ? primary.createdAt : secondary.createdAt,
  }

  // Update primary with merged data
  await prisma.contact.update({
    where: { id: primaryId },
    data: mergedData,
  })

  // Move all messages from secondary to primary
  await prisma.message.updateMany({
    where: { contactId: secondaryId },
    data: { contactId: primaryId },
  })

  // Move all notes from secondary to primary
  await prisma.note.updateMany({
    where: { contactId: secondaryId },
    data: { contactId: primaryId },
  })

  // Mark secondary as merged
  await prisma.contact.update({
    where: { id: secondaryId },
    data: {
      mergedWithId: primaryId,
      status: "CLOSED", // Close the duplicate
    },
  })
}

/**
 * Auto-detect and suggest duplicate contacts on creation/update
 */
export async function autoDetectDuplicates(
  contact: { name?: string | null; email?: string | null; phone?: string | null },
  excludeId?: string,
): Promise<Array<{ contact: any; score: number; reasons: string[] }>> {
  return findDuplicateContacts(contact, excludeId)
}

