function parseNumber(value: string | undefined, fallback = 0) {
  if (!value) {
    return fallback
  }

  const numeric = Number.parseFloat(value)
  return Number.isFinite(numeric) ? numeric : fallback
}

function formatNumber(value: number, precision = 4) {
  const fixed = value.toFixed(precision)
  return fixed.replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1")
}

function buildRoundRectPath(x: number, y: number, width: number, height: number, rx: number, ry: number) {
  const clampedRx = Math.min(rx, width / 2)
  const clampedRy = Math.min(ry, height / 2)

  return [
    `M ${formatNumber(x + clampedRx)} ${formatNumber(y)}`,
    `H ${formatNumber(x + width - clampedRx)}`,
    `A ${formatNumber(clampedRx)} ${formatNumber(clampedRy)} 0 0 1 ${formatNumber(x + width)} ${formatNumber(y + clampedRy)}`,
    `V ${formatNumber(y + height - clampedRy)}`,
    `A ${formatNumber(clampedRx)} ${formatNumber(clampedRy)} 0 0 1 ${formatNumber(x + width - clampedRx)} ${formatNumber(y + height)}`,
    `H ${formatNumber(x + clampedRx)}`,
    `A ${formatNumber(clampedRx)} ${formatNumber(clampedRy)} 0 0 1 ${formatNumber(x)} ${formatNumber(y + height - clampedRy)}`,
    `V ${formatNumber(y + clampedRy)}`,
    `A ${formatNumber(clampedRx)} ${formatNumber(clampedRy)} 0 0 1 ${formatNumber(x + clampedRx)} ${formatNumber(y)}`,
    "Z",
  ].join(" ")
}

function pointsToPath(points: string | undefined, close: boolean) {
  const values = (points ?? "")
    .trim()
    .split(/[\s,]+/)
    .filter(Boolean)
    .map((value) => Number.parseFloat(value))

  if (values.length < 4) {
    return ""
  }

  const commands = [`M ${formatNumber(values[0])} ${formatNumber(values[1])}`]

  for (let index = 2; index < values.length; index += 2) {
    commands.push(`L ${formatNumber(values[index])} ${formatNumber(values[index + 1] ?? values[index])}`)
  }

  if (close) {
    commands.push("Z")
  }

  return commands.join(" ")
}

export function convertShapeToPath(tagName: string, attributes: Record<string, string>) {
  if (tagName === "path") {
    return attributes.d ?? ""
  }

  if (tagName === "rect") {
    const x = parseNumber(attributes.x)
    const y = parseNumber(attributes.y)
    const width = parseNumber(attributes.width)
    const height = parseNumber(attributes.height)
    const rx = parseNumber(attributes.rx)
    const ry = parseNumber(attributes.ry || attributes.rx)

    if (rx > 0 || ry > 0) {
      return buildRoundRectPath(x, y, width, height, rx, ry)
    }

    return `M ${formatNumber(x)} ${formatNumber(y)} H ${formatNumber(x + width)} V ${formatNumber(y + height)} H ${formatNumber(x)} Z`
  }

  if (tagName === "circle") {
    const cx = parseNumber(attributes.cx)
    const cy = parseNumber(attributes.cy)
    const radius = parseNumber(attributes.r)

    return `M ${formatNumber(cx - radius)} ${formatNumber(cy)} A ${formatNumber(radius)} ${formatNumber(radius)} 0 1 0 ${formatNumber(cx + radius)} ${formatNumber(cy)} A ${formatNumber(radius)} ${formatNumber(radius)} 0 1 0 ${formatNumber(cx - radius)} ${formatNumber(cy)} Z`
  }

  if (tagName === "ellipse") {
    const cx = parseNumber(attributes.cx)
    const cy = parseNumber(attributes.cy)
    const rx = parseNumber(attributes.rx)
    const ry = parseNumber(attributes.ry)

    return `M ${formatNumber(cx - rx)} ${formatNumber(cy)} A ${formatNumber(rx)} ${formatNumber(ry)} 0 1 0 ${formatNumber(cx + rx)} ${formatNumber(cy)} A ${formatNumber(rx)} ${formatNumber(ry)} 0 1 0 ${formatNumber(cx - rx)} ${formatNumber(cy)} Z`
  }

  if (tagName === "line") {
    return `M ${formatNumber(parseNumber(attributes.x1))} ${formatNumber(parseNumber(attributes.y1))} L ${formatNumber(parseNumber(attributes.x2))} ${formatNumber(parseNumber(attributes.y2))}`
  }

  if (tagName === "polyline") {
    return pointsToPath(attributes.points, false)
  }

  if (tagName === "polygon") {
    return pointsToPath(attributes.points, true)
  }

  return ""
}

export function roundPathData(pathData: string, precision = 4) {
  return pathData.replace(/-?\d*\.?\d+(?:e[+-]?\d+)?/gi, (token) =>
    formatNumber(Number(token), precision),
  )
}
