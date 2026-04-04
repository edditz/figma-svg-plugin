import { Layers3, RefreshCcw, Sparkles, Wand2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface HeaderBarProps {
  total: number
  selected: number
  scanning: boolean
  converting: boolean
  hasResults: boolean
  onRefresh: () => void
  onSelectAll: () => void
  onInvert: () => void
  onOpenResults: () => void
}

export function HeaderBar({
  total,
  selected,
  scanning,
  converting,
  hasResults,
  onRefresh,
  onSelectAll,
  onInvert,
  onOpenResults,
}: HeaderBarProps) {
  return (
    <TooltipProvider delayDuration={120}>
      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-panel/80 px-4 pb-5 pt-3 backdrop-blur-xl">
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 shrink-0 place-content-center rounded-2xl border border-white/10 bg-white/5 shadow-glow">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-[20px] font-bold text-foreground">
                <span>SVG → VectorDrawable</span>
                <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
                  Figma
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[12px] text-muted-foreground">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-1">
                  <Layers3 className="h-3.5 w-3.5" /> {total} 个候选
                </span>
                <span className="rounded-full bg-primary/10 px-2 py-1 text-primary">
                  已勾选 {selected}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-10 w-10 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10"
                  disabled={scanning || converting}
                  onClick={onRefresh}
                >
                  <RefreshCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>重新扫描当前选区</TooltipContent>
            </Tooltip>
            <Button
              size="sm"
              variant="outline"
              className="rounded-2xl border-white/10 bg-white/5 hover:bg-white/10"
              disabled={total === 0 || converting}
              onClick={onSelectAll}
            >
              全选
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="rounded-2xl border-white/10 bg-white/5 hover:bg-white/10"
              disabled={total === 0 || converting}
              onClick={onInvert}
            >
              反选
            </Button>
            <Button
              size="sm"
              className="rounded-2xl bg-gradient-to-r from-primary to-accent text-white shadow-glow hover:opacity-90"
              disabled={!hasResults}
              onClick={onOpenResults}
            >
              <Wand2 className="mr-2 h-4 w-4" /> 查看结果
            </Button>
          </div>
        </div>
      </header>
    </TooltipProvider>
  )
}
