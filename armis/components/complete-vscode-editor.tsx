"use client"

import { useState, useEffect, useRef } from "react"
import { AdvancedEditor } from "@/components/advanced-editor"
import { CommandPalette } from "@/components/command-palette"
import { Snippets } from "@/components/snippets"
import { Terminal } from "@/components/terminal"
import { Settings } from "@/components/settings"
import { CodeNavigation } from "@/components/code-navigation"
import { insertSnippetIntoEditor } from "@/components/snippet-manager"
import { Button } from "@/components/ui/button"
import { 
  Search, 
  Settings as SettingsIcon, 
  Terminal as TerminalIcon,
  Code,
  Palette,
  Zap,
  Navigation,
  FileText,
  Save,
  Play,
  Bug
} from "lucide-react"

interface CompleteVSCodeEditorProps {
  content?: string
  language?: string
  onContentChange?: (content: string) => void
  theme?: "vs-dark" | "vs-light" | "hc-black"
}

interface EditorSettings {
  theme: "vs-dark" | "vs-light" | "hc-black"
  fontSize: number
  fontFamily: string
  lineNumbers: "on" | "off" | "relative"
  wordWrap: "on" | "off" | "wordWrapColumn"
  minimap: boolean
  bracketPairColorization: boolean
  guides: {
    bracketPairs: boolean
    indentation: boolean
  }
  suggestOnTriggerCharacters: boolean
  quickSuggestions: boolean
  parameterHints: boolean
  autoSave: boolean
  tabSize: number
  insertSpaces: boolean
  models: any
}

const defaultSettings: EditorSettings = {
  theme: "vs-dark",
  fontSize: 14,
  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  lineNumbers: "on",
  wordWrap: "on",
  minimap: false,
  bracketPairColorization: true,
  guides: {
    bracketPairs: true,
    indentation: true
  },
  suggestOnTriggerCharacters: true,
  quickSuggestions: true,
  parameterHints: true,
  autoSave: true,
  tabSize: 2,
  insertSpaces: true,
  models: {}
}

