// Webreader APIクライアント
export interface WebreaderExtractRequest {
  url: string
  options?: {
    includeImages?: boolean
    includeLinks?: boolean
    maxLength?: number
  }
}

export interface WebreaderExtractResponse {
  title: string
  content: string
  text: string
  url: string
  status: 'success' | 'error'
  error?: string
}

export class WebreaderClient {
  private baseUrl: string

  constructor(baseUrl: string = '/api/webreader') {
    this.baseUrl = baseUrl
  }

  /**
   * URLからテキストを抽出する
   */
  async extractText(request: WebreaderExtractRequest): Promise<WebreaderExtractResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: request.url,
          options: request.options || {}
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Webreader API error: ${response.status}`)
      }

      const data = await response.json()
      return {
        title: data.title || '',
        content: data.content || '',
        text: data.text || data.content || '',
        url: request.url,
        status: data.status || 'success'
      }
    } catch (error) {
      console.error('Webreader extract error:', error)
      return {
        title: '',
        content: '',
        text: '',
        url: request.url,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * 複数のURLからテキストを抽出する
   */
  async extractMultipleUrls(urls: string[]): Promise<WebreaderExtractResponse[]> {
    const promises = urls.map(url => 
      this.extractText({ url })
    )
    
    return Promise.all(promises)
  }
}

// シングルトンインスタンス
export const webreaderClient = new WebreaderClient() 