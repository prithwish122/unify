/**
 * WhatsApp Webhook Alert Component
 * Shows alert if WhatsApp webhook is not configured
 */

"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function WhatsAppWebhookAlert() {
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>WhatsApp Webhook Not Configured</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-2">
          WhatsApp replies aren't showing up because the webhook URL isn't configured in Twilio.
        </p>
        <div className="flex gap-2 mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              window.open("https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn", "_blank")
            }}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Configure in Twilio
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              window.open("/WHATSAPP_WEBHOOK_SETUP.md", "_blank")
            }}
          >
            View Setup Guide
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}

