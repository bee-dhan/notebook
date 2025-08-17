"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Bot, User, ExternalLink, FileText, Loader2, Sparkles } from "lucide-react"
import { type AIMessage, AIService } from "@/lib/ai-service"

interface AIChatProps {
  sources?: any[]
  onSourceClick?: (sourceId: string) => void
}

export function AIChat({ sources = [], onSourceClick }: AIChatProps) {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your AI research assistant. I can help you analyze your sources, answer questions, and generate insights. What would you like to explore?",
      timestamp: new Date(),
      sources: [],
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const aiService = new AIService()

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await aiService.generateResponse([...messages, userMessage], sources)

      const assistantMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.content,
        timestamp: new Date(),
        sources: response.sources,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("AI response error:", error)
      const errorMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I apologize, but I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const renderMessage = (message: AIMessage) => {
    const isUser = message.role === "user"

    return (
      <div key={message.id} className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
        {!isUser && (
          <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
            <Bot className="h-4 w-4 text-accent" />
          </div>
        )}

        <div className={`max-w-[80%] ${isUser ? "order-first" : ""}`}>
          <Card className={`p-3 ${isUser ? "bg-primary text-primary-foreground" : "bg-card"}`}>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>

            {message.sources && message.sources.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border/50">
                <p className="text-xs text-muted-foreground mb-2">Sources:</p>
                <div className="space-y-1">
                  {message.sources.map((source) => (
                    <SourceCitationComponent
                      key={source.id}
                      source={source}
                      onClick={() => onSourceClick?.(source.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </Card>

          <p className="text-xs text-muted-foreground mt-1 px-1">{message.timestamp.toLocaleTimeString()}</p>
        </div>

        {isUser && (
          <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
            <User className="h-4 w-4" />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map(renderMessage)}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-accent" />
              </div>
              <Card className="p-3 bg-card">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about your sources..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} disabled={!input.trim() || isLoading} size="sm">
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {sources.length > 0 && (
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3" />
            <span>AI responses are grounded in your {sources.length} sources</span>
          </div>
        )}
      </div>
    </div>
  )
}

function SourceCitationComponent({ source, onClick }: { source: any; onClick?: () => void }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-auto p-2 justify-start text-left hover:bg-accent/10"
      onClick={onClick}
    >
      <div className="flex items-start gap-2 w-full">
        <FileText className="h-3 w-3 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium truncate">{source.title}</p>
          <p className="text-xs text-muted-foreground line-clamp-2">{source.excerpt}</p>
          {source.page && (
            <Badge variant="outline" className="text-xs mt-1">
              Page {source.page}
            </Badge>
          )}
          {source.url && (
            <div className="flex items-center gap-1 mt-1">
              <ExternalLink className="h-2 w-2" />
              <span className="text-xs">Web source</span>
            </div>
          )}
        </div>
      </div>
    </Button>
  )
}
