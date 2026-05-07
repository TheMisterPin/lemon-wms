# Stack Research: v1.2 Component Folder Restructuring

**Project:** Lemon WMS  
**Milestone:** v1.2 Component Folder Restructuring  
**Researched:** 2026-05-07  
**Overall confidence:** HIGH

## Summary

No stack additions are needed for this milestone. The restructuring work is a brownfield frontend architecture cleanup: move components, hooks, DTOs, transformers, primitives, and route composition into predictable ownership boundaries while preserving behavior and visual design.

The existing Next.js 16, React 19, TypeScript, Tailwind 4, shadcn/ui, Axios, Zustand, ESLint, Vitest, and Testing Library stack is sufficient. The useful work is not adding capability; it is applying the existing stack more consistently: route files stay thin, hooks own data flow, page components receive hook output, feature components remain domain-specific, primitives wrap shared Lemon WMS UI structure, and `components/ui` remains the shadcn base layer.

The milestone should treat dependency changes as a hard stop. A new library would increase review surface and risk visual or behavioral drift without solving the actual problem: unclear frontend ownership.

## Recommended Stack Posture

**Recommendation:** keep the current stack unchanged.

| Area | Posture | Rationale |
|---|---|---|
| Framework | Keep Next.js App Router | Existing routes already define dashboard and warehouse surfaces; restructuring should thin route files, not replace routing. |
| UI runtime | Keep React 19 components and hooks | The target architecture is route -> hook -> page -> feature -> primitive -> shadcn/ui, which fits current React usage. |
| Type system | Lean harder on strict TypeScript | Named props, API types, DTO types, hook result types, and transformer return types are the main safety net during moves. |
| Styling | Keep Tailwind 4 and current CSS variables | Visual preservation depends on reusing current tokens/classes, not introducing a parallel styling system. |
| Base components | Keep shadcn/ui in `src/components/ui` | Existing `components.json` aliases already map `ui` to `@/components/ui`; this folder should remain reserved for shadcn base components. |
| Data fetching | Keep custom hooks with Axios | Existing rules explicitly require custom `useState`/`useEffect`/Axios hooks and prohibit React Query. |
| State | Keep Zustand only for existing auth/session state | Component restructuring does not require new global state or expanded provider usage. |
| Validation/forms | Keep Zod and react-hook-form where already used | Useful for existing forms, but not a reason to alter contracts during file moves. |
| Verification | Use existing ESLint, TypeScript build, Vitest, and Testing Library | Import churn and component moves are best caught by current static checks and targeted tests. |

## Tools Already Present

### Core Frontend

| Tool | Current Role | Refactor Use |
|---|---|---|
| `next` 16.2.1 | App Router pages, layouts, API routes | Keep route files as visible composition boundaries. |
| `react` / `react-dom` 19.2.3 | Client component runtime | Continue using function components and hooks. |
| `typescript` 5.x | Strict typing | Define named props, hook return types, API payload types, DTOs, and transformer output types. |
| `@/*` path alias | Imports from `src/*` | Supports target folders like `@/hooks`, `@/types`, `@/lib/transformers`, and `@/components/features` without config changes. |

### UI and Styling

| Tool | Current Role | Refactor Use |
|---|---|---|
| `tailwindcss` 4 | Utility styling | Preserve existing classes; extract repeated patterns only when reuse is real. |
| `src/app/globals.css` | Tailwind imports, shadcn variables, Lemon WMS tokens | Treat current tokens as the source of visual continuity. |
| `shadcn` / `components.json` | shadcn setup and aliases | Keep `src/components/ui` as generated/base component territory. |
| Radix packages / `radix-ui` | Primitive behavior under shadcn/ui | Use through existing shadcn components or existing wrappers. |
| `lucide-react` / `@tabler/icons-react` | Iconography | Reuse existing icon libraries; do not introduce another icon set. |
| `class-variance-authority`, `clsx`, `tailwind-merge` | Class composition utilities | Use for reusable primitives when class composition becomes repeated and typed. |
| `recharts` | Existing chart rendering | Keep chart behavior unchanged; only move chart wrappers if scoped by docs. |

