"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Mic, Video, Brain, BarChart3, FileText, Download, Play, Sparkles } from "lucide-react"
import { AIService } from "@/lib/ai-service"

interface StudioOutput {
  id: string
  type: "audio" | "video" | "mindmap" | "report" | "summary"
  title: string
  status: "generating" | "ready" | "error"
  progress?: number
  content?: any
  createdAt: Date
}

interface AIStudioProps {
  sources?: any[]
}

export function AIStudio({ sources = [] }: AIStudioProps) {
  const [outputs, setOutputs] = useState<StudioOutput[]>([])
  const [isGenerating, setIsGenerating] = useState<string | null>(null)
  const aiService = new AIService()

  const generateOutput = async (type: StudioOutput["type"]) => {
    const outputId = Date.now().toString()
    const newOutput: StudioOutput = {
      id: outputId,
      type,
      title: getOutputTitle(type),
      status: "generating",
      progress: 0,
      createdAt: new Date(),
    }

    setOutputs((prev) => [newOutput, ...prev])
    setIsGenerating(outputId)

    try {
      // Simulate progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 200))
        setOutputs((prev) => prev.map((output) => (output.id === outputId ? { ...output, progress: i } : output)))
      }

      // Generate actual content based on type
      let content
      switch (type) {
        case "mindmap":
          content = await aiService.generateMindMap("User sources content")
          break
        case "summary":
          content = await aiService.generateSummary("User sources content", sources)
          break
        default:
          content = `Generated ${type} content based on your sources.`
      }

      setOutputs((prev) =>
        prev.map((output) =>
          output.id === outputId ? { ...output, status: "ready", content, progress: 100 } : output,
        ),
      )
    } catch (error) {
      setOutputs((prev) => prev.map((output) => (output.id === outputId ? { ...output, status: "error" } : output)))
    } finally {
      setIsGenerating(null)
    }
  }

  const getOutputTitle = (type: StudioOutput["type"]): string => {
    const titles = {
      audio: "Audio Overview",
      video: "Video Overview",
      mindmap: "Mind Map",
      report: "Research Report",
      summary: "Summary",
    }
    return titles[type]
  }

  const getOutputIcon = (type: StudioOutput["type"]) => {
    const icons = {
      audio: Mic,
      video: Video,
      mindmap: Brain,
      report: BarChart3,
      summary: FileText,
    }
    const Icon = icons[type]
    return <Icon className="h-4 w-4" />
  }

  const renderOutput = (output: StudioOutput) => {
    return (
      <Card key={output.id} className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {getOutputIcon(output.type)}
            <h3 className="font-medium">{output.title}</h3>
          </div>

          <div className="flex items-center gap-2">
            {output.status === "ready" && (
              <>
                <Button variant="ghost" size="sm">
                  <Download className="h-3 w-3" />
                </Button>
                {(output.type === "audio" || output.type === "video") && (
                  <Button variant="ghost" size="sm">
                    <Play className="h-3 w-3" />
                  </Button>
                )}
              </>
            )}

            <Badge
              variant={output.status === "ready" ? "default" : output.status === "error" ? "destructive" : "secondary"}
            >
              {output.status}
            </Badge>
          </div>
        </div>

        {output.status === "generating" && (
          <div className="space-y-2">
            <Progress value={output.progress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              Generating {output.title.toLowerCase()}... {output.progress}%
            </p>
          </div>
        )}

        {output.status === "ready" && output.content && (
          <div className="mt-3 p-3 bg-muted rounded-md">
            {output.type === "mindmap" ? (
              <div className="text-sm">
                <p className="font-medium mb-2">{output.content.central}</p>
                <ul className="space-y-1 ml-4">
                  {output.content.branches?.map((branch: any, index: number) => (
                    <li key={index} className="text-muted-foreground">
                      • {branch.label}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{output.content}</p>
            )}
          </div>
        )}

        {output.status === "error" && (
          <p className="text-sm text-destructive mt-2">
            Failed to generate {output.title.toLowerCase()}. Please try again.
          </p>
        )}

        <p className="text-xs text-muted-foreground mt-3">{output.createdAt.toLocaleString()}</p>
      </Card>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-sidebar-border">
        <h2 className="font-semibold text-sidebar-foreground mb-4">Studio</h2>

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="p-3 h-auto flex-col gap-2 bg-transparent hover:bg-sidebar-accent"
            onClick={() => generateOutput("audio")}
            disabled={!!isGenerating || sources.length === 0}
          >
            <Mic className="h-5 w-5 text-sidebar-accent" />
            <span className="text-xs font-medium">Audio Overview</span>
          </Button>

          <Button
            variant="outline"
            className="p-3 h-auto flex-col gap-2 bg-transparent hover:bg-sidebar-accent"
            onClick={() => generateOutput("video")}
            disabled={!!isGenerating || sources.length === 0}
          >
            <Video className="h-5 w-5 text-sidebar-accent" />
            <span className="text-xs font-medium">Video Overview</span>
          </Button>

          <Button
            variant="outline"
            className="p-3 h-auto flex-col gap-2 bg-transparent hover:bg-sidebar-accent"
            onClick={() => generateOutput("mindmap")}
            disabled={!!isGenerating || sources.length === 0}
          >
            <Brain className="h-5 w-5 text-sidebar-accent" />
            <span className="text-xs font-medium">Mind Map</span>
          </Button>

          <Button
            variant="outline"
            className="p-3 h-auto flex-col gap-2 bg-transparent hover:bg-sidebar-accent"
            onClick={() => generateOutput("report")}
            disabled={!!isGenerating || sources.length === 0}
          >
            <BarChart3 className="h-5 w-5 text-sidebar-accent" />
            <span className="text-xs font-medium">Reports</span>
          </Button>
        </div>

        {sources.length === 0 && (
          <p className="text-xs text-muted-foreground mt-3 text-center">Add sources to generate AI outputs</p>
        )}
      </div>

      <ScrollArea className="flex-1 p-4">
        {outputs.length === 0 ? (
          <div className="text-center py-12">
            <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground mb-2">Studio output will be saved here</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              After adding sources, click to add Audio Overview, Study Guide, Mind Map, and more!
            </p>
          </div>
        ) : (
          <div className="space-y-4">{outputs.map(renderOutput)}</div>
        )}
      </ScrollArea>
    </div>
  )
}
