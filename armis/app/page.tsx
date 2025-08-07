"use client"

import { useState, useRef } from "react"
import { AddContext } from "@/components/add-context"
import { EnhancedChat, Message } from "@/components/ui/enhanced-chat"
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from "@/components/ui/resizable"
import { Button } from "@/components/ui/button"
import { Heading3, Video, Code, Settings, FileVideo } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [chatWidth, setChatWidth] = useState(400) // デフォルトのチャット幅

  const handleSubmit = async (message: string, attachments?: File[]) => {
    if (!message.trim() && (!attachments || attachments.length === 0)) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      createdAt: new Date(),
      attachments: attachments
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      // Gemini APIを呼び出す
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.map(msg => ({ role: msg.role, content: msg.content }))
        })
      })

      if (response.ok) {
        const data = await response.json()
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          createdAt: new Date()
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        // エラーの場合、フォールバックメッセージを表示
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "申し訳ございませんが、現在AIサービスに接続できません。後でもう一度お試しください。",
          createdAt: new Date()
        }
        setMessages(prev => [...prev, assistantMessage])
      }
    } catch (error) {
      console.error('Chat error:', error)
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "エラーが発生しました。ネットワーク接続を確認してください。",
        createdAt: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleContextAdded = () => {
    // コンテキストが追加された時の処理
    console.log('Context added successfully')
  }

  // 提案メッセージ
  const suggestions = [
    "こんにちは！何かお手伝いできることはありますか？",
    "コードの説明をお願いします",
    "バグの修正方法を教えてください",
    "新しい機能のアイデアを聞かせてください"
  ]

  return (
    <div className="h-screen flex bg-white">
      <ResizablePanelGroup direction="horizontal" className="w-full">
        {/* チャットパネル */}
        <ResizablePanel 
          defaultSize={33} 
          minSize={20} 
          maxSize={60}
          className="flex flex-col"
        >
          {/* ヘッダー */}
          <div className="p-4 border-b border-gray-300 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src="/icon.png" alt="Armis" className="h-8 w-8" />
                <span className="font-semibold text-lg">Chat</span>
              </div>
            </div>
          </div>
          
          {/* チャットエリア */}
          <div className="flex-1">
            <EnhancedChat
              messages={messages}
              input={input}
              handleInputChange={setInput}
              handleSubmit={handleSubmit}
              isGenerating={isLoading}
              suggestions={suggestions}
              placeholder="メッセージを入力してください..."
            />
          </div>
        </ResizablePanel>

        {/* リサイズハンドル */}
        <ResizableHandle withHandle />

        {/* 右側: Canvas パネル */}
        <ResizablePanel defaultSize={67} minSize={40}>
          <div className="flex flex-col h-full bg-white">
            {/* ヘッダー */}
            <div className="p-4 border-b border-gray-300">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-black text-center">Canvas</h1>
              </div>
            </div>
            
            {/* メインコンテンツ */}
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-4xl font-bold text-gray-600 mb-4">Canvas</h2>
                <p className="text-gray-500 mb-6">ここにキャンバスコンテンツが表示されます</p>
                <div className="flex items-center justify-center gap-4">
                  <Link href="/video-timeline-editor">
                    <Button className="flex items-center gap-2">
                      <FileVideo className="h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
