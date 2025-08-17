"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Plus, Search, FileText, Globe, ExternalLink, Video, Music, MoreHorizontal } from "lucide-react"
import { SourceUpload } from "./source-upload"
import type { ProcessedSource } from "@/lib/source-processor"

interface SourcesPanelProps {
  sources: ProcessedSource[]
  onSourceAdd: (source: ProcessedSource) => void
  onSourceClick: (sourceId: string) => void
}

export function SourcesPanel({ sources, onSourceAdd, onSourceClick }: SourcesPanelProps) {
  const [showAddSource, setShowAddSource] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"date" | "name" | "type">("date")

  const filteredSources = sources
    .filter((source) => {
      const matchesSearch =
        source.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        source.content.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesFilter = filterType === "all" || source.type === filterType
      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.title.localeCompare(b.title)
        case "type":
          return a.type.localeCompare(b.type)
        case "date":
        default:
          return b.addedAt.getTime() - a.addedAt.getTime()
      }
    })

  const getSourceIcon = (type: ProcessedSource["type"]) => {
    switch (type) {
      case "website":
        return <Globe className="h-4 w-4" />
      case "pdf":
        return <FileText className="h-4 w-4" />
      case "video":
        return <Video className="h-4 w-4" />
      case "audio":
        return <Music className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ""
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
  }

  const getSourceTypeCount = (type: string) => {
    if (type === "all") return sources.length
    return sources.filter((s) => s.type === type).length
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-sidebar-border">
        <h2 className="font-semibold text-sidebar-foreground mb-3">Sources</h2>
        <div className="flex gap-2 mb-3">
          <Button size="sm" className="flex-1" onClick={() => setShowAddSource(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
          <Button variant="outline" size="sm" className="flex-1 bg-transparent">
            <Search className="h-4 w-4 mr-2" />
            Discover
          </Button>
        </div>

        <div className="space-y-2">
          <Input
            placeholder="Search sources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-sm"
          />

          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="flex-1 text-xs bg-background border border-border rounded px-2 py-1"
            >
              <option value="all">All ({getSourceTypeCount("all")})</option>
              <option value="pdf">PDF ({getSourceTypeCount("pdf")})</option>
              <option value="website">Web ({getSourceTypeCount("website")})</option>
              <option value="video">Video ({getSourceTypeCount("video")})</option>
              <option value="audio">Audio ({getSourceTypeCount("audio")})</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="flex-1 text-xs bg-background border border-border rounded px-2 py-1"
            >
              <option value="date">Date</option>
              <option value="name">Name</option>
              <option value="type">Type</option>
            </select>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        {filteredSources.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground mb-2">
              {sources.length === 0 ? "No sources added yet" : "No sources match your search"}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {sources.length === 0
                ? "Click Add source above to add PDFs, websites, text, videos, or audio files."
                : "Try adjusting your search or filter criteria."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSources.map((source) => (
              <Card
                key={source.id}
                className="p-3 cursor-pointer hover:bg-sidebar-accent transition-colors"
                onClick={() => onSourceClick(source.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="text-sidebar-accent mt-0.5">{getSourceIcon(source.type)}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{source.title}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="outline" className="text-xs">
                        {source.type}
                      </Badge>
                      {source.metadata.pages && (
                        <Badge variant="outline" className="text-xs">
                          {source.metadata.pages} pages
                        </Badge>
                      )}
                      {source.metadata.size && (
                        <Badge variant="outline" className="text-xs">
                          {formatFileSize(source.metadata.size)}
                        </Badge>
                      )}
                      {source.metadata.url && <ExternalLink className="h-3 w-3 text-muted-foreground" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Added {source.addedAt.toLocaleDateString()}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{source.content.slice(0, 100)}...</p>
                  </div>
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>

      {showAddSource && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <SourceUpload
            onSourceProcessed={(source) => {
              onSourceAdd(source)
              // Auto-close after successful upload
              setTimeout(() => setShowAddSource(false), 1000)
            }}
            onClose={() => setShowAddSource(false)}
          />
        </div>
      )}
    </div>
  )
}
