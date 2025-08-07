// URL検出とWebreader機能のためのユーティリティ関数
import { webreaderClient, WebreaderExtractResponse } from './webreader-client'

export interface ScrapedContent {
  title: string
  description: string
  content: string
  url: string
  timestamp: string
  status: 'success' | 'partial' | 'error'
  readabilityScore: number
  wordCount: number
  readingTime: number
  message?: string
}

// URLを検出する正規表現パターン
const URL_REGEX = /(https?:\/\/[^\s]+)/g

/**
 * テキストからURLを抽出する
 */
export function extractUrls(text: string): string[] {
  const matches = text.match(URL_REGEX)
  return matches ? matches.filter(url => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }) : []
}

/**
 * テキストにURLが含まれているかチェックする
 */
export function containsUrls(text: string): boolean {
  return extractUrls(text).length > 0
}

/**
 * Webreaderを使用してURLからテキストを抽出する
 */
export async function extractTextWithWebreader(url: string): Promise<WebreaderExtractResponse> {
  return await webreaderClient.extractText({ 
    url,
    options: {
      includeImages: false,
      includeLinks: false,
      maxLength: 10000
    }
  })
}

/**
 * URLからWebコンテンツを抽出する（Webreader優先）
 */
export async function scrapeUrl(url: string): Promise<ScrapedContent> {
  try {
    // まずWebreaderを試行
    const webreaderResult = await extractTextWithWebreader(url)
    
    if (webreaderResult.status === 'success' && webreaderResult.text) {
      const wordCount = webreaderResult.text.split(/\s+/).length
      const readingTime = Math.ceil(wordCount / 200)
      
      return {
        title: webreaderResult.title,
        description: webreaderResult.text.substring(0, 200) + '...',
        content: webreaderResult.text,
        url: url,
        timestamp: new Date().toISOString(),
        status: 'success',
        readabilityScore: 100,
        wordCount,
        readingTime,
        message: 'Successfully extracted using Webreader'
      }
    }

    // Webreaderが失敗した場合は、既存のscrape APIを使用
    const response = await fetch('/api/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to scrape URL')
    }

    return await response.json()
  } catch (error) {
    console.error('Error scraping URL:', error)
    throw error
  }
}

/**
 * メッセージとURLコンテンツを組み合わせてAIに送信するためのテキストを生成する
 */
export function combineMessageWithWebContent(
  userMessage: string,
  scrapedContent: ScrapedContent
): string {
  const urlInfo = `[Web Content from ${scrapedContent.url}]
Title: ${scrapedContent.title}
Description: ${scrapedContent.description}
Content: ${scrapedContent.content}

User Message: ${userMessage}

Please analyze the web content and respond to the user's message.`

  return urlInfo
}

/**
 * 複数のURLからコンテンツを抽出し、メッセージと組み合わせる
 */
export async function processUrlsInMessage(
  userMessage: string
): Promise<{ processedMessage: string; scrapedContents: ScrapedContent[] }> {
  const urls = extractUrls(userMessage)
  
  if (urls.length === 0) {
    return {
      processedMessage: userMessage,
      scrapedContents: []
    }
  }

  const scrapedContents: ScrapedContent[] = []
  let processedMessage = userMessage

  try {
    // 各URLからコンテンツを抽出
    for (const url of urls) {
      try {
        const scrapedContent = await scrapeUrl(url)
        scrapedContents.push(scrapedContent)
        
        // メッセージからURLを削除し、代わりにコンテンツ情報を追加
        processedMessage = processedMessage.replace(url, `[Web Content: ${scrapedContent.title}]`)
      } catch (error) {
        console.error(`Failed to scrape URL ${url}:`, error)
        // URLの抽出に失敗した場合は、元のURLをそのまま残す
      }
    }

    // 抽出したコンテンツをメッセージに追加
    if (scrapedContents.length > 0) {
      const webContentInfo = scrapedContents.map(content => 
        `[Web Content from ${content.url}]
Title: ${content.title}
Description: ${content.description}
Content: ${content.content}`
      ).join('\n\n')

      processedMessage = `${processedMessage}\n\n${webContentInfo}\n\nPlease analyze the web content and respond to the user's message.`
    }
  } catch (error) {
    console.error('Error processing URLs in message:', error)
  }

  return {
    processedMessage,
    scrapedContents
  }
} 