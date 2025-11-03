/**
 * Twilio Number Badge - Displays trial/sandbox number
 */

"use client"

import { Phone } from "lucide-react"
import { useQuery } from "@tanstack/react-query"

export default function TwilioNumberBadge() {
  const { data, isLoading } = useQuery({
    queryKey: ["twilio-numbers"],
    queryFn: async () => {
      const res = await fetch("/api/twilio/numbers")
      if (!res.ok) return null
      return res.json()
    },
    refetchInterval: 60000, // Refetch every minute
  })

  const numbers = data?.numbers || []
  
  // Get WhatsApp sandbox number or first number
  const whatsappNumber = numbers.find((n: any) => 
    n.phoneNumber?.includes("14155238886") || 
    n.phoneNumber?.includes("415-523-8886")
  ) || numbers[0]

  if (isLoading || !whatsappNumber) {
    return null
  }

  const displayNumber = whatsappNumber.phoneNumber?.replace("whatsapp:", "").replace(/\D/g, "").replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, "+$1 $2 $3 $4") || "+1 415 523 8886"

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-lg">
      <Phone className="w-4 h-4 text-green-400" />
      <div className="flex flex-col">
        <span className="text-xs text-white/60">Trial Number</span>
        <span className="text-sm font-semibold text-green-300">{displayNumber}</span>
      </div>
    </div>
  )
}

