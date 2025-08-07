import { Brain, Sparkles, Globe, Cpu, Bot, Shield, Zap } from "lucide-react"

export interface AIModel {
  id: string
  name: string
  provider: string
  description: string
  category: string
  icon: any
}

export const AVAILABLE_MODELS: Record<string, AIModel> = {
  "claude-4-sonnet": { 
    id: "claude-4-sonnet",
    name: "Claude 4 Sonnet", 
    provider: "Anthropic", 
    description: "高性能な会話モデル", 
    category: "Premium", 
    icon: Brain 
  },
  "claude-3.7-sonnet": { 
    id: "claude-3.7-sonnet",
    name: "Claude 3.7 Sonnet", 
    provider: "Anthropic", 
    description: "最新のClaudeモデル", 
    category: "Premium", 
    icon: Brain 
  },
  "claude-4-opus": { 
    id: "claude-4-opus",
    name: "Claude 4 Opus", 
    provider: "Anthropic", 
    description: "最高性能のClaudeモデル", 
    category: "Premium", 
    icon: Brain 
  },
  "claude-3.5-sonnet": { 
    id: "claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet", 
    provider: "Anthropic", 
    description: "バランスの取れたClaudeモデル", 
    category: "Standard", 
    icon: Brain 
  },
  "claude-3.5-haiku": { 
    id: "claude-3.5-haiku",
    name: "Claude 3.5 Haiku", 
    provider: "Anthropic", 
    description: "軽量なClaudeモデル", 
    category: "Standard", 
    icon: Brain 
  },
  "gpt-4": { 
    id: "gpt-4",
    name: "GPT-4", 
    provider: "OpenAI", 
    description: "高性能なGPTモデル", 
    category: "Premium", 
    icon: Sparkles 
  },
  "gpt-4-turbo": { 
    id: "gpt-4-turbo",
    name: "GPT-4 Turbo", 
    provider: "OpenAI", 
    description: "高速なGPT-4モデル", 
    category: "Premium", 
    icon: Sparkles 
  },
  "gpt-4o": { 
    id: "gpt-4o",
    name: "GPT-4o", 
    provider: "OpenAI", 
    description: "最新のGPT-4モデル", 
    category: "Premium", 
    icon: Sparkles 
  },
  "gpt-4o-mini": { 
    id: "gpt-4o-mini",
    name: "GPT-4o Mini", 
    provider: "OpenAI", 
    description: "軽量なGPT-4oモデル", 
    category: "Standard", 
    icon: Sparkles 
  },
  "gpt-4.5-preview": { 
    id: "gpt-4.5-preview",
    name: "GPT-4.5 Preview", 
    provider: "OpenAI", 
    description: "GPT-4.5のプレビュー版", 
    category: "Premium", 
    icon: Sparkles 
  },
  "gpt-3.5-turbo": { 
    id: "gpt-3.5-turbo",
    name: "GPT-3.5 Turbo", 
    provider: "OpenAI", 
    description: "軽量なGPTモデル", 
    category: "Standard", 
    icon: Sparkles 
  },
  "gemini-2.5-pro": { 
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro", 
    provider: "Google", 
    description: "高性能なGeminiモデル", 
    category: "Premium", 
    icon: Globe 
  },
  "gemini-2.5-pro-max": { 
    id: "gemini-2.5-pro-max",
    name: "Gemini 2.5 Pro Max", 
    provider: "Google", 
    description: "最高性能のGeminiモデル", 
    category: "Premium", 
    icon: Globe 
  },
  "gemini-2.5-flash": { 
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash", 
    provider: "Google", 
    description: "高速なGeminiモデル", 
    category: "Standard", 
    icon: Globe 
  },
  "gemini-2.5-flash-preview-04-17": { 
    id: "gemini-2.5-flash-preview-04-17",
    name: "Gemini 2.5 Flash Preview", 
    provider: "Google", 
    description: "Gemini 2.5 Flashのプレビュー版", 
    category: "Standard", 
    icon: Globe 
  },
  "gemini-2.5-pro-exp-03-25": { 
    id: "gemini-2.5-pro-exp-03-25",
    name: "Gemini 2.5 Pro Experimental", 
    provider: "Google", 
    description: "Gemini 2.5 Proの実験版", 
    category: "Premium", 
    icon: Globe 
  },
  "gemini-2.5-pro-preview-06-05": { 
    id: "gemini-2.5-pro-preview-06-05",
    name: "Gemini 2.5 Pro Preview", 
    provider: "Google", 
    description: "Gemini 2.5 Proのプレビュー版", 
    category: "Premium", 
    icon: Globe 
  },
  "gemini-2.0-flash-lite": { 
    id: "gemini-2.0-flash-lite",
    name: "Gemini 2.0 Flash Lite", 
    provider: "Google", 
    description: "軽量なGeminiモデル", 
    category: "Standard", 
    icon: Globe 
  },
  "grok-2": { 
    id: "grok-2",
    name: "Grok-2", 
    provider: "xAI", 
    description: "xAIの高性能モデル", 
    category: "Premium", 
    icon: Sparkles 
  },
  "grok-3": { 
    id: "grok-3",
    name: "Grok-3", 
    provider: "xAI", 
    description: "最新のGrokモデル", 
    category: "Premium", 
    icon: Sparkles 
  },
  "grok-3-mini": { 
    id: "grok-3-mini",
    name: "Grok-3 Mini", 
    provider: "xAI", 
    description: "軽量なGrok-3モデル", 
    category: "Standard", 
    icon: Sparkles 
  },
  "grok-4": { 
    id: "grok-4",
    name: "Grok-4", 
    provider: "xAI", 
    description: "最新のGrok-4モデル", 
    category: "Premium", 
    icon: Sparkles 
  },
  "o1": { 
    id: "o1",
    name: "O1", 
    provider: "Anthropic", 
    description: "Anthropicの最新モデル", 
    category: "Premium", 
    icon: Brain 
  },
  "o1-mini": { 
    id: "o1-mini",
    name: "O1 Mini", 
    provider: "Anthropic", 
    description: "軽量なO1モデル", 
    category: "Standard", 
    icon: Brain 
  },
  "o1-preview": { 
    id: "o1-preview",
    name: "O1 Preview", 
    provider: "Anthropic", 
    description: "O1のプレビュー版", 
    category: "Premium", 
    icon: Brain 
  },
  "o3": { 
    id: "o3",
    name: "O3", 
    provider: "Anthropic", 
    description: "AnthropicのO3モデル", 
    category: "Premium", 
    icon: Brain 
  },
  "o3-mini": { 
    id: "o3-mini",
    name: "O3 Mini", 
    provider: "Anthropic", 
    description: "軽量なO3モデル", 
    category: "Standard", 
    icon: Brain 
  },
  "o3-pro": { 
    id: "o3-pro",
    name: "O3 Pro", 
    provider: "Anthropic", 
    description: "高性能なO3モデル", 
    category: "Premium", 
    icon: Brain 
  },
  "o4-mini": { 
    id: "o4-mini",
    name: "O4 Mini", 
    provider: "Anthropic", 
    description: "軽量なO4モデル", 
    category: "Standard", 
    icon: Brain 
  },
  "deepseek-r1": { 
    id: "deepseek-r1",
    name: "DeepSeek R1", 
    provider: "DeepSeek", 
    description: "DeepSeekの高性能モデル", 
    category: "Premium", 
    icon: Cpu 
  },
  "deepseek-r1-0528": { 
    id: "deepseek-r1-0528",
    name: "DeepSeek R1 0528", 
    provider: "DeepSeek", 
    description: "DeepSeek R1の特定バージョン", 
    category: "Premium", 
    icon: Cpu 
  },
  "deepseek-v3": { 
    id: "deepseek-v3",
    name: "DeepSeek V3", 
    provider: "DeepSeek", 
    description: "DeepSeekのV3モデル", 
    category: "Premium", 
    icon: Cpu 
  },
  "deepseek-v3.1": { 
    id: "deepseek-v3.1",
    name: "DeepSeek V3.1", 
    provider: "DeepSeek", 
    description: "DeepSeek V3の改良版", 
    category: "Premium", 
    icon: Cpu 
  },
  "kimi-k2-instruct": { 
    id: "kimi-k2-instruct",
    name: "Kimi K2 Instruct", 
    provider: "Moonshot", 
    description: "MoonshotのK2指示モデル", 
    category: "Standard", 
    icon: Bot 
  },
  "cursor-small": { 
    id: "cursor-small",
    name: "Cursor Small", 
    provider: "Cursor", 
    description: "Cursorの軽量モデル", 
    category: "Standard", 
    icon: Bot 
  },

  // Fireworks AI Models
  "accounts/fireworks/models/llama-v3-70b-instruct": { 
    id: "accounts/fireworks/models/llama-v3-70b-instruct",
    name: "Llama v3 70B Instruct", 
    provider: "Fireworks", 
    description: "高性能なLlama v3モデル", 
    category: "Premium", 
    icon: Zap 
  },
  "accounts/fireworks/models/llama-v3-8b-instruct": { 
    id: "accounts/fireworks/models/llama-v3-8b-instruct",
    name: "Llama v3 8B Instruct", 
    provider: "Fireworks", 
    description: "軽量なLlama v3モデル", 
    category: "Standard", 
    icon: Zap 
  },
  "accounts/fireworks/models/llama-v3-1b-instruct": { 
    id: "accounts/fireworks/models/llama-v3-1b-instruct",
    name: "Llama v3 1B Instruct", 
    provider: "Fireworks", 
    description: "超軽量なLlama v3モデル", 
    category: "Standard", 
    icon: Zap 
  },
  "accounts/fireworks/models/llama-v2-70b-chat": { 
    id: "accounts/fireworks/models/llama-v2-70b-chat",
    name: "Llama v2 70B Chat", 
    provider: "Fireworks", 
    description: "高性能なLlama v2チャットモデル", 
    category: "Premium", 
    icon: Zap 
  },
  "accounts/fireworks/models/llama-v2-13b-chat": { 
    id: "accounts/fireworks/models/llama-v2-13b-chat",
    name: "Llama v2 13B Chat", 
    provider: "Fireworks", 
    description: "中容量のLlama v2チャットモデル", 
    category: "Standard", 
    icon: Zap 
  },
  "accounts/fireworks/models/llama-v2-7b-chat": { 
    id: "accounts/fireworks/models/llama-v2-7b-chat",
    name: "Llama v2 7B Chat", 
    provider: "Fireworks", 
    description: "軽量なLlama v2チャットモデル", 
    category: "Standard", 
    icon: Zap 
  },
  "accounts/fireworks/models/codellama-34b-instruct": { 
    id: "accounts/fireworks/models/codellama-34b-instruct",
    name: "Code Llama 34B Instruct", 
    provider: "Fireworks", 
    description: "高性能なコード生成モデル", 
    category: "Premium", 
    icon: Zap 
  },
  "accounts/fireworks/models/codellama-13b-instruct": { 
    id: "accounts/fireworks/models/codellama-13b-instruct",
    name: "Code Llama 13B Instruct", 
    provider: "Fireworks", 
    description: "中容量のコード生成モデル", 
    category: "Standard", 
    icon: Zap 
  },
  "accounts/fireworks/models/codellama-7b-instruct": { 
    id: "accounts/fireworks/models/codellama-7b-instruct",
    name: "Code Llama 7B Instruct", 
    provider: "Fireworks", 
    description: "軽量なコード生成モデル", 
    category: "Standard", 
    icon: Zap 
  },
  "accounts/fireworks/models/mistral-7b-instruct": { 
    id: "accounts/fireworks/models/mistral-7b-instruct",
    name: "Mistral 7B Instruct", 
    provider: "Fireworks", 
    description: "高性能なMistralモデル", 
    category: "Standard", 
    icon: Zap 
  },
  "accounts/fireworks/models/mixtral-8x7b-instruct": { 
    id: "accounts/fireworks/models/mixtral-8x7b-instruct",
    name: "Mixtral 8x7B Instruct", 
    provider: "Fireworks", 
    description: "高性能なMixture of Expertsモデル", 
    category: "Premium", 
    icon: Zap 
  },
  "accounts/fireworks/models/qwen2-72b-instruct": { 
    id: "accounts/fireworks/models/qwen2-72b-instruct",
    name: "Qwen2 72B Instruct", 
    provider: "Fireworks", 
    description: "高性能なQwen2モデル", 
    category: "Premium", 
    icon: Zap 
  },
  "accounts/fireworks/models/qwen2-7b-instruct": { 
    id: "accounts/fireworks/models/qwen2-7b-instruct",
    name: "Qwen2 7B Instruct", 
    provider: "Fireworks", 
    description: "軽量なQwen2モデル", 
    category: "Standard", 
    icon: Zap 
  },
  "accounts/fireworks/models/qwen2-1.5b-instruct": { 
    id: "accounts/fireworks/models/qwen2-1.5b-instruct",
    name: "Qwen2 1.5B Instruct", 
    provider: "Fireworks", 
    description: "超軽量なQwen2モデル", 
    category: "Standard", 
    icon: Zap 
  },
  "accounts/fireworks/models/phi-3.5-14b-instruct": { 
    id: "accounts/fireworks/models/phi-3.5-14b-instruct",
    name: "Phi-3.5 14B Instruct", 
    provider: "Fireworks", 
    description: "高性能なPhi-3.5モデル", 
    category: "Premium", 
    icon: Zap 
  },
  "accounts/fireworks/models/phi-3.5-4b-instruct": { 
    id: "accounts/fireworks/models/phi-3.5-4b-instruct",
    name: "Phi-3.5 4B Instruct", 
    provider: "Fireworks", 
    description: "軽量なPhi-3.5モデル", 
    category: "Standard", 
    icon: Zap 
  },
  "accounts/fireworks/models/phi-3-mini-4k-instruct": { 
    id: "accounts/fireworks/models/phi-3-mini-4k-instruct",
    name: "Phi-3 Mini 4K Instruct", 
    provider: "Fireworks", 
    description: "軽量なPhi-3 Miniモデル", 
    category: "Standard", 
    icon: Zap 
  },
  "accounts/fireworks/models/phi-3-mini-128k-instruct": { 
    id: "accounts/fireworks/models/phi-3-mini-128k-instruct",
    name: "Phi-3 Mini 128K Instruct", 
    provider: "Fireworks", 
    description: "長文対応のPhi-3 Miniモデル", 
    category: "Standard", 
    icon: Zap 
  },
  "accounts/fireworks/models/gemma-2-27b-it": { 
    id: "accounts/fireworks/models/gemma-2-27b-it",
    name: "Gemma 2 27B IT", 
    provider: "Fireworks", 
    description: "高性能なGemma 2モデル", 
    category: "Premium", 
    icon: Zap 
  },
  "accounts/fireworks/models/gemma-2-9b-it": { 
    id: "accounts/fireworks/models/gemma-2-9b-it",
    name: "Gemma 2 9B IT", 
    provider: "Fireworks", 
    description: "中容量のGemma 2モデル", 
    category: "Standard", 
    icon: Zap 
  },
  "accounts/fireworks/models/gemma-2-2b-it": { 
    id: "accounts/fireworks/models/gemma-2-2b-it",
    name: "Gemma 2 2B IT", 
    provider: "Fireworks", 
    description: "軽量なGemma 2モデル", 
    category: "Standard", 
    icon: Zap 
  },
  "accounts/fireworks/models/command-r-plus": { 
    id: "accounts/fireworks/models/command-r-plus",
    name: "Command R+", 
    provider: "Fireworks", 
    description: "高性能なCommand R+モデル", 
    category: "Premium", 
    icon: Zap 
  },
  "accounts/fireworks/models/command-r": { 
    id: "accounts/fireworks/models/command-r",
    name: "Command R", 
    provider: "Fireworks", 
    description: "中容量のCommand Rモデル", 
    category: "Standard", 
    icon: Zap 
  },
  "accounts/fireworks/models/command-light": { 
    id: "accounts/fireworks/models/command-light",
    name: "Command Light", 
    provider: "Fireworks", 
    description: "軽量なCommand Lightモデル", 
    category: "Standard", 
    icon: Zap 
  }
}

// モデル配列としても提供（Settings.tsxで使用）
export const AVAILABLE_MODELS_ARRAY: AIModel[] = Object.values(AVAILABLE_MODELS)

// カテゴリ別にグループ化されたモデルを取得
export const getModelsByCategory = () => {
  const modelsByCategory: Record<string, AIModel[]> = {}
  
  AVAILABLE_MODELS_ARRAY.forEach(model => {
    if (!modelsByCategory[model.category]) {
      modelsByCategory[model.category] = []
    }
    modelsByCategory[model.category].push(model)
  })
  
  return modelsByCategory
}

// プロバイダー別にモデルを取得
export const getModelsByProvider = (provider: string) => {
  return AVAILABLE_MODELS_ARRAY.filter(model => model.provider === provider)
}

// 有効化されたモデルのみを取得
export const getEnabledModels = (enabledModels: Record<string, boolean>) => {
  return Object.entries(enabledModels)
    .filter(([_, isEnabled]) => isEnabled)
    .map(([modelId, _]) => modelId)
} 