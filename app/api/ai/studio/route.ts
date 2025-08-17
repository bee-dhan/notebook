import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { notebookId, type, sourcesUsed = [] } = body

    if (!notebookId || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const titles = {
      audio: "Audio Overview",
      video: "Video Overview",
      mindmap: "Mind Map",
      report: "Research Report",
      summary: "Summary",
    }

    // Create studio output record
    const output = await db.createStudioOutput({
      notebookId,
      type,
      title: titles[type as keyof typeof titles] || "AI Output",
      content: {},
      status: "generating",
      sourcesUsed,
    })

    // Simulate AI generation process
    setTimeout(async () => {
      let generatedContent

      switch (type) {
        case "mindmap":
          generatedContent = {
            central: "Main Topic",
            branches: [
              { label: "Key Concept 1", children: ["Detail A", "Detail B"] },
              { label: "Key Concept 2", children: ["Detail C", "Detail D"] },
              { label: "Key Concept 3", children: ["Detail E", "Detail F"] },
            ],
          }
          break
        case "summary":
          generatedContent = {
            text: "This is a comprehensive summary of your sources, highlighting the key themes and insights discovered through AI analysis.",
          }
          break
        default:
          generatedContent = {
            text: `Generated ${type} content based on your sources.`,
          }
      }

      // Update with generated content
      await db.updateStudioOutput(output.id, {
        content: generatedContent,
        status: "ready",
      })
    }, 3000)

    return NextResponse.json({ output }, { status: 201 })
  } catch (error) {
    console.error("Error creating studio output:", error)
    return NextResponse.json({ error: "Failed to create studio output" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const notebookId = searchParams.get("notebookId")

    if (!notebookId) {
      return NextResponse.json({ error: "Notebook ID is required" }, { status: 400 })
    }

    const outputs = await db.getStudioOutputsByNotebook(notebookId)

    return NextResponse.json({ outputs })
  } catch (error) {
    console.error("Error fetching studio outputs:", error)
    return NextResponse.json({ error: "Failed to fetch studio outputs" }, { status: 500 })
  }
}
