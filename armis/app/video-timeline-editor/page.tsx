"use client"

import { useState } from "react"
import { VideoTimelineEditor } from "@/components/video-timeline-editor"

export default function VideoTimelineEditorPage() {
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null)

  return (
    <div className="h-screen w-full">
      <VideoTimelineEditor 
        selectedAsset={selectedAsset}
        onAssetSelect={setSelectedAsset}
      />
    </div>
  )
}
