# SVG to VectorDrawable — Figma 插件

将 Figma 选区中的矢量节点批量转换为 Android VectorDrawable XML 文件。

[English](./README.md)

## 功能

- **批量扫描** — 扫描当前选区，自动识别可转换的矢量节点
- **预检提示** — 检测不支持的特性（文字、位图、效果、蒙版、裁剪）并给出警告
- **一键转换** — 将 SVG 转换为 Android VectorDrawable XML，可配置精度和优化选项
- **灵活导出** — 下载 ZIP 包，或通过 File System Access API 直接写入本地目录
- **自定义命名** — 可配置前缀/后缀，自动归一化为 Android 资源文件名

## 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装

```bash
npm install
```

### 开发

```bash
npm run dev        # 启动 UI 开发服务器 localhost:4173
```

### 构建

```bash
npm run build      # 完整构建：类型检查 → UI → code
```

构建完成后，在 Figma 中加载 `dist/` 目录作为插件即可。

### 测试

```bash
npm test           # 运行测试
npm run test:watch # 监听模式
```

### 代码检查

```bash
npm run lint
```

## 架构

本插件采用双构建架构：

- **Figma Sandbox**（`src/code.ts`）— 运行在 Figma 沙箱环境中，可访问 Figma API
- **UI 面板**（React SPA）— 渲染插件界面，可访问浏览器 DOM

两个环境之间通过 `postMessage` 通信，消息协议在 `src/shared/messages.ts` 中严格类型定义。

核心转换逻辑位于 `src/core/`，是纯 TypeScript 实现，不依赖 Figma 或浏览器 API，可在 Node.js 环境中完整测试。

```
src/
├── code.ts             # Figma 沙箱入口 (IIFE)
├── figma/              # Figma API 交互层
├── core/               # SVG → VectorDrawable 转换（纯函数）
├── shared/             # 共享类型和工具
├── ui/                 # React UI 组件
└── components/ui/      # shadcn/ui 基础组件
```

## 配置

### 导出设置

| 设置 | 默认值 | 说明 |
|------|--------|------|
| 前缀 | `ic_` | 文件名前缀 |
| 后缀 | _(空)_ | 文件名后缀 |
| 精度 | `4` | 路径数据小数位数 |
| 优化 | `true` | 移除冗余空白、缩短数字精度 |
| 输出目录 | `app/src/main/res/drawable` | 导出的子目录路径 |

## 技术栈

- **运行时**: TypeScript, React 18
- **构建**: Vite（双模式：UI + IIFE）
- **UI**: Tailwind CSS, shadcn/ui, Radix UI, Lucide Icons
- **SVG/XML**: xmldom, fast-xml-parser
- **导出**: JSZip, File System Access API
- **测试**: Vitest
- **代码检查**: ESLint, typescript-eslint

## 许可证

详见 [LICENSE](./LICENSE)。
