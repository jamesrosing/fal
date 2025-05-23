# Allure MD Web Application - Architecture Documentation

## Overview

This document provides an overview of the architecture and structure of the Allure MD web application after the refactoring process.

## Project Structure

```
/fal
├── app/                    # Next.js App Router pages and routes
│   ├── api/               # API routes
│   ├── styles/            # Global styles and font configurations
│   └── [routes]/          # Application pages
├── components/            # React components (feature-based organization)
│   ├── features/          # Feature-specific components
│   │   ├── admin/         # Admin dashboard components
│   │   ├── appointments/  # Appointment scheduling components
│   │   ├── articles/      # Article management components
│   │   ├── chat/          # Chat interface components
│   │   ├── gallery/       # Gallery components
│   │   └── marketing/     # Marketing components
│   ├── shared/            # Shared components across features
│   │   ├── layout/        # Layout components (nav, footer, sections)
│   │   ├── media/         # Media handling components (Cloudinary)
│   │   ├── seo/           # SEO-related components
│   │   └── ui/            # Reusable UI components
│   └── icons/             # Icon components
├── docs/                  # Documentation
│   └── archive/           # Archived documentation
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions and configurations
├── providers/             # React context providers
├── public/                # Static assets
│   └── fonts/             # Web fonts
├── scripts/               # Build and utility scripts
│   └── archive/           # Archived migration scripts
├── supabase/              # Supabase configuration
└── types/                 # TypeScript type definitions
```

## Key Architectural Decisions

### 1. Feature-Based Component Organization

Components are organized by feature rather than by type, making it easier to:
- Find related components
- Maintain feature cohesion
- Scale the application
- Implement code splitting

### 2. Unified Font System

The application uses two primary fonts:
- **Garamond Premier Pro** (via Adobe Typekit) - For headings and display text
- **Cerebri Sans** (local) - For body text and UI elements

Font configuration is centralized in `/app/styles/fonts.css` with:
- Consistent font weight variables
- Responsive typography scale
- Optimized font loading with `font-display: swap`

### 3. Enhanced Error Handling

Implemented a comprehensive error boundary system:
- Global error boundary in the root layout
- Section-specific error boundaries for graceful degradation
- Media-specific error handling for image/video failures
- Development-friendly error messages

### 4. Performance Optimizations

- **Dynamic imports** for heavy components
- **Lazy loading** for sections below the fold
- **Video optimization** with multiple formats and responsive sources
- **Font optimization** by removing unused font files
- **Dependency cleanup** to reduce bundle size

### 5. Media System Architecture

The application uses Cloudinary for media management with:
- Enhanced wrapper components (`CldImage`, `CldVideo`)
- Loading states and error handling
- Responsive image delivery
- Automatic format optimization

## Component Guidelines

### Shared Components

Located in `/components/shared/`, these components should be:
- Generic and reusable
- Well-documented with JSDoc comments
- Have clear prop interfaces
- Include default props where appropriate

### Feature Components

Located in `/components/features/[feature]/`, these should:
- Be specific to their feature domain
- Import shared components as needed
- Maintain feature-specific state
- Follow consistent naming conventions

### UI Components

Located in `/components/shared/ui/`, these are:
- Pure presentational components
- Styled using Tailwind CSS
- Based on Radix UI primitives
- Fully accessible

## Code Style Guidelines

### TypeScript

- Use explicit types for function parameters and returns
- Prefer interfaces over types for object shapes
- Use const assertions for literal types
- Avoid `any` type

### React

- Use functional components with hooks
- Implement error boundaries for sections
- Use dynamic imports for code splitting
- Memoize expensive computations

### Styling

- Use Tailwind CSS utilities
- Follow mobile-first responsive design
- Use CSS variables for dynamic values
- Maintain consistent spacing scale

## Performance Considerations

1. **Image Optimization**
   - Use Cloudinary for automatic format selection
   - Implement responsive images with proper sizes
   - Add loading="lazy" for below-fold images
   - Use blur placeholders for better UX

2. **Bundle Size**
   - Remove unused dependencies
   - Use dynamic imports for large components
   - Tree-shake unused code
   - Monitor bundle size with analyzer

3. **Runtime Performance**
   - Implement React.memo for expensive components
   - Use useCallback and useMemo appropriately
   - Avoid unnecessary re-renders
   - Profile performance in development

## Deployment

The application is configured for deployment on Vercel with:
- Automatic optimizations
- Edge runtime support
- Analytics integration
- Environment variable management

## Maintenance

### Regular Tasks

1. **Dependency Updates**
   - Review and update dependencies monthly
   - Test thoroughly after updates
   - Check for security vulnerabilities

2. **Performance Monitoring**
   - Use Vercel Analytics
   - Monitor Core Web Vitals
   - Review bundle size trends

3. **Code Quality**
   - Run linting before commits
   - Maintain test coverage
   - Review and refactor regularly

## Future Considerations

1. **Testing Strategy**
   - Implement unit tests for utilities
   - Add integration tests for features
   - Set up E2E testing

2. **State Management**
   - Consider adding Zustand or Redux for complex state
   - Implement optimistic updates
   - Add offline support

3. **Accessibility**
   - Regular accessibility audits
   - Keyboard navigation testing
   - Screen reader compatibility

## Conclusion

This architecture provides a solid foundation for the Allure MD web application, with clear organization, performance optimizations, and maintainability in mind. The feature-based structure allows for easy scaling while the shared component library ensures consistency across the application.
