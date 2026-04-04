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

function splitPath(path: string) {
  const segments = path.split("/").filter(Boolean)
  const fileName = segments.pop() ?? "vector.xml"

  return {
    directories: segments,
    fileName,
  }
}

async function ensureDirectory(
  rootHandle: FileSystemDirectoryHandle,
  directories: string[],
): Promise<FileSystemDirectoryHandle> {
  let currentHandle = rootHandle

  for (const directory of directories) {
    currentHandle = await currentHandle.getDirectoryHandle(directory, { create: true })
  }

  return currentHandle
}

export function pickDirectoryHandle() {
  if (!window.showDirectoryPicker) {
    return Promise.reject(new Error("当前环境不支持目录选择，将自动回退为 ZIP 下载。"))
  }

  return window.showDirectoryPicker({ mode: "readwrite" })
}

export function downloadSingleResult(result: VectorDrawableResult) {
  createDownload(`${result.fileName}.xml`, new Blob([result.xml], { type: "application/xml" }))
}

export async function downloadResultsZip(results: VectorDrawableResult[], archiveName: string) {
  const { default: JSZip } = await import("jszip")
  const zip = new JSZip()

  getSuccessfulResults(results).forEach((result) => {
    zip.file(result.outputPath, result.xml)
  })

  const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" })
  createDownload(`${archiveName}.zip`, blob)
}

export async function writeResultsToDirectory(
  directoryHandle: FileSystemDirectoryHandle,
  results: VectorDrawableResult[],
) {
  const writtenFiles: string[] = []

  for (const result of getSuccessfulResults(results)) {
    const { directories, fileName } = splitPath(result.outputPath)
    const nestedDirectory = await ensureDirectory(directoryHandle, directories)
    const fileHandle = await nestedDirectory.getFileHandle(fileName, { create: true })
    const writable = await fileHandle.createWritable()
    await writable.write(result.xml)
    await writable.close()
    writtenFiles.push(result.outputPath)
  }

  return writtenFiles
}
