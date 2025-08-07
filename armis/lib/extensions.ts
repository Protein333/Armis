import { v4 as uuidv4 } from 'uuid'

export interface Extension {
  id: string
  name: string
  displayName: string
  description: string
  version: string
  publisher: string
  icon?: string
  repository?: string
  homepage?: string
  license?: string
  categories: string[]
  keywords: string[]
  engines: {
    vscode: string
  }
  activationEvents: string[]
  main: string
  contributes?: ExtensionContributes
  isEnabled: boolean
  isInstalled: boolean
  isBuiltin: boolean
}

export interface ExtensionContributes {
  commands?: ExtensionCommand[]
  keybindings?: ExtensionKeybinding[]
  menus?: Record<string, ExtensionMenuItem[]>
  views?: Record<string, ExtensionView[]>
  languages?: ExtensionLanguage[]
  themes?: ExtensionTheme[]
  snippets?: ExtensionSnippet[]
  configuration?: ExtensionConfiguration
}

export interface ExtensionCommand {
  command: string
  title: string
  category?: string
  icon?: string
}

export interface ExtensionKeybinding {
  command: string
  key: string
  when?: string
  mac?: string
  linux?: string
  win?: string
}

export interface ExtensionMenuItem {
  command: string
  when?: string
  group?: string
}

export interface ExtensionView {
  id: string
  name: string
  when?: string
}

export interface ExtensionLanguage {
  id: string
  extensions: string[]
  aliases?: string[]
  configuration?: string
}

export interface ExtensionTheme {
  label: string
  uiTheme: 'vs' | 'vs-dark' | 'hc-black' | 'hc-light'
  path: string
}

export interface ExtensionSnippet {
  language: string
  path: string
}

export interface ExtensionConfiguration {
  title: string
  properties: Record<string, any>
}

export interface ExtensionContext {
  subscriptions: Array<{ dispose: () => void }>
  extensionPath: string
  globalState: ExtensionGlobalState
  workspaceState: ExtensionWorkspaceState
}

export interface ExtensionGlobalState {
  get<T>(key: string, defaultValue?: T): T
  update(key: string, value: any): Promise<void>
}

export interface ExtensionWorkspaceState {
  get<T>(key: string, defaultValue?: T): T
  update(key: string, value: any): Promise<void>
}

export interface ExtensionAPI {
  registerCommand(command: string, callback: (...args: any[]) => any): void
  registerTextEditorCommand(command: string, callback: (textEditor: any, edit: any, ...args: any[]) => void): void
  registerLanguageProvider(language: string, provider: any): void
  registerCompletionProvider(language: string, provider: any): void
  registerHoverProvider(language: string, provider: any): void
  registerDefinitionProvider(language: string, provider: any): void
  registerReferenceProvider(language: string, provider: any): void
  registerCodeActionProvider(language: string, provider: any): void
  registerDocumentFormattingEditProvider(language: string, provider: any): void
  registerDocumentRangeFormattingEditProvider(language: string, provider: any): void
  registerOnTypeFormattingEditProvider(language: string, provider: any): void
  registerSignatureHelpProvider(language: string, provider: any): void
  registerRenameProvider(language: string, provider: any): void
  registerDocumentSymbolProvider(language: string, provider: any): void
  registerWorkspaceSymbolProvider(provider: any): void
  registerCodeLensProvider(language: string, provider: any): void
  registerOutlineProvider(language: string, provider: any): void
  registerFoldingRangeProvider(language: string, provider: any): void
  registerColorProvider(language: string, provider: any): void
  registerDocumentHighlightProvider(language: string, provider: any): void
  registerDocumentLinkProvider(language: string, provider: any): void
  registerImplementationProvider(language: string, provider: any): void
  registerTypeDefinitionProvider(language: string, provider: any): void
  registerDeclarationProvider(language: string, provider: any): void
  registerCallHierarchyProvider(language: string, provider: any): void
  registerInlayHintsProvider(language: string, provider: any): void
  registerSemanticTokensProvider(language: string, provider: any): void
  registerFileSystemProvider(scheme: string, provider: any): void
  registerWebviewViewProvider(viewType: string, provider: any): void
  registerWebviewPanelSerializer(viewType: string, serializer: any): void
  registerUriHandler(handler: any): void
  registerAuthenticationProvider(id: string, provider: any): void
  registerDebugAdapterDescriptorFactory(debugType: string, factory: any): void
  registerDebugConfigurationProvider(debugType: string, provider: any): void
  registerDebugAdapterTrackerFactory(debugType: string, factory: any): void
  registerTaskProvider(type: string, provider: any): void
  registerFileDecorationProvider(provider: any): void
  registerNotebookSerializer(notebookType: string, serializer: any): void
  registerNotebookProvider(notebookType: string, provider: any): void
  registerNotebookKernelProvider(selector: any, provider: any): void
  registerNotebookContentProvider(notebookType: string, provider: any): void
  registerNotebookOutputRenderer(id: string, renderer: any): void
  registerNotebookEditorProvider(notebookType: string, provider: any): void
  registerNotebookKernel(selector: any, kernel: any): void
  registerNotebookSerializer(notebookType: string, serializer: any): void
  registerNotebookProvider(notebookType: string, provider: any): void
  registerNotebookKernelProvider(selector: any, provider: any): void
  registerNotebookContentProvider(notebookType: string, provider: any): void
  registerNotebookOutputRenderer(id: string, renderer: any): void
  registerNotebookEditorProvider(notebookType: string, provider: any): void
  registerNotebookKernel(selector: any, kernel: any): void
}

