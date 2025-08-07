"use client"

import * as React from "react"
import { Infinity, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Brain, Globe, Server } from "lucide-react"
import { AVAILABLE_MODELS } from "@/lib/ai-providers"

interface ModelSwitcherProps {
  currentProvider: string
  currentModel: string
  availableProviders: string[]
  onProviderChange: (provider: string) => void
  onModelChange: (model: string) => void
  getAvailableModelsForProvider: (provider: string) => any[]
  className?: string
}

export function ModelSwitcher({
  currentProvider,
  currentModel,
  availableProviders,
  onProviderChange,
  onModelChange,
  getAvailableModelsForProvider,
  className = ""
}: ModelSwitcherProps) {
  const [open, setOpen] = React.useState(false)

  // キーボードショートカット「⌘I」でメニューを開く
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'i') {
        event.preventDefault()
        setOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className={`h-8 px-3 text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300 ${className}`}
        >
          <div className="flex items-center space-x-2">
            <Infinity className="h-4 w-4" />
            <span>Agent</span>
            <span className="text-xs text-gray-500">⌘I</span>
            <ChevronDown className="h-3 w-3" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="start">
        <DropdownMenuLabel>AI モデル選択</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* プロバイダー選択 */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-gray-500 px-2 py-1">
            プロバイダー
          </DropdownMenuLabel>
          
          <DropdownMenuItem
            onClick={() => {
              onProviderChange('google')
              const geminiModels = getAvailableModelsForProvider('google')
              if (geminiModels.length > 0) {
                onModelChange(geminiModels[0].name)
              }
              setOpen(false)
            }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4" />
              <span>Gemini</span>
            </div>
            <Badge variant={availableProviders.includes('google') ? "default" : "secondary"} className="text-xs">
              {availableProviders.includes('google') ? '接続中' : '未接続'}
            </Badge>
          </DropdownMenuItem>
          
          <DropdownMenuItem
            onClick={() => {
              onProviderChange('ollama')
              const ollamaModels = getAvailableModelsForProvider('ollama')
              if (ollamaModels.length > 0) {
                onModelChange(ollamaModels[0].name)
              }
              setOpen(false)
            }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center space-x-2">
              <Server className="h-4 w-4" />
              <span>Ollama</span>
            </div>
            <Badge variant={availableProviders.includes('ollama') ? "default" : "secondary"} className="text-xs">
              {availableProviders.includes('ollama') ? '接続中' : '未接続'}
            </Badge>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        {/* モデル選択 */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs text-gray-500 px-2 py-1">
            モデル
          </DropdownMenuLabel>
          
          {(() => {
            const availableModels = getAvailableModelsForProvider(currentProvider)
            
            if (availableModels.length === 0) {
              return (
                <div className="p-3 text-center text-sm text-gray-500">
                  <div className="mb-2">
                    <Brain className="h-6 w-6 mx-auto text-gray-400" />
                  </div>
                  <p className="font-medium mb-1">モデルが利用できません</p>
                  <p className="text-xs">プロバイダーの接続を確認してください</p>
                </div>
              )
            }
            
            return availableModels.map((model) => {
              const modelInfo = AVAILABLE_MODELS[model.name]
              const Icon = modelInfo?.icon || Brain
              const isSelected = currentModel === model.name
              
              return (
                <DropdownMenuItem
                  key={model.name}
                  onClick={() => {
                    onModelChange(model.name)
                    setOpen(false)
                  }}
                  className={`flex items-center justify-between ${isSelected ? 'bg-accent' : ''}`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="h-4 w-4" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {modelInfo?.name || model.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {modelInfo?.description || (model as any).description || ''}
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <Badge variant="outline" className="text-xs">
                      選択中
                    </Badge>
                  )}
                </DropdownMenuItem>
              )
            })
          })()}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
