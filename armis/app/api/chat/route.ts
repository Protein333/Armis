import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Gemini APIキーを環境変数から取得
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json()

    console.log('API Key exists:', !!apiKey)
    console.log('Message:', message)
    console.log('History length:', history?.length || 0)

    if (!apiKey) {
      console.error('GOOGLE_API_KEY is not set')
      return NextResponse.json(
        { 
          error: 'Gemini APIキーが設定されていません。GOOGLE_API_KEY環境変数を設定してください。',
          details: 'Please set GOOGLE_API_KEY in your .env.local file'
        },
        { status: 500 }
      )
    }

    if (apiKey === 'your_gemini_api_key_here' || apiKey === 'your_google_api_key_here') {
      console.error('API key is still the placeholder value')
      return NextResponse.json(
        { 
          error: 'APIキーがプレースホルダーのままです。実際のAPIキーを設定してください。',
          details: 'Please replace the placeholder API key with your actual Gemini API key'
        },
        { status: 500 }
      )
    }

    // Gemini AIクライアントを初期化
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    // チャット履歴をGeminiの形式に変換
    const chatHistory = history.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }))

    console.log('Starting chat with Gemini...')

    // チャットセッションを開始
    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
      },
    })

    // メッセージを送信してレスポンスを取得
    const result = await chat.sendMessage(message)
    const response = await result.response
    const text = response.text()

    console.log('Gemini response received:', text.substring(0, 100) + '...')

    return NextResponse.json({ response: text })
  } catch (error) {
    console.error('Chat API error:', error)
    
    // エラーの詳細をログに出力
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }

    return NextResponse.json(
      { 
        error: 'AIサービスとの通信中にエラーが発生しました。',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 