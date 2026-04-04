# Architecture

## System Design

Figma Plugin 双构建架构，运行在两个隔离环境中：

1. **Figma Sandbox** (`code.ts` IIFE) — 可访问 Figma API，无 DOM
2. **UI Panel** (React SPA) — 有 DOM，无法访问 Figma API

两者通过 `postMessage` 双向通信。

## Module Dependencies

```
UI Layer (src/ui/)
  ↓ imports from
Shared Layer (src/shared/)
  ↑ imports from
Figma Layer (src/figma/)    Core Layer (src/core/)
```

### Dependency Rules

- `core/` → 只能导入 `core/` 内部模块和 `shared/`
- `shared/` → 无外部依赖（纯类型和工具函数）
- `figma/` → 只能导入 `shared/`（不能导入 `ui/`）
- `ui/` → 可以导入 `shared/`、`core/`（不能导入 `figma/`）
- `components/ui/` → shadcn 生成，不被上述规则约束

## Data Flow

### 1. 扫描选区

```
UI → SCAN_SELECTION → code.ts → scanSelection()
                                         ↓
                                    遍历 figma.currentPage.selection
                                    过滤：visible + hasGeometry + exportable + hasVectorContent
                                    收集 warnings (text, image, effects, mask, clip)
                                         ↓
                                    IconCandidate[]
                              ← SCAN_RESULT ← code.ts
```

### 2. 导出 SVG

```
UI → EXPORT_SVGS(nodeIds) → code.ts → exportSvgBatch()
                                            ↓
                                       逐个 exportAsync({ format: "SVG" })
                                       解码 UTF-8 → svg 字符串
                                       进度回调 → EXPORT_PROGRESS
                                            ↓
                                       ExportedSvg[] + ExportFailure[]
                              ← EXPORT_RESULT ← code.ts
```

### 3. SVG → VectorDrawable 转换

```
UI 收到 ExportedSvg[]
  ↓ dynamic import
convertSvgToVectorDrawable(svg, options)
  ↓
  parseSvg(svg)           → RawSvgDocument (AST)
  normalizeSvgDocument()  → 合并 transform、归一化样式
  build VectorDrawableGraphic (VectorNode tree)
  renderXml()             → Android VectorDrawable XML string
  optimizeXml()           → 移除冗余空白、缩短数字精度
  validateOutput()        → 检查必需属性、Android 兼容性
  ↓
ConvertSvgResult { xml, graphic, warnings, metrics }
```

## Message Protocol

所有消息类型定义在 `src/shared/messages.ts`：

| 方向 | 类型 | 描述 |
|------|------|------|
| UI → Plugin | `SCAN_SELECTION` | 请求扫描当前选区 |
| UI → Plugin | `APPLY_SELECTION` | 选中指定节点 |
| UI → Plugin | `EXPORT_SVGS` | 批量导出 SVG |
| Plugin → UI | `SCAN_RESULT` | 返回 IconCandidate 列表 |
| Plugin → UI | `SELECTION_APPLIED` | 确认节点已选中 |
| Plugin → UI | `EXPORT_PROGRESS` | 导出进度更新 |
| Plugin → UI | `EXPORT_RESULT` | 返回导出结果 |
| Plugin → UI | `PLUGIN_ERROR` | 错误通知 |

每条消息包含 `requestId` 用于请求-响应关联。

## Build System

详见 `docs/build.md`。核心要点：

- `npm run build` 先构建 UI (`vite build --mode ui`)，再构建 code (`vite build --mode code`)
- UI 构建后，CSS 和 JS 会被内联到 `dist/index.html`
- Code 构建读取 `dist/index.html` 内容作为 `__FIGMA_UI_HTML__` 常量嵌入 `dist/code.js`
- 最终产物：`dist/code.js` + `dist/index.html`（Figma 从 code.js 加载，它内含 UI HTML）
