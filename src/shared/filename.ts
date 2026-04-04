const INVALID_CHAR_PATTERN = /[^a-z0-9_]+/g
const MULTI_UNDERSCORE_PATTERN = /_+/g
const TRIM_UNDERSCORE_PATTERN = /^_+|_+$/g

export function normalizeAndroidResourceName(value: string, fallback = "ic_vector") {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(INVALID_CHAR_PATTERN, "_")
    .replace(MULTI_UNDERSCORE_PATTERN, "_")
    .replace(TRIM_UNDERSCORE_PATTERN, "")

  if (!normalized) {
    return fallback
  }

  return /^[a-z]/.test(normalized) ? normalized : `${fallback}_${normalized}`
}

export function applyNamePattern(baseName: string, prefix: string, suffix: string) {
  return normalizeAndroidResourceName(`${prefix}${baseName}${suffix}`)
}

export function dedupeFileNames(names: string[]) {
  const nextNames = new Map<string, number>()

  return names.map((name) => {
    const base = normalizeAndroidResourceName(name)
    const seen = nextNames.get(base) ?? 0
    nextNames.set(base, seen + 1)

    if (seen === 0) {
      return base
    }

    return `${base}_${seen + 1}`
  })
}

export function joinOutputPath(directory: string, fileName: string) {
  const cleanDirectory = directory
    .split("/")
    .map((segment) => segment.trim())
    .filter(Boolean)
    .join("/")

  return cleanDirectory ? `${cleanDirectory}/${fileName}.xml` : `${fileName}.xml`
}
