import { lazy, Suspense, type ComponentType } from "react"

/**
 * Dev-only tools — tree-shaken in production builds.
 *
 * 显示条件（满足任一）：
 * - dev server（import.meta.env.DEV）
 * - dev 构建（--mode dev-ui）
 *
 * 生产构建（--mode ui）中两个条件均为 false，agentation 被完全移除。
 */
const enableAnnotation = import.meta.env.DEV || import.meta.env.MODE === "dev-ui"

const Agentation: ComponentType = enableAnnotation
  ? lazy(() =>
      import("agentation").then((m) => ({ default: m.Agentation })),
    )
  : (() => null) as ComponentType

export function DevTools() {
  if (!enableAnnotation) return null

  return (
    <Suspense fallback={null}>
      <Agentation />
    </Suspense>
  )
}
