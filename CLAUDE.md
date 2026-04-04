# SVG to VectorDrawable — Figma Plugin

将 Figma 选区中的矢量节点批量导出为 Android VectorDrawable XML。

## Quick Start

```bash
npm install
npm run dev       # UI 开发服务器 (localhost:4173)
npm run build     # 构建 plugin (dist/code.js + dist/index.html)
npm test          # 运行测试
npm run lint      # ESLint
```

## Architecture Overview

双构建架构：Vite 以 `ui` 模式构建 React UI，以 `code` 模式构建 Figma sandbox IIFE。
UI 通过 `postMessage` 与 Figma sandbox 通信，消息协议定义在 `src/shared/messages.ts`。

详细设计 → `docs/architecture.md`

## Directory Structure

```
src/
├── code.ts                       # Figma sandbox 入口 (IIFE, 运行在 plugin sandbox)
├── figma/                        # Figma API 交互层 (只能在 sandbox 中运行)
│   ├── scan-selection.ts         #   扫描选区，收集 IconCandidate
│   ├── apply-selection.ts        #   在画布上选中指定节点
│   └── export-svg.ts             #   通过 Figma API 导出 SVG 字节流
├── core/                         # 核心转换逻辑 (纯函数，无 Figma/浏览器依赖)
│   ├── types.ts                  #   内部 AST 类型 (RawSvg, VectorNode, etc.)
│   ├── parse-svg.ts              #   SVG 字符串 → RawSvgDocument
│   ├── normalize-svg.ts          #   归一化变换、样式
│   ├── style-utils.ts            #   CSS/SVG 样式解析工具
│   ├── path-utils.ts             #   SVG path data 解析与变换
│   ├── vectordrawable-converter.ts # RawSvgDocument → VectorDrawable XML
│   ├── optimize-xml.ts           #   XML 输出优化
│   └── validate-output.ts        #   输出校验
├── shared/                       # UI 和 sandbox 共享类型与工具
│   ├── types.ts                  #   IconCandidate, ExportedSvg, ConversionWarning, etc.
│   ├── messages.ts               #   postMessage 协议定义
│   └── filename.ts               #   Android 资源文件名处理
├── ui/                           # React UI (Figma plugin panel)
│   ├── main.tsx                  #   入口
│   ├── App.tsx                   #   主界面状态管理
│   ├── types.ts                  #   UI 层类型
│   ├── components/               #   UI 组件
│   ├── hooks/
│   │   └── use-plugin-bridge.ts  #   postMessage 桥接 hook
│   └── utils/
│       └── export-files.ts       #   ZIP 下载 & File System Access API
├── components/ui/                # shadcn/ui 基础组件 (不要手动编辑)
└── lib/
    └── utils.ts                  # shadcn cn() 工具

tests/                            # Vitest 测试
├── fixtures/                     #   SVG 测试样本
├── path-utils.test.ts
├── style-utils.test.ts
├── filename.test.ts
└── vectordrawable-converter.test.ts
```

## Key Conventions

1. **core/ 必须是纯函数** — 不能 import Figma API 或浏览器 API，所有 core/ 模块可在 Node.js 测试环境直接运行
2. **figma/ 只在 sandbox 中运行** — 可以引用 `figma` 全局对象，不能被 core/ 或 ui/ 导入
3. **消息协议严格类型化** — 所有 UI ↔ Figma 通信必须通过 `src/shared/messages.ts` 中定义的类型
4. **不可变数据** — 使用展开运算符创建新对象，禁止直接 mutate
5. **路径别名** — 使用 `@/` 代替相对路径 (`@/core/...`, `@/shared/...`)
6. **UI 语言为中文** — 用户可见的提示文本、按钮文字一律使用中文
7. **shadcn/ui 组件** — `src/components/ui/` 下为自动生成的组件，不要手动编辑
8. **单文件 < 400 行** — 超过时拆分模块

## Documentation Map

| 文档 | 内容 |
|------|------|
| `docs/architecture.md` | 系统设计、模块关系、数据流 |
| `docs/conventions.md` | 编码规范、命名约定、模式 |
| `docs/testing.md` | 测试策略、如何写测试 |
| `docs/build.md` | 构建系统、双构建配置 |

## Common Tasks

| 任务 | 相关文件 | 命令 |
|------|----------|------|
| 修改转换逻辑 | `src/core/vectordrawable-converter.ts` | `npm test` |
| 添加 SVG 解析支持 | `src/core/parse-svg.ts` + `tests/` | `npm test` |
| 修改 UI 布局 | `src/ui/App.tsx`, `src/ui/components/` | `npm run dev` |
| 添加新的 Figma 操作 | `src/figma/` + `src/shared/messages.ts` | `npm run build` |
| 修改导出选项 | `src/shared/types.ts` → `src/ui/components/export-settings.tsx` | `npm run dev` |
| 调试转换问题 | 添加 SVG fixture → 写测试 → 修复 core/ | `npm test -- --watch` |
