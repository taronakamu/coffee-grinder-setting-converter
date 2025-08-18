# Repository instructions for GitHub Copilot

This file guides Copilot to produce code and tests that fit this repo. Prefer TypeScript, React, Vite, Tailwind CSS, and Vitest.

## Project overview
- Purpose: Convert coffee grinder settings between models by matching median particle size (µm).
- App: React + Vite + TypeScript SPA. Styling via Tailwind.
- Data: Static JSON under `public/grinders/` loaded at runtime. Manifest at `public/grinders/index.json`.
- Deploy target: GitHub Pages; Vite `base` is `/coffee-grinder-setting-converter/`.

## Tech stack and conventions
- Language: TypeScript (ES modules). React 18 function components/hooks.
- Build: Vite. Tests: Vitest + jsdom.
- Styles: Tailwind utility classes in JSX. No CSS-in-JS.
- i18n: Minimal provider in `src/lib/i18n.tsx`. Use `useI18n()` and `t('key', params)`; do not inline user-facing strings.
- Accessibility: Use proper roles/aria (e.g., combobox/listbox/option, aria-expanded/controls/selected, role=alert for errors). Keyboard handling for Enter/Space/Escape.
- Formatting: Keep existing style. Type-only imports where applicable.

## Source layout
- `src/lib/types.ts`: Core types: `Grinder`, `Manifest`.
- `src/lib/data.ts`: `loadManifest`, `loadGrinder`, small in-memory cache. Always use these instead of calling `fetch` directly.
- `src/lib/interpolate.ts`: Linear interpolation utilities (`lerp`, `invLerp`) and `convertBetweenGrinders`.
- `src/lib/validation.ts`: `parseInput`, `validateRangeAndStep`, `roundToStep`.
- `src/components/GrinderSelect.tsx`: Accessible combobox-style select.
- `src/App.tsx`: App composition, state, i18n, error surfaces.

## Data contract (important)
Grinder JSON shape (see `src/lib/types.ts`):
- `grinder_id: string`
- `display_name: string`
- `setting_type: 'clicks' | 'dial'` (UI hint only)
- `setting_format: 'integer' | 'decimal'` (input/rounding behavior)
- `setting_constraints: { min: number; max: number; step: number }`
- `mapping: Record<string, number>` where keys are settings (numbers stringified) and values are µm (median size)

Rules:
- `mapping` keys must be sorted numerically ascending when used. Ensure monotonic `setting` axis; µm may be non-linear but should be non-decreasing in practice.
- `setting_constraints` range should cover the min/max mapping keys. `step` defines allowed granularity; integer for click-based grinders, decimal for dials.
- Manifest `index.json` lists file names only: `{ "files": ["<file>.json", ...] }`.

## Algorithms and numeric behavior
- From source setting → µm: If exact key exists in `mapping`, use it. Otherwise, linearly interpolate on `[setting, µm]` pairs (`lerp`).
- From µm → target setting: Use inverse linear interpolation on `[setting, µm]` (`invLerp`).
- Clamping: If µm is outside the target mapping range, `invLerp` clamps to boundary and sets `clamped = true`. Surface a warning to users.
- Validation before interpolation (source side):
  - `parseInput(value, format)`: returns number or `null`. For `integer` format, non-integers are invalid.
  - `validateRangeAndStep(n, grinder)`: reject out-of-range and values not aligning to `min + k*step` (tolerance `1e-9`).
  - `roundToStep(n, grinder)`: round to nearest legal setting based on `min` and `step`. For `integer` format, final value is integer. Normalize small FP errors with `toFixed(6)`.

## i18n keys (non-exhaustive)
- Keep user-facing strings in `src/lib/i18n.tsx`. Add `en` and `ja` entries for new UI text.
- Reuse existing keys when possible: `title`, `subtitle`, `fromGrinder`, `toGrinder`, `fromSetting`, `resultTitle`, `enterPrompt`, `toSettingApprox`, `medianMatch`, `warningClamped`, `invalidValue`, `errorSourceRange`, `errorStepAlign`, `failedManifest`, `searchPlaceholder`, `noResults`, `disclaimerTitle`, `disclaimerText`.

## Testing guidance (Vitest + jsdom)
- Unit-test core logic under `src/lib/*`:
  - Validation: range/step alignment, integer vs decimal parsing, tolerance.
  - Interpolation: exact hits, between points, clamping at boundaries, inverse mapping.
  - Rounding: integer vs decimal steps; examples exist in `__tests__/rounding-e2e.test.tsx`.
- Component tests: prefer rendering minimal components (e.g., `GrinderSelect`) with keyboard and ARIA behavior.
- Edge cases to cover:
  - Empty input → no result; shows prompt text.
  - Out-of-range input → error message via i18n, no conversion.
  - Non-step-aligned input → error.
  - Conversion that clamps on target → warning surfaced.
  - Floating precision near step boundaries.

## UI and accessibility
- Maintain ARIA attributes and keyboard behavior in selects and inputs.
- Use Tailwind utilities for styling; avoid inline styles unless necessary.
- Error and warning surfaces should use `role="alert"` and be connected via `aria-describedby`.
- Language picker: keep flags select behavior; ensure labels (sr-only) remain.

## Performance
- Use `loadManifest`/`loadGrinder` to benefit from in-memory cache. Do not fetch the same JSON repeatedly.
- Use `useMemo` to avoid redundant parsing/calculation where already established.

## Adding a new grinder file
1) Add `<name>.json` in `public/grinders/` with the contract above. Ensure mapping keys cover the UI-relevant range and are sorted when parsed.
2) Append the file name to `public/grinders/index.json` `files` array.
3) Validate `setting_constraints` aligns with mapping domain and intended step.
4) Optionally add acceptance tests for conversion behavior vs known reference points.

## Copilot DOs
- DO use TypeScript types and narrow types (`as const` where helpful maps are literal).
- DO keep pure functions in `src/lib/` without React dependencies.
- DO use existing helpers (`parseInput`, `validateRangeAndStep`, `roundToStep`, `convertBetweenGrinders`).
- DO add i18n keys for any new user-visible text.
- DO write Vitest tests alongside new logic.
- DO maintain accessibility roles/aria when editing UI.

## Copilot DON'Ts
- DON’T introduce new state management libraries; keep React hooks.
- DON’T bypass `loadManifest`/`loadGrinder` with raw `fetch` in components.
- DON’T hardcode English strings in components; use `t()`.
- DON’T change Vite `base` unless coordinating with deployment.
- DON’T add runtime dependencies without strong justification; prefer stdlib or existing utilities.

## Quality bar
- Type-checks pass. No unused exports or obvious any-casts.
- No regression in existing tests (`pnpm test`). Add tests for new behavior.
- Maintain bundle simplicity; avoid heavy libs.
- UI remains keyboard-navigable and screen-reader-friendly.

## Helpful snippets (structure, not exact code)
- Interpolation shape:
  - `const pairs = Object.entries(mapping).map(([s, um]) => [Number(s), um]).sort((a,b)=>a[0]-b[0])`
  - `lerp(pairs, x)` and `invLerp(pairs, y)` for forward/inverse mapping
- Validation shape:
  - Integer format requires `Number.isInteger(n)`; step alignment via `(n - min)/step ≈ integer` within `1e-9`.

---
These instructions are repository-scoped. When in doubt, prefer existing patterns in `src/lib/` and tests under `src/__tests__/`. 
