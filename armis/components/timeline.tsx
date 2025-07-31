"use client"

import type React from "react"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, Video, ImageIcon, Music, Type, Plus } from "lucide-react"

interface TimelineProps {
  currentTime: number
  onTimeUpdate: (time: number) => void
  isPlaying: boolean
  onPlayPause: () => void
}

export function Timeline({ currentTime, onTimeUpdate, isPlaying, onPlayPause }: TimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null)

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (timelineRef.current) {
      const rect = timelineRef.current.getBoundingClientRect()
      const clickPosition = e.clientX - rect.left
      const percentage = clickPosition / rect.width
      const newTime = percentage * 90 // Assuming 90 seconds total duration
      onTimeUpdate(newTime)
    }
  }

  return (
    <div className="h-48 border-t border-zinc-800 bg-black flex flex-col">
      <div className="flex items-center justify-between p-2 border-b border-zinc-800">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" className="text-xs text-zinc-300 hover:text-white">
            タイムライン
            <ChevronDown className="ml-1 h-3 w-3" />
          </Button>
        </div>
        <div className="flex items-center space-x-1">
          <Button variant="outline" size="sm" className="h-7 text-xs border-zinc-700 text-zinc-300">
            <Plus className="mr-1 h-3 w-3" />
            トラック追加
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="flex">
          <div className="w-32 flex-shrink-0 border-r border-zinc-800">
            <div className="h-8 flex items-center px-2 border-b border-zinc-800 bg-zinc-900">
              <Video className="h-3.5 w-3.5 mr-1" />
              <span className="text-xs text-zinc-300">ビデオ</span>
            </div>
            <div className="h-8 flex items-center px-2 border-b border-zinc-800 bg-zinc-900">
              <ImageIcon className="h-3.5 w-3.5 mr-1" />
              <span className="text-xs text-zinc-300">画像</span>
            </div>
            <div className="h-8 flex items-center px-2 border-b border-zinc-800 bg-zinc-900">
              <Type className="h-3.5 w-3.5 mr-1" />
              <span className="text-xs text-zinc-300">テキスト</span>
            </div>
            <div className="h-8 flex items-center px-2 border-b border-zinc-800 bg-zinc-900">
              <Music className="h-3.5 w-3.5 mr-1" />
              <span className="text-xs text-zinc-300">音声</span>
            </div>
          </div>

          <div ref={timelineRef} className="flex-1 relative bg-zinc-950" onClick={handleTimelineClick}>
            {/* Time markers */}
            <div className="h-6 border-b border-zinc-800 flex">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex-1 border-r border-zinc-800 text-xs text-zinc-500 pl-1">
                  {i * 10}s
                </div>
              ))}
            </div>

            {/* Video track */}
            <div className="h-8 border-b border-zinc-800 relative">
              <div className="absolute top-1 left-10 h-6 w-40 bg-emerald-500/20 border border-emerald-500 rounded-sm">
                <div className="text-xs p-1 truncate text-emerald-300">intro.mp4</div>
              </div>
            </div>

            {/* Image track */}
            <div className="h-8 border-b border-zinc-800 relative">
              <div className="absolute top-1 left-52 h-6 w-24 bg-emerald-500/20 border border-emerald-500 rounded-sm">
                <div className="text-xs p-1 truncate text-emerald-300">slide1.png</div>
              </div>
            </div>

            {/* Text track */}
            <div className="h-8 border-b border-zinc-800 relative">
              <div className="absolute top-1 left-52 h-6 w-32 bg-emerald-500/20 border border-emerald-500 rounded-sm">
                <div className="text-xs p-1 truncate text-emerald-300">タイトル</div>
              </div>
            </div>

            {/* Audio track */}
            <div className="h-8 border-b border-zinc-800 relative">
              <div className="absolute top-1 left-10 h-6 w-80 bg-emerald-500/20 border border-emerald-500 rounded-sm">
                <div className="text-xs p-1 truncate text-emerald-300">narration.mp3</div>
              </div>
            </div>

            {/* Playhead */}
            <div
              className="absolute top-0 bottom-0 w-px bg-emerald-500 z-10"
              style={{ left: `${(currentTime / 90) * 100}%` }}
            >
              <div className="w-3 h-3 bg-emerald-500 rounded-full -translate-x-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
