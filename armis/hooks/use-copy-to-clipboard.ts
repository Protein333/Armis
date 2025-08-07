"use client"

import { useState, useCallback } from "react"
import { toast } from "sonner"

interface UseCopyToClipboardOptions {
  text: string
  copyMessage?: string
}

export function useCopyToClipboard({ text, copyMessage }: UseCopyToClipboardOptions) {
  const [isCopied, setIsCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      setIsCopied(true)
      
      if (copyMessage) {
        toast.success(copyMessage)
      }
      
      setTimeout(() => {
        setIsCopied(false)
      }, 2000)
    } catch (error) {
      console.error("Failed to copy to clipboard:", error)
      toast.error("クリップボードにコピーできませんでした")
    }
  }, [text, copyMessage])

  return {
    isCopied,
    handleCopy,
  }
}
