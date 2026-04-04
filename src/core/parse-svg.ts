import { DOMParser as XmlDomParser } from "@xmldom/xmldom"

import type { RawSvgDocument, RawSvgElement } from "./types"

const UNSUPPORTED_TAGS = new Set([
  "clipPath",
  "defs",
  "filter",
  "foreignObject",
  "image",
  "mask",
  "metadata",
  "pattern",
  "script",
  "style",
  "symbol",
  "text",
  "textPath",
  "use",
])

function createParser() {
  return typeof DOMParser !== "undefined" ? new DOMParser() : new XmlDomParser()
}

function readAttributes(element: Element) {
  return Array.from(element.attributes).reduce<Record<string, string>>((attributes, attribute) => {
    attributes[attribute.name] = attribute.value
    return attributes
  }, {})
}

function toRawElement(node: Element, warnings: RawSvgDocument["warnings"]): RawSvgElement | null {
  const tagName = node.tagName

  if (UNSUPPORTED_TAGS.has(tagName)) {
    warnings.push({
      code: `unsupported-${tagName}`,
      message: `检测到不受支持的 SVG 元素 <${tagName}>，转换结果可能出现差异。`,
      level: tagName === "defs" || tagName === "style" ? "info" : "warning",
    })
    return null
  }

  const children = Array.from(node.childNodes)
    .filter((child): child is Element => child.nodeType === 1)
    .map((child) => toRawElement(child, warnings))
    .filter((child): child is RawSvgElement => child !== null)

  return {
    tagName,
    attributes: readAttributes(node),
    children,
  }
}

export function parseSvg(svg: string): RawSvgDocument {
  const parser = createParser()
  const document = parser.parseFromString(svg, "image/svg+xml")
  const root = document.getElementsByTagName("svg")[0]

  if (!root) {
    return {
      rootAttributes: {},
      children: [],
      warnings: [
        {
          code: "missing-svg-root",
          message: "输入内容不包含有效的 <svg> 根节点。",
          level: "error",
        },
      ],
    }
  }

  const warnings: RawSvgDocument["warnings"] = []
  const children = Array.from(root.childNodes)
    .filter((child): child is Element => child.nodeType === 1)
    .map((child) => toRawElement(child, warnings))
    .filter((child): child is RawSvgElement => child !== null)

  return {
    rootAttributes: readAttributes(root),
    children,
    warnings,
  }
}
