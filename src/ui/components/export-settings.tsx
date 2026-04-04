import { FolderOpen, PackageOpen } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import type { ExportSettingsState } from "@/ui/types"

interface ExportSettingsProps {
  settings: ExportSettingsState
  directoryLabel?: string
  disabled?: boolean
  onPickDirectory: () => void
  onChange: (nextSettings: ExportSettingsState) => void
}

export function ExportSettings({
  settings,
  directoryLabel,
  disabled,
  onPickDirectory,
  onChange,
}: ExportSettingsProps) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-panel px-4 py-4 shadow-panel">
      <div className="mb-4 space-y-1">
        <p className="text-[14px] font-semibold text-foreground">导出设置</p>
        <p className="text-[12px] leading-5 text-muted-foreground">
          设置 Android 资源目录、命名前后缀与压缩精度。插件优先写入你选择的本地目录，不支持时自动回退为 ZIP 下载。
        </p>
      </div>

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="output-directory">输出资源路径</Label>
          <Input
            id="output-directory"
            className="h-11 rounded-2xl border-white/10 bg-white/5"
            disabled={disabled}
            value={settings.outputSubdirectory}
            onChange={(event) =>
              onChange({ ...settings, outputSubdirectory: event.target.value })
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label htmlFor="prefix">文件名前缀</Label>
            <Input
              id="prefix"
              className="h-11 rounded-2xl border-white/10 bg-white/5"
              disabled={disabled}
              value={settings.prefix}
              onChange={(event) => onChange({ ...settings, prefix: event.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="suffix">文件名后缀</Label>
            <Input
              id="suffix"
              className="h-11 rounded-2xl border-white/10 bg-white/5"
              disabled={disabled}
              value={settings.suffix}
              onChange={(event) => onChange({ ...settings, suffix: event.target.value })}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="precision">数值精度</Label>
          <Input
            id="precision"
            className="h-11 rounded-2xl border-white/10 bg-white/5"
            disabled={disabled}
            min={2}
            max={5}
            type="number"
            value={settings.precision}
            onChange={(event) =>
              onChange({
                ...settings,
                precision: Math.max(2, Math.min(5, Number(event.target.value) || 4)),
              })
            }
          />
        </div>

        <Separator className="bg-white/10" />

        <div className="flex items-center justify-between rounded-[22px] border border-white/8 bg-white/[0.04] px-4 py-3">
          <div className="space-y-1">
            <p className="text-[13px] font-semibold text-foreground">启用安全压缩</p>
            <p className="text-[12px] leading-5 text-muted-foreground">
              自动收敛小数位、删除冗余属性，尽可能减小 XML 体积。
            </p>
          </div>
          <Switch
            checked={settings.optimize}
            disabled={disabled}
            onCheckedChange={(checked) => onChange({ ...settings, optimize: checked })}
          />
        </div>

        <div className="flex flex-col gap-3 rounded-[22px] border border-white/8 bg-white/[0.04] p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-[13px] font-semibold text-foreground">本地保存目录</p>
              <p className="text-[12px] text-muted-foreground">
                {directoryLabel ? `已选择：${directoryLabel}` : "未选择目录时，导出按钮将生成 ZIP 下载。"}
              </p>
            </div>
            <Button
              variant="outline"
              className="rounded-2xl border-white/10 bg-white/5 hover:bg-white/10"
              disabled={disabled}
              onClick={onPickDirectory}
            >
              <FolderOpen className="mr-2 h-4 w-4" /> 选择目录
            </Button>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-accent/10 px-3 py-2 text-[12px] text-accent">
            <PackageOpen className="h-4 w-4" />
            ZIP 导出会保留上方填写的相对目录结构。
          </div>
        </div>
      </div>
    </section>
  )
}
