import { useCallback, useEffect, useMemo, useState } from "react"
import { LoaderCircle, WandSparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  applyNamePattern,
  dedupeFileNames,
  joinOutputPath,
  normalizeAndroidResourceName,
} from "@/shared/filename"
import type { VectorDrawableResult } from "@/shared/types"
import { HeaderBar } from "@/ui/components/header-bar"
import { ExportSettings } from "@/ui/components/export-settings"
import { IconList } from "@/ui/components/icon-list"
import { PreviewPanel } from "@/ui/components/preview-panel"
import { ResultDrawer } from "@/ui/components/result-drawer"
import { usePluginBridge } from "@/ui/hooks/use-plugin-bridge"
import { buildResultSummary, type ExportSettingsState, type UiIconItem } from "@/ui/types"
import {
  downloadResultsZip,
  downloadSingleResult,
  pickDirectoryHandle,
  writeResultsToDirectory,
} from "@/ui/utils/export-files"

const defaultSettings: ExportSettingsState = {
  prefix: "ic_",
  suffix: "",
  precision: 4,
  optimize: true,
  outputSubdirectory: "app/src/main/res/drawable",
}

function toUiIcon(candidate: Omit<UiIconItem, "selected" | "fileName">): UiIconItem {
  return { ...candidate, selected: true, fileName: candidate.suggestedFileName }
}

