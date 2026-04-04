import type { ConversionWarning, IconCandidate, VectorDrawableResult } from "@/shared/types"

export interface UiIconItem extends IconCandidate {
  selected: boolean
  fileName: string
}

export interface ExportSettingsState {
  prefix: string
  suffix: string
  precision: number
  optimize: boolean
  outputSubdirectory: string
}

export interface PreviewSelection {
  icon?: UiIconItem
  warnings: ConversionWarning[]
  xml?: string
  sourceSvg?: string
}

export interface ResultSummary {
  total: number
  successCount: number
  failedCount: number
  averageSaving: number
}

export function buildResultSummary(results: VectorDrawableResult[]): ResultSummary {
  const successCount = results.filter((result) => result.status === "success").length
  const failedCount = results.length - successCount
  const averageSaving =
    successCount === 0
      ? 0
      : Number(
          (
            results
              .filter((result) => result.status === "success")
              .reduce((total, result) => total + result.metrics.savingRatio, 0) / successCount
          ).toFixed(2),
        )

  return {
    total: results.length,
    successCount,
    failedCount,
    averageSaving,
  }
}
