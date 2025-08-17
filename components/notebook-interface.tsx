"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Settings, Share, MoreHorizontal, Brain } from "lucide-react"
import { AIChat } from "./ai-chat"
import { AIStudio } from "./ai-studio"
import { SourcesPanel } from "./sources-panel"
import { SharingDialog } from "./sharing-dialog"
import { CollaborationBar } from "./collaboration-bar"
import { collaborationService, type Collaborator } from "@/lib/collaboration"
import type { ProcessedSource } from "@/lib/source-processor"

export function NotebookInterface() {
  const [sources, setSources] = useState<ProcessedSource[]>([])
  const [activePanel, setActivePanel] = useState<"sources" | "chat" | "studio">("chat")
  const [showSharingDialog, setShowSharingDialog] = useState(false)
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [comments, setComments] = useState(collaborationService.getComments())
  const [activities, setActivities] = useState(collaborationService.getActivities())

  useEffect(() => {
    // Simulate current user and some collaborators
    const mockCollaborators: Collaborator[] = [
      {
        id: "user-1",
        name: "John Doe",
        email: "john@example.com",
        avatarUrl: "/generic-user-avatar.png",
        color: "#3b82f6",
        role: "owner",
        isOnline: true,
        lastSeen: new Date(),
      },
      {
        id: "user-2",
        name: "Jane Smith",
        email: "jane@example.com",
        avatarUrl: "/user-avatar-2.png",
        color: "#10b981",
        role: "editor",
        isOnline: true,
        lastSeen: new Date(),
      },
      {
        id: "user-3",
        name: "Bob Wilson",
        email: "bob@example.com",
        color: "#f59e0b",
        role: "viewer",
        isOnline: false,
        lastSeen: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      },
    ]

    mockCollaborators.forEach((collaborator) => {
      collaborationService.addCollaborator(collaborator)
    })

    // Add some mock comments
    collaborationService.addComment({
      content: "This source looks really interesting! Can we explore the methodology section more?",
      author: mockCollaborators[1],
      blockId: "block-1",
    })

    collaborationService.addComment({
      content: "I think we should add more context about the AI integration approach.",
      author: mockCollaborators[2],
      blockId: "block-2",
    })

    setCollaborators(collaborationService.getCollaborators())
    setComments(collaborationService.getComments())
    setActivities(collaborationService.getActivities())
  }, [])

  const handleSourceAdd = (source: ProcessedSource) => {
    setSources((prev) => [...prev, source])

    collaborationService.addActivity({
      type: "source_added",
      user: collaborators[0], // Current user
      description: `Added source: ${source.title}`,
      metadata: { sourceId: source.id, sourceType: source.type },
    })
    setActivities(collaborationService.getActivities())
  }

  const handleSourceClick = (sourceId: string) => {
    console.log("Source clicked:", sourceId)
    // Handle source navigation/highlighting
  }

  const handleInviteUser = (email: string, role: "editor" | "viewer") => {
    console.log("Inviting user:", email, "as", role)
    // In production, send invitation email
  }

  const handleUpdateRole = (userId: string, role: "editor" | "viewer") => {
    console.log("Updating role for user:", userId, "to", role)
    // In production, update user role in database
  }

  const handleRemoveUser = (userId: string) => {
    console.log("Removing user:", userId)
    // In production, remove user access
  }

  const handleCommentClick = (commentId: string) => {
    console.log("Comment clicked:", commentId)
    // In production, scroll to comment location
  }

  return (
    <div className="h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-accent" />
            <h1 className="text-xl font-semibold">Hybrid AI Notebook</h1>
          </div>
          <Badge variant="secondary" className="text-xs">
            Untitled notebook
          </Badge>
          <div className="flex items-center gap-1">
            {collaborators
              .filter((c) => c.isOnline)
              .slice(0, 3)
              .map((user) => (
                <div
                  key={user.id}
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: user.color }}
                  title={`${user.name} is online`}
                />
              ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setShowSharingDialog(true)}>
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Sources Panel */}
        <div className="w-80 border-r border-border bg-sidebar">
          <SourcesPanel sources={sources} onSourceAdd={handleSourceAdd} onSourceClick={handleSourceClick} />
        </div>

        {/* Chat Panel */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold">Chat</h2>
          </div>

          <AIChat sources={sources} onSourceClick={handleSourceClick} />
        </div>

        {/* Studio Panel */}
        <div className="w-96 border-l border-border bg-sidebar">
          <AIStudio sources={sources} />
        </div>
      </div>

      <CollaborationBar
        collaborators={collaborators}
        comments={comments}
        activities={activities}
        onCommentClick={handleCommentClick}
      />

      <SharingDialog
        isOpen={showSharingDialog}
        onClose={() => setShowSharingDialog(false)}
        notebookTitle="Untitled notebook"
        collaborators={collaborators}
        onInviteUser={handleInviteUser}
        onUpdateRole={handleUpdateRole}
        onRemoveUser={handleRemoveUser}
      />
    </div>
  )
}
