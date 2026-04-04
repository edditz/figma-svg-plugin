import type { ConversionWarning } from "@/shared/types"

import type { GroupTransform, ViewBox } from "./types"

export type PresentationAttributes = Record<string, string | undefined>

const PRESENTATION_KEYS = [
  "fill",
  "fill-opacity",
  "fill-rule",
  "stroke",
  "stroke-opacity",
  "stroke-width",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-miterlimit",
  "opacity",
] as const

const RGB_PATTERN = /rgba?\(([^)]+)\)/i
const HEX_PATTERN = /^#([0-9a-f]{3,8})$/i

function expandHex(value: string) {
  if (value.length === 3 || value.length === 4) {
    return value
      .split("")
      .map((part) => `${part}${part}`)
      .join("")
  }

  return value
}

function clampAlpha(value: number) {
  return Math.max(0, Math.min(1, value))
}

export function parseNumber(value: string | undefined, fallback = 0) {
  if (!value) {
    return fallback
  }

  const numeric = Number.parseFloat(value.replace(/px|pt|em|rem|%/g, ""))
  return Number.isFinite(numeric) ? numeric : fallback
}

export function resolveDimension(value: string | undefined, fallback: number) {
  const numeric = parseNumber(value, fallback)
  return numeric > 0 ? numeric : fallback
}

export function parseInlineStyle(styleValue: string | undefined) {
  if (!styleValue) {
    return {} as PresentationAttributes
  }

  return styleValue
    .split(";")
    .map((segment) => segment.trim())
    .filter(Boolean)
    .reduce<PresentationAttributes>((styleMap, segment) => {
      const [key, value] = segment.split(":")
      if (key && value) {
        styleMap[key.trim()] = value.trim()
      }
      return styleMap
    }, {})
}

export function extractPresentationAttributes(attributes: Record<string, string>) {
  const inlineStyle = parseInlineStyle(attributes.style)

  return PRESENTATION_KEYS.reduce<PresentationAttributes>((presentation, key) => {
    presentation[key] = attributes[key] ?? inlineStyle[key]
    return presentation
  }, {})
}

export function mergePresentationAttributes(
  parent: PresentationAttributes,
  local: PresentationAttributes,
) {
  return PRESENTATION_KEYS.reduce<PresentationAttributes>((merged, key) => {
    merged[key] = local[key] ?? parent[key]
    return merged
  }, {})
}

export function parseViewBox(attributes: Record<string, string>): ViewBox {
  const rawViewBox = attributes.viewBox?.split(/[\s,]+/).map((value) => Number(value))

  if (rawViewBox?.length === 4 && rawViewBox.every((value) => Number.isFinite(value))) {
    return {
      minX: rawViewBox[0],
      minY: rawViewBox[1],
      width: Math.abs(rawViewBox[2]) || 24,
      height: Math.abs(rawViewBox[3]) || 24,
    }
  }

  return {
    minX: 0,
    minY: 0,
    width: resolveDimension(attributes.width, 24),
    height: resolveDimension(attributes.height, 24),
  }
}

export function normalizeColor(value: string | undefined) {
  if (!value || value === "inherit") {
    return { color: undefined, alpha: 1 }
  }

  if (value === "none") {
    return { color: undefined, alpha: 0, isNone: true }
  }

  const hexMatch = value.match(HEX_PATTERN)
  if (hexMatch) {
    const expanded = expandHex(hexMatch[1])

    if (expanded.length === 6) {
      return { color: `#${expanded.toUpperCase()}`, alpha: 1 }
    }

    if (expanded.length === 8) {
      const color = expanded.slice(0, 6)
      const alpha = clampAlpha(Number.parseInt(expanded.slice(6, 8), 16) / 255)
      return { color: `#${color.toUpperCase()}`, alpha }
    }
  }

  const rgbMatch = value.match(RGB_PATTERN)
  if (rgbMatch) {
    const [red = "0", green = "0", blue = "0", alphaValue = "1"] = rgbMatch[1]
      .split(",")
      .map((segment) => segment.trim())

    const color = [red, green, blue]
      .map((segment) => Math.max(0, Math.min(255, Number.parseInt(segment, 10))))
      .map((segment) => segment.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()

    return {
      color: `#${color}`,
      alpha: clampAlpha(Number.parseFloat(alphaValue)),
    }
  }

  const namedColors: Record<string, string> = {
    black: "#000000",
    white: "#FFFFFF",
    red: "#FF0000",
    green: "#008000",
    blue: "#0000FF",
    transparent: "#000000",
  }

  if (namedColors[value]) {
    return {
      color: namedColors[value],
      alpha: value === "transparent" ? 0 : 1,
    }
  }

  return {
    color: undefined,
    alpha: 1,
    warning: {
      code: "unsupported-color",
      message: `颜色值 ${value} 无法被准确解析，已回退为默认颜色。`,
      level: "warning",
    } satisfies ConversionWarning,
  }
}

export function parseTransform(transformValue: string | undefined) {
  if (!transformValue) {
    return { transform: undefined, warnings: [] as ConversionWarning[] }
  }

  const transform: GroupTransform = {
    translateX: 0,
    translateY: 0,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
    pivotX: 0,
    pivotY: 0,
  }
  const warnings: ConversionWarning[] = []
  const tokens = transformValue.matchAll(/([a-zA-Z]+)\(([^)]+)\)/g)

  for (const [, operation, rawValues] of tokens) {
    const values = rawValues
      .split(/[\s,]+/)
      .map((value) => value.trim())
      .filter(Boolean)
      .map((value) => Number.parseFloat(value))

    if (operation === "translate") {
      transform.translateX += values[0] ?? 0
      transform.translateY += values[1] ?? 0
      continue
    }

    if (operation === "scale") {
      transform.scaleX *= values[0] ?? 1
      transform.scaleY *= values[1] ?? values[0] ?? 1
      continue
    }

    if (operation === "rotate") {
      transform.rotation += values[0] ?? 0
      transform.pivotX = values[1] ?? transform.pivotX
      transform.pivotY = values[2] ?? transform.pivotY
      continue
    }

    warnings.push({
      code: "unsupported-transform",
      message: `变换 ${operation} 无法被完整映射到 VectorDrawable。`,
      level: "warning",
    })
  }

  return { transform, warnings }
}

export function hasActiveTransform(transform: GroupTransform | undefined) {
  return Boolean(
    transform &&
      (transform.translateX !== 0 ||
        transform.translateY !== 0 ||
        transform.scaleX !== 1 ||
        transform.scaleY !== 1 ||
        transform.rotation !== 0),
  )
}
