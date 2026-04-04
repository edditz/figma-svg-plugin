import { applySelection } from "@/figma/apply-selection"
import { exportSvgBatch } from "@/figma/export-svg"
import { scanSelection } from "@/figma/scan-selection"
import type { PluginMessage, UiRequest } from "@/shared/messages"

figma.showUI(__FIGMA_UI_HTML__, {
  width: 480,
  height: 760,
  themeColors: true,
})

function postMessage(message: PluginMessage) {
  figma.ui.postMessage(message)
}

async function handleRequest(message: UiRequest) {
  if (message.type === "SCAN_SELECTION") {
    postMessage({
      type: "SCAN_RESULT",
      requestId: message.requestId,
      icons: scanSelection(figma.currentPage.selection),
    })
    return
  }

  if (message.type === "APPLY_SELECTION") {
    postMessage({
      type: "SELECTION_APPLIED",
      requestId: message.requestId,
      nodeIds: applySelection(message.nodeIds),
    })
    return
  }

  if (message.type === "EXPORT_SVGS") {
    const payload = await exportSvgBatch(message.nodeIds, (progress) => {
      postMessage({
        type: "EXPORT_PROGRESS",
        requestId: message.requestId,
        progress,
      })
    })

    postMessage({
      type: "EXPORT_RESULT",
      requestId: message.requestId,
      items: payload.items,
      failures: payload.failures,
    })
  }
}

figma.ui.onmessage = (message: UiRequest) => {
  handleRequest(message).catch((error: Error) => {
    console.error(error)
    postMessage({
      type: "PLUGIN_ERROR",
      requestId: message.requestId,
      action: message.type,
      error: error.message,
    })
  })
}
