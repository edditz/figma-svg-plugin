import { AlertTriangle, Eye, Layers2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { UiIconItem } from "@/ui/types"

interface IconListProps {
  items: UiIconItem[]
  activeId?: string
  disabled?: boolean
  onToggle: (id: string, checked: boolean) => void
  onFocus: (id: string) => void
  onReveal: (id: string) => void
  onFileNameChange: (id: string, fileName: string) => void
}

export function IconList({
  items,
  activeId,
  disabled,
  onToggle,
  onFocus,
  onReveal,
  onFileNameChange,
}: IconListProps) {
  if (items.length === 0) {
    return (
      <section className="rounded-[28px] border border-white/10 bg-panel px-4 py-5 shadow-panel">
        <div className="flex flex-col items-center justify-center gap-3 rounded-[22px] border border-dashed border-white/10 bg-white/5 px-6 py-10 text-center">
          <Layers2 className="h-9 w-9 text-muted-foreground" />
          <div className="space-y-1">
            <p className="text-[14px] font-semibold text-foreground">当前没有可转换图标</p>
            <p className="max-w-sm text-[12px] leading-5 text-muted-foreground">
              在 Figma 里选中包含矢量内容的图标、组件或小尺寸分组后，点击顶部“重新扫描”即可识别候选项。
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="rounded-[28px] border border-white/10 bg-panel px-4 py-4 shadow-panel">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-[14px] font-semibold text-foreground">候选图标列表</p>
          <p className="text-[12px] text-muted-foreground">支持逐项命名、勾选与回选到 Figma 画布。</p>
        </div>
        <div className="rounded-full bg-white/5 px-3 py-1 text-[11px] text-muted-foreground">
          已识别 {items.length} 项
        </div>
      </div>

      <div>
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div
              key={item.id}
              className={cn(
                "rounded-[24px] border border-white/8 bg-white/[0.04] p-4 transition-all duration-200",
                item.id === activeId && "border-primary/40 bg-primary/10 shadow-glow",
              )}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={item.selected}
                  disabled={disabled}
                  onCheckedChange={(checked) => onToggle(item.id, Boolean(checked))}
                />
                <button
                  className="flex flex-1 cursor-pointer flex-col gap-2 rounded-2xl text-left"
                  onClick={() => onFocus(item.id)}
                  type="button"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[14px] font-semibold text-foreground">{item.name}</p>
                      <p className="text-[12px] text-muted-foreground">
                        {item.nodeType} · {item.width} × {item.height}
                      </p>
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-accent">
                      {item.selected ? "Ready" : "Skip"}
                    </div>
                  </div>

                  {item.warnings.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {item.warnings.slice(0, 2).map((warning) => (
                        <span
                          key={`${item.id}-${warning.code}`}
                          className="inline-flex items-center gap-1 rounded-full border border-warning/20 bg-warning/10 px-2 py-1 text-[10px] text-warning"
                        >
                          <AlertTriangle className="h-3 w-3" />
                          {warning.message}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <Input
                  className="h-10 rounded-2xl border-white/10 bg-white/5 text-[12px]"
                  disabled={disabled}
                  value={item.fileName}
                  onChange={(event) => onFileNameChange(item.id, event.target.value)}
                />
                <Button
                  size="icon"
                  variant="outline"
                  className="aspect-square h-10 w-10 rounded-full border-white/10 bg-white/5 hover:bg-white/10"
                  disabled={disabled}
                  onClick={() => onReveal(item.id)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
