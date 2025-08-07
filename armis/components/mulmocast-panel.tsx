'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  MessageSquare, 
  Send, 
  Wifi, 
  WifiOff, 
  Settings, 
  Play, 
  Square,
  FileText,
  Terminal,
  Image
} from 'lucide-react'
import { useMulmocast } from '@/hooks/use-mulmocast'

interface MulmocastPanelProps {
  className?: string
}

export function MulmocastPanel({ className }: MulmocastPanelProps) {
  const [inputMessage, setInputMessage] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const {
    isConnected,
    messages,
    connect,
    disconnect,
    sendMessage
  } = useMulmocast()

  const connectToServer = async () => {
    await connect()
  }

  const disconnectFromServer = async () => {
    await disconnect()
  }

  const handleSendMessage = async (type: 'text' | 'file' | 'command' = 'text') => {
    if (!inputMessage.trim()) return
    await sendMessage(inputMessage, type)
    setInputMessage('')
  }

  const handleSendText = () => handleSendMessage('text')
  const handleSendCommand = () => handleSendMessage('command')
  const handleSendFile = () => handleSendMessage('file')

  // ファイルアップロード処理
  const handleFileUpload = (files: FileList) => {
    const newFiles = Array.from(files)
    setUploadedFiles(prev => [...prev, ...newFiles])
    
    // ファイル情報をメッセージに追加
    const fileInfo = newFiles.map(file => 
      `📎 ${file.name} (${(file.size / 1024).toFixed(1)}KB)`
    ).join('\n')
    
    setInputMessage(prev => prev + (prev ? '\n' : '') + fileInfo)
  }

  // ファイル選択ダイアログを開く
  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const getMessageIcon = (type: 'text' | 'file' | 'command') => {
    switch (type) {
      case 'text':
        return <MessageSquare className="w-4 h-4" />
      case 'file':
        return <FileText className="w-4 h-4" />
      case 'command':
        return <Terminal className="w-4 h-4" />
      default:
        return <MessageSquare className="w-4 h-4" />
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Mulmocast CLI
            </CardTitle>
            <CardDescription>
              Real-time communication and file sharing
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isConnected ? "default" : "secondary"}>
              {isConnected ? (
                <>
                  <Wifi className="w-3 h-3 mr-1" />
                  Connected
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 mr-1" />
                  Disconnected
                </>
              )}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={isConnected ? disconnectFromServer : connectToServer}
            >
              {isConnected ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Messages Area */}
        <ScrollArea className="h-64 border rounded-md p-4">
          <div className="space-y-3">
            {messages.map((message) => (
              <div key={message.id} className="flex items-start gap-2">
                <div className="flex-shrink-0 mt-1">
                  {getMessageIcon(message.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-foreground">
                      {message.sender}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {message.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-foreground break-words">
                    {message.content}
                  </p>
                </div>
              </div>
            ))}
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No messages yet</p>
                <p className="text-xs">Connect to start communicating</p>
              </div>
            )}
          </div>
        </ScrollArea>

        <Separator />

        {/* Input Area */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <Textarea
              placeholder="Type your message..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendText()
                }
              }}
              className="flex-1"
              rows={2}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSendText}
                disabled={!isConnected || !inputMessage.trim()}
              >
                <Send className="w-4 h-4 mr-1" />
                Send
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={openFileDialog}
                disabled={!isConnected}
                title="ファイルをアップロード"
              >
                <Image className="w-4 h-4 mr-1" />
                Upload
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleSendCommand}
                disabled={!isConnected || !inputMessage.trim()}
              >
                <Terminal className="w-4 h-4 mr-1" />
                Command
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleSendFile}
                disabled={!isConnected || !inputMessage.trim()}
              >
                <FileText className="w-4 h-4 mr-1" />
                File
              </Button>
            </div>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {/* TODO: Open settings */}}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* 隠しファイル入力 */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,audio/*,text/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
          onChange={(e) => {
            if (e.target.files) {
              handleFileUpload(e.target.files)
            }
            // 同じファイルを再度選択できるようにリセット
            e.target.value = ''
          }}
          className="hidden"
          aria-label="ファイルをアップロード"
        />
      </CardContent>
    </Card>
  )
} 