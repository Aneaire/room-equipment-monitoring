# AGENTS.md

## Global Instructions
- **Package Manager**: Use `npm` for all JavaScript/Node.js projects
- **Reusability**: Prioritize reusable components, functions, and patterns
- **Web Design**: Use Tailwind CSS for styling and shadcn/ui for components

## Build, Lint, and Test Commands
- **Build**: `npm run build` (Next.js production build)
- **Lint**: `npm run lint` (ESLint with Next.js config)
- **Database**: `npm run db:push`, `npm run db:generate`, `npm run db:migrate`, `npm run db:studio`
- **Test**: No testing framework configured - recommend adding Jest or Vitest

## Code Style Guidelines
- **Imports**: Group imports (React, third-party, local with `@/` alias)
- **Formatting**: TypeScript with strict mode. Use `.tsx` for React components, `.ts` for utilities
- **Types**: Full TypeScript with strict configuration. Use proper React.ComponentProps patterns
- **Naming**: Components: PascalCase, Files: kebab-case for pages, camelCase for utilities, Variables/Functions: camelCase, Database fields: snake_case
- **Styling**: Use Tailwind CSS with `cn()` utility from `@/lib/utils` for conditional classes
- **Error Handling**: Use Zod for validation, proper error boundaries for React components

## Agent-Specific Rules
- **Cursor Rules**: No specific Cursor rules found
- **Copilot Rules**: No specific Copilot rules found