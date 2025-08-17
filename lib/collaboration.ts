// Collaboration service for real-time features
export interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
  color: string
}

export interface Collaborator extends User {
  role: "owner" | "editor" | "viewer"
  isOnline: boolean
  lastSeen: Date
  cursor?: {
    x: number
    y: number
    blockId?: string
  }
}

export interface Comment {
  id: string
  content: string
  author: User
  blockId?: string
  position?: { x: number; y: number }
  replies: Comment[]
  createdAt: Date
  updatedAt: Date
  resolved: boolean
}

export interface Activity {
  id: string
  type: "source_added" | "block_created" | "block_updated" | "comment_added" | "user_joined" | "ai_generated"
  user: User
  description: string
  metadata: Record<string, any>
  createdAt: Date
}

export class CollaborationService {
  private collaborators = new Map<string, Collaborator>()
  private comments = new Map<string, Comment>()
  private activities: Activity[] = []

  // User presence management
  addCollaborator(collaborator: Collaborator) {
    this.collaborators.set(collaborator.id, collaborator)
    this.addActivity({
      type: "user_joined",
      user: collaborator,
      description: `${collaborator.name} joined the notebook`,
      metadata: { role: collaborator.role },
    })
  }

  updateUserPresence(userId: string, cursor?: { x: number; y: number; blockId?: string }) {
    const collaborator = this.collaborators.get(userId)
    if (collaborator) {
      collaborator.cursor = cursor
      collaborator.lastSeen = new Date()
      this.collaborators.set(userId, collaborator)
    }
  }

  removeCollaborator(userId: string) {
    const collaborator = this.collaborators.get(userId)
    if (collaborator) {
      collaborator.isOnline = false
      this.collaborators.set(userId, collaborator)
    }
  }

  getCollaborators(): Collaborator[] {
    return Array.from(this.collaborators.values())
  }

  // Comment management
  addComment(comment: Omit<Comment, "id" | "createdAt" | "updatedAt" | "replies" | "resolved">): Comment {
    const newComment: Comment = {
      id: this.generateId(),
      ...comment,
      replies: [],
      resolved: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.comments.set(newComment.id, newComment)
    this.addActivity({
      type: "comment_added",
      user: comment.author,
      description: `${comment.author.name} added a comment`,
      metadata: { commentId: newComment.id, blockId: comment.blockId },
    })

    return newComment
  }

  getComments(): Comment[] {
    return Array.from(this.comments.values())
  }

  resolveComment(commentId: string) {
    const comment = this.comments.get(commentId)
    if (comment) {
      comment.resolved = true
      comment.updatedAt = new Date()
      this.comments.set(commentId, comment)
    }
  }

  // Activity tracking
  addActivity(activity: Omit<Activity, "id" | "createdAt">) {
    const newActivity: Activity = {
      id: this.generateId(),
      ...activity,
      createdAt: new Date(),
    }

    this.activities.unshift(newActivity)
    // Keep only last 100 activities
    if (this.activities.length > 100) {
      this.activities = this.activities.slice(0, 100)
    }
  }

  getActivities(): Activity[] {
    return this.activities
  }

  private generateId(): string {
    return Date.now().toString() + "-" + Math.random().toString(36).substr(2, 9)
  }
}

export const collaborationService = new CollaborationService()
