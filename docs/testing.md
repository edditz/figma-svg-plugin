# Testing

## Strategy

- **框架**: Vitest (`vitest.config.ts`)
- **环境**: Node.js（core/ 是纯函数，不需要浏览器环境）
- **测试位置**: `tests/` 目录
- **Fixture**: `tests/fixtures/*.svg` — SVG 样本文件

## Running Tests

```bash
npm test           # 单次运行
npm run test:watch # 监听模式
```

## What to Test

### 必须测试

- `core/` 下的所有纯函数转换逻辑
  - `parse-svg.ts` — SVG 解析
  - `normalize-svg.ts` — 归一化
  - `path-utils.ts` — 路径变换
  - `style-utils.ts` — 样式解析
  - `vectordrawable-converter.ts` — 端到端转换
  - `optimize-xml.ts` — XML 优化
  - `validate-output.ts` — 输出校验
- `shared/` 下的工具函数
  - `filename.ts` — 文件名处理

### 不需要测试

- `figma/` — 依赖 Figma 全局对象，无法在 Node 中测试
- `ui/` — UI 组件（除非添加 React 测试环境）
- `components/ui/` — shadcn 生成

## Test Pattern

```typescript
import { describe, it, expect } from "vitest"
import { functionUnderTest } from "@/core/module"

describe("functionUnderTest", () => {
  it("should handle basic case", () => {
    const result = functionUnderTest(input)
    expect(result).toMatchSnapshot()
  })

  it("should handle edge case", () => {
    const result = functionUnderTest(edgeCaseInput)
    expect(result.xml).toContain("expected content")
  })
})
```

## Adding Tests for SVG Conversion

1. 将问题 SVG 保存到 `tests/fixtures/`
2. 写测试用例验证解析/转换结果
3. 使用 `toMatchSnapshot()` 对 XML 输出做快照测试
4. 使用 `toMatchInlineSnapshot()` 对小片段做内联快照

## Coverage Target

- core/ 和 shared/ 模块覆盖率 ≥ 80%
