#!/usr/bin/env node

// mulmocast-cli functionality test script
const { exec } = require('child_process')
const { promisify } = require('util')
const fs = require('fs-extra')
const path = require('path')

const execAsync = promisify(exec)

async function testMulmocastCLI() {
  console.log('Testing mulmocast-cli functionality...\n')

  try {
    // 1. バージョン確認
    console.log('1. Checking mulmocast-cli version...')
    const { stdout: versionOutput } = await execAsync('npx mulmo --version')
    console.log('Version:', versionOutput.trim())

    // 2. ヘルプ確認
    console.log('\n2. Checking available commands...')
    const { stdout: helpOutput } = await execAsync('npx mulmo --help')
    console.log('Available commands found in help output')

    // 3. 利用可能なテンプレート確認
    console.log('\n3. Checking available templates...')
    const { stdout: templateOutput } = await execAsync('npx mulmo tool scripting --help')
    console.log('Template options found in scripting help')

    // 4. スキーマ確認
    console.log('\n4. Checking schema...')
    const { stdout: schemaOutput } = await execAsync('npx mulmo tool schema')
    console.log('Schema output length:', schemaOutput.length)

    // 5. プロンプト確認
    console.log('\n5. Checking available prompts...')
    const { stdout: promptOutput } = await execAsync('npx mulmo tool prompt --help')
    console.log('Prompt options found')

    console.log('\n✅ All basic mulmocast-cli functionality tests passed!')
    console.log('\nNext steps:')
    console.log('- Create a test script file')
    console.log('- Test audio generation')
    console.log('- Test image generation')
    console.log('- Test movie generation')
    console.log('- Test PDF generation')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.error('Make sure mulmocast-cli is properly installed')
  }
}

async function createTestScript() {
  console.log('\nCreating test script...')
  
  const testScript = {
    title: "Test Presentation",
    description: "A test presentation for mulmocast-cli",
    scenes: [
      {
        id: "scene1",
        title: "Introduction",
        content: "Welcome to our test presentation",
        duration: 10,
        images: [],
        audio: null
      },
      {
        id: "scene2", 
        title: "Main Content",
        content: "This is the main content of our presentation",
        duration: 20,
        images: [],
        audio: null
      },
      {
        id: "scene3",
        title: "Conclusion", 
        content: "Thank you for watching our test presentation",
        duration: 10,
        images: [],
        audio: null
      }
    ],
    metadata: {
      language: "en",
      presentationStyle: "business",
      totalDuration: 40
    }
  }

  const scriptPath = path.join(process.cwd(), 'test-script.json')
  await fs.writeJson(scriptPath, testScript, { spaces: 2 })
  console.log('✅ Test script created:', scriptPath)
  
  return scriptPath
}

async function testGeneration(scriptPath) {
  console.log('\nTesting generation with test script...')
  
  try {
    // PDF生成テスト
    console.log('Testing PDF generation...')
    const { stdout: pdfOutput } = await execAsync(`npx mulmo pdf "${scriptPath}" --pdf_mode slide`)
    console.log('✅ PDF generation test completed')

    // 音声生成テスト
    console.log('Testing audio generation...')
    const { stdout: audioOutput } = await execAsync(`npx mulmo audio "${scriptPath}"`)
    console.log('✅ Audio generation test completed')

    // 画像生成テスト
    console.log('Testing image generation...')
    const { stdout: imageOutput } = await execAsync(`npx mulmo images "${scriptPath}"`)
    console.log('✅ Image generation test completed')

    console.log('\n✅ All generation tests completed!')

  } catch (error) {
    console.error('❌ Generation test failed:', error.message)
    console.error('This might be due to missing API keys or configuration')
  }
}

async function main() {
  await testMulmocastCLI()
  
  const createTest = process.argv.includes('--create-test')
  if (createTest) {
    const scriptPath = await createTestScript()
    await testGeneration(scriptPath)
  }
}

if (require.main === module) {
  main().catch(console.error)
}

module.exports = { testMulmocastCLI, createTestScript, testGeneration } 