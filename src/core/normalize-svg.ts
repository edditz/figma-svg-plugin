import type { ConversionWarning } from "@/shared/types"

import { convertShapeToPath } from "./path-utils"
import {
  extractPresentationAttributes,
  hasActiveTransform,
  mergePresentationAttributes,
  normalizeColor,
  parseNumber,
  parseTransform,
  parseViewBox,
  resolveDimension,
  type PresentationAttributes,
} from "./style-utils"
import type {
  RawSvgDocument,
  RawSvgElement,
  VectorDrawableGraphic,
  VectorGroupNode,
  VectorNode,
  VectorPathNode,
  VectorPathStyle,
} from "./types"

function buildName(attributes: Record<string, string>) {
  return attributes.id ?? attributes["data-name"]
}

function clampAlpha(value: number) {
  return Math.max(0, Math.min(1, value))
}

function resolvePathStyle(
  presentation: PresentationAttributes,
  alphaMultiplier: number,
  warnings: ConversionWarning[],
): VectorPathStyle {
  const fill = normalizeColor(presentation.fill)
  const stroke = normalizeColor(presentation.stroke)
  const fillOpacity = clampAlpha(alphaMultiplier * parseNumber(presentation["fill-opacity"], 1) * fill.alpha)
  const strokeOpacity = clampAlpha(alphaMultiplier * parseNumber(presentation["stroke-opacity"], 1) * stroke.alpha)
  const strokeWidth = parseNumber(presentation["stroke-width"], stroke.color ? 1 : 0)
  const style: VectorPathStyle = {}

  if (fill.warning) {
    warnings.push(fill.warning)
  }

  if (stroke.warning) {
    warnings.push(stroke.warning)
  }

  if (!fill.isNone && fill.color) {
    style.fillColor = fill.color
  }

  if (!fill.color && !stroke.color) {
    style.fillColor = "#000000"
  }

  if (style.fillColor && fillOpacity < 0.999) {
    style.fillAlpha = fillOpacity
  }

  if (presentation["fill-rule"] === "evenodd") {
    style.fillType = "evenOdd"
  }

  if (stroke.color && strokeWidth > 0) {
    style.strokeColor = stroke.color
    style.strokeWidth = strokeWidth

    if (strokeOpacity < 0.999) {
      style.strokeAlpha = strokeOpacity
    }

    if (presentation["stroke-linecap"] === "round" || presentation["stroke-linecap"] === "square") {
      style.strokeLineCap = presentation["stroke-linecap"]
    }

    if (
      presentation["stroke-linejoin"] === "round" ||
      presentation["stroke-linejoin"] === "bevel"
    ) {
      style.strokeLineJoin = presentation["stroke-linejoin"]
    }

    if (presentation["stroke-linejoin"] === "miter") {
      style.strokeLineJoin = "miter"
    }

    if (presentation["stroke-miterlimit"]) {
      style.strokeMiterLimit = parseNumber(presentation["stroke-miterlimit"], 4)
    }
  }

  return style
}

function normalizeElement(
  element: RawSvgElement,
  inheritedPresentation: PresentationAttributes,
  alphaMultiplier: number,
  warnings: ConversionWarning[],
): VectorNode[] {
  const localPresentation = extractPresentationAttributes(element.attributes)
  const mergedPresentation = mergePresentationAttributes(inheritedPresentation, localPresentation)
  const nextAlpha = clampAlpha(alphaMultiplier * parseNumber(localPresentation.opacity, 1))
  const { transform, warnings: transformWarnings } = parseTransform(element.attributes.transform)

  warnings.push(...transformWarnings)

  if (element.tagName === "g") {
    const children = element.children.flatMap((child) =>
      normalizeElement(child, mergedPresentation, nextAlpha, warnings),
    )

    if (!hasActiveTransform(transform)) {
      return children
    }

    const groupNode: VectorGroupNode = {
      kind: "group",
      name: buildName(element.attributes),
      transform,
      children,
    }

    return children.length > 0 ? [groupNode] : []
  }

  const pathData = convertShapeToPath(element.tagName, element.attributes)

  if (!pathData) {
    warnings.push({
      code: `unsupported-shape-${element.tagName}`,
      message: `图形元素 <${element.tagName}> 暂未实现转换。`,
      level: "warning",
    })
    return []
  }

  const pathNode: VectorPathNode = {
    kind: "path",
    name: buildName(element.attributes),
    pathData,
    style: resolvePathStyle(mergedPresentation, nextAlpha, warnings),
  }

  if (!hasActiveTransform(transform)) {
    return [pathNode]
  }

  return [
    {
      kind: "group",
      name: buildName(element.attributes),
      transform,
      children: [pathNode],
    },
  ]
}

export function normalizeSvgDocument(rawSvg: RawSvgDocument): VectorDrawableGraphic {
  const warnings = [...rawSvg.warnings]
  const viewBox = parseViewBox(rawSvg.rootAttributes)
  const rootPresentation = extractPresentationAttributes(rawSvg.rootAttributes)
  const rootAlpha = clampAlpha(parseNumber(rootPresentation.opacity, 1))
  const children = rawSvg.children.flatMap((child) =>
    normalizeElement(child, rootPresentation, rootAlpha, warnings),
  )
  const shiftedChildren =
    viewBox.minX !== 0 || viewBox.minY !== 0
      ? [
          {
            kind: "group" as const,
            transform: {
              translateX: -viewBox.minX,
              translateY: -viewBox.minY,
              scaleX: 1,
              scaleY: 1,
              rotation: 0,
              pivotX: 0,
              pivotY: 0,
            },
            children,
          },
        ]
      : children

  return {
    width: resolveDimension(rawSvg.rootAttributes.width, viewBox.width),
    height: resolveDimension(rawSvg.rootAttributes.height, viewBox.height),
    viewportWidth: viewBox.width,
    viewportHeight: viewBox.height,
    children: shiftedChildren,
    warnings,
  }
}
