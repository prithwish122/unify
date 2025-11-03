import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl.searchParams.get("url")
    if (!url) {
      return NextResponse.json({ error: "Missing url parameter" }, { status: 400 })
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN

    // If the URL is a Twilio media URL, add basic auth
    const headers: HeadersInit = {}
    if (accountSid && authToken && url.includes("api.twilio.com")) {
      const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64")
      headers["Authorization"] = `Basic ${auth}`
    }

    const res = await fetch(url, { headers })
    if (!res.ok) {
      return NextResponse.json({ error: `Upstream error: ${res.status}` }, { status: 500 })
    }

    const contentType = res.headers.get("content-type") || "application/octet-stream"
    const buffer = Buffer.from(await res.arrayBuffer())

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=60",
      },
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed to proxy media" }, { status: 500 })
  }
}


