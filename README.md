# ISD Hours v3

A dashboard website for tracking and visualising IT Service Desk hours.

## Tech Stack

| Concern | Choice |
|---|---|
| Framework | React 18 + TypeScript |
| Build tool | Vite |
| Routing | React Router v6 |
| Styling | CSS Modules + global CSS variables |
| Testing | Vitest + React Testing Library |
| Linting | ESLint + TypeScript rules |
| Formatting | Prettier |

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Project Structure

```
src/
  assets/styles/   # Global CSS variables and reset
  components/
    layout/        # Shell, Sidebar, Header
    ui/            # Reusable UI components (Button, Card, StatCard, …)
  context/         # React Context providers
  hooks/           # Custom React hooks
  pages/           # Top-level route pages
  services/        # API / data-fetching layer (stub implementations)
  types/           # Shared TypeScript types
  utils/           # Pure helper functions
```

## Copilot Instructions

See [`.github/copilot-instructions.md`](.github/copilot-instructions.md) for coding conventions, naming rules, and contribution guidelines used by GitHub Copilot in this project.
