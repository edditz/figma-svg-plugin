export type WarningLevel = "info" | "warning" | "error"

export interface ConversionWarning {
  code: string
  message: string
  level: WarningLevel
}

export interface IconCandidate {
  id: string
  name: string
  suggestedFileName: string
  width: number
  height: number
  nodeType: string
  selectionDepth: number
  warnings: ConversionWarning[]
  thumbnail?: string
}

export interface ExportedSvg {
  id: string
  name: string
  suggestedFileName: string
  svg: string
  sourceBytes: number
}

export interface ExportFailure {
  id: string
  name: string
  suggestedFileName: string
  message: string
}

export interface ExportProgressInfo {
  completed: number
  total: number
  currentName: string
}

export interface OutputMetrics {
  sourceBytes: number
  outputBytes: number
  savingRatio: number
}

export interface VectorDrawableResult {
  id: string
  name: string
  fileName: string
  outputPath: string
  status: "success" | "error"
  xml: string
  error?: string
  sourceSvg?: string
  warnings: ConversionWarning[]
  metrics: OutputMetrics
}

export interface ConversionOptions {
  precision: number
  optimize: boolean
}
