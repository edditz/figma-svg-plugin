import { normalizeAndroidResourceName } from "@/shared/filename"
import type { ConversionWarning, IconCandidate } from "@/shared/types"

const SCENE_LIMIT = 512
const TEXT_WARNING: ConversionWarning = {
  code: "contains-text",
  message: "包含文字节点，文字将无法直接转换为 VectorDrawable 路径。",
  level: "warning",
}
const IMAGE_WARNING: ConversionWarning = {
  code: "contains-image",
  message: "包含位图填充，位图内容不会被写入 VectorDrawable。",
  level: "warning",
}
const EFFECT_WARNING: ConversionWarning = {
  code: "contains-effects",
  message: "检测到阴影或模糊效果，Android VectorDrawable 不支持这类效果。",
  level: "info",
}
const MASK_WARNING: ConversionWarning = {
  code: "contains-mask",
  message: "检测到蒙版或裁剪，复杂遮罩可能导致视觉差异。",
  level: "warning",
}
const CLIP_WARNING: ConversionWarning = {
  code: "contains-clips-content",
  message: "检测到内容裁剪，复杂 clipPath 无法被完整保留。",
  level: "warning",
}

function isSceneNode(node: BaseNode | null): node is SceneNode {
  return node !== null && "visible" in node
}

function isExportableNode(node: SceneNode): node is SceneNode & ExportMixin {
  return typeof (node as SceneNode & ExportMixin).exportAsync === "function"
}

function hasGeometry(node: SceneNode) {
  return "width" in node && "height" in node && node.width > 0 && node.height > 0
}

function countDescendants(node: SceneNode) {
  if (!("findAll" in node)) {
    return 0
  }

  return node.findAll(() => true).length
}

function hasVectorContent(node: SceneNode) {
  if (["VECTOR", "BOOLEAN_OPERATION", "STAR", "ELLIPSE", "LINE", "POLYGON", "RECTANGLE"].includes(node.type)) {
    return true
  }

  if (!("findAll" in node)) {
    return false
  }

  return node.findOne(
    (child) =>
      child.type === "VECTOR" ||
      child.type === "BOOLEAN_OPERATION" ||
      child.type === "STAR" ||
      child.type === "ELLIPSE" ||
      child.type === "LINE" ||
      child.type === "POLYGON" ||
      child.type === "RECTANGLE",
  ) !== null
}

function collectWarnings(node: SceneNode) {
  const warnings: ConversionWarning[] = []
  const descendants = "findAll" in node ? node.findAll(() => true) : []

  if (descendants.some((child) => child.type === "TEXT")) {
    warnings.push(TEXT_WARNING)
  }

  if (
    descendants.some(
      (child) =>
        "fills" in child &&
        Array.isArray(child.fills) &&
        child.fills.some((fill) => fill.type === "IMAGE"),
    )
  ) {
    warnings.push(IMAGE_WARNING)
  }

  if (
    descendants.some(
      (child) => "effects" in child && Array.isArray(child.effects) && child.effects.length > 0,
    )
  ) {
    warnings.push(EFFECT_WARNING)
  }

  if (descendants.some((child) => "isMask" in child && child.isMask)) {
    warnings.push(MASK_WARNING)
  }

  if (descendants.some((child) => "clipsContent" in child && child.clipsContent)) {
    warnings.push(CLIP_WARNING)
  }

  return warnings
}

function shouldCollectNode(node: SceneNode, depth: number) {
  if (!node.visible || !hasGeometry(node) || !isExportableNode(node) || !hasVectorContent(node)) {
    return false
  }

  const largestEdge = Math.max(node.width, node.height)
  const subtreeSize = countDescendants(node)

  if (largestEdge <= SCENE_LIMIT && subtreeSize <= 64) {
    return true
  }

  return depth > 0 && largestEdge <= SCENE_LIMIT / 2
}

function createCandidate(node: SceneNode, depth: number): IconCandidate {
  return {
    id: node.id,
    name: node.name,
    suggestedFileName: normalizeAndroidResourceName(node.name),
    width: Math.round(node.width * 100) / 100,
    height: Math.round(node.height * 100) / 100,
    nodeType: node.type,
    selectionDepth: depth,
    warnings: collectWarnings(node),
  }
}

function visitNode(node: SceneNode, depth: number, collected: Map<string, IconCandidate>) {
  if (shouldCollectNode(node, depth)) {
    collected.set(node.id, createCandidate(node, depth))
    return
  }

  if (!("children" in node)) {
    return
  }

  node.children.forEach((child) => {
    if (isSceneNode(child)) {
      visitNode(child, depth + 1, collected)
    }
  })
}

export function scanSelection(selection: readonly SceneNode[]) {
  const collected = new Map<string, IconCandidate>()

  selection.forEach((node) => visitNode(node, 0, collected))

  return Array.from(collected.values()).sort((left, right) => {
    if (left.selectionDepth !== right.selectionDepth) {
      return left.selectionDepth - right.selectionDepth
    }

    return left.name.localeCompare(right.name)
  })
}
