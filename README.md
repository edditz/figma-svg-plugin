# SVG to VectorDrawable — Figma Plugin

A Figma plugin that batch-converts selected vector nodes into Android VectorDrawable XML files.

[中文文档](./README.zh-CN.md)

## Features

- **Batch Scan** — Scans the current selection and identifies vector nodes suitable for conversion
- **Pre-flight Checks** — Warns about unsupported features (text, images, effects, masks, clips)
- **One-click Convert** — Converts SVG to Android VectorDrawable XML with configurable precision and optimization
- **Flexible Export** — Download as ZIP, or write directly to a local directory via the File System Access API
- **Custom Naming** — Configurable prefix/suffix with Android resource name normalization

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9

### Install

```bash
npm install
```

### Development

```bash
npm run dev        # Start UI dev server at localhost:4173
```

### Build

```bash
npm run build      # Full build: typecheck → UI → code
```

After building, load the `dist/` directory as a Figma plugin.

### Test

```bash
npm test           # Run tests
npm run test:watch # Watch mode
```

### Lint

```bash
npm run lint
```

## Architecture

This plugin uses a dual-build architecture:

- **Figma Sandbox** (`src/code.ts`) — Runs in Figma's sandboxed environment with access to the Figma API
- **UI Panel** (React SPA) — Renders the plugin UI with access to the browser DOM

Communication between the two environments uses `postMessage` with a strictly typed protocol defined in `src/shared/messages.ts`.

The core conversion logic in `src/core/` is pure TypeScript with no Figma or browser dependencies, making it fully testable in Node.js.

```
src/
├── code.ts             # Figma sandbox entry (IIFE)
├── figma/              # Figma API interactions
├── core/               # SVG → VectorDrawable conversion (pure functions)
├── shared/             # Shared types and utilities
├── ui/                 # React UI components
└── components/ui/      # shadcn/ui primitives
```

## Configuration

### Export Settings

| Setting | Default | Description |
|---------|---------|-------------|
| Prefix | `ic_` | File name prefix |
| Suffix | _(empty)_ | File name suffix |
| Precision | `4` | Decimal precision for path data |
| Optimize | `true` | Remove redundant whitespace and shorten numbers |
| Output directory | `app/src/main/res/drawable` | Subdirectory path for export |

## Tech Stack

- **Runtime**: TypeScript, React 18
- **Build**: Vite (dual-mode: UI + IIFE)
- **UI**: Tailwind CSS, shadcn/ui, Radix UI, Lucide Icons
- **SVG/XML**: xmldom, fast-xml-parser
- **Export**: JSZip, File System Access API
- **Testing**: Vitest
- **Linting**: ESLint, typescript-eslint

## License

See [LICENSE](./LICENSE).
