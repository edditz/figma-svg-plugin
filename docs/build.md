# Build System

## Overview

项目使用 Vite 双构建模式，生成 Figma Plugin 所需的两个产物。

## Build Pipeline

```
npm run build
  ├── tsc -b                    # TypeScript 类型检查
  ├── npm run build:ui          # Vite --mode ui → dist/index.html (内联 CSS/JS)
  └── npm run build:code        # Vite --mode code → dist/code.js (IIFE, 内嵌 UI HTML)
```

## Build Modes

### UI Mode (`vite build --mode ui`)

- **入口**: `src/ui/index.html`
- **输出**: `dist/index.html` (所有资源内联)
- **插件**: `@vitejs/plugin-react` + `inlineFigmaUiAssets()` (post-build 内联)
- **特性**: CSS/JS 在构建后被内联到 HTML，生成自包含的 UI 文件

### Code Mode (`vite build --mode code`)

- **入口**: `src/code.ts`
- **输出**: `dist/code.js` (IIFE 格式)
- **特性**: 读取 `dist/index.html` 内容作为 `__FIGMA_UI_HTML__` 常量嵌入
- **目标**: ES2018

## Key Build Details

- UI 构建会清空 `dist/`，Code 构建不会 (`emptyOutDir: false`)
- Script 内联使用 base64 编码 + bootstrap loader（Figma CSP 限制）
- CSS 内联为 `<style>` 标签
- 路径别名 `@/` → `./src/` 在两种模式中都生效

## Development

```bash
npm run dev    # UI 开发服务器，localhost:4173
               # 注意：只启动 UI 部分，Figma API 调用会失败
```

开发时在 Figma 中加载 `dist/` 需要先 `npm run build`。

## Figma Plugin Manifest

`manifest.json` 指定：
- `main`: `dist/code.js`
- `ui`: `dist/index.html`
- `editorType`: `figma`
- `api`: `1.0.0`
