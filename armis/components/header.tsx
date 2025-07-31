import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Save, Settings } from "lucide-react"

export function Header() {
  return (
    <header className="h-10 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between px-4">
      <div className="flex items-center">
        <div className="flex items-center mr-6">
          <Image src="/images/icon.png" alt="Armis Logo" width={24} height={24} className="mr-2" />
          <h1 className="text-sm font-semibold text-white">Armis</h1>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon" className="text-zinc-300 hover:text-white">
          <Save className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-zinc-300 hover:text-white">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
