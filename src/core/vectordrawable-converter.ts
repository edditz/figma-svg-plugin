import { optimizeXml } from "./optimize-xml"
import { parseSvg } from "./parse-svg"
import { normalizeSvgDocument } from "./normalize-svg"
import { validateVectorDrawable } from "./validate-output"
import type {
  ConvertSvgOptions,
  ConvertSvgResult,
  VectorDrawableGraphic,
  VectorGroupNode,
  VectorNode,
  VectorPathNode,
} from "./types"

function formatNumber(value: number, precision = 4) {
  const fixed = value.toFixed(precision)
  return fixed.replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1")
}

function escapeAttribute(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
}

function renderPath(node: VectorPathNode): string {
  const attributes = [
    node.name ? `android:name="${escapeAttribute(node.name)}"` : "",
    `android:pathData="${escapeAttribute(node.pathData)}"`,
    node.style.fillColor ? `android:fillColor="${node.style.fillColor}"` : "",
    typeof node.style.fillAlpha === "number"
      ? `android:fillAlpha="${formatNumber(node.style.fillAlpha)}"`
      : "",
    node.style.fillType ? `android:fillType="${node.style.fillType}"` : "",
    node.style.strokeColor ? `android:strokeColor="${node.style.strokeColor}"` : "",
    typeof node.style.strokeAlpha === "number"
      ? `android:strokeAlpha="${formatNumber(node.style.strokeAlpha)}"`
      : "",
    typeof node.style.strokeWidth === "number"
      ? `android:strokeWidth="${formatNumber(node.style.strokeWidth)}"`
      : "",
    node.style.strokeLineCap ? `android:strokeLineCap="${node.style.strokeLineCap}"` : "",
    node.style.strokeLineJoin ? `android:strokeLineJoin="${node.style.strokeLineJoin}"` : "",
    typeof node.style.strokeMiterLimit === "number"
      ? `android:strokeMiterLimit="${formatNumber(node.style.strokeMiterLimit)}"`
      : "",
  ].filter(Boolean)

  return `<path ${attributes.join(" ")} />`
}

function renderGroup(node: VectorGroupNode): string {
  const transform = node.transform
  const attributes = [
    node.name ? `android:name="${escapeAttribute(node.name)}"` : "",
    transform ? `android:translateX="${formatNumber(transform.translateX)}"` : "",
    transform ? `android:translateY="${formatNumber(transform.translateY)}"` : "",
    transform && transform.scaleX !== 1
      ? `android:scaleX="${formatNumber(transform.scaleX)}"`
      : "",
    transform && transform.scaleY !== 1
      ? `android:scaleY="${formatNumber(transform.scaleY)}"`
      : "",
    transform && transform.rotation !== 0
      ? `android:rotation="${formatNumber(transform.rotation)}"`
      : "",
    transform && transform.pivotX !== 0
      ? `android:pivotX="${formatNumber(transform.pivotX)}"`
      : "",
    transform && transform.pivotY !== 0
      ? `android:pivotY="${formatNumber(transform.pivotY)}"`
      : "",
  ].filter(Boolean)

  return `<group ${attributes.join(" ")}>${node.children.map(renderNode).join("")}</group>`
}

function renderNode(node: VectorNode): string {
  return node.kind === "path" ? renderPath(node) : renderGroup(node)
}

function serializeVectorDrawable(graphic: VectorDrawableGraphic) {
  const rootAttributes = [
    'xmlns:android="http://schemas.android.com/apk/res/android"',
    `android:width="${formatNumber(graphic.width)}dp"`,
    `android:height="${formatNumber(graphic.height)}dp"`,
    `android:viewportWidth="${formatNumber(graphic.viewportWidth)}"`,
    `android:viewportHeight="${formatNumber(graphic.viewportHeight)}"`,
  ]

  return `<vector ${rootAttributes.join(" ")}>${graphic.children.map(renderNode).join("")}</vector>`
}

export function convertSvgToVectorDrawable(
  svg: string,
  options: ConvertSvgOptions = {},
): ConvertSvgResult {
  const graphic = normalizeSvgDocument(parseSvg(svg))
  const precision = options.precision ?? 4
  const xml =
    options.optimize === false
      ? serializeVectorDrawable(graphic)
      : optimizeXml(serializeVectorDrawable(graphic), precision)
  const warnings = [...graphic.warnings, ...validateVectorDrawable(xml, graphic)]
  const encoder = new TextEncoder()
  const sourceBytes = encoder.encode(svg).length
  const outputBytes = encoder.encode(xml).length

  return {
    xml,
    graphic,
    warnings,
    metrics: {
      sourceBytes,
      outputBytes,
      savingRatio: sourceBytes === 0 ? 0 : Number(((1 - outputBytes / sourceBytes) * 100).toFixed(2)),
    },
  }
}
