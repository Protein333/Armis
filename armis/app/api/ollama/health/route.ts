import { NextRequest, NextResponse } from 'next/server'

// Ollamaのデフォルトホスト
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434'

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${OLLAMA_HOST}/api/tags`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })

    if (response.ok) {
      return NextResponse.json({ 
        status: 'healthy',
        message: 'Ollama server is running'
      })
    } else {
      return NextResponse.json({ 
        status: 'unhealthy',
        message: 'Ollama server is not responding'
      }, { status: 503 })
    }
  } catch (error) {
    console.error('Ollama health check failed:', error)
    return NextResponse.json({ 
      status: 'unhealthy',
      message: 'Ollama server is not accessible',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 })
  }
} 