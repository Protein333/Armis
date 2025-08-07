#!/usr/bin/env node

/**
 * Webreader機能のテストスクリプト
 * 
 * 使用方法:
 * node scripts/test-webreader.js [URL]
 * 
 * 例:
 * node scripts/test-webreader.js https://ja.wikipedia.org/wiki/ヴァイキング
 */

const fetch = require('node-fetch')

async function testWebreader(url) {
  console.log(`🔍 Testing Webreader functionality with URL: ${url}`)
  console.log('=' * 60)

  try {
    // Webreader APIをテスト
    console.log('📡 Testing Webreader API...')
    const response = await fetch('http://localhost:3000/api/webreader', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        options: {
          includeImages: false,
          includeLinks: false,
          maxLength: 5000
        }
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    
    console.log('✅ Webreader API test successful!')
    console.log('\n📄 Extracted Content:')
    console.log(`Title: ${data.title}`)
    console.log(`URL: ${data.url}`)
    console.log(`Status: ${data.status}`)
    console.log(`Content length: ${data.content?.length || 0} characters`)
    
    if (data.content) {
      console.log('\n📝 Content preview:')
      console.log(data.content.substring(0, 300) + '...')
    }

    // URL処理ユーティリティをテスト
    console.log('\n🔧 Testing URL processing utilities...')
    const testMessage = `このURLについて教えてください: ${url}`
    
    const urlResponse = await fetch('http://localhost:3000/api/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url })
    })

    if (urlResponse.ok) {
      const urlData = await urlResponse.json()
      console.log('✅ URL processing test successful!')
      console.log(`Scraped title: ${urlData.title}`)
      console.log(`Scraped content length: ${urlData.content?.length || 0} characters`)
      console.log(`Readability score: ${urlData.readabilityScore || 'N/A'}%`)
    } else {
      console.log('⚠️ URL processing test failed')
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the development server is running:')
      console.log('   npm run dev')
    }
  }
}

// メイン実行
async function main() {
  const url = process.argv[2]
  
  if (!url) {
    console.log('Usage: node scripts/test-webreader.js [URL]')
    console.log('Example: node scripts/test-webreader.js https://ja.wikipedia.org/wiki/ヴァイキング')
    process.exit(1)
  }

  // URLの形式を検証
  try {
    new URL(url)
  } catch {
    console.error('❌ Invalid URL format:', url)
    process.exit(1)
  }

  await testWebreader(url)
}

if (require.main === module) {
  main().catch(console.error)
}

module.exports = { testWebreader } 