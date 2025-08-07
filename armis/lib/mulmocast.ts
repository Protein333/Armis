// mulmocast-cli integration for armis
// This file provides integration with mulmocast-cli functionality

export interface MulmocastConfig {
  enabled: boolean
  serverUrl?: string
  apiKey?: string
  autoConnect: boolean
}

export interface MulmocastMessage {
  id: string
  content: string
  timestamp: Date
  sender: string
  type: 'text' | 'file' | 'command'
}

export interface MulmocastConnection {
  isConnected: boolean
  serverUrl: string
  lastConnected: Date | null
}

export interface GenerateOptions {
  outdir?: string
  basedir?: string
  lang?: 'en' | 'ja'
  force?: boolean
  presentationStyle?: string
  audiodir?: string
  imagedir?: string
  caption?: 'en' | 'ja'
  pdf_mode?: 'slide' | 'talk' | 'handout'
  pdf_size?: 'letter' | 'a4'
}

export interface ScriptingOptions {
  template?: string
  urls?: string[]
  inputFile?: string
  interactive?: boolean
  script?: string
  llm?: 'openai' | 'anthropic' | 'gemini' | 'groq'
  llm_model?: string
  cache?: string
  outdir?: string
  basedir?: string
}

export class MulmocastClient {
  private config: MulmocastConfig
  private connection: MulmocastConnection
  private messageHandlers: ((message: MulmocastMessage) => void)[] = []

  constructor(config: MulmocastConfig) {
    this.config = config
    this.connection = {
      isConnected: false,
      serverUrl: config.serverUrl || 'ws://localhost:8080',
      lastConnected: null
    }
  }

  async connect(): Promise<boolean> {
    try {
      // Simulate connection to mulmocast server
      this.connection.isConnected = true
      this.connection.lastConnected = new Date()
      console.log('Connected to mulmocast server')
      return true
    } catch (error) {
      console.error('Failed to connect to mulmocast server:', error)
      return false
    }
  }

  async disconnect(): Promise<void> {
    this.connection.isConnected = false
    console.log('Disconnected from mulmocast server')
  }

  async sendMessage(content: string, type: 'text' | 'file' | 'command' = 'text'): Promise<void> {
    if (!this.connection.isConnected) {
      throw new Error('Not connected to mulmocast server')
    }

    const message: MulmocastMessage = {
      id: Date.now().toString(),
      content,
      timestamp: new Date(),
      sender: 'armis-client',
      type
    }

    // Simulate sending message
    console.log('Sending message:', message)
  }

  onMessage(handler: (message: MulmocastMessage) => void): void {
    this.messageHandlers.push(handler)
  }

  getConnectionStatus(): MulmocastConnection {
    return { ...this.connection }
  }

  getConfig(): MulmocastConfig {
    return { ...this.config }
  }

  // 新しい機能: mulmocast-cliの実際の機能を呼び出すメソッド

  async generateAudio(scriptFile: string, options?: GenerateOptions): Promise<any> {
    try {
      const response = await fetch('/api/mulmocast/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'audio',
          scriptFile,
          options
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Audio generation failed:', error)
      throw error
    }
  }

  async generateImages(scriptFile: string, options?: GenerateOptions): Promise<any> {
    try {
      const response = await fetch('/api/mulmocast/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'images',
          scriptFile,
          options
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Image generation failed:', error)
      throw error
    }
  }

  async generateMovie(scriptFile: string, options?: GenerateOptions): Promise<any> {
    try {
      const response = await fetch('/api/mulmocast/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'movie',
          scriptFile,
          options
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Movie generation failed:', error)
      throw error
    }
  }

  async generatePDF(scriptFile: string, options?: GenerateOptions): Promise<any> {
    try {
      const response = await fetch('/api/mulmocast/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'pdf',
          scriptFile,
          options
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('PDF generation failed:', error)
      throw error
    }
  }

  async generateScript(options: ScriptingOptions): Promise<any> {
    try {
      const response = await fetch('/api/mulmocast/scripting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Script generation failed:', error)
      throw error
    }
  }

  // 利用可能なテンプレートを取得
  async getAvailableTemplates(): Promise<string[]> {
    try {
      const response = await fetch('/api/mulmocast/scripting')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      return data.availableTemplates || []
    } catch (error) {
      console.error('Failed to get available templates:', error)
      return []
    }
  }

  // 生成タイプの情報を取得
  async getGenerationInfo(type: 'audio' | 'images' | 'movie' | 'pdf'): Promise<any> {
    try {
      const response = await fetch(`/api/mulmocast/generate?type=${type}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error(`Failed to get ${type} generation info:`, error)
      throw error
    }
  }
}

// Default configuration
export const defaultMulmocastConfig: MulmocastConfig = {
  enabled: true,
  serverUrl: 'ws://localhost:8080',
  autoConnect: true
}

// Utility functions
export function createMulmocastClient(config?: Partial<MulmocastConfig>): MulmocastClient {
  const finalConfig = { ...defaultMulmocastConfig, ...config }
  return new MulmocastClient(finalConfig)
} 