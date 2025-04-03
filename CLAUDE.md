# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build, Lint, and Test Commands
- `npm run dev`: Run dev server with turbopack
- `npm run build`: Build the application
- `npm run lint`: Check codebase for linting issues
- `npm run lint:fix`: Fix linting issues automatically
- `npm run type-check`: Verify TypeScript types (no emit)
- `npm run format`: Format code with Prettier

## Code Style Guidelines
- **Formatting**: No semicolons, single quotes, 100 char line limit, 2 space tabs
- **TypeScript**: Strict typing required, use type definitions from `lib/database.types.ts`
- **Imports**: Use absolute paths with `@/` prefix (e.g., `@/components/ui/button`)
- **Components**: Follow existing patterns, reuse UI components from `components/ui/`
- **Media**: Use approved media systems, follow `lib/media` utilities
- **Database**: Never modify schema without migration, use Supabase client
- **Error Handling**: Catch and handle all errors, avoid unexpected UI failures
- **Best Practices**: Don't modify working code without instruction, always test changes