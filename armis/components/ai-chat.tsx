"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Sparkles, Plus, Mic } from "lucide-react"

interface AIChatProps {
  chatHistory: Array<{ role: string; content: string }>
  onChatSubmit: (message: string) => void
}

export function AIChat({ chatHistory, onChatSubmit }: AIChatProps) {
  const [message, setMessage] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      onChatSubmit(message)
      setMessage("")
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatHistory])

  return (
    <div className="w-80 border-r border-zinc-800 bg-zinc-950 flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center justify-between">
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatHistory.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-lg p-3 text-sm ${
                msg.role === "user" 
                  ? "bg-emerald-600 text-white" 
                  : "bg-zinc-800 text-zinc-100"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t border-zinc-800">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-center space-x-2">
            <Button type="button" variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-300">
              <Plus className="h-4 w-4" />
            </Button>
            <span className="text-xs text-zinc-500">Tools</span>
          </div>
          <div className="flex space-x-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="何でも聞いてください..."
              className="flex-1 bg-zinc-900 border-zinc-700 text-zinc-100"
            />
            <Button type="button" variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-300">
              <Mic className="h-4 w-4" />
            </Button>
            <Button type="submit" size="icon" className="bg-emerald-600 hover:bg-emerald-700">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
