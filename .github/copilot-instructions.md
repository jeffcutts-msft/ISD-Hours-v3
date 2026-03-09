# GitHub Copilot Instructions

## Project Overview
ISD Hours v3 is a dashboard website for tracking and visualising IT Service Desk hours. It is built with React, TypeScript, and Vite.

## Technology Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: CSS Modules + global styles (no CSS-in-JS libraries)
- **State Management**: React Context API for global state; local `useState`/`useReducer` for component state
- **HTTP Client**: Fetch API (native); no axios unless absolutely required
- **Testing**: Vitest + React Testing Library
- **Linting**: ESLint with TypeScript rules
- **Formatting**: Prettier (single quotes, 2-space indent, trailing commas)

## Coding Conventions

### General
- Use **TypeScript** for all source files (`.ts` / `.tsx`). Avoid `any`; prefer explicit types or `unknown`.
- Follow **functional components** with hooks — no class components.
- Keep components small and focused. If a component exceeds ~150 lines, split it.
- Export one component per file. The file name must match the component name (PascalCase).

### Naming
- **Components**: `PascalCase` (e.g., `HoursTable.tsx`)
- **Hooks**: `camelCase` prefixed with `use` (e.g., `useHoursData.ts`)
- **Utilities / helpers**: `camelCase` (e.g., `formatDuration.ts`)
- **Types / interfaces**: `PascalCase`, interfaces prefixed with `I` only when there is ambiguity (e.g., `HoursEntry`, `IHoursService`)
- **CSS Modules**: `camelCase` class names (e.g., `styles.cardTitle`)
- **Constants**: `UPPER_SNAKE_CASE` for true constants; `camelCase` for config objects

### File Structure
```
src/
  assets/styles/   # global CSS variables and reset
  components/
    layout/        # Shell, Sidebar, Header, Footer
    ui/            # Reusable UI atoms (Button, Card, Badge, …)
  context/         # React context providers
  hooks/           # Custom hooks
  pages/           # Top-level route pages
  services/        # API / data-fetching layer
  types/           # Shared TypeScript types and interfaces
  utils/           # Pure helper functions
```

### Imports
- Use **absolute imports** via the `@/` alias (configured in `vite.config.ts` and `tsconfig.json`).
- Order: React → third-party → internal (`@/`) → relative → styles.

### State & Data
- Derive values from state rather than duplicating state.
- Use `useCallback` and `useMemo` only when there is a measurable performance benefit.
- Keep API calls inside `services/`; components call hooks, not services directly.

### Error Handling
- Always handle promise rejections. Use `try/catch` in async functions.
- Display user-friendly error messages in the UI; log technical details to the console in development.

### Accessibility
- All interactive elements must have accessible labels (`aria-label`, `aria-labelledby`, or visible text).
- Use semantic HTML (`<main>`, `<nav>`, `<section>`, `<article>`, `<button>`, etc.).
- Ensure colour contrast meets WCAG AA (4.5:1 for normal text).

### Page-Specific Rules
- **People by Day weekly totals** must always be colour-coded with no unstyled gap values.
- Use these thresholds consistently in code and legend copy: `>36 = high (green)`, `23-36 = medium (orange)`, `<23 = low (red)`.
- If threshold logic changes, update both the helper function and the on-page legend text in the same change.

### Testing
- Write a test file alongside each component: `ComponentName.test.tsx`.
- Test behaviour, not implementation details.
- Mock network calls at the service layer using `vi.mock`.

## Commit Message Format
Follow Conventional Commits:
```
feat: add weekly hours summary card
fix: correct overtime calculation for split shifts
chore: update dependencies
docs: add API service documentation
```

## Pull Request Guidelines
- Keep PRs focused on a single feature or fix.
- Include a clear description of **what** changed and **why**.
- Ensure all tests pass and linting is clean before requesting review.

## Local Workflow
- After any code change, always start (or restart) the local web server so the user can immediately review the update in the browser.
- On this project, use `npm.cmd run dev` in PowerShell environments where `npm.ps1` may be blocked by execution policy.
