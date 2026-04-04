import { roundPathData } from "./path-utils"

const NUMERIC_ATTRIBUTE_PATTERN =
  /android:(width|height|viewportWidth|viewportHeight|fillAlpha|strokeAlpha|strokeWidth|strokeMiterLimit|translateX|translateY|scaleX|scaleY|rotation|pivotX|pivotY)="([^"]+)"/g

function formatNumber(value: number, precision = 4) {
  const fixed = value.toFixed(precision)
  return fixed.replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1")
}

function optimizeAttributeValue(value: string, precision: number) {
  return value.replace(/-?\d*\.?\d+(?:e[+-]?\d+)?/gi, (token) =>
    formatNumber(Number(token), precision),
  )
}

export function optimizeXml(xml: string, precision = 4) {
  const optimizedAttributes = xml.replace(NUMERIC_ATTRIBUTE_PATTERN, (_, name, value) => {
    return `android:${name}="${optimizeAttributeValue(value, precision)}"`
  })

  return optimizedAttributes
    .replace(/android:pathData="([^"]+)"/g, (_, pathData) => {
      return `android:pathData="${roundPathData(pathData, precision)}"`
    })
    .replace(/>\s+</g, "><")
    .trim()
}