### Data Flow and Forms

| Tool | Current Role | Refactor Use |
|---|---|---|
| `axios` | API transport via existing clients | Hooks may call existing clients; components must not call Axios directly. |
| `zustand` | Auth/session state | Do not add feature state here during structural refactors. |
| `zod` | API/form validation | Preserve validation contracts; do not redefine API payloads inside components. |
| `react-hook-form` | Form state | Keep form behavior in existing forms while moving ownership. |
| `@tanstack/react-table` | Existing GenericTable/table behavior | Do not replace table architecture during this milestone unless explicitly scoped. |

### Verification

| Tool | Current Role | Refactor Use |
|---|---|---|
| `eslint` + `eslint-config-next` | Lint and Next rules | Catch unused imports, import ordering, JSX formatting, and route/component mistakes. |
| `eslint-plugin-unused-imports` | Import cleanup | Especially important after file moves. |
| `vitest` | Unit/integration tests | Run targeted tests for moved hooks/components and broader tests when shared surfaces move. |
| Testing Library | Component behavior tests | Use only where behavior risk justifies it; do not create broad snapshot churn. |
| `pnpm build` | Full Next/TypeScript verification | Required before claiming a moved vertical slice is complete. |

## Explicit Non-Additions

Do not add these for v1.2 unless the developer explicitly approves a scope change:

| Do Not Add | Reason |
|---|---|
| React Query, SWR, Apollo, Relay, or another data-fetching framework | Existing rules require custom hooks with Axios; adding one would change data-flow semantics. |
| Redux, Jotai, Valtio, XState, or broader global state tooling | The milestone should reduce hidden coupling, not centralize page-local state. |
| CSS-in-JS, styled-components, Emotion, vanilla-extract, or Sass | Tailwind 4 and existing CSS variables already cover styling needs. |
| A second component library | shadcn/ui is the base layer; another library would create visual and API inconsistency. |
| New Tailwind plugins or theme packages | Current tokens and utilities are enough for visual preservation. |
| Storybook or a component workbench | Useful in some design-system projects, but unnecessary for the first restructuring slice and adds setup cost. |
| Visual regression tooling | Consider only after repeated visual drift appears; not required to begin this milestone. |
| Codegen/scaffolding for components | The risk is architectural judgment, not typing speed. Manual, documented moves are safer. |
| Barrel-file generator or import rewrite tooling | Existing ESLint and TypeScript are enough; generated barrels can hide ownership and dependency direction. |
| New API clients or Axios instances | Existing `sharedApi`, `dashboardApiClient`, and `warehouseApiClient` boundaries must remain intact. |
| Prisma/schema/migration changes | This is frontend restructuring only; database changes are out of scope. |

## Integration Points

### Folder Boundaries

The stack supports the target folder structure without configuration changes because `tsconfig.json` maps `@/*` to `src/*` and `components.json` already defines aliases for `components`, `ui`, `lib`, `utils`, and `hooks`.

Recommended target ownership:

```txt
src/app
-> route composition only

src/hooks
-> page/data hooks with Axios calls, loading/error/refetch state, actions

src/components/features/[domain]/pages
-> page-level render components that receive hook output

src/components/features/[domain]/components
-> domain-specific feature components

src/components/primitives
-> reusable Lemon WMS UI primitives, typed and domain-agnostic

src/components/ui
-> shadcn/ui base components only

src/types/api
-> API payload and boundary types

src/types/dto
-> UI-ready DTO types

src/lib/transformers/[domain]
-> reusable API-to-DTO transformation logic
```

### TypeScript

Use TypeScript as the main refactor safety mechanism:

- Define named props types for moved components with more than one prop.
- Define hook result types for every promoted page hook.
- Keep API payload types out of components.
- Keep UI DTOs separate from raw API/database shapes.
- Give reusable transformers explicit input and output types.
- Prefer named exports, except where Next.js page/layout conventions require defaults.

### Tailwind and Styling

