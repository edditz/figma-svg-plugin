import fs from "node:fs"
import fsp from "node:fs/promises"
import path from "node:path"

import react from "@vitejs/plugin-react"
import { defineConfig, type PluginOption } from "vite"

const rootDir = __dirname
const uiRoot = path.resolve(rootDir, "src/ui")
const distDir = path.resolve(rootDir, "dist")
const distHtmlPath = path.resolve(distDir, "index.html")
const fallbackHtml = "<!doctype html><html lang=\"zh-CN\"><body><div id=\"root\"></div></body></html>"

function resolveAssetPath(assetPath: string) {
  return path.resolve(distDir, assetPath.replace(/^\.\//, "").replace(/^\//, ""))
}

function escapeInlineTagContent(content: string, tagName: "script" | "style") {
  return content.replace(new RegExp(`</${tagName}`, "gi"), `<\\/${tagName}`)
}

function encodeInlineContent(content: string) {
  return Buffer.from(content, "utf8").toString("base64")
}

function createInlineScriptBootstrap(content: string) {
  const encoded = encodeInlineContent(content)

  return [
    "<script>",
    "(() => {",
    "  const decode = (value) => new TextDecoder().decode(Uint8Array.from(atob(value), (char) => char.charCodeAt(0)))",
    "  const mount = () => {",
    '    const script = document.createElement("script")',
    '    script.type = "module"',
    '    script.textContent = decode("' + encoded + '")',
    '    document.body.appendChild(script)',
    "  }",
    '  if (document.readyState === "loading") {',
    '    document.addEventListener("DOMContentLoaded", mount, { once: true })',
    "  } else {",
    "    mount()",
    "  }",
    "})()",
    "</script>",
  ].join("\n")
}

function inlineFigmaUiAssets(): PluginOption {
  return {
    name: "inline-figma-ui-assets",
    apply: "build",
    enforce: "post",
    async closeBundle() {
      if (!fs.existsSync(distHtmlPath)) {
        return
      }

      let html = await fsp.readFile(distHtmlPath, "utf8")
      const stylesheetPaths = Array.from(html.matchAll(/<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g)).map(
        (match) => match[1],
      )
      const scriptPaths = Array.from(html.matchAll(/<script type="module"[^>]*src="([^"]+)"[^>]*><\/script>/g)).map(
        (match) => match[1],
      )

      for (const stylesheetPath of stylesheetPaths) {
        const css = await fsp.readFile(resolveAssetPath(stylesheetPath), "utf8")
        html = html.replace(
          new RegExp(`<link rel="stylesheet"[^>]*href="${stylesheetPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[^>]*>`),
          `<style>${escapeInlineTagContent(css, "style")}</style>`,
        )
      }

      for (const scriptPath of scriptPaths) {
        const js = await fsp.readFile(resolveAssetPath(scriptPath), "utf8")
        html = html.replace(
          new RegExp(`<script type="module"[^>]*src="${scriptPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[^>]*><\\/script>`),
          createInlineScriptBootstrap(js),
        )
      }

      await fsp.writeFile(distHtmlPath, html)
    },
  }
}

export default defineConfig(({ mode }) => {
  if (mode === "code") {
    const uiHtml = fs.existsSync(distHtmlPath) ? fs.readFileSync(distHtmlPath, "utf8") : fallbackHtml

    return {
      define: {
        __FIGMA_UI_HTML__: JSON.stringify(uiHtml),
      },
      resolve: {
        alias: {
          "@": path.resolve(rootDir, "./src"),
        },
      },
      build: {
        outDir: distDir,
        emptyOutDir: false,
        lib: {
          entry: path.resolve(rootDir, "src/code.ts"),
          formats: ["iife"],
          name: "FigmaSvgVectorDrawablePlugin",
          fileName: () => "code.js",
        },
        rollupOptions: {
          output: {
            inlineDynamicImports: true,
          },
        },
        sourcemap: false,
        target: "es2018",
      },
    }
  }

  return {
    root: uiRoot,
    base: "./",
    plugins: [react(), inlineFigmaUiAssets()],
    resolve: {
      alias: {
        "@": path.resolve(rootDir, "./src"),
      },
    },
    server: {
      host: "0.0.0.0",
      allowedHosts: true,
      port: 4173,
    },
    build: {
      outDir: distDir,
      emptyOutDir: true,
      cssCodeSplit: false,
      sourcemap: false,
      target: "es2018",
      rollupOptions: {
        output: {
          inlineDynamicImports: true,
        },
      },
    },
  }
})
