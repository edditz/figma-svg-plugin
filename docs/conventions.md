# Coding Conventions

## Naming

- **文件名**: kebab-case (`parse-svg.ts`, `export-settings.tsx`)
- **函数/变量**: camelCase (`parseSvg`, `handleConvert`)
- **类型/接口**: PascalCase (`IconCandidate`, `VectorDrawableResult`)
- **常量**: UPPER_SNAKE_CASE (`EXPORT_TIMEOUT_MS`, `UNSUPPORTED_TAGS`)
- **React 组件**: PascalCase 文件名 (`IconList.tsx` → `export function IconList`)
- **测试文件**: 与源文件同名 + `.test.ts` (`path-utils.test.ts`)

## TypeScript

- 严格模式 (strict)
- 路径别名 `@/*` → `./src/*`
- 禁止 `as any`、`@ts-ignore`、`@ts-expect-error`
- 优先使用 `interface`，需要 union 或交叉类型时用 `type`
- 使用 TypeScript 类型守卫而非类型断言

## Immutability

使用展开运算符和 `Array.prototype.map/filter` 创建新对象：

```typescript
// ✅ Correct
setIcons((current) => current.map((icon) => (icon.id === id ? { ...icon, selected: true } : icon)))

// ❌ Wrong
icons.find((i) => i.id === id).selected = true
```

## Error Handling

- `core/` 函数：抛出带描述性消息的 Error
- `figma/` 函数：catch 并返回 failures 数组（不中断批量操作）
- `ui/` 组件：catch 并通过 `setNotice()` 显示给用户
- 永远不要吞掉错误（空 catch 块）

## File Organization

- 单文件 < 400 行，硬性上限 800 行
- 高内聚低耦合：按功能/领域组织，不按类型
- 相关的函数放在同一个文件中，不需要为每个函数建一个文件

## UI Conventions

- UI 文本使用中文
- 组件使用 shadcn/ui + Tailwind CSS
- 状态管理使用 React hooks (useState/useReducer)
- 与 Figma 交互通过 `usePluginBridge` hook

## Import Order

```typescript
// 1. Node 内置模块
import fs from "node:fs"

// 2. 第三方库
import { DOMParser } from "@xmldom/xmldom"
import { Button } from "@/components/ui/button"

// 3. 项目内模块
import { parseSvg } from "@/core/parse-svg"
import type { IconCandidate } from "@/shared/types"
```
