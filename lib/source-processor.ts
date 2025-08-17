// Source processing utilities for different file types
export interface ProcessedSource {
  id: string
  title: string
  type: "pdf" | "website" | "text" | "video" | "audio" | "document"
  content: string
  metadata: {
    url?: string
    size?: number
    pages?: number
    duration?: number
    author?: string
    publishedAt?: Date
    language?: string
  }
  chunks: SourceChunk[]
  embeddings?: number[]
  addedAt: Date
  lastProcessed: Date
}

export interface SourceChunk {
  id: string
  content: string
  startIndex: number
  endIndex: number
  metadata: {
    page?: number
    timestamp?: number
    section?: string
  }
}

export class SourceProcessor {
  async processFile(file: File): Promise<ProcessedSource> {
    const fileType = this.getFileType(file)

    let content = ""
    const metadata: any = {
      size: file.size,
    }

    switch (fileType) {
      case "pdf":
        content = await this.processPDF(file)
        metadata.pages = await this.getPDFPageCount(file)
        break
      case "text":
      case "document":
        content = await this.processTextFile(file)
        break
      default:
        throw new Error(`Unsupported file type: ${fileType}`)
    }

    const chunks = this.chunkContent(content)

    return {
      id: Date.now().toString(),
      title: file.name,
      type: fileType,
      content,
      metadata,
      chunks,
      addedAt: new Date(),
      lastProcessed: new Date(),
    }
  }

  async processURL(url: string): Promise<ProcessedSource> {
    try {
      // Simulate web scraping - in production, use actual web scraping service
      const response = await fetch(`/api/scrape?url=${encodeURIComponent(url)}`)
      const data = await response.json()

      const content = data.content || `Content from ${url}`
      const chunks = this.chunkContent(content)

      return {
        id: Date.now().toString(),
        title: data.title || this.extractDomainFromURL(url),
        type: "website",
        content,
        metadata: {
          url,
          author: data.author,
          publishedAt: data.publishedAt ? new Date(data.publishedAt) : undefined,
        },
        chunks,
        addedAt: new Date(),
        lastProcessed: new Date(),
      }
    } catch (error) {
      // Fallback for demo
      const content = `Content extracted from ${url}. This would contain the actual webpage content in a production environment.`
      const chunks = this.chunkContent(content)

      return {
        id: Date.now().toString(),
        title: this.extractDomainFromURL(url),
        type: "website",
        content,
        metadata: { url },
        chunks,
        addedAt: new Date(),
        lastProcessed: new Date(),
      }
    }
  }

  private getFileType(file: File): ProcessedSource["type"] {
    const extension = file.name.split(".").pop()?.toLowerCase()

    switch (extension) {
      case "pdf":
        return "pdf"
      case "txt":
      case "md":
        return "text"
      case "doc":
      case "docx":
        return "document"
      case "mp4":
      case "mov":
      case "avi":
        return "video"
      case "mp3":
      case "wav":
      case "m4a":
        return "audio"
      default:
        return "text"
    }
  }

  private async processPDF(file: File): Promise<string> {
    // Simulate PDF text extraction - in production, use PDF.js or similar
    return `Extracted text content from PDF: ${file.name}. This would contain the actual PDF text content in a production environment.`
  }

  private async processTextFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string)
      reader.onerror = reject
      reader.readAsText(file)
    })
  }

  private async getPDFPageCount(file: File): Promise<number> {
    // Simulate page count extraction
    return Math.floor(Math.random() * 50) + 1
  }

  private chunkContent(content: string, chunkSize = 1000): SourceChunk[] {
    const chunks: SourceChunk[] = []
    const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 0)

    let currentChunk = ""
    let startIndex = 0

    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length > chunkSize && currentChunk.length > 0) {
        chunks.push({
          id: `chunk-${chunks.length}`,
          content: currentChunk.trim(),
          startIndex,
          endIndex: startIndex + currentChunk.length,
          metadata: {},
        })

        startIndex += currentChunk.length
        currentChunk = sentence
      } else {
        currentChunk += sentence + ". "
      }
    }

    if (currentChunk.trim().length > 0) {
      chunks.push({
        id: `chunk-${chunks.length}`,
        content: currentChunk.trim(),
        startIndex,
        endIndex: startIndex + currentChunk.length,
        metadata: {},
      })
    }

    return chunks
  }

  private extractDomainFromURL(url: string): string {
    try {
      return new URL(url).hostname.replace("www.", "")
    } catch {
      return "Web Article"
    }
  }
}

export const sourceProcessor = new SourceProcessor()
