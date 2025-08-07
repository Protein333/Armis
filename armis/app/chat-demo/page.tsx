"use client"

import { useState } from "react"
import { AIChatEnhanced } from "@/components/ai-chat-enhanced"
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from "@/components/ui/resizable"

export default function ChatDemoPage() {
  const [chatHistory, setChatHistory] = useState<Array<{ role: string; content: string }>>([
    {
      role: "assistant",
      content: "こんにちは！新しいshadcn-chatbot-kitスタイルのチャットUIへようこそ。何かお手伝いできることはありますか？"
    }
  ])

  const handleChatSubmit = (message: string) => {
    console.log("Chat submitted:", message)
    // 実際のAI処理はここで実装
  }

  const handleChatResponse = (response: string) => {
    console.log("Chat response:", response)
    // 実際のAIレスポンス処理はここで実装
  }

  return (
    <div className="h-screen flex">
      <ResizablePanelGroup direction="horizontal" className="w-full">
        {/* チャットパネル */}
        <ResizablePanel 
          defaultSize={40} 
          minSize={30} 
          maxSize={70}
          className="flex flex-col"
        >
          <AIChatEnhanced
            chatHistory={chatHistory}
            onChatSubmit={handleChatSubmit}
            onChatResponse={handleChatResponse}
            theme="light"
          />
        </ResizablePanel>

        {/* リサイズハンドル */}
        <ResizableHandle withHandle />

        {/* 右側のプレビューパネル */}
        <ResizablePanel defaultSize={60} minSize={30}>
          <div className="h-full bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">チャットデモ</h2>
              <p className="text-gray-600">
                左側のチャットパネルの横幅を調整できます。<br />
                リサイズハンドルをドラッグして試してみてください。
              </p>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
