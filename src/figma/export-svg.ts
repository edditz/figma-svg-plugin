import { normalizeAndroidResourceName } from "@/shared/filename"
import type { ExportFailure, ExportProgressInfo, ExportedSvg } from "@/shared/types"

const EXPORT_TIMEOUT_MS = 20000

function isExportableNode(node: BaseNode | null): node is SceneNode & ExportMixin {
  return Boolean(node) && typeof (node as SceneNode & ExportMixin).exportAsync === "function"
}

function exportNodeAsSvg(node: SceneNode & ExportMixin) {
  return Promise.race([
    node.exportAsync({ format: "SVG" }),
    new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`导出「${node.name}」超时，请拆分复杂图层后重试。`))
      }, EXPORT_TIMEOUT_MS)
    }),
  ])
}

function decodeUtf8(bytes: Uint8Array) {
  try {
    let encoded = ""

    for (const byte of bytes) {
      encoded += `%${byte.toString(16).padStart(2, "0")}`
    }

    return decodeURIComponent(encoded)
  } catch (_error) {
    let fallback = ""

    for (let index = 0; index < bytes.length; index += 8192) {
      fallback += String.fromCharCode(...bytes.slice(index, index + 8192))
    }

    return fallback
  }
}

export async function exportSvgBatch(
  nodeIds: string[],
  onProgress: (progress: ExportProgressInfo) => void,
) {
  const items: ExportedSvg[] = []
  const failures: ExportFailure[] = []

  if (nodeIds.length > 0) {
    onProgress({ completed: 0, total: nodeIds.length, currentName: "准备导出…" })
  }

  for (const [index, nodeId] of nodeIds.entries()) {
    const node = figma.getNodeById(nodeId)
    const name = isExportableNode(node) ? node.name : "Unknown"
    const suggestedFileName = normalizeAndroidResourceName(name)

    if (!isExportableNode(node)) {
      failures.push({
        id: nodeId,
        name,
        suggestedFileName,
        message: "节点不存在或不支持 SVG 导出。",
      })
      onProgress({ completed: index + 1, total: nodeIds.length, currentName: name })
      continue
    }

    await exportNodeAsSvg(node)
      .then((bytes) => {
        items.push({
          id: node.id,
          name: node.name,
          suggestedFileName,
          svg: decodeUtf8(bytes),
          sourceBytes: bytes.byteLength,
        })
      })
      .catch((error: Error) => {
        console.error(error)
        failures.push({
          id: node.id,
          name: node.name,
          suggestedFileName,
          message: error.message,
        })
      })
      .finally(() => {
        onProgress({
          completed: index + 1,
          total: nodeIds.length,
          currentName: node.name,
        })
      })
  }

  return { items, failures }
}
