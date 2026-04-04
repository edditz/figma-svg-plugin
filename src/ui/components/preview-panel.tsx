import { AlertTriangle, CheckCircle2, Code2, ImageIcon } from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { PreviewSelection } from "@/ui/types"

interface PreviewPanelProps {
  preview: PreviewSelection
}

export function PreviewPanel({ preview }: PreviewPanelProps) {
  if (!preview.icon) {
    return (
      <section className="rounded-[28px] border border-white/10 bg-panel px-4 py-4 shadow-panel">
        <div className="rounded-[22px] border border-dashed border-white/10 bg-white/5 px-4 py-8 text-center">
          <p className="text-[14px] font-semibold text-foreground">预览面板</p>
          <p className="mt-2 text-[12px] leading-5 text-muted-foreground">
            点击左侧任意图标项，可查看尺寸、警告与转换后的 XML 摘要。
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="rounded-[28px] border border-white/10 bg-panel px-4 py-4 shadow-panel">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[14px] font-semibold text-foreground">细节预览</p>
          <p className="text-[12px] text-muted-foreground">{preview.icon.name}</p>
        </div>
        <div className="rounded-full bg-white/5 px-3 py-1 text-[11px] text-muted-foreground">
          {preview.icon.width} × {preview.icon.height}
        </div>
      </div>

      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="w-full rounded-2xl bg-white/5">
          <TabsTrigger className="flex-1 rounded-xl" value="summary">
            摘要
          </TabsTrigger>
          <TabsTrigger className="flex-1 rounded-xl" value="xml">
            XML
          </TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[22px] border border-white/8 bg-white/[0.04] p-4">
                <div className="mb-2 flex items-center gap-2 text-[12px] text-muted-foreground">
                  <ImageIcon className="h-4 w-4" /> SVG 状态
                </div>
                <p className="text-[13px] font-semibold text-foreground">
                  {preview.sourceSvg ? "已导出源 SVG，可用于对照" : "尚未转换，等待生成结果"}
                </p>
              </div>
              <div className="rounded-[22px] border border-white/8 bg-white/[0.04] p-4">
                <div className="mb-2 flex items-center gap-2 text-[12px] text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4" /> 告警统计
                </div>
                <p className="text-[13px] font-semibold text-foreground">
                  {preview.warnings.length === 0 ? "未发现高风险问题" : `${preview.warnings.length} 条提示`}
                </p>
              </div>
            </div>

            {preview.sourceSvg && (
              <div className="rounded-[22px] border border-white/8 bg-white/[0.04] p-4">
                <div className="mb-3 text-[12px] text-muted-foreground">源图快速预览</div>
                <div className="grid min-h-[120px] place-content-center rounded-[18px] border border-white/10 bg-[#0C1020] p-4">
                  <img
                    alt={preview.icon.name}
                    className="max-h-24 max-w-full object-contain"
                    src={`data:image/svg+xml;utf8,${encodeURIComponent(preview.sourceSvg)}`}
                  />
                </div>
              </div>
            )}

            <div className="rounded-[22px] border border-white/8 bg-white/[0.04] p-4">
              <div className="mb-3 flex items-center gap-2 text-[12px] text-muted-foreground">
                <AlertTriangle className="h-4 w-4" /> 转换提示
              </div>
              <div className="flex flex-wrap gap-2">
                {preview.warnings.length === 0 ? (
                  <span className="rounded-full border border-success/20 bg-success/10 px-3 py-1 text-[11px] text-success">
                    当前图标适合直接转换
                  </span>
                ) : (
                  preview.warnings.map((warning) => (
                    <span
                      key={warning.code}
                      className="rounded-full border border-warning/20 bg-warning/10 px-3 py-1 text-[11px] text-warning"
                    >
                      {warning.message}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="xml">
          <div className="rounded-[22px] border border-white/8 bg-[#0D1120] p-4">
            <div className="mb-3 flex items-center gap-2 text-[12px] text-muted-foreground">
              <Code2 className="h-4 w-4" /> 输出片段
            </div>
            <pre className="max-h-[220px] overflow-auto whitespace-pre-wrap break-all text-[11px] leading-5 text-[#CFE0FF]">
              {preview.xml ?? "转换完成后，这里会显示对应的 VectorDrawable XML。"}
            </pre>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  )
}