Use the existing Tailwind 4 and CSS variable setup:

- Preserve current `className` behavior during file moves.
- Extract repeated style structures into primitives only when the pattern appears across domains or pages.
- Keep one-off layout tweaks local to feature components.
- Keep `src/app/globals.css` as the current token source unless a later phase explicitly introduces `src/styles/tokens.css` or `src/styles/component-classes.css`.
- If style files are introduced later, import them through `globals.css` and treat them as organization-only changes, not redesign.

### shadcn/ui

Use shadcn/ui as the base dependency layer:

- `src/components/ui` should contain base shadcn components only.
- Project primitives may wrap shadcn components and apply Lemon WMS styling.
- Feature components may compose primitives and shadcn-backed UI, but should not be moved into `components/ui`.
- Do not modify generated shadcn components as part of feature restructuring unless the change is required by all consumers.

### Hooks and Axios

The existing custom hook pattern remains the correct stack choice:

- Hooks own data fetching, mutations, loading state, error state, refresh state, and page-ready DTO preparation.
- Hooks call the existing typed Axios clients.
- Components receive hook output and callbacks; they do not call Axios or mutation clients directly.
- Every data hook should expose loading, error, and refresh/refetch behavior according to existing project rules.

### Documentation

The refactor documentation is part of the operating stack for this milestone:

- `.docs/developer/refactors/components` and `.docs/developer/refactors/hooks` are required coordination artifacts.
- Component and hook docs must be updated with path, classification, logic mapping, risk, and refactor status before or alongside moves.
- The documentation-first workflow is the replacement for adding a new inventory or architecture tool.

## Requirements Implications

1. **No dependency tasks should appear in the roadmap by default.** The v1.2 roadmap should not include install, migration, provider setup, or new package evaluation work.
2. **Phases should be structured around documentation and vertical slices.** Good phase boundaries are inventory, classification, logic mapping, primitive planning, and one safe dashboard warehouse/location/stock slice.
3. **Verification requirements should use existing scripts.** For each code-moving phase, record relevant lint/typecheck/test status in the matching refactor docs. For the first vertical slice, `pnpm build` is the strongest final check.
4. **Type and import cleanup is core work, not cleanup work.** Because the stack already has strict TypeScript and import linting, the roadmap should budget time for named types, DTO movement, transformer extraction, and import repair.
5. **Visual preservation should be handled through existing tokens and primitives.** Do not create a redesign phase. Primitive extraction should happen only for repeated UI structures.
6. **Data-flow preservation is mandatory.** Route files should call hooks and render page components; hooks continue using existing Axios clients; components remain render-focused.
7. **Shared abstractions need proof of reuse.** A primitive or shared transformer should be created only when repeated structure or logic exists across component locations.
8. **Out-of-scope stack areas should stay quiet.** Prisma, API route contracts, authentication, database schema, PDF/printing, notifications, and table V2 rewrites are not part of this stack plan.

## Confidence Assessment

| Area | Confidence | Notes |
|---|---|---|
| Existing stack sufficiency | HIGH | Confirmed from `package.json`, `tsconfig.json`, `eslint.config.mjs`, `components.json`, and project rules. |
| No-additions recommendation | HIGH | Milestone explicitly preserves behavior/visual design and forbids new data-fetching/state frameworks. |
| Tailwind/shadcn posture | HIGH | Existing aliases and rules clearly reserve `components/ui` for shadcn and use Tailwind tokens for visual consistency. |
| Verification posture | HIGH | Existing scripts cover lint, build, Vitest, and coverage; import churn is already covered by ESLint plugins. |

## Sources

- `.planning/PROJECT.md`
- `.cursor/rules/component-architecture.mdc`
- `.cursor/rules/refactor-documentation-workflow.mdc`
- `.cursor/rules/styling-and-primitives.mdc`
- `.cursor/rules/hooks-and-data-flow.mdc`
- `AGENTS.md`
- `package.json`
- `components.json`
- `tsconfig.json`
- `eslint.config.mjs`
- `src/app/globals.css`
