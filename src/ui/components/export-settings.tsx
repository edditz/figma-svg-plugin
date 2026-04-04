import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import type { ExportSettingsState } from "@/ui/types"

interface ExportSettingsProps {
  settings: ExportSettingsState
  disabled?: boolean
  onChange: (nextSettings: ExportSettingsState) => void
}

export function ExportSettings({
  settings,
  disabled,
  onChange,
}: ExportSettingsProps) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-panel px-4 py-4 shadow-panel">
      <div className="mb-4 space-y-1">
        <p className="text-[14px] font-semibold text-foreground">导出设置</p>
        <p className="text-[12px] leading-5 text-muted-foreground">
          设置命名前后缀与压缩精度。转换完成后将打包为 ZIP 下载。
        </p>
      </div>

      <div className="grid gap-4">
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
      </div>
    </section>
  )
}
