import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

import { convertSvgToVectorDrawable } from "@/core/vectordrawable-converter"

function readFixture(fileName: string) {
  return fs.readFileSync(path.resolve(__dirname, "fixtures", fileName), "utf8")
}

describe("VectorDrawable converter", () => {
  it("converts a basic stroked icon", () => {
    const result = convertSvgToVectorDrawable(readFixture("basic-icon.svg"))

    expect(result.xml).toContain("<vector")
    expect(result.xml).toContain('android:strokeColor="#6D5EF9"')
    expect(result.xml).toContain('android:strokeLineCap="round"')
    expect(result.warnings.filter((warning) => warning.level === "error")).toHaveLength(0)
  })

  it("preserves alpha from SVG fill colors", () => {
    const result = convertSvgToVectorDrawable(readFixture("fill-alpha-icon.svg"))

    expect(result.xml).toContain('android:fillColor="#3366CC"')
    expect(result.xml).toContain('android:fillAlpha="0.502"')
  })

  it("warns when unsupported clip paths are present", () => {
    const result = convertSvgToVectorDrawable(readFixture("clipped-icon.svg"))

    expect(result.warnings.some((warning) => warning.code === "unsupported-defs")).toBe(true)
    expect(result.xml).toContain("<vector")
  })
})
