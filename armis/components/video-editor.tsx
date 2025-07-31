"use client"

import { useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, SkipBack, SkipForward, Scissors, Volume2, Maximize, ZoomIn, ZoomOut } from "lucide-react"

interface VideoEditorProps {
  selectedAsset: string | null
  currentTime: number
  isPlaying: boolean
  onPlayPause: () => void
}

export function VideoEditor({ selectedAsset, currentTime, isPlaying, onPlayPause }: VideoEditorProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play()
      } else {
        videoRef.current.pause()
      }
    }
  }, [isPlaying])

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = currentTime
    }
  }, [currentTime])

  return (
    <div className="flex-1 bg-black flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        {selectedAsset ? (
          <video
            ref={videoRef}
            className="max-h-full max-w-full"
            src="/placeholder.svg?height=720&width=1280"
            poster="/placeholder.svg?height=720&width=1280"
          />
        ) : (
          <div className="text-zinc-500 text-center">
            <p>アセットを選択してください</p>
            <p className="text-sm">左側のパネルからビデオ、画像、またはドキュメントを選択</p>
          </div>
        )}
      </div>

      <div className="p-2 bg-zinc-900 border-t border-zinc-800 flex items-center">
        <div className="flex items-center space-x-1 mr-4">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-300 hover:text-white">
            <SkipBack className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-300 hover:text-white" onClick={onPlayPause}>
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-300 hover:text-white">
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-2 mr-4">
          <span className="text-xs text-zinc-300">00:00:00</span>
          <Slider className="w-32" defaultValue={[0]} max={100} step={1} />
          <span className="text-xs text-zinc-300">00:01:30</span>
        </div>

        <div className="flex items-center space-x-1 mr-4">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-300 hover:text-white">
            <Scissors className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-300 hover:text-white">
            <Volume2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="ml-auto flex items-center space-x-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-300 hover:text-white">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs text-zinc-300">100%</span>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-300 hover:text-white">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-300 hover:text-white">
            <Maximize className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
