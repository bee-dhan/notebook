import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    // In production, get user from authentication
    const userId = "demo-user-id"

    // Get notebooks for user (would implement proper query)
    const notebooks = []

    return NextResponse.json({ notebooks })
  } catch (error) {
    console.error("Error fetching notebooks:", error)
    return NextResponse.json({ error: "Failed to fetch notebooks" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description } = body

    // In production, get user from authentication
    const userId = "demo-user-id"

    const notebook = await db.createNotebook({
      title: title || "Untitled notebook",
      description,
      ownerId: userId,
      isPublic: false,
    })

    return NextResponse.json({ notebook }, { status: 201 })
  } catch (error) {
    console.error("Error creating notebook:", error)
    return NextResponse.json({ error: "Failed to create notebook" }, { status: 500 })
  }
}
