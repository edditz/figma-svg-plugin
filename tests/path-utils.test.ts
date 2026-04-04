import { describe, expect, it } from "vitest"

import { convertShapeToPath, roundPathData } from "@/core/path-utils"

describe("path utilities", () => {
  it("converts rect to path commands", () => {
    expect(convertShapeToPath("rect", { x: "2", y: "3", width: "6", height: "7" })).toBe(
      "M 2 3 H 8 V 10 H 2 Z",
    )
  })

  it("rounds path data safely", () => {
    expect(roundPathData("M 0.12345 1.98765 L 2.55555 3.44444", 3)).toBe(
      "M 0.123 1.988 L 2.556 3.444",
    )
  })
})
