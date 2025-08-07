import { useState, useEffect, useCallback } from 'react'
import { MulmocastClient, MulmocastMessage, MulmocastConfig, createMulmocastClient } from '@/lib/mulmocast'

interface UseMulmocastReturn {
  client: MulmocastClient | null
  isConnected: boolean
  messages: MulmocastMessage[]
  config: MulmocastConfig
  connect: () => Promise<boolean>
  disconnect: () => Promise<void>
  sendMessage: (content: string, type?: 'text' | 'file' | 'command') => Promise<void>
  updateConfig: (newConfig: Partial<MulmocastConfig>) => void
  clearMessages: () => void
}

export function useMulmocast(initialConfig?: Partial<MulmocastConfig>): UseMulmocastReturn {
  const [client, setClient] = useState<MulmocastClient | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState<MulmocastMessage[]>([])
  const [config, setConfig] = useState<MulmocastConfig>({
    enabled: true,
    serverUrl: 'ws://localhost:8080',
    autoConnect: true,
    ...initialConfig
  })

  // Initialize client
  useEffect(() => {
    const mulmocastClient = createMulmocastClient(config)
    setClient(mulmocastClient)

    // Set up message handler
    mulmocastClient.onMessage((message) => {
      setMessages(prev => [...prev, message])
    })

    // Auto-connect if enabled
    if (config.autoConnect && config.enabled) {
      connect()
    }

    return () => {
      if (mulmocastClient) {
        mulmocastClient.disconnect()
      }
    }
  }, [config])

  const connect = useCallback(async (): Promise<boolean> => {
    if (!client || !config.enabled) return false

    try {
      const success = await client.connect()
      setIsConnected(success)
      
      if (success) {
        const connectionMessage: MulmocastMessage = {
          id: Date.now().toString(),
          content: 'Connected to mulmocast server',
          timestamp: new Date(),
          sender: 'system',
          type: 'text'
        }
        setMessages(prev => [...prev, connectionMessage])
      }
      
      return success
    } catch (error) {
      console.error('Failed to connect:', error)
      return false
    }
  }, [client, config.enabled])

  const disconnect = useCallback(async (): Promise<void> => {
    if (!client) return

    try {
      await client.disconnect()
      setIsConnected(false)
      
      const disconnectionMessage: MulmocastMessage = {
        id: Date.now().toString(),
        content: 'Disconnected from mulmocast server',
        timestamp: new Date(),
        sender: 'system',
        type: 'text'
      }
      setMessages(prev => [...prev, disconnectionMessage])
    } catch (error) {
      console.error('Failed to disconnect:', error)
    }
  }, [client])

  const sendMessage = useCallback(async (content: string, type: 'text' | 'file' | 'command' = 'text'): Promise<void> => {
    if (!client || !isConnected || !content.trim()) return

    try {
      await client.sendMessage(content, type)
      
      const newMessage: MulmocastMessage = {
        id: Date.now().toString(),
        content,
        timestamp: new Date(),
        sender: 'You',
        type
      }
      
      setMessages(prev => [...prev, newMessage])
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }, [client, isConnected])

  const updateConfig = useCallback((newConfig: Partial<MulmocastConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }))
  }, [])

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  return {
    client,
    isConnected,
    messages,
    config,
    connect,
    disconnect,
    sendMessage,
    updateConfig,
    clearMessages
  }
} 