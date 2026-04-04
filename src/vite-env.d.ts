/// <reference types="vite/client" />

declare const __FIGMA_UI_HTML__: string

declare interface Window {
  showDirectoryPicker?: (options?: { mode?: "read" | "readwrite" }) => Promise<FileSystemDirectoryHandle>
}

declare interface FileSystemDirectoryHandle {
  kind: "directory"
  name: string
  getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<FileSystemDirectoryHandle>
  getFileHandle(name: string, options?: { create?: boolean }): Promise<FileSystemFileHandle>
}

declare interface FileSystemFileHandle {
  createWritable(): Promise<FileSystemWritableFileStream>
}

declare interface FileSystemWritableFileStream {
  write(data: Blob | BufferSource | string): Promise<void>
  close(): Promise<void>
}
