import { describe, expect, it } from "vitest"

import {
  applyNamePattern,
  dedupeFileNames,
  joinOutputPath,
  normalizeAndroidResourceName,
} from "@/shared/filename"

describe("filename utilities", () => {
  it("normalizes android resource names", () => {
    expect(normalizeAndroidResourceName("  Hero/Icon 24px ")).toBe("hero_icon_24px")
    expect(normalizeAndroidResourceName("24/Icon")).toBe("ic_vector_24_icon")
  })

  it("applies prefix suffix and deduplicates names", () => {
    expect(applyNamePattern("check_mark", "ic_", "_filled")).toBe("ic_check_mark_filled")
    expect(dedupeFileNames(["ic_star", "ic_star", "ic_star"])).toEqual([
      "ic_star",
      "ic_star_2",
      "ic_star_3",
    ])
  })

  it("joins output paths", () => {
    expect(joinOutputPath("app/src/main/res/drawable", "ic_check")).toBe(
      "app/src/main/res/drawable/ic_check.xml",
    )
  })
})
