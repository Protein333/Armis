import { ContextManager } from '@/components/context-manager'

export default function ContextPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <ContextManager />
      </div>
    </div>
  )
} 