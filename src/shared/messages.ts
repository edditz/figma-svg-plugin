import type {
  ExportFailure,
  ExportProgressInfo,
  ExportedSvg,
  IconCandidate,
} from "./types"

export interface ScanSelectionRequest {
  type: "SCAN_SELECTION"
  requestId: string
}

export interface ApplySelectionRequest {
  type: "APPLY_SELECTION"
  requestId: string
  nodeIds: string[]
}

export interface ExportSvgRequest {
  type: "EXPORT_SVGS"
  requestId: string
  nodeIds: string[]
}

export type UiRequest =
  | ScanSelectionRequest
  | ApplySelectionRequest
  | ExportSvgRequest

export interface ScanResultMessage {
  type: "SCAN_RESULT"
  requestId: string
  icons: IconCandidate[]
}

export interface SelectionAppliedMessage {
  type: "SELECTION_APPLIED"
  requestId: string
  nodeIds: string[]
}

export interface ExportProgressMessage {
  type: "EXPORT_PROGRESS"
  requestId: string
  progress: ExportProgressInfo
}

export interface ExportResultMessage {
  type: "EXPORT_RESULT"
  requestId: string
  items: ExportedSvg[]
  failures: ExportFailure[]
}

export interface PluginErrorMessage {
  type: "PLUGIN_ERROR"
  requestId: string
  action: UiRequest["type"]
  error: string
}

export type PluginMessage =
  | ScanResultMessage
  | SelectionAppliedMessage
  | ExportProgressMessage
  | ExportResultMessage
  | PluginErrorMessage

export function isPluginMessage(value: unknown): value is PluginMessage {
  return typeof value === "object" && value !== null && "type" in value
}