export function CompleteVSCodeEditor({ 
  content = "", 
  language = "javascript",
  onContentChange,
  theme = "vs-dark"
}: CompleteVSCodeEditorProps) {
  const [settings, setSettings] = useState<EditorSettings>(defaultSettings)
  const [showCommandPalette, setShowCommandPalette] = useState(false)
  const [showSnippets, setShowSnippets] = useState(false)
  const [showTerminal, setShowTerminal] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showCodeNavigation, setShowCodeNavigation] = useState(false)
  const [currentFile, setCurrentFile] = useState("untitled.js")
  const [isDirty, setIsDirty] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [isDebugging, setIsDebugging] = useState(false)
  const editorRef = useRef<any>(null)

  useEffect(() => {
    // ローカルストレージから設定を読み込み
    const savedSettings = localStorage.getItem('armis-editor-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings(prev => ({ ...prev, ...parsed }))
      } catch (error) {
        console.error('Failed to load settings:', error)
      }
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + Shift + P: コマンドパレット
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'P') {
        e.preventDefault()
        setShowCommandPalette(true)
      }
      // Cmd/Ctrl + P: クイックオープン
      else if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault()
        setShowCommandPalette(true)
      }
      // Cmd/Ctrl + S: 保存
      else if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
      // Cmd/Ctrl + ,: 設定
      else if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault()
        setShowSettings(true)
      }
      // Ctrl + `: ターミナル
      else if (e.ctrlKey && e.key === '`') {
        e.preventDefault()
        setShowTerminal(!showTerminal)
      }
      // F5: 実行
      else if (e.key === 'F5') {
        e.preventDefault()
        handleRun()
      }
      // F9: デバッグ
      else if (e.key === 'F9') {
        e.preventDefault()
        handleDebug()
      }
      // Escape: モーダルを閉じる
      else if (e.key === 'Escape') {
        if (showCommandPalette) setShowCommandPalette(false)
        if (showSnippets) setShowSnippets(false)
        if (showSettings) setShowSettings(false)
        if (showCodeNavigation) setShowCodeNavigation(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showTerminal, showCommandPalette, showSnippets, showSettings, showCodeNavigation])

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor
    editor.focus()
  }

  const handleEditorChange = (value: string | undefined) => {
    onContentChange?.(value || "")
    setIsDirty(true)
  }

  const handleCommandExecute = (commandId: string) => {
    console.log('Executing command:', commandId)
    
    switch (commandId) {
      case "workbench.action.showCommands":
        setShowCommandPalette(true)
        break
      case "workbench.action.quickOpen":
        setShowCommandPalette(true)
        break
      case "workbench.action.toggleTerminal":
        setShowTerminal(!showTerminal)
        break
      case "workbench.action.openSettings":
        setShowSettings(true)
        break
      case "file.save":
        handleSave()
        break
      case "file.new":
        handleNewFile()
        break
      case "file.open":
        handleOpenFile()
        break
      case "workbench.action.showAllSymbols":
        setShowCodeNavigation(true)
        break
      case "editor.action.organizeImports":
        handleOrganizeImports()
        break
      case "editor.action.formatDocument":
        handleFormatDocument()
        break
      case "workbench.action.debug.start":
        handleDebug()
        break
      case "workbench.action.debug.run":
        handleRun()
        break
      case "ai.chat":
        // AIチャットを開く
        console.log("Opening AI chat...")
        break
      default:
        console.log("Unknown command:", commandId)
    }
  }

  const handleSave = () => {
    if (editorRef.current) {
      const value = editorRef.current.getValue()
      // 実際の保存処理を実装
      console.log("Saving file:", value)
      setIsDirty(false)
    }
  }

  const handleNewFile = () => {
    if (editorRef.current) {
      editorRef.current.setValue("")
      setCurrentFile("untitled.js")
      setIsDirty(false)
    }
  }

  const handleOpenFile = () => {
    // ファイル選択ダイアログを実装
    console.log("Opening file...")
  }

  const handleOrganizeImports = () => {
    if (editorRef.current) {
      const value = editorRef.current.getValue()
      // インポート文の整理を実装
      console.log("Organizing imports...")
    }
  }

  const handleFormatDocument = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument').run()
    }
  }

  const handleRun = () => {
    setIsRunning(true)
    // 実行処理を実装
    setTimeout(() => {
      setIsRunning(false)
      console.log("Code executed successfully")
    }, 2000)
  }

  const handleDebug = () => {
    setIsDebugging(true)
    // デバッグ処理を実装
    setTimeout(() => {
      setIsDebugging(false)
      console.log("Debug session started")
    }, 1000)
  }

  const handleSnippetInsert = (snippet: any) => {
    if (editorRef.current) {
      const position = editorRef.current.getPosition()
      insertSnippetIntoEditor(editorRef.current, snippet.body, position)
    }
  }

  const handleTerminalCommand = async (command: string): Promise<string> => {
    // ターミナルコマンド実行の実装
    console.log("Executing terminal command:", command)
    return `Executed: ${command}`
  }

  const handleSettingsChange = (newSettings: EditorSettings) => {
    setSettings(newSettings)
    // 設定をローカルストレージに保存
    localStorage.setItem('armis-editor-settings', JSON.stringify(newSettings))
  }

  const handleNavigateToSymbol = (symbol: any) => {
    console.log("Navigating to symbol:", symbol)
  }

  const handleNavigateToReference = (reference: any) => {
    console.log("Navigating to reference:", reference)
  }

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      {/* メニューバー */}
      <div className="flex items-center justify-between p-2 border-b border-zinc-800 bg-zinc-900">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-zinc-200">Armis Editor</span>
          {isDirty && <span className="text-xs text-yellow-400">●</span>}
        </div>
        
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            className="h-8 px-3 text-xs"
            disabled={!isDirty}
          >
            <Save className="h-3 w-3 mr-1" />
            保存
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRun}
            className={`h-8 px-3 text-xs ${isRunning ? 'bg-green-600 text-white' : ''}`}
          >
            <Play className="h-3 w-3 mr-1" />
            実行
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDebug}
            className={`h-8 px-3 text-xs ${isDebugging ? 'bg-red-600 text-white' : ''}`}
          >
                            <Bug className="h-3 w-3 mr-1" />
            デバッグ
          </Button>
        </div>
      </div>

      {/* ツールバー */}
      <div className="flex items-center justify-between p-2 border-b border-zinc-800 bg-zinc-900">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCodeNavigation(true)}
            className="h-8 px-3 text-xs"
          >
            <Navigation className="h-3 w-3 mr-1" />
            ナビゲーション
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSnippets(true)}
            className="h-8 px-3 text-xs"
          >
            <Code className="h-3 w-3 mr-1" />
            スニペット
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTerminal(!showTerminal)}
            className={`h-8 px-3 text-xs ${showTerminal ? 'bg-blue-600 text-white' : ''}`}
          >
            <TerminalIcon className="h-3 w-3 mr-1" />
            ターミナル
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-xs text-zinc-400">{currentFile}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCommandPalette(true)}
            className="h-8 px-3 text-xs"
          >
            <Palette className="h-3 w-3 mr-1" />
            コマンド
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(true)}
            className="h-8 px-3 text-xs"
          >
            <SettingsIcon className="h-3 w-3 mr-1" />
            設定
          </Button>
        </div>
      </div>

      {/* メインエディター */}
      <div className="flex-1 overflow-hidden">
        <AdvancedEditor
          content={content}
          language={language}
          onContentChange={handleEditorChange}
          theme={settings.theme}
          settings={settings}
        />
      </div>

      {/* コマンドパレット */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onCommandExecute={handleCommandExecute}
      />

      {/* スニペット */}
      <Snippets
        isOpen={showSnippets}
        onClose={() => setShowSnippets(false)}
        onSnippetInsert={handleSnippetInsert}
        currentLanguage={language}
      />

      {/* ターミナル */}
      <Terminal
        isOpen={showTerminal}
        onClose={() => setShowTerminal(false)}
        onCommandExecute={handleTerminalCommand}
      />

      {/* 設定 */}
      <Settings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSettingsChange={handleSettingsChange}
      />

      {/* コードナビゲーション */}
      {showCodeNavigation && (
        <CodeNavigation
          editor={editorRef.current}
          currentFile={currentFile}
          onNavigateToSymbol={handleNavigateToSymbol}
          onNavigateToReference={handleNavigateToReference}
        />
      )}
    </div>
  )
} 