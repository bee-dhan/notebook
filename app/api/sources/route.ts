import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const notebookId = searchParams.get("notebookId")

    if (!notebookId) {
      return NextResponse.json({ error: "Notebook ID is required" }, { status: 400 })
    }

    const sources = await db.getSourcesByNotebook(notebookId)

    return NextResponse.json({ sources })
  } catch (error) {
    console.error("Error fetching sources:", error)
    return NextResponse.json({ error: "Failed to fetch sources" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { notebookId, title, type, content, metadata, fileUrl, fileSize } = body

    if (!notebookId || !title || !type || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const source = await db.createSource({
      notebookId,
      title,
      type,
      content,
      metadata: metadata || {},
      fileUrl,
      fileSize,
      processingStatus: "completed",
    })

    // Create source chunks for RAG
    const chunks = chunkContent(content)
    const sourceChunks = chunks.map((chunk) => ({
      sourceId: source.id,
      content: chunk.content,
      startIndex: chunk.startIndex,
      endIndex: chunk.endIndex,
      metadata: chunk.metadata,
      // In production, generate embeddings here
      embedding: undefined,
    }))

    await db.createSourceChunks(sourceChunks)

    return NextResponse.json({ source }, { status: 201 })
  } catch (error) {
    console.error("Error creating source:", error)
    return NextResponse.json({ error: "Failed to create source" }, { status: 500 })
  }
}

function chunkContent(content: string, chunkSize = 1000) {
  const chunks = []
  const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 0)

  let currentChunk = ""
  let startIndex = 0

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > chunkSize && currentChunk.length > 0) {
      chunks.push({
        content: currentChunk.trim(),
        startIndex,
        endIndex: startIndex + currentChunk.length,
        metadata: {},
      })

      startIndex += currentChunk.length
      currentChunk = sentence
    } else {
      currentChunk += sentence + ". "
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push({
      content: currentChunk.trim(),
      startIndex,
      endIndex: startIndex + currentChunk.length,
      metadata: {},
    })
  }

  return chunks
}