export default function App() {
  const { progress, clearProgress, scanSelection: requestScanSelection, applySelection, exportSvgs } = usePluginBridge()
  const [icons, setIcons] = useState<UiIconItem[]>([])
  const [results, setResults] = useState<VectorDrawableResult[]>([])
  const [settings, setSettings] = useState(defaultSettings)
  const [activeId, setActiveId] = useState<string>()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null)
  const [directoryLabel, setDirectoryLabel] = useState("")
  const [notice, setNotice] = useState("先扫描当前 Figma 选区，然后开始批量转换。")
  const [isScanning, setIsScanning] = useState(false)
  const [isConverting, setIsConverting] = useState(false)

  const scanSelection = useCallback(() => {
    setIsScanning(true)
    clearProgress()
    requestScanSelection()
      .then(({ icons: nextIcons }) => {
        const mappedIcons = nextIcons.map((icon) => toUiIcon(icon))
        setIcons(mappedIcons)
        setActiveId(mappedIcons[0]?.id)
        setResults([])
        setDrawerOpen(false)
        setNotice(
          mappedIcons.length > 0
            ? `已识别 ${mappedIcons.length} 个候选图标，可直接批量转换。`
            : "当前选区内没有找到适合转换的矢量图标。",
        )
      })
      .catch((error: Error) => {
        console.error(error)
        setNotice(error.message)
      })
      .finally(() => setIsScanning(false))
  }, [clearProgress, requestScanSelection])

  useEffect(() => {
    scanSelection()
  }, [scanSelection])

  const selectedIcons = useMemo(() => icons.filter((icon) => icon.selected), [icons])
  const activeIcon = useMemo(() => icons.find((icon) => icon.id === activeId), [activeId, icons])
  const activeResult = useMemo(() => results.find((result) => result.id === activeId), [activeId, results])
  const summary = useMemo(() => buildResultSummary(results), [results])
  const progressValue = progress ? Math.round((progress.completed / Math.max(progress.total, 1)) * 100) : 0

  const updateIcon = (iconId: string, updater: (icon: UiIconItem) => UiIconItem) => {
    setIcons((currentIcons) => currentIcons.map((icon) => (icon.id === iconId ? updater(icon) : icon)))
  }

  const revealOnCanvas = (iconId: string) => {
    setActiveId(iconId)
    applySelection([iconId]).catch((error: Error) => {
      console.error(error)
      setNotice(error.message)
    })
  }

  const handleConvert = async () => {
    if (selectedIcons.length === 0) {
      setNotice("请至少勾选一个图标再开始转换。")
      return
    }

    setIsConverting(true)
    setNotice("正在导出 SVG 并生成 VectorDrawable…")
    clearProgress()

    const dedupedNames = dedupeFileNames(
      selectedIcons.map((icon) =>
        applyNamePattern(normalizeAndroidResourceName(icon.fileName), settings.prefix, settings.suffix),
      ),
    )
    const fileNameMap = new Map(selectedIcons.map((icon, index) => [icon.id, dedupedNames[index]]))

    try {
      const [{ convertSvgToVectorDrawable }, { items, failures }] = await Promise.all([
        import("@/core/vectordrawable-converter"),
        exportSvgs(selectedIcons.map((icon) => icon.id)),
      ])

      const convertedResults = items.map<VectorDrawableResult>((item) => {
        const fileName = fileNameMap.get(item.id) ?? item.suggestedFileName
        const converted = convertSvgToVectorDrawable(item.svg, {
          precision: settings.precision,
          optimize: settings.optimize,
        })
        const blockingWarnings = converted.warnings.filter((warning) => warning.level === "error")

        return {
          id: item.id,
          name: item.name,
          fileName,
          outputPath: joinOutputPath(settings.outputSubdirectory, fileName),
          status: blockingWarnings.length > 0 ? "error" : "success",
          xml: converted.xml,
          error: blockingWarnings.map((warning) => warning.message).join("；"),
          sourceSvg: item.svg,
          warnings: converted.warnings,
          metrics: converted.metrics,
        }
      })
      const failedResults = failures.map<VectorDrawableResult>((failure) => ({
        id: failure.id,
        name: failure.name,
        fileName: failure.suggestedFileName,
        outputPath: joinOutputPath(settings.outputSubdirectory, failure.suggestedFileName),
        status: "error",
        xml: "",
        error: failure.message,
        warnings: [],
        metrics: { sourceBytes: 0, outputBytes: 0, savingRatio: 0 },
      }))
      const orderedResults = [...convertedResults, ...failedResults].sort((left, right) => {
        return (
          selectedIcons.findIndex((icon) => icon.id === left.id) -
          selectedIcons.findIndex((icon) => icon.id === right.id)
        )
      })

      setResults(orderedResults)
      setDrawerOpen(true)
      setActiveId(orderedResults[0]?.id ?? activeId)
      setNotice(`转换完成：${orderedResults.filter((result) => result.status === "success").length} 个文件可导出。`)
    } catch (error) {
      console.error(error)
      setNotice(error instanceof Error ? error.message : "转换失败，请重试。")
    } finally {
      setIsConverting(false)
      clearProgress()
    }
  }

  const handlePickDirectory = () => {
    pickDirectoryHandle()
      .then((handle) => {
        setDirectoryHandle(handle)
        setDirectoryLabel(handle.name)
        setNotice(`已选择本地目录：${handle.name}`)
      })
      .catch((error: Error) => {
        console.error(error)
        setNotice(error.message)
      })
  }

  const handleZipDownload = () => {
    downloadResultsZip(results, "android-vectordrawables")
      .then(() => setNotice("ZIP 已生成并开始下载。"))
      .catch((error: Error) => {
        console.error(error)
        setNotice(error.message)
      })
  }

  const handleDirectoryWrite = () => {
    if (!directoryHandle) {
      handlePickDirectory()
      return
    }

    writeResultsToDirectory(directoryHandle, results)
      .then((writtenFiles) => setNotice(`已写入 ${writtenFiles.length} 个 XML 文件到 ${directoryLabel}。`))
      .catch((error: Error) => {
        console.error(error)
        setNotice(error.message)
      })
  }

  return (
    <div className="min-h-screen bg-aurora text-foreground">
      <HeaderBar
        converting={isConverting}
        hasResults={results.length > 0}
        scanning={isScanning}
        selected={selectedIcons.length}
        total={icons.length}
        onInvert={() => setIcons((currentIcons) => currentIcons.map((icon) => ({ ...icon, selected: !icon.selected })))}
        onOpenResults={() => setDrawerOpen(true)}
        onRefresh={scanSelection}
        onSelectAll={() => setIcons((currentIcons) => currentIcons.map((icon) => ({ ...icon, selected: true })))}
      />

      <main className="flex flex-col gap-4 px-4 pb-28 pt-40">
        <section className="rounded-[32px] border border-white/10 bg-panel px-5 py-5 shadow-panel">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[20px] font-bold text-foreground">批量扫描、预检与导出</p>
              <p className="mt-2 max-w-2xl text-[12px] leading-6 text-muted-foreground">{notice}</p>
            </div>
            <div className="rounded-[22px] border border-accent/20 bg-accent/10 px-4 py-3 text-right">
              <p className="text-[11px] uppercase tracking-[0.2em] text-accent">Export Stage</p>
              <p className="mt-1 text-[14px] font-semibold text-foreground">
                {progress ? progress.currentName : "等待开始"}
              </p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-[12px] text-muted-foreground">
              <span>Figma 导出进度</span>
              <span>{progressValue}%</span>
            </div>
            <Progress className="h-2 bg-white/10" value={progressValue} />
          </div>
        </section>

        <IconList
          activeId={activeId}
          disabled={isConverting}
          items={icons}
          onFileNameChange={(iconId, fileName) =>
            updateIcon(iconId, (icon) => ({ ...icon, fileName: normalizeAndroidResourceName(fileName || icon.name) }))
          }
          onFocus={setActiveId}
          onReveal={revealOnCanvas}
          onToggle={(iconId, checked) => updateIcon(iconId, (icon) => ({ ...icon, selected: checked }))}
        />

        <ExportSettings
          directoryLabel={directoryLabel}
          disabled={isConverting}
          settings={settings}
          onChange={setSettings}
          onPickDirectory={handlePickDirectory}
        />

        <PreviewPanel
          preview={{
            icon: activeIcon,
            warnings: activeResult?.warnings ?? activeIcon?.warnings ?? [],
            xml: activeResult?.xml,
            sourceSvg: activeResult?.sourceSvg,
          }}
        />
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-panel/85 px-4 py-4 backdrop-blur-xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[14px] font-semibold text-foreground">已勾选 {selectedIcons.length} 个图标</p>
            <p className="text-[12px] text-muted-foreground">转换后可直接下载 ZIP，或写入你选择的本地目录。</p>
          </div>
          <Button
            className="h-12 rounded-2xl bg-gradient-to-r from-primary to-accent px-6 text-white shadow-glow hover:opacity-90"
            disabled={isConverting || selectedIcons.length === 0}
            onClick={handleConvert}
          >
            {isConverting ? (
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <WandSparkles className="mr-2 h-4 w-4" />
            )}
            一键转换
          </Button>
        </div>
      </div>

      <ResultDrawer
        directoryLabel={directoryLabel}
        open={drawerOpen}
        results={results}
        summary={summary}
        onDownloadSingle={downloadSingleResult}
        onDownloadZip={handleZipDownload}
        onOpenChange={setDrawerOpen}
        onWriteDirectory={handleDirectoryWrite}
      />
    </div>
  )
}
