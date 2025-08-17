"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  ImageIcon,
  Plus,
  GripVertical,
  Sparkles,
} from "lucide-react"

interface Block {
  id: string
  type: "text" | "heading1" | "heading2" | "heading3" | "bullet-list" | "numbered-list" | "quote" | "code" | "image"
  content: string
  placeholder?: string
}

const BLOCK_TYPES = [
  { type: "text" as const, icon: Type, label: "Text", placeholder: "Start writing..." },
  { type: "heading1" as const, icon: Heading1, label: "Heading 1", placeholder: "Heading 1" },
  { type: "heading2" as const, icon: Heading2, label: "Heading 2", placeholder: "Heading 2" },
  { type: "heading3" as const, icon: Heading3, label: "Heading 3", placeholder: "Heading 3" },
  { type: "bullet-list" as const, icon: List, label: "Bullet List", placeholder: "List item" },
  { type: "numbered-list" as const, icon: ListOrdered, label: "Numbered List", placeholder: "List item" },
  { type: "quote" as const, icon: Quote, label: "Quote", placeholder: "Quote" },
  { type: "code" as const, icon: Code, label: "Code", placeholder: "Code block" },
  { type: "image" as const, icon: ImageIcon, label: "Image", placeholder: "Image URL" },
]

export function BlockEditor() {
  const [blocks, setBlocks] = useState<Block[]>([
    { id: "1", type: "text", content: "", placeholder: "Start writing..." },
  ])
  const [showBlockMenu, setShowBlockMenu] = useState<string | null>(null)

  const addBlock = (afterId: string, type: Block["type"] = "text") => {
    const newBlock: Block = {
      id: Date.now().toString(),
      type,
      content: "",
      placeholder: BLOCK_TYPES.find((bt) => bt.type === type)?.placeholder || "Start writing...",
    }

    const index = blocks.findIndex((block) => block.id === afterId)
    const newBlocks = [...blocks]
    newBlocks.splice(index + 1, 0, newBlock)
    setBlocks(newBlocks)
    setShowBlockMenu(null)
  }

  const updateBlock = (id: string, content: string) => {
    setBlocks(blocks.map((block) => (block.id === id ? { ...block, content } : block)))
  }

  const deleteBlock = (id: string) => {
    if (blocks.length > 1) {
      setBlocks(blocks.filter((block) => block.id !== id))
    }
  }

  const renderBlock = (block: Block) => {
    const commonProps = {
      value: block.content,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => updateBlock(block.id, e.target.value),
      placeholder: block.placeholder,
      className: "w-full bg-transparent border-none outline-none resize-none",
    }

    switch (block.type) {
      case "heading1":
        return <Input {...commonProps} className="text-3xl font-bold bg-transparent border-none outline-none" />
      case "heading2":
        return <Input {...commonProps} className="text-2xl font-semibold bg-transparent border-none outline-none" />
      case "heading3":
        return <Input {...commonProps} className="text-xl font-medium bg-transparent border-none outline-none" />
      case "quote":
        return (
          <div className="border-l-4 border-accent pl-4">
            <Textarea {...commonProps} className="italic" />
          </div>
        )
      case "code":
        return (
          <div className="bg-muted rounded-md p-3">
            <Textarea {...commonProps} className="font-mono text-sm" />
          </div>
        )
      case "bullet-list":
        return (
          <div className="flex items-start gap-2">
            <span className="text-muted-foreground mt-2">•</span>
            <Textarea {...commonProps} />
          </div>
        )
      case "numbered-list":
        return (
          <div className="flex items-start gap-2">
            <span className="text-muted-foreground mt-2">1.</span>
            <Textarea {...commonProps} />
          </div>
        )
      case "image":
        return (
          <div className="flex items-center">
            <ImageIcon className="h-4 w-4 mr-2" />
            <Input {...commonProps} />
          </div>
        )
      default:
        return <Textarea {...commonProps} />
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-2">
      {blocks.map((block, index) => (
        <div key={block.id} className="group relative">
          <div className="flex items-start gap-2">
            {/* Block Handle */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-2">
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 cursor-grab">
                <GripVertical className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setShowBlockMenu(showBlockMenu === block.id ? null : block.id)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            {/* Block Content */}
            <div className="flex-1 min-h-[2.5rem] flex items-center">{renderBlock(block)}</div>

            {/* AI Assistant */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-accent">
                <Sparkles className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Block Type Menu */}
          {showBlockMenu === block.id && (
            <Card className="absolute left-12 top-8 z-10 p-2 w-48">
              <div className="grid gap-1">
                {BLOCK_TYPES.map((blockType) => (
                  <Button
                    key={blockType.type}
                    variant="ghost"
                    size="sm"
                    className="justify-start"
                    onClick={() => addBlock(block.id, blockType.type)}
                  >
                    <blockType.icon className="h-4 w-4 mr-2" />
                    {blockType.label}
                  </Button>
                ))}
              </div>
            </Card>
          )}
        </div>
      ))}
    </div>
  )
}
