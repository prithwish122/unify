export interface Contact {
  id: string
  name: string
  lastMessage: string
  channel: "whatsapp" | "sms" | "email"
  timestamp: string
  status: "unread" | "active" | "closed"
  avatar: string
}
