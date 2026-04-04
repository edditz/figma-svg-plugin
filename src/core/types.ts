import type { ConversionWarning, OutputMetrics } from "@/shared/types"

export interface ViewBox {
  minX: number
  minY: number
  width: number
  height: number
}

export interface RawSvgElement {
  tagName: string
  attributes: Record<string, string>
  children: RawSvgElement[]
}

export interface RawSvgDocument {
  rootAttributes: Record<string, string>
  children: RawSvgElement[]
  warnings: ConversionWarning[]
}

export interface GroupTransform {
  translateX: number
  translateY: number
  scaleX: number
  scaleY: number
  rotation: number
  pivotX: number
  pivotY: number
}

export interface VectorPathStyle {
  fillColor?: string
  fillAlpha?: number
  fillType?: "nonZero" | "evenOdd"
  strokeColor?: string
  strokeAlpha?: number
  strokeWidth?: number
  strokeLineCap?: "butt" | "round" | "square"
  strokeLineJoin?: "miter" | "round" | "bevel"
  strokeMiterLimit?: number
}

export interface VectorPathNode {
  kind: "path"
  name?: string
  pathData: string
  style: VectorPathStyle
}

export interface VectorGroupNode {
  kind: "group"
  name?: string
  transform?: GroupTransform
  children: VectorNode[]
}

export type VectorNode = VectorGroupNode | VectorPathNode

export interface VectorDrawableGraphic {
  width: number
  height: number
  viewportWidth: number
  viewportHeight: number
  children: VectorNode[]
  warnings: ConversionWarning[]
}

export interface ConvertSvgOptions {
  name?: string
  precision?: number
  optimize?: boolean
}

export interface ConvertSvgResult {
  xml: string
  graphic: VectorDrawableGraphic
  warnings: ConversionWarning[]
  metrics: OutputMetrics
}
