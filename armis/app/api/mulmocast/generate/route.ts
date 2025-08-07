import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs-extra'

const execAsync = promisify(exec)

interface GenerateRequest {
  type: 'audio' | 'images' | 'movie' | 'pdf'
  scriptFile: string
  options?: {
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
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json()
    const { type, scriptFile, options = {} } = body

    // スクリプトファイルの存在確認
    const scriptPath = path.resolve(process.cwd(), scriptFile)
    if (!await fs.pathExists(scriptPath)) {
      return NextResponse.json(
        { error: 'Script file not found' },
        { status: 404 }
      )
    }

    // mulmocast-cliコマンドの構築
    let command = `npx mulmo ${type} "${scriptPath}"`
    
    // オプションの追加
    if (options.outdir) command += ` -o "${options.outdir}"`
    if (options.basedir) command += ` -b "${options.basedir}"`
    if (options.lang) command += ` -l ${options.lang}`
    if (options.force) command += ` -f`
    if (options.presentationStyle) command += ` -p "${options.presentationStyle}"`
    if (options.audiodir) command += ` -a "${options.audiodir}"`
    if (options.imagedir) command += ` -i "${options.imagedir}"`
    if (options.caption) command += ` -c ${options.caption}`
    if (options.pdf_mode) command += ` --pdf_mode ${options.pdf_mode}`
    if (options.pdf_size) command += ` --pdf_size ${options.pdf_size}`

    console.log('Executing mulmocast command:', command)

    // mulmocast-cliコマンドの実行
    const { stdout, stderr } = await execAsync(command, {
      cwd: process.cwd(),
      timeout: 300000 // 5分のタイムアウト
    })

    if (stderr) {
      console.error('Mulmocast CLI stderr:', stderr)
    }

    return NextResponse.json({
      success: true,
      type,
      scriptFile,
      output: stdout,
      message: `${type} generation completed successfully`
    })

  } catch (error) {
    console.error('Mulmocast generation error:', error)
    return NextResponse.json(
      { 
        error: 'Generation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    if (!type) {
      return NextResponse.json({
        message: 'Mulmocast Generation API',
        availableTypes: ['audio', 'images', 'movie', 'pdf'],
        usage: 'POST /api/mulmocast/generate with type and scriptFile in body'
      })
    }

    // 特定のタイプの情報を返す
    const typeInfo = {
      audio: {
        description: 'Generate audio files from script',
        options: ['outdir', 'basedir', 'lang', 'force', 'presentationStyle', 'audiodir']
      },
      images: {
        description: 'Generate image files from script',
        options: ['outdir', 'basedir', 'lang', 'force', 'presentationStyle', 'imagedir']
      },
      movie: {
        description: 'Generate movie file from script',
        options: ['outdir', 'basedir', 'lang', 'force', 'presentationStyle', 'audiodir', 'imagedir', 'caption']
      },
      pdf: {
        description: 'Generate PDF files from script',
        options: ['outdir', 'basedir', 'lang', 'force', 'presentationStyle', 'imagedir', 'pdf_mode', 'pdf_size']
      }
    }

    return NextResponse.json({
      type,
      ...typeInfo[type as keyof typeof typeInfo]
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 