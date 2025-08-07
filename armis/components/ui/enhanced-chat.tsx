"use client"

import React, { forwardRef, useCallback, useRef, useState } from "react"
import { ArrowDown, ThumbsDown, ThumbsUp, Send, Mic, Paperclip, Square, X, Bot } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CopyButton } from "@/components/ui/copy-button"
import { MarkdownRenderer } from "@/components/ui/markdown-renderer"
import { FilePreview } from "@/components/ui/file-preview"

export interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  createdAt?: Date
  attachments?: File[]
  isStreaming?: boolean
}

interface EnhancedChatProps {
  messages: Message[]
  input: string
  handleInputChange: (value: string) => void
  handleSubmit: (message: string, attachments?: File[]) => void
  isGenerating: boolean
  stop?: () => void
  className?: string
  placeholder?: string
  suggestions?: string[]
  onRateResponse?: (messageId: string, rating: "thumbs-up" | "thumbs-down") => void
  transcribeAudio?: (blob: Blob) => Promise<string>
}

export function EnhancedChat({
  messages,
  input,
  handleInputChange,
  handleSubmit,
  isGenerating,
  stop,
  className,
  placeholder = "メッセージを入力...",
  suggestions = [],
  onRateResponse,
  transcribeAudio,
}: EnhancedChatProps) {
  const [attachments, setAttachments] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 自動スクロール
  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [])

  React.useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // ファイルアップロード処理
  const handleFileUpload = (files: FileList | File[]) => {
    const newFiles = Array.from(files)
    setAttachments(prev => [...prev, ...newFiles])
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  // ドラッグ&ドロップ処理
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files)
    }
  }

  // メッセージ送信
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() && attachments.length === 0) return

    handleSubmit(input, attachments)
    setAttachments([])
  }

  // キーボードショートカット
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      onSubmit(e as any)
    }
  }

  return (
    <TooltipProvider>
      <div className={cn("flex h-full flex-col", className)}>
        {/* メッセージエリア */}
        <ScrollArea 
          ref={scrollAreaRef}
          className="flex-1 p-4"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="space-y-4">
            {messages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                onRateResponse={onRateResponse}
              />
            ))}
            
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start space-x-3"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <Card className="flex-1">
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                      <div className="h-2 w-16 rounded-full bg-muted animate-pulse" />
                      <div className="h-2 w-12 rounded-full bg-muted animate-pulse" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        {/* 提案ボタン */}
        {messages.length === 0 && suggestions.length > 0 && (
          <div className="p-4 border-t">
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSubmit(suggestion)}
                  className="text-xs"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* 入力エリア */}
        <div className="border-t p-4">
          <form onSubmit={onSubmit} className="space-y-3">
            {/* 添付ファイル表示 */}
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center space-x-2 bg-muted rounded-lg p-2">
                    <FilePreview file={file} />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(index)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* 入力フィールド */}
            <div className="flex items-end space-x-2">
              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholder}
                  className="min-h-[60px] max-h-[200px] resize-none pr-12"
                  disabled={isGenerating}
                />
                
                {/* ファイルアップロードボタン */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 bottom-2 h-8 w-8 p-0"
                      onClick={() => {
                        const input = document.createElement('input')
                        input.type = 'file'
                        input.multiple = true
                        input.onchange = (e) => {
                          const files = (e.target as HTMLInputElement).files
                          if (files) handleFileUpload(files)
                        }
                        input.click()
                      }}
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>ファイルを添付</TooltipContent>
                </Tooltip>

                {/* 音声入力ボタン */}
                {transcribeAudio && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-10 bottom-2 h-8 w-8 p-0"
                      >
                        <Mic className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>音声入力</TooltipContent>
                  </Tooltip>
                )}
              </div>

              {/* 送信ボタン */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={(!input.trim() && attachments.length === 0) || isGenerating}
                    className="h-10 w-10 p-0"
                  >
                    {isGenerating ? (
                      <Square className="h-4 w-4" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isGenerating ? "停止" : "送信"}
                </TooltipContent>
              </Tooltip>
            </div>
          </form>
        </div>

        {/* ドラッグオーバーレイ */}
        <AnimatePresence>
          {isDragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-lg flex items-center justify-center"
            >
              <div className="text-center">
                <Paperclip className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm font-medium">ファイルをドロップしてアップロード</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  )
}

interface MessageBubbleProps {
  message: Message
  onRateResponse?: (messageId: string, rating: "thumbs-up" | "thumbs-down") => void
}

function MessageBubble({ message, onRateResponse }: MessageBubbleProps) {
  const isUser = message.role === "user"

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex items-start space-x-3", isUser && "flex-row-reverse space-x-reverse")}
    >
      <Avatar className="h-8 w-8">
        <AvatarFallback className={cn(
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        )}>
          {isUser ? "U" : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      <div className={cn("flex-1 space-y-2", isUser && "text-right")}>
        <Card className={cn(
          "inline-block max-w-[80%]",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        )}>
          <CardContent className="p-3">
            {/* 添付ファイル表示 */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="mb-3 space-y-2">
                {message.attachments.map((file, index) => (
                  <FilePreview key={index} file={file} />
                ))}
              </div>
            )}

            {/* メッセージ内容 */}
            <div className="prose prose-sm max-w-none">
              <MarkdownRenderer>{message.content}</MarkdownRenderer>
            </div>

            {/* タイムスタンプ */}
            {message.createdAt && (
              <time className="text-xs opacity-70 mt-2 block">
                {message.createdAt.toLocaleTimeString()}
              </time>
            )}
          </CardContent>
        </Card>

        {/* アクションボタン */}
        {!isUser && (
          <div className="flex items-center space-x-1">
            <CopyButton content={message.content} />
            {onRateResponse && (
              <>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={() => onRateResponse(message.id, "thumbs-up")}
                >
                  <ThumbsUp className="h-3 w-3" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={() => onRateResponse(message.id, "thumbs-down")}
                >
                  <ThumbsDown className="h-3 w-3" />
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
