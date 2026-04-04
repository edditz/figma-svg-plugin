import { Component, StrictMode, type ReactNode } from "react"
import { createRoot } from "react-dom/client"

import App from "./App"
import "./styles/globals.css"

function formatError(error: unknown) {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}${error.stack ? `\n\n${error.stack}` : ""}`
  }

  return typeof error === "string" ? error : JSON.stringify(error, null, 2)
}

function showFatalError(error: unknown, source: string) {
  const target = document.getElementById("root") ?? document.body
  const message = formatError(error)

  target.innerHTML = `
    <div style="padding:16px;color:#fff;background:#11152a;font:12px/1.6 ui-monospace, SFMono-Regular, Menlo, monospace;white-space:pre-wrap;word-break:break-word;">
      <div style="margin-bottom:8px;font:700 14px/1.4 -apple-system,BlinkMacSystemFont,sans-serif;">插件 UI 运行失败</div>
      <div style="margin-bottom:8px;color:#8B91B3;">来源：${source}</div>
      <div>${message.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")}</div>
    </div>
  `
}

class UiErrorBoundary extends Component<{ children: ReactNode }, { error: unknown }> {
  state = { error: null as unknown }

  static getDerivedStateFromError(error: unknown) {
    return { error }
  }

  componentDidCatch(error: unknown) {
    console.error("UI render failed", error)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="p-4 text-white">
          <div className="text-sm font-bold">插件 UI 运行失败</div>
          <pre className="mt-3 whitespace-pre-wrap break-all text-[11px] text-white/80">
            {formatError(this.state.error)}
          </pre>
        </div>
      )
    }

    return this.props.children
  }
}

window.addEventListener("error", (event) => {
  showFatalError(event.error ?? event.message, "window.error")
})

window.addEventListener("unhandledrejection", (event) => {
  showFatalError(event.reason, "unhandledrejection")
})

function bootstrap() {
  const rootElement = document.getElementById("root")

  if (!rootElement) {
    showFatalError("未找到 #root 挂载节点。", "bootstrap")
    return
  }

  rootElement.innerHTML = '<div style="padding:16px;color:#fff;font:12px/1.4 -apple-system,BlinkMacSystemFont,sans-serif;">插件正在启动…</div>'

  try {
    createRoot(rootElement).render(
      <StrictMode>
        <UiErrorBoundary>
          <App />
        </UiErrorBoundary>
      </StrictMode>,
    )
  } catch (error) {
    showFatalError(error, "bootstrap")
  }
}

void bootstrap()
