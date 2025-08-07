import { NextRequest, NextResponse } from 'next/server'

interface WebreaderRequest {
  url: string
  options?: {
    includeImages?: boolean
    includeLinks?: boolean
    maxLength?: number
  }
}

interface WebreaderResponse {
  title: string
  content: string
  text: string
  url: string
  status: 'success' | 'error'
  error?: string
}

export async function POST(request: NextRequest) {
  try {
    const { url, options }: WebreaderRequest = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // URLの形式を検証
    let targetUrl: string
    try {
      const urlObj = new URL(url)
      targetUrl = urlObj.toString()
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Webreader APIにリクエストを送信
    const webreaderResponse = await fetch('https://webreader.ai/api/extract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      body: JSON.stringify({
        url: targetUrl,
        options: options || {
          includeImages: false,
          includeLinks: false,
          maxLength: 10000
        }
      }),
      signal: AbortSignal.timeout(30000) // 30秒タイムアウト
    })

    if (!webreaderResponse.ok) {
      console.error('Webreader API error:', webreaderResponse.status, webreaderResponse.statusText)
      
      // Webreader APIが失敗した場合は、フォールバックとして既存のscrape APIを使用
      const fallbackResponse = await fetch(`${request.nextUrl.origin}/api/scrape`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: targetUrl })
      })

      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json()
        return NextResponse.json({
          title: fallbackData.title,
          content: fallbackData.content,
          text: fallbackData.content,
          url: targetUrl,
          status: 'success'
        })
      } else {
        throw new Error(`Webreader API failed: ${webreaderResponse.status}`)
      }
    }

    const data = await webreaderResponse.json()
    
    const response: WebreaderResponse = {
      title: data.title || '',
      content: data.content || data.text || '',
      text: data.text || data.content || '',
      url: targetUrl,
      status: 'success'
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Webreader API error:', error)
    
    let errorMessage = 'Failed to extract content from the URL.'
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = 'Request timed out. The website might be slow or unavailable.'
      } else if (error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your internet connection and try again.'
      } else {
        errorMessage = error.message
      }
    }

    return NextResponse.json(
      { 
        title: '',
        content: '',
        text: '',
        url: '',
        status: 'error',
        error: errorMessage
      },
      { status: 500 }
    )
  }
} 