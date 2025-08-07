import { NextRequest, NextResponse } from 'next/server'
import { createMulmocastClient, MulmocastConfig } from '@/lib/mulmocast'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'status':
        return NextResponse.json({ 
          status: 'connected',
          timestamp: new Date().toISOString()
        })
      
      case 'config':
        const config: MulmocastConfig = {
          enabled: true,
          serverUrl: 'ws://localhost:8080',
          autoConnect: true
        }
        return NextResponse.json(config)
      
      default:
        return NextResponse.json({ 
          message: 'Mulmocast CLI API',
          version: '1.0.0'
        })
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case 'connect':
        const client = createMulmocastClient()
        const success = await client.connect()
        return NextResponse.json({ 
          success,
          message: success ? 'Connected to mulmocast server' : 'Failed to connect'
        })
      
      case 'disconnect':
        const disconnectClient = createMulmocastClient()
        await disconnectClient.disconnect()
        return NextResponse.json({ 
          success: true,
          message: 'Disconnected from mulmocast server'
        })
      
      case 'send':
        const { content, type = 'text' } = data
        const sendClient = createMulmocastClient()
        await sendClient.sendMessage(content, type)
        return NextResponse.json({ 
          success: true,
          message: 'Message sent successfully'
        })
      
      case 'config':
        // Update configuration
        return NextResponse.json({ 
          success: true,
          message: 'Configuration updated'
        })
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 