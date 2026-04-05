import type { VectorDrawableResult } from "@/shared/types"

function createDownload(fileName: string, blob: Blob) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  link.click()

  window.setTimeout(() => {
    URL.revokeObjectURL(url)
  }, 250)
}

function getSuccessfulResults(results: VectorDrawableResult[]) {
  return results.filter((result) => result.status === "success")
}

export function downloadSingleResult(result: VectorDrawableResult) {
  createDownload(`${result.fileName}.xml`, new Blob([result.xml], { type: "application/xml" }))
}

export async function downloadResultsZip(results: VectorDrawableResult[], archiveName: string) {
  const { default: JSZip } = await import("jszip")
  const zip = new JSZip()

  const folder = zip.folder(archiveName)

  getSuccessfulResults(results).forEach((result) => {
    folder!.file(result.outputPath, result.xml)
  })

  const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" })
  createDownload(`${archiveName}.zip`, blob)
}
