import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const file = form.get("file") as File | null
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName || !uploadPreset) {
      return NextResponse.json({ error: "Uploads not configured. Set CLOUDINARY_* env vars." }, { status: 500 })
    }

    // Use Cloudinary unsigned upload if only preset provided, else signed
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    try {
      // Prefer cloudinary SDK when available
      const { v2: cloudinary } = await import("cloudinary")
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
      })

      const result: any = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { upload_preset: uploadPreset },
          (error: any, res: any) => (error ? reject(error) : resolve(res)),
        )
        stream.end(buffer)
      })

      return NextResponse.json({ url: result.secure_url })
    } catch (e: any) {
      // Fallback: unsigned upload via REST API (no SDK required)
      try {
        const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
        const fd = new FormData()
        fd.append("file", new Blob([buffer], { type: file.type || "application/octet-stream" }), file.name || "upload")
        fd.append("upload_preset", uploadPreset)
        const up = await fetch(url, { method: "POST", body: fd })
        const json = await up.json()
        if (!up.ok) {
          return NextResponse.json({ error: json?.error?.message || "Upload failed" }, { status: 500 })
        }
        return NextResponse.json({ url: json.secure_url || json.url })
      } catch (err: any) {
        const message = err?.message || e?.message || "Upload failed"
        return NextResponse.json({ error: message }, { status: 500 })
      }
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to process upload" }, { status: 500 })
  }
}


