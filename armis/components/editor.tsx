"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Code, Eye, Play, Download } from "lucide-react"

interface EditorProps {
  content?: string
  onContentChange?: (content: string) => void
}

export function Editor({ content = "", onContentChange }: EditorProps) {
  const [activeTab, setActiveTab] = useState("code")

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      {/* Editor Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-800">
        <h2 className="text-lg font-semibold text-white">エディター</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300">
            <Play className="h-4 w-4 mr-1" />
            実行
          </Button>
          <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300">
            <Download className="h-4 w-4 mr-1" />
            エクスポート
          </Button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="px-4 pt-2">
            <TabsList className="bg-zinc-900">
              <TabsTrigger value="code" className="data-[state=active]:bg-zinc-800">
                <Code className="h-4 w-4 mr-1" />
                コード
              </TabsTrigger>
              <TabsTrigger value="preview" className="data-[state=active]:bg-zinc-800">
                <Eye className="h-4 w-4 mr-1" />
                プレビュー
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="code" className="flex-1 p-4">
            <div className="h-full bg-zinc-900 rounded-lg border border-zinc-800">
              <textarea
                value={content}
                onChange={(e) => onContentChange?.(e.target.value)}
                placeholder="ここにコードを入力してください..."
                className="w-full h-full bg-transparent text-zinc-100 p-4 resize-none outline-none font-mono text-sm"
              />
            </div>
          </TabsContent>

          <TabsContent value="preview" className="flex-1 p-4">
            <div className="h-full bg-zinc-900 rounded-lg border border-zinc-800 p-4">
              <div className="text-zinc-400 text-center">
                <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>プレビュー画面</p>
                <p className="text-sm mt-2">ここに制作物のプレビューが表示されます</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 