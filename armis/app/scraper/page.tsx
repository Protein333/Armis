import { WebScraper } from '@/components/web-scraper'

export default function ScraperPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Web Content Scraper</h1>
          <p className="text-muted-foreground mt-2">
            Extract and analyze content from any webpage by entering its URL
          </p>
        </div>
        
        <WebScraper />
      </div>
    </div>
  )
} 