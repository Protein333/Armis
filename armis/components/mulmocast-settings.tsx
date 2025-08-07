'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Settings, Save, RefreshCw } from 'lucide-react'
import { MulmocastConfig } from '@/lib/mulmocast'

interface MulmocastSettingsProps {
  config: MulmocastConfig
  onConfigChange: (config: MulmocastConfig) => void
  onClose: () => void
}

export function MulmocastSettings({ config, onConfigChange, onClose }: MulmocastSettingsProps) {
  const [localConfig, setLocalConfig] = useState<MulmocastConfig>(config)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      onConfigChange(localConfig)
      // Simulate save delay
      await new Promise(resolve => setTimeout(resolve, 500))
      onClose()
    } catch (error) {
      console.error('Failed to save configuration:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    setLocalConfig(config)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Mulmocast Settings
        </CardTitle>
        <CardDescription>
          Configure mulmocast-cli connection and behavior
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Enable/Disable */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="enabled">Enable Mulmocast</Label>
            <p className="text-sm text-muted-foreground">
              Enable mulmocast-cli functionality
            </p>
          </div>
          <Switch
            id="enabled"
            checked={localConfig.enabled}
            onCheckedChange={(checked) => 
              setLocalConfig(prev => ({ ...prev, enabled: checked }))
            }
          />
        </div>

        <Separator />

        {/* Server URL */}
        <div className="space-y-2">
          <Label htmlFor="serverUrl">Server URL</Label>
          <Input
            id="serverUrl"
            type="url"
            placeholder="ws://localhost:8080"
            value={localConfig.serverUrl || ''}
            onChange={(e) => 
              setLocalConfig(prev => ({ ...prev, serverUrl: e.target.value }))
            }
          />
          <p className="text-xs text-muted-foreground">
            WebSocket URL for mulmocast server
          </p>
        </div>

        {/* API Key */}
        <div className="space-y-2">
          <Label htmlFor="apiKey">API Key (Optional)</Label>
          <Input
            id="apiKey"
            type="password"
            placeholder="Enter API key if required"
            value={localConfig.apiKey || ''}
            onChange={(e) => 
              setLocalConfig(prev => ({ ...prev, apiKey: e.target.value }))
            }
          />
          <p className="text-xs text-muted-foreground">
            Authentication key for the mulmocast server
          </p>
        </div>

        {/* Auto Connect */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="autoConnect">Auto Connect</Label>
            <p className="text-sm text-muted-foreground">
              Automatically connect on startup
            </p>
          </div>
          <Switch
            id="autoConnect"
            checked={localConfig.autoConnect}
            onCheckedChange={(checked) => 
              setLocalConfig(prev => ({ ...prev, autoConnect: checked }))
            }
          />
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isSaving}
          >
            Reset
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 