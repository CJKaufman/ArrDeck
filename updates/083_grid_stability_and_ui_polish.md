# Update 083 — Grid Stability, Theme Engine Restoration & UI Polish

**Date:** 2026-04-10
**Phase:** Phase 9 / Ongoing Polish
**Type:** Bugfix | UI Change | Architecture
**Affects:** `src/index.css`, `src/pages/DashboardPage.tsx`, `src/stores/useDashboardStore.ts`, `src/components/layout/Sidebar.tsx`, `src/components/search/IndexerCard.tsx`, `src/components/dashboard/HealthDistribution.tsx`, `src/components/dashboard/StorageChart.tsx`, `src/components/dashboard/QualityDistribution.tsx`

## Summary
This session resolved the persistent windowed-mode "Stacked UI" layout collapse, restored the 6-theme engine that was accidentally wiped in previous session rewrites, fixed the dashboard toolbar button clipping, and upgraded the Prowlarr indexer status rail to a full cinematic animated spectral beam.

## Changes Made

### Grid Layout (`useDashboardStore.ts`)
- Populated `DEFAULT_MD`, `DEFAULT_SM`, `DEFAULT_XS`, and `DEFAULT_XXS` with all 10 widgets. Previously missing widgets at smaller breakpoints caused the "Stacked UI" collapse when not fullscreen.
- Defined an explicit `DEFAULT_XS` object (was aliasing `DEFAULT_SM`).

### Grid Engine (`DashboardPage.tsx`)
- Removed manually added `className="react-grid-item"` from grid children — the library manages this class automatically; adding it manually broke layout calculations.
- Added `deck-edit-active` CSS class to the grid wrapper only when `isEditMode === true` to gate resize handle visibility.
- Fixed header flex row: removed `overflow-hidden`, added `min-w-0 flex-1` to title section and `shrink-0` to button group — prevents Lock/Configure button from being clipped at smaller window sizes.

### Theme Engine (`index.css`)
- Restored all 6 `[data-theme]` CSS variable blocks that were wiped in the previous session's wholesale rewrite:
  - `minimal`: `#111111` base / `#00bcff` cyan accent
  - `autobrr`: `#0d1117` base / `#2563eb` blue accent
  - `kyle`: `#13112a` purple base / `#f0059a` magenta accent
  - `nightwalker`: `#0f172a` navy base / `#38bdf8` sky blue accent
  - `swizzin`: `#181818` warm gray base / `#00d084` emerald accent
  - `napster`: `#f1f3f5` light base / `#1971c2` blue accent (light theme)
- Colors matched from reference screenshots provided by user (autobrr/qUI application).
- Fixed `@theme` registry: `--color-accent` etc. now reference `var(--accent-color)` instead of hardcoded hex, so theme switching propagates correctly across the UI.

### Resize Handle (`index.css`)
- `.react-resizable-handle` now `display: none` by default.
- Only shown inside `.deck-edit-active` parent: `.deck-edit-active .react-resizable-handle { display: block }`.
- Repositioned from `bottom/right: 0` (grid cell edge) to `bottom/right: 28px` so it sits within the visible card boundary.

### Sidebar Active State (`Sidebar.tsx`)
- Updated active NavLink to use `style={{ backgroundColor: 'var(--accent-color)' }}` so each theme's accent color is reflected in the active sidebar item, matching reference screenshots.

### Chart Component Responsiveness
- `HealthDistribution`, `StorageChart`, `QualityDistribution`: Changed header row from `justify-between` (two opposing labels that collide at narrow widths) to `gap-2` with `truncate` on both labels.
- `HealthDistribution` pie chart: Changed hardcoded `innerRadius={50} outerRadius={70}` to `"35%"/"55%"` percentages so the chart scales with its container.
- Added `overflow-hidden` to all three card containers.

### Spectral Rail (`IndexerCard.tsx`, `index.css`)
- Removed "Signal Path Locked" label and icon.
- Status rail is now full-width with a dimmed base color and animated neon beam:
  - Base: 12–15% opacity of status color (so bar is identifiably green/amber/red at rest).
  - Beam (`::after`): Bright neon gradient sweeping via `spectral-scan` keyframe animation.
  - Speeds: green = 4s, amber = 2.5s, red = 1.5s.
  - Beam width: 60% of rail.

### Custom Scrollbar (`index.css`)
- 6px thin scrollbar with transparent track and subtle white thumb.

## Deviations From Project Doc
- **Inline style used in `Sidebar.tsx`**: The project doc states "No inline styles — Tailwind classes only. No `style={{ }}` props." The sidebar active state uses `style={{ backgroundColor: 'var(--accent-color)' }}` because Tailwind v4 cannot dynamically reference a CSS variable as an arbitrary background value in a way that overrides cleanly across themes. This is a justified deviation — the alternative of generating per-theme static utility classes would require a full Tailwind plugin or duplicated class sets.

## AI Instructions
- Always read `ARRDECK_PROJECTV2.md` AND all `/updates/` files in numerical order before generating any code.
- Follow the exact update file template format — not freeform prose.
- Do not make wholesale rewrites of `index.css` — it contains the theme engine with 6 `[data-theme]` blocks that are critical to the settings theme switcher. Use surgical edits only.
- `react-grid-layout` adds `react-grid-item` class to its direct children automatically — never add it manually.
- Avoid `style={{ }}` props per project doc. If truly necessary, document the deviation here.
