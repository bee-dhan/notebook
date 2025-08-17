"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, Globe, Video, Music, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { sourceProcessor, type ProcessedSource } from "@/lib/source-processor"

interface SourceUploadProps {
  onSourceProcessed: (source: ProcessedSource) => void
  onClose: () => void
}

interface UploadItem {
  id: string
  file?: File
  url?: string
  status: "pending" | "processing" | "completed" | "error"
  progress: number
  error?: string
  result?: ProcessedSource
}

export function SourceUpload({ onSourceProcessed, onClose }: SourceUploadProps) {
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([])
  const [urlInput, setUrlInput] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return

    const newItems: UploadItem[] = Array.from(files).map((file) => ({
      id: `file-${Date.now()}-${Math.random()}`,
      file,
      status: "pending",
      progress: 0,
    }))

    setUploadItems((prev) => [...prev, ...newItems])
    processItems(newItems)
  }

  const handleUrlAdd = () => {
    if (!urlInput.trim()) return

    const newItem: UploadItem = {
      id: `url-${Date.now()}`,
      url: urlInput.trim(),
      status: "pending",
      progress: 0,
    }

    setUploadItems((prev) => [...prev, newItem])
    setUrlInput("")
    processItems([newItem])
  }

  const processItems = async (items: UploadItem[]) => {
    for (const item of items) {
      try {
        setUploadItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: "processing", progress: 20 } : i)))

        let result: ProcessedSource

        if (item.file) {
          result = await sourceProcessor.processFile(item.file)
        } else if (item.url) {
          result = await sourceProcessor.processURL(item.url)
        } else {
          throw new Error("No file or URL provided")
        }

        setUploadItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, progress: 80 } : i)))

        // Simulate final processing
        await new Promise((resolve) => setTimeout(resolve, 500))

        setUploadItems((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? {
                  ...i,
                  status: "completed",
                  progress: 100,
                  result,
                }
              : i,
          ),
        )

        onSourceProcessed(result)
      } catch (error) {
        setUploadItems((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? {
                  ...i,
                  status: "error",
                  error: error instanceof Error ? error.message : "Processing failed",
                }
              : i,
          ),
        )
      }
    }
  }

  const removeItem = (id: string) => {
    setUploadItems((prev) => prev.filter((item) => item.id !== id))
  }

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase()

    switch (extension) {
      case "pdf":
      case "doc":
      case "docx":
      case "txt":
      case "md":
        return <FileText className="h-4 w-4" />
      case "mp4":
      case "mov":
      case "avi":
        return <Video className="h-4 w-4" />
      case "mp3":
      case "wav":
      case "m4a":
        return <Music className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getStatusIcon = (status: UploadItem["status"]) => {
    switch (status) {
      case "processing":
        return <Loader2 className="h-4 w-4 animate-spin" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  return (
    <Card className="p-6 w-full max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Add Sources</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* File Upload */}
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Upload Files</label>
          <div
            className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-accent transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              handleFileSelect(e.dataTransfer.files)
            }}
          >
            <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-1">Drop files here or click to browse</p>
            <p className="text-xs text-muted-foreground">Supports PDF, DOC, TXT, MP4, MP3, and more</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
            accept=".pdf,.doc,.docx,.txt,.md,.mp4,.mov,.avi,.mp3,.wav,.m4a"
          />
        </div>

        {/* URL Input */}
        <div>
          <label className="text-sm font-medium mb-2 block">Add Website</label>
          <div className="flex gap-2">
            <Input
              placeholder="Enter website URL..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleUrlAdd()}
            />
            <Button onClick={handleUrlAdd} disabled={!urlInput.trim()}>
              <Globe className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadItems.length > 0 && (
        <div className="mt-6 space-y-3">
          <h4 className="text-sm font-medium">Processing Sources</h4>
          {uploadItems.map((item) => (
            <Card key={item.id} className="p-3">
              <div className="flex items-center gap-3">
                <div className="text-muted-foreground">
                  {item.file ? getFileIcon(item.file.name) : <Globe className="h-4 w-4" />}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.file?.name || item.url}</p>

                  {item.status === "processing" && <Progress value={item.progress} className="h-1 mt-1" />}

                  {item.error && <p className="text-xs text-red-500 mt-1">{item.error}</p>}
                </div>

                <div className="flex items-center gap-2">
                  {getStatusIcon(item.status)}

                  <Badge
                    variant={
                      item.status === "completed" ? "default" : item.status === "error" ? "destructive" : "secondary"
                    }
                  >
                    {item.status}
                  </Badge>

                  <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Card>
  )
}
