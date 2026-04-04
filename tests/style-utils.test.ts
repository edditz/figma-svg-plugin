import { describe, expect, it } from "vitest"

import { normalizeColor, parseTransform } from "@/core/style-utils"

describe("style utilities", () => {
  it("parses rgba and 8 digit hex colors using SVG semantics", () => {
    expect(normalizeColor("#3366CC80")).toEqual({ color: "#3366CC", alpha: 0.5019607843137255 })
    expect(normalizeColor("rgba(79, 140, 255, 0.4)")).toEqual({ color: "#4F8CFF", alpha: 0.4 })
  })

  it("reports unsupported transform operations", () => {
    const parsed = parseTransform("translate(4 8) matrix(1 0 0 1 0 0)")

    expect(parsed.transform?.translateX).toBe(4)
    expect(parsed.transform?.translateY).toBe(8)
    expect(parsed.warnings[0]?.code).toBe("unsupported-transform")
  })
})
