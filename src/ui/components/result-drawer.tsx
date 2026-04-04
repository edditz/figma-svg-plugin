import { Download, FolderSymlink, Sparkles, TriangleAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { VectorDrawableResult } from "@/shared/types"
import type { ResultSummary } from "@/ui/types"

interface ResultDrawerProps {
  open: boolean
  results: VectorDrawableResult[]
  summary: ResultSummary
  directoryLabel?: string
  onOpenChange: (open: boolean) => void
  onDownloadZip: () => void
  onWriteDirectory: () => void
  onDownloadSingle: (result: VectorDrawableResult) => void
}

export function ResultDrawer({
  open,
  results,
  summary,
  directoryLabel,
  onOpenChange,
  onDownloadZip,
  onWriteDirectory,
  onDownloadSingle,
}: ResultDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="w-[96vw] max-w-[560px] border-white/10 bg-[#101429]/95 px-0 text-foreground backdrop-blur-2xl"
        side="right"
      >
        <SheetHeader className="border-b border-white/10 px-6 pb-4">
          <SheetTitle className="text-[20px] font-bold">转换结果</SheetTitle>
          <SheetDescription>
            {summary.successCount} 成功 / {summary.failedCount} 失败，平均体积变化 {summary.averageSaving}%
          </SheetDescription>
        </SheetHeader>

        <div className="grid grid-cols-3 gap-3 px-6 py-4">
          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
            <p className="text-[12px] text-muted-foreground">总任务数</p>
            <p className="mt-2 text-[20px] font-bold text-foreground">{summary.total}</p>
          </div>
          <div className="rounded-[22px] border border-success/20 bg-success/10 p-4">
            <p className="text-[12px] text-success/80">成功</p>
            <p className="mt-2 text-[20px] font-bold text-success">{summary.successCount}</p>
          </div>
          <div className="rounded-[22px] border border-destructive/20 bg-destructive/10 p-4">
            <p className="text-[12px] text-destructive/80">失败</p>
            <p className="mt-2 text-[20px] font-bold text-destructive">{summary.failedCount}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 border-b border-white/10 px-6 pb-4">
          <Button className="rounded-2xl bg-gradient-to-r from-primary to-accent" onClick={onDownloadZip}>
            <Download className="mr-2 h-4 w-4" /> 下载 ZIP
          </Button>
          <Button
            className="rounded-2xl border-white/10 bg-white/5 hover:bg-white/10"
            variant="outline"
            onClick={onWriteDirectory}
          >
            <FolderSymlink className="mr-2 h-4 w-4" /> 写入目录
          </Button>
          <div className="text-[12px] text-muted-foreground">
            {directoryLabel ? `目标目录：${directoryLabel}` : "未选择目录时仅支持 ZIP 下载。"}
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-250px)] px-6 py-4">
          <div className="flex flex-col gap-3 pb-6">
            {results.map((result) => (
              <div
                key={`${result.id}-${result.fileName}`}
                className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-[14px] font-semibold text-foreground">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span>{result.fileName}.xml</span>
                    </div>
                    <p className="mt-1 text-[12px] text-muted-foreground">{result.outputPath}</p>
                  </div>
                  <span
                    className={result.status === "success"
                      ? "rounded-full bg-success/10 px-2 py-1 text-[11px] text-success"
                      : "rounded-full bg-destructive/10 px-2 py-1 text-[11px] text-destructive"}
                  >
                    {result.status === "success" ? "Success" : "Failed"}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {result.status === "success" ? (
                    <>
                      <span className="rounded-full bg-white/5 px-3 py-1 text-[11px] text-muted-foreground">
                        源 {result.metrics.sourceBytes} B
                      </span>
                      <span className="rounded-full bg-white/5 px-3 py-1 text-[11px] text-muted-foreground">
                        输出 {result.metrics.outputBytes} B
                      </span>
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] text-primary">
                        变化 {result.metrics.savingRatio}%
                      </span>
                    </>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-3 py-1 text-[11px] text-destructive">
                      <TriangleAlert className="h-3.5 w-3.5" /> {result.error}
                    </span>
                  )}
                </div>

                {result.warnings.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {result.warnings.map((warning) => (
                      <span
                        key={`${result.id}-${warning.code}`}
                        className="rounded-full bg-warning/10 px-3 py-1 text-[11px] text-warning"
                      >
                        {warning.message}
                      </span>
                    ))}
                  </div>
                )}

                {result.status === "success" && (
                  <Button
                    className="mt-4 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10"
                    variant="outline"
                    onClick={() => onDownloadSingle(result)}
                  >
                    <Download className="mr-2 h-4 w-4" /> 单独下载
                  </Button>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
