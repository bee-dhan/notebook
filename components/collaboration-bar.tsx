"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Users, MessageSquare, Activity, X } from "lucide-react"
import type { Collaborator, Comment, Activity as ActivityType } from "@/lib/collaboration"

interface CollaborationBarProps {
  collaborators: Collaborator[]
  comments: Comment[]
  activities: ActivityType[]
  onCommentClick: (commentId: string) => void
}

export function CollaborationBar({ collaborators, comments, activities, onCommentClick }: CollaborationBarProps) {
  const [activeTab, setActiveTab] = useState<"users" | "comments" | "activity">("users")
  const [isExpanded, setIsExpanded] = useState(false)

  const onlineUsers = collaborators.filter((c) => c.isOnline)
  const unresolvedComments = comments.filter((c) => !c.resolved)

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <div className="fixed top-20 right-4 z-40">
      {/* Collapsed state */}
      {!isExpanded && (
        <div className="flex flex-col gap-2">
          {/* Online users avatars */}
          <Card className="p-2">
            <div className="flex items-center gap-1">
              {onlineUsers.slice(0, 3).map((user) => (
                <Avatar key={user.id} className="h-6 w-6 border-2" style={{ borderColor: user.color }}>
                  <AvatarImage src={user.avatarUrl || "/placeholder.svg"} />
                  <AvatarFallback className="text-xs">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              ))}
              {onlineUsers.length > 3 && (
                <div className="h-6 w-6 bg-muted rounded-full flex items-center justify-center text-xs">
                  +{onlineUsers.length - 3}
                </div>
              )}
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 ml-1" onClick={() => setIsExpanded(true)}>
                <Users className="h-3 w-3" />
              </Button>
            </div>
          </Card>

          {/* Quick action buttons */}
          <div className="flex flex-col gap-1">
            {unresolvedComments.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 bg-transparent"
                onClick={() => {
                  setActiveTab("comments")
                  setIsExpanded(true)
                }}
              >
                <MessageSquare className="h-3 w-3" />
                {unresolvedComments.length > 0 && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs">
                    {unresolvedComments.length}
                  </Badge>
                )}
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 bg-transparent"
              onClick={() => {
                setActiveTab("activity")
                setIsExpanded(true)
              }}
            >
              <Activity className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Expanded state */}
      {isExpanded && (
        <Card className="w-80 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-1">
              <Button
                variant={activeTab === "users" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("users")}
              >
                <Users className="h-3 w-3 mr-1" />
                Users ({onlineUsers.length})
              </Button>
              <Button
                variant={activeTab === "comments" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("comments")}
              >
                <MessageSquare className="h-3 w-3 mr-1" />
                Comments ({unresolvedComments.length})
              </Button>
              <Button
                variant={activeTab === "activity" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("activity")}
              >
                <Activity className="h-3 w-3 mr-1" />
                Activity
              </Button>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(false)}>
              <X className="h-3 w-3" />
            </Button>
          </div>

          <ScrollArea className="h-64">
            {activeTab === "users" && (
              <div className="space-y-2">
                {collaborators.map((user) => (
                  <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                    <Avatar className="h-8 w-8 border-2" style={{ borderColor: user.color }}>
                      <AvatarImage src={user.avatarUrl || "/placeholder.svg"} />
                      <AvatarFallback className="text-xs">
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{user.name}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {user.role}
                        </Badge>
                        {user.isOnline ? (
                          <span className="text-xs text-green-600">Online</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">{formatTimeAgo(user.lastSeen)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "comments" && (
              <div className="space-y-3">
                {unresolvedComments.map((comment) => (
                  <Card
                    key={comment.id}
                    className="p-3 cursor-pointer hover:bg-muted/50"
                    onClick={() => onCommentClick(comment.id)}
                  >
                    <div className="flex items-start gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={comment.author.avatarUrl || "/placeholder.svg"} />
                        <AvatarFallback className="text-xs">
                          {comment.author.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-xs font-medium">{comment.author.name}</p>
                        <p className="text-sm mt-1">{comment.content}</p>
                        <p className="text-xs text-muted-foreground mt-1">{formatTimeAgo(comment.createdAt)}</p>
                      </div>
                    </div>
                  </Card>
                ))}
                {unresolvedComments.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No unresolved comments</p>
                )}
              </div>
            )}

            {activeTab === "activity" && (
              <div className="space-y-2">
                {activities.slice(0, 20).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/50">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={activity.user.avatarUrl || "/placeholder.svg"} />
                      <AvatarFallback className="text-xs">
                        {activity.user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">{formatTimeAgo(activity.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </Card>
      )}
    </div>
  )
}
