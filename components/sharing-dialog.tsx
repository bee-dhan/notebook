"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { X, Copy, Globe, UserPlus, Crown, Edit, Eye, MoreHorizontal } from "lucide-react"
import type { Collaborator } from "@/lib/collaboration"

interface SharingDialogProps {
  isOpen: boolean
  onClose: () => void
  notebookTitle: string
  collaborators: Collaborator[]
  onInviteUser: (email: string, role: "editor" | "viewer") => void
  onUpdateRole: (userId: string, role: "editor" | "viewer") => void
  onRemoveUser: (userId: string) => void
}

export function SharingDialog({
  isOpen,
  onClose,
  notebookTitle,
  collaborators,
  onInviteUser,
  onUpdateRole,
  onRemoveUser,
}: SharingDialogProps) {
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<"editor" | "viewer">("viewer")
  const [isPublic, setIsPublic] = useState(false)
  const [shareLink] = useState("https://notebook.ai/shared/abc123")

  if (!isOpen) return null

  const handleInvite = () => {
    if (inviteEmail.trim()) {
      onInviteUser(inviteEmail.trim(), inviteRole)
      setInviteEmail("")
    }
  }

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink)
    // Show toast notification in production
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="h-3 w-3" />
      case "editor":
        return <Edit className="h-3 w-3" />
      case "viewer":
        return <Eye className="h-3 w-3" />
      default:
        return null
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
      case "editor":
        return "bg-green-500/10 text-green-600 border-green-500/20"
      case "viewer":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20"
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20"
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold">Share Notebook</h3>
            <p className="text-sm text-muted-foreground">{notebookTitle}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Public sharing toggle */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Public access</p>
                <p className="text-xs text-muted-foreground">Anyone with the link can view</p>
              </div>
            </div>
            <Button variant={isPublic ? "default" : "outline"} size="sm" onClick={() => setIsPublic(!isPublic)}>
              {isPublic ? "On" : "Off"}
            </Button>
          </div>

          {/* Share link */}
          {isPublic && (
            <div className="flex gap-2">
              <Input value={shareLink} readOnly className="text-xs" />
              <Button variant="outline" size="sm" onClick={copyShareLink}>
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          )}

          <Separator />

          {/* Invite users */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Invite people</h4>
            <div className="flex gap-2">
              <Input
                placeholder="Enter email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleInvite()}
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as "editor" | "viewer")}
                className="px-3 py-2 border rounded-md text-sm bg-background"
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
              </select>
              <Button size="sm" onClick={handleInvite} disabled={!inviteEmail.trim()}>
                <UserPlus className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <Separator />

          {/* Current collaborators */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">People with access</h4>
            <ScrollArea className="max-h-48">
              <div className="space-y-2">
                {collaborators.map((collaborator) => (
                  <div
                    key={collaborator.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={collaborator.avatarUrl || "/placeholder.svg"} />
                        <AvatarFallback className="text-xs">
                          {collaborator.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{collaborator.name}</p>
                        <p className="text-xs text-muted-foreground">{collaborator.email}</p>
                      </div>
                      {collaborator.isOnline && <div className="h-2 w-2 bg-green-500 rounded-full" />}
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-xs ${getRoleColor(collaborator.role)}`}>
                        <div className="flex items-center gap-1">
                          {getRoleIcon(collaborator.role)}
                          {collaborator.role}
                        </div>
                      </Badge>

                      {collaborator.role !== "owner" && (
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </Card>
    </div>
  )
}