export class ExtensionManager {
  private extensions: Map<string, Extension> = new Map()
  private enabledExtensions: Set<string> = new Set()
  private extensionContexts: Map<string, ExtensionContext> = new Map()
  private extensionAPIs: Map<string, ExtensionAPI> = new Map()

  constructor() {
    this.loadBuiltinExtensions()
  }

  // 拡張機能のインストール
  async installExtension(extensionPath: string): Promise<Extension> {
    try {
      const extension = await this.loadExtension(extensionPath)
      this.extensions.set(extension.id, extension)
      return extension
    } catch (error) {
      console.error('Error installing extension:', error)
      throw error
    }
  }

  // 拡張機能のアンインストール
  async uninstallExtension(extensionId: string): Promise<boolean> {
    const extension = this.extensions.get(extensionId)
    if (!extension) return false

    await this.disableExtension(extensionId)
    this.extensions.delete(extensionId)
    return true
  }

  // 拡張機能の有効化
  async enableExtension(extensionId: string): Promise<boolean> {
    const extension = this.extensions.get(extensionId)
    if (!extension || !extension.isInstalled) return false

    extension.isEnabled = true
    this.enabledExtensions.add(extensionId)
    await this.activateExtension(extensionId)
    return true
  }

  // 拡張機能の無効化
  async disableExtension(extensionId: string): Promise<boolean> {
    const extension = this.extensions.get(extensionId)
    if (!extension) return false

    extension.isEnabled = false
    this.enabledExtensions.delete(extensionId)
    await this.deactivateExtension(extensionId)
    return true
  }

  // 拡張機能のアクティベート
  private async activateExtension(extensionId: string): Promise<void> {
    const extension = this.extensions.get(extensionId)
    if (!extension) return

    const context = this.createExtensionContext(extension)
    this.extensionContexts.set(extensionId, context)

    try {
      // 拡張機能のメインファイルを読み込み、アクティベート
      const extensionModule = await this.loadExtensionModule(extension.main, context)
      if (extensionModule.activate) {
        await extensionModule.activate(context)
      }
    } catch (error) {
      console.error(`Error activating extension ${extensionId}:`, error)
    }
  }

  // 拡張機能のディアクティベート
  private async deactivateExtension(extensionId: string): Promise<void> {
    const context = this.extensionContexts.get(extensionId)
    if (!context) return

    // サブスクリプションを破棄
    context.subscriptions.forEach(subscription => subscription.dispose())
    this.extensionContexts.delete(extensionId)
  }

  // 拡張機能の読み込み
  private async loadExtension(extensionPath: string): Promise<Extension> {
    // 実際の実装では、package.jsonを読み込んで拡張機能の情報を取得
    const extension: Extension = {
      id: uuidv4(),
      name: 'sample-extension',
      displayName: 'Sample Extension',
      description: 'A sample extension for Armis',
      version: '1.0.0',
      publisher: 'armis',
      categories: ['Other'],
      keywords: ['sample'],
      engines: { vscode: '^1.0.0' },
      activationEvents: ['*'],
      main: 'extension.js',
      isEnabled: false,
      isInstalled: true,
      isBuiltin: false
    }

    return extension
  }

  // 拡張機能モジュールの読み込み
  private async loadExtensionModule(mainPath: string, context: ExtensionContext): Promise<any> {
    // 実際の実装では、拡張機能のメインファイルを読み込む
    return {
      activate: (context: ExtensionContext) => {
        console.log('Extension activated')
      }
    }
  }

  // 拡張機能コンテキストの作成
  private createExtensionContext(extension: Extension): ExtensionContext {
    return {
      subscriptions: [],
      extensionPath: `/extensions/${extension.id}`,
      globalState: {
        get: (key: string, defaultValue?: any) => defaultValue,
        update: async (key: string, value: any) => {
          // グローバル状態の更新
        }
      },
      workspaceState: {
        get: (key: string, defaultValue?: any) => defaultValue,
        update: async (key: string, value: any) => {
          // ワークスペース状態の更新
        }
      }
    }
  }

  // ビルトイン拡張機能の読み込み
  private loadBuiltinExtensions(): void {
    const builtinExtensions: Extension[] = [
      {
        id: 'armis-core',
        name: 'armis-core',
        displayName: 'Armis Core',
        description: 'Core functionality for Armis editor',
        version: '1.0.0',
        publisher: 'armis',
        categories: ['Core'],
        keywords: ['core'],
        engines: { vscode: '^1.0.0' },
        activationEvents: ['*'],
        main: 'core.js',
        isEnabled: true,
        isInstalled: true,
        isBuiltin: true
      }
    ]

    builtinExtensions.forEach(extension => {
      this.extensions.set(extension.id, extension)
      if (extension.isEnabled) {
        this.enabledExtensions.add(extension.id)
      }
    })
  }

  // インストール済み拡張機能の取得
  getInstalledExtensions(): Extension[] {
    return Array.from(this.extensions.values())
  }

  // 有効な拡張機能の取得
  getEnabledExtensions(): Extension[] {
    return Array.from(this.enabledExtensions).map(id => this.extensions.get(id)!)
  }

  // 拡張機能の検索
  searchExtensions(query: string): Extension[] {
    const results: Extension[] = []
    const searchRegex = new RegExp(query, 'i')

    for (const extension of this.extensions.values()) {
      if (
        searchRegex.test(extension.name) ||
        searchRegex.test(extension.displayName) ||
        searchRegex.test(extension.description) ||
        extension.keywords.some(keyword => searchRegex.test(keyword))
      ) {
        results.push(extension)
      }
    }

    return results
  }

  // 拡張機能の取得
  getExtension(extensionId: string): Extension | undefined {
    return this.extensions.get(extensionId)
  }
} 