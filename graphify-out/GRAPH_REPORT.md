# Graph Report - .  (2026-04-08)

## Corpus Check
- Corpus is ~11,805 words - fits in a single context window. You may not need a graph.

## Summary
- 175 nodes · 261 edges · 19 communities detected
- Extraction: 75% EXTRACTED · 25% INFERRED · 0% AMBIGUOUS · INFERRED: 66 edges (avg confidence: 0.6)
- Token cost: 0 input · 0 output

## God Nodes (most connected - your core abstractions)
1. `Testing Strategy` - 8 edges
2. `Data Flow: SVG to VectorDrawable Conversion` - 7 edges
3. `shouldCollectNode()` - 6 edges
4. `Core Layer Pure Functions` - 6 edges
5. `convertShapeToPath()` - 5 edges
6. `SVG to VectorDrawable Figma Plugin` - 5 edges
7. `Dual Build Architecture` - 5 edges
8. `postMessage Communication Protocol` - 5 edges
9. `UiErrorBoundary` - 4 edges
10. `formatNumber()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `SVG to VectorDrawable Figma Plugin` --semantically_similar_to--> `SVG to VectorDrawable Figma Plugin (Chinese)`  [INFERRED] [semantically similar]
  README.md → README.zh-CN.md
- `Export Settings Configuration` --conceptually_related_to--> `Data Flow: SVG to VectorDrawable Conversion`  [INFERRED]
  README.md → docs/architecture.md
- `Fixture: basic-icon.svg (Stroke Path)` --references--> `Data Flow: SVG to VectorDrawable Conversion`  [INFERRED]
  tests/fixtures/basic-icon.svg → docs/architecture.md
- `Fixture: clipped-icon.svg (ClipPath)` --references--> `Data Flow: SVG to VectorDrawable Conversion`  [INFERRED]
  tests/fixtures/clipped-icon.svg → docs/architecture.md
- `Fixture: fill-alpha-icon.svg (Alpha Fill)` --references--> `Data Flow: SVG to VectorDrawable Conversion`  [INFERRED]
  tests/fixtures/fill-alpha-icon.svg → docs/architecture.md

## Hyperedges (group relationships)
- **Dual Environment Communication Pipeline** — concept_figma_sandbox, concept_ui_panel, concept_postmessage_protocol [EXTRACTED 1.00]
- **SVG to VectorDrawable Full Conversion Pipeline** — concept_data_flow_scan, concept_data_flow_export, concept_data_flow_convert [EXTRACTED 1.00]
- **Test Fixtures Covering SVG Feature Cases** — fixture_basic_icon_svg, fixture_clipped_icon_svg, fixture_fill_alpha_icon_svg [INFERRED 0.85]

## Communities

### Community 0 - "UI Components"
Cohesion: 0.14
Nodes (0): 

### Community 1 - "Architecture Concepts"
Cohesion: 0.15
Nodes (19): Core Layer Pure Functions, Coverage Target >= 80%, Data Flow: SVG to VectorDrawable Conversion, Data Flow: Export SVG, Data Flow: Scan Selection, Module Dependency Rules, Immutability Convention, Import Order Convention (+11 more)

### Community 2 - "Figma Sandbox"
Cohesion: 0.15
Nodes (7): handleRequest(), postMessage(), exportNodeAsSvg(), exportSvgBatch(), isExportableNode(), applyNamePattern(), normalizeAndroidResourceName()

### Community 3 - "SVG Parsing & Preview"
Cohesion: 0.2
Nodes (4): createParser(), parseSvg(), readAttributes(), toRawElement()

### Community 4 - "Plugin Architecture Docs"
Cohesion: 0.19
Nodes (14): CLAUDE.md Project Instructions, Dual Build Architecture, Error Handling Per Layer, Export Settings Configuration, Figma Sandbox Environment, Rationale: Dual Environment Isolation, Tech Stack, UI Panel (React SPA) (+6 more)

### Community 5 - "VectorDrawable Conversion"
Cohesion: 0.27
Nodes (9): hasPathNode(), validateVectorDrawable(), convertSvgToVectorDrawable(), escapeAttribute(), formatNumber(), renderGroup(), renderNode(), renderPath() (+1 more)

### Community 6 - "Style Utilities"
Cohesion: 0.22
Nodes (8): clampAlpha(), expandHex(), extractPresentationAttributes(), normalizeColor(), parseInlineStyle(), parseNumber(), parseViewBox(), resolveDimension()

### Community 7 - "Path & XML Optimization"
Cohesion: 0.26
Nodes (5): buildRoundRectPath(), convertShapeToPath(), formatNumber(), parseNumber(), pointsToPath()

### Community 8 - "Selection Scanning"
Cohesion: 0.31
Nodes (8): collectWarnings(), countDescendants(), createCandidate(), hasGeometry(), hasVectorContent(), isExportableNode(), shouldCollectNode(), visitNode()

### Community 9 - "UI Entry & Error Handling"
Cohesion: 0.25
Nodes (3): formatError(), showFatalError(), UiErrorBoundary

### Community 10 - "Vite Build Config"
Cohesion: 0.4
Nodes (2): createInlineScriptBootstrap(), encodeInlineContent()

### Community 11 - "SVG Normalization"
Cohesion: 0.67
Nodes (5): buildName(), clampAlpha(), normalizeElement(), normalizeSvgDocument(), resolvePathStyle()

### Community 12 - "Build System Docs"
Cohesion: 0.53
Nodes (6): Build Pipeline (tsc + UI + Code), Code Mode Build, Figma Plugin Manifest, Inline Asset Embedding (Figma CSP), Path Alias @/, UI Mode Build

### Community 13 - "File Export"
Cohesion: 0.7
Nodes (4): createDownload(), downloadResultsZip(), downloadSingleResult(), getSuccessfulResults()

### Community 14 - "Tailwind Config"
Cohesion: 1.0
Nodes (0): 

### Community 15 - "Lint Config"
Cohesion: 1.0
Nodes (0): 

### Community 16 - "Test Config"
Cohesion: 1.0
Nodes (0): 

### Community 17 - "Type Declarations"
Cohesion: 1.0
Nodes (0): 

### Community 18 - "Message Protocol"
Cohesion: 1.0
Nodes (1): Message Types (postMessage Protocol)

## Knowledge Gaps
- **13 isolated node(s):** `SVG to VectorDrawable Figma Plugin (Chinese)`, `Coding Conventions`, `Testing Documentation`, `Module Dependency Rules`, `Immutability Convention` (+8 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Tailwind Config`** (1 nodes): `tailwind.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Lint Config`** (1 nodes): `eslint.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Test Config`** (1 nodes): `vitest.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Type Declarations`** (1 nodes): `vite-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Message Protocol`** (1 nodes): `Message Types (postMessage Protocol)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Data Flow: SVG to VectorDrawable Conversion` connect `Architecture Concepts` to `Plugin Architecture Docs`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `Testing Strategy` (e.g. with `Rationale: Core Isolation for Testability` and `Naming Conventions`) actually correct?**
  _`Testing Strategy` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Are the 6 inferred relationships involving `Data Flow: SVG to VectorDrawable Conversion` (e.g. with `postMessage Communication Protocol` and `Export Settings Configuration`) actually correct?**
  _`Data Flow: SVG to VectorDrawable Conversion` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Are the 5 inferred relationships involving `shouldCollectNode()` (e.g. with `hasGeometry()` and `isExportableNode()`) actually correct?**
  _`shouldCollectNode()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Are the 3 inferred relationships involving `Core Layer Pure Functions` (e.g. with `Module Dependency Rules` and `Error Handling Per Layer`) actually correct?**
  _`Core Layer Pure Functions` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `convertShapeToPath()` (e.g. with `parseNumber()` and `buildRoundRectPath()`) actually correct?**
  _`convertShapeToPath()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `SVG to VectorDrawable Figma Plugin (Chinese)`, `Coding Conventions`, `Testing Documentation` to the rest of the system?**
  _13 weakly-connected nodes found - possible documentation gaps or missing edges._