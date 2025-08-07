import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'
import { Readability } from '@mozilla/readability'
import { JSDOM } from 'jsdom'

interface ScrapedContent {
  title: string
  description: string
  content: string
  url: string
  timestamp: string
  status: 'success' | 'partial' | 'error'
  message?: string
  readabilityScore?: number
  wordCount?: number
  readingTime?: number
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

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

    // ページの取得
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      // タイムアウトを設定
      signal: AbortSignal.timeout(30000) // 30秒
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL: ${response.status} ${response.statusText}` },
        { status: response.status }
      )
    }

    const html = await response.text()
    
    // Readabilityを使用してメインコンテンツを抽出
    const dom = new JSDOM(html, { url: targetUrl })
    const reader = new Readability(dom.window.document)
    const article = reader.parse()

    // Cheerioも使用してメタデータを取得
    const $ = cheerio.load(html)

    // タイトルの取得（複数の方法を試行）
    let title = article?.title || ''
    if (!title) {
      title = $('title').text().trim()
    }
    if (!title) {
      title = $('h1').first().text().trim()
    }
    if (!title) {
      title = $('meta[property="og:title"]').attr('content') || ''
    }
    if (!title) {
      title = $('meta[name="twitter:title"]').attr('content') || ''
    }
    if (!title) {
      title = 'No title found'
    }

    // 説明の取得（複数の方法を試行）
    let description = $('meta[name="description"]').attr('content') || ''
    if (!description) {
      description = $('meta[property="og:description"]').attr('content') || ''
    }
    if (!description) {
      description = $('meta[name="twitter:description"]').attr('content') || ''
    }
    if (!description && article?.excerpt) {
      description = article.excerpt
    }
    if (!description) {
      // 最初の段落から説明を取得
      const firstParagraph = $('p').first().text().trim()
      description = firstParagraph.length > 200 ? firstParagraph.substring(0, 200) + '...' : firstParagraph
    }
    if (!description) {
      description = 'No description available'
    }

    // コンテンツの取得（Readabilityを優先）
    let content = ''
    let readabilityScore = 0
    let wordCount = 0
    let readingTime = 0

    if (article && article.textContent) {
      content = article.textContent.trim()
      wordCount = content.split(/\s+/).length
      readingTime = Math.ceil(wordCount / 200) // 平均的な読書速度（200語/分）
      readabilityScore = 100 // Readabilityが成功した場合は高スコア
    } else {
      // Readabilityが失敗した場合は、従来の方法を使用
      const contentSelectors = [
        'main',
        'article',
        '.content',
        '.main-content',
        '#content',
        '#main',
        '.post-content',
        '.entry-content',
        '.article-content',
        'body'
      ]

      let contentFound = false

      for (const selector of contentSelectors) {
        const element = $(selector)
        if (element.length > 0) {
          // 不要な要素を除去
          element.find('script, style, nav, header, footer, .nav, .navigation, .menu, .sidebar, .advertisement, .ads, .social-share, .comments, .related-posts').remove()
          
          // テキストコンテンツを取得
          const elementText = element.text().trim()
          
          // 不要な空白を整理
          const cleanedText = elementText.replace(/\s+/g, ' ').trim()
          
          if (cleanedText.length > 100) {
            content = cleanedText
            contentFound = true
            break
          }
        }
      }

      // コンテンツが見つからない場合は、すべての段落から取得
      if (!contentFound) {
        const paragraphs = $('p').map((_, el) => $(el).text().trim()).get()
        content = paragraphs.join(' ')
        
        // 短すぎる場合は、すべてのテキスト要素から取得
        if (content.length < 100) {
          const allText = $('body').text().trim()
          content = allText.replace(/\s+/g, ' ').trim()
        }
      }

      wordCount = content.split(/\s+/).length
      readingTime = Math.ceil(wordCount / 200)
      readabilityScore = 50 // 従来の方法の場合は中スコア
    }

    // コンテンツの長さを制限
    if (content.length > 10000) {
      content = content.substring(0, 10000) + '...'
    }

    // ステータスの決定
    let status: 'success' | 'partial' | 'error' = 'success'
    let message = ''

    if (content.length < 50) {
      status = 'partial'
      message = 'Limited content extracted. The page might be using JavaScript to load content or have restricted access.'
    } else if (content.length < 200) {
      status = 'partial'
      message = 'Partial content extracted. Some content may be missing.'
    } else if (readabilityScore >= 80) {
      status = 'success'
      message = 'High-quality content extracted using Readability.'
    }

    const scrapedContent: ScrapedContent = {
      title,
      description,
      content,
      url: targetUrl,
      timestamp: new Date().toISOString(),
      status,
      readabilityScore,
      wordCount,
      readingTime,
      ...(message && { message })
    }

    return NextResponse.json(scrapedContent)

  } catch (error) {
    console.error('Scraping error:', error)
    
    let errorMessage = 'Failed to scrape the URL. Please check the URL and try again.'
    
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
      { error: errorMessage },
      { status: 500 }
    )
  }
} 