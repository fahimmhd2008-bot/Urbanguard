# Contributing to Urbanguard

Thank you for your interest in contributing to **Urbanguard** — the AI-powered municipal complaint management platform! 🏙️

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

By participating, you agree to maintain a respectful and inclusive environment for all contributors.

## Getting Started

1. **Fork** the repository
2. **Clone** your fork:
   ```bash
   git clone https://github.com/<your-username>/Urbanguard.git
   cd Urbanguard
   ```
3. **Install** dependencies:
   ```bash
   npm install
   ```
4. **Copy** environment variables:
   ```bash
   cp .env.example .env.local
   ```
5. **Start** the dev server:
   ```bash
   npm run dev
   ```

## Development Workflow

```
main ← staging ← feature/your-feature-name
```

- Always branch off from `main`
- Use descriptive branch names: `feature/add-map-clustering`, `fix/auth-redirect-loop`
- Keep commits atomic and use conventional commit messages:
  - `feat:` — new feature
  - `fix:` — bug fix
  - `test:` — adding or updating tests
  - `docs:` — documentation
  - `refactor:` — code refactoring
  - `perf:` — performance improvement
  - `chore:` — maintenance tasks

## Coding Standards

- **TypeScript**: All code must be strongly typed — no `any` unless absolutely necessary
- **ESLint**: Run `npm run lint` before committing; all warnings must be resolved
- **Formatting**: Use consistent indentation (2 spaces)
- **Components**: Keep React components focused — single responsibility principle
- **API Routes**: Always validate inputs and return structured `{ success, data, error }` responses
- **Accessibility**: All interactive elements must have `aria-label`, proper roles, and keyboard navigation

## Testing Requirements

**All PRs must include tests.** We use Jest + React Testing Library.

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:coverage

# Run in watch mode during development
npm run test:watch
```

- New utility functions → unit tests in `__tests__/utils/`
- New API endpoints → integration tests in `__tests__/api/`
- New UI components → component tests in `__tests__/components/`
- Minimum coverage target: **70%** for new code

## Pull Request Process

1. Ensure all tests pass: `npm test`
2. Ensure no lint errors: `npm run lint`
3. Update `README.md` if your change affects setup or usage
4. Fill out the PR template completely
5. Request review from at least one maintainer
6. PRs are squash-merged into `main`

## Questions?

Open a [GitHub Discussion](https://github.com/fahimmhd2008-bot/Urbanguard/discussions) or email **dev@urbanguard.example.com**.
