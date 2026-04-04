import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import {
  isPluginMessage,
  type ApplySelectionRequest,
  type ExportResultMessage,
  type ExportSvgRequest,
  type PluginMessage,
  type ScanResultMessage,
  type ScanSelectionRequest,
} from "@/shared/messages"
import type { ExportProgressInfo } from "@/shared/types"

interface PendingRequest {
  resolve: (message: PluginMessage) => void
  reject: (reason?: unknown) => void
  timeoutId: ReturnType<typeof window.setTimeout>
}

type UiPayload =
  | Omit<ScanSelectionRequest, "requestId">
  | Omit<ApplySelectionRequest, "requestId">
  | Omit<ExportSvgRequest, "requestId">

function createRequestId() {
  return crypto.randomUUID?.() ?? `req_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

export function usePluginBridge() {
  const [progress, setProgress] = useState<ExportProgressInfo | null>(null)
  const pendingRequests = useRef(new Map<string, PendingRequest>())

  useEffect(() => {
    const handleMessage = (event: MessageEvent<{ pluginMessage?: unknown }>) => {
      const message = event.data?.pluginMessage

      if (!isPluginMessage(message)) {
        return
      }

      if (message.type === "EXPORT_PROGRESS") {
        setProgress(message.progress)
        return
      }

      const pendingRequest = pendingRequests.current.get(message.requestId)
      if (!pendingRequest) {
        return
      }

      window.clearTimeout(pendingRequest.timeoutId)

      if (message.type === "PLUGIN_ERROR") {
        pendingRequest.reject(new Error(message.error))
      } else {
        pendingRequest.resolve(message)
      }

      pendingRequests.current.delete(message.requestId)
    }

    window.addEventListener("message", handleMessage)

    return () => {
      window.removeEventListener("message", handleMessage)
    }
  }, [])

  const request = useCallback(<TResponse extends PluginMessage>(payload: UiPayload, timeoutMs = 15000) => {
    return new Promise<TResponse>((resolve, reject) => {
      const requestId = createRequestId()
      const timeoutId = window.setTimeout(() => {
        pendingRequests.current.delete(requestId)
        reject(new Error("插件响应超时，请重试；如果仍失败，请减少选中的图标数量或拆分复杂图层。"))
      }, timeoutMs)

      pendingRequests.current.set(requestId, {
        resolve: (message) => resolve(message as TResponse),
        reject,
        timeoutId,
      })

      parent.postMessage(
        {
          pluginMessage: {
            ...payload,
            requestId,
          },
        },
        "*",
      )
    })
  }, [])

  const clearProgress = useCallback(() => {
    setProgress(null)
  }, [])

  const scanSelection = useCallback(() => request<ScanResultMessage>({ type: "SCAN_SELECTION" }, 10000), [request])
  const applySelection = useCallback((nodeIds: string[]) => request({ type: "APPLY_SELECTION", nodeIds }, 10000), [request])
  const exportSvgs = useCallback((nodeIds: string[]) => request<ExportResultMessage>({ type: "EXPORT_SVGS", nodeIds }, 120000), [request])

  return useMemo(
    () => ({
      progress,
      clearProgress,
      scanSelection,
      applySelection,
      exportSvgs,
    }),
    [applySelection, clearProgress, exportSvgs, progress, scanSelection],
  )
}
