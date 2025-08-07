import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs-extra'

const execAsync = promisify(exec)

interface ScriptingRequest {
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

export async function POST(request: NextRequest) {
  try {
    const body: ScriptingRequest = await request.json()
    const {
      template,
      urls = [],
      inputFile,
      interactive = false,
      script = 'script',
      llm,
      llm_model,
      cache,
      outdir,
      basedir
    } = body

    // mulmocast-cli scriptingコマンドの構築
    let command = 'npx mulmo tool scripting'
    
    // オプションの追加
    if (template) command += ` -t "${template}"`
    if (urls.length > 0) {
      urls.forEach(url => {
        command += ` -u "${url}"`
      })
    }
    if (inputFile) command += ` --input-file "${inputFile}"`
    if (interactive) command += ` -i`
    if (script) command += ` -s "${script}"`
    if (llm) command += ` --llm ${llm}`
    if (llm_model) command += ` --llm_model "${llm_model}"`
    if (cache) command += ` -c "${cache}"`
    if (outdir) command += ` -o "${outdir}"`
    if (basedir) command += ` -b "${basedir}"`

    console.log('Executing mulmocast scripting command:', command)

    // mulmocast-cli scriptingコマンドの実行
    const { stdout, stderr } = await execAsync(command, {
      cwd: process.cwd(),
      timeout: 300000 // 5分のタイムアウト
    })

    if (stderr) {
      console.error('Mulmocast CLI scripting stderr:', stderr)
    }

    return NextResponse.json({
      success: true,
      template,
      script,
      output: stdout,
      message: 'Script generation completed successfully'
    })

  } catch (error) {
    console.error('Mulmocast scripting error:', error)
    return NextResponse.json(
      { 
        error: 'Script generation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const template = searchParams.get('template')

    if (!template) {
      return NextResponse.json({
        message: 'Mulmocast Scripting API',
        availableTemplates: [
          'akira_comic',
          'business',
          'children_book',
          'coding',
          'comic_strips',
          'drslump_comic',
          'ghibli_comic',
          'ghibli_image_only',
          'ghibli_shorts',
          'ghost_comic',
          'onepiece_comic',
          'podcast_standard',
          'portrait_movie',
          'realistic_movie',
          'sensei_and_taro',
          'shorts',
          'text_and_image',
          'text_only',
          'trailer'
        ],
        usage: 'POST /api/mulmocast/scripting with template and other options in body'
      })
    }

    // 特定のテンプレートの情報を返す
    const templateInfo = {
      business: {
        description: 'Business presentation template',
        suitableFor: ['presentations', 'reports', 'meetings']
      },
      coding: {
        description: 'Coding tutorial template',
        suitableFor: ['tutorials', 'code reviews', 'documentation']
      },
      podcast_standard: {
        description: 'Standard podcast template',
        suitableFor: ['podcasts', 'interviews', 'discussions']
      },
      ghibli_comic: {
        description: 'Studio Ghibli style comic template',
        suitableFor: ['stories', 'comics', 'creative content']
      }
    }

    return NextResponse.json({
      template,
      ...templateInfo[template as keyof typeof templateInfo]
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 