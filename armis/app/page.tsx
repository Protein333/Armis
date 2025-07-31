"use client"

import { useState } from "react"
import { Layout } from "@/components/layout"
import { AIChat } from "@/components/ai-chat"
import { Editor } from "@/components/editor"

export default function Home() {
  const [chatHistory, setChatHistory] = useState<Array<{ role: string; content: string }>>([
    {
      role: "assistant",
      content: "こんにちは！Armisへようこそ。何かお手伝いできることはありますか？",
    },
  ])
  const [editorContent, setEditorContent] = useState("")

  const handleChatSubmit = (message: string) => {
    // Add user message to chat
    setChatHistory([...chatHistory, { role: "user", content: message }])

    // Simulate AI response
    setTimeout(() => {
      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `「${message}」という指示を受け取りました。作業を進めています...`,
        },
      ])
    }, 1000)
  }

  return (
    <Layout>
      <div className="flex h-[calc(100vh-40px)]">
        {/* Left: Chat Panel */}
        <AIChat chatHistory={chatHistory} onChatSubmit={handleChatSubmit} />
        
        {/* Right: Editor Panel */}
        <div className="flex-1">
          <Editor 
            content={editorContent} 
            onContentChange={setEditorContent} 
          />
        </div>
      </div>
    </Layout>
  )
}
