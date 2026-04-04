import type { ConversionWarning } from "@/shared/types"

import type { VectorDrawableGraphic, VectorNode } from "./types"

function hasPathNode(nodes: VectorNode[]): boolean {
  return nodes.some((node) => {
    if (node.kind === "path") {
      return Boolean(node.pathData)
    }

    return hasPathNode(node.children)
  })
}

export function validateVectorDrawable(xml: string, graphic: VectorDrawableGraphic) {
  const warnings: ConversionWarning[] = []

  if (!xml.startsWith("<vector")) {
    warnings.push({
      code: "missing-vector-root",
      message: "输出 XML 缺少 <vector> 根节点。",
      level: "error",
    })
  }

  if (graphic.viewportWidth <= 0 || graphic.viewportHeight <= 0) {
    warnings.push({
      code: "invalid-viewport",
      message: "视口尺寸无效，Android 无法正确渲染该 VectorDrawable。",
      level: "error",
    })
  }

  if (!hasPathNode(graphic.children)) {
    warnings.push({
      code: "empty-output",
      message: "未生成任何可绘制路径，请检查输入 SVG 是否包含受支持的图形元素。",
      level: "error",
    })
  }

  if (/NaN|undefined/.test(xml)) {
    warnings.push({
      code: "invalid-number",
      message: "输出 XML 中存在无效数值，请检查转换过程。",
      level: "error",
    })
  }

  if (xml.length > 64_000) {
    warnings.push({
      code: "large-output",
      message: "生成的 XML 较大，建议提高压缩级别或拆分复杂图标。",
      level: "info",
    })
  }

  return warnings
}
