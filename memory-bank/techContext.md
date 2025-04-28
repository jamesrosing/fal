# Technical Context: Allure MD Web Application

## Technologies Used

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: TailwindCSS + shadcn/ui Components
- **Animations**: Framer Motion
- **State Management**: React Query for data fetching and caching
- **SEO**: Next.js Metadata API
- **Media**: next-cloudinary for image and video optimization

### Backend
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage + Cloudinary CDN
- **API**: Next.js API Routes
- **Caching**: Redis (for query caching)
- **External APIs**:
  - Zenoti API (for appointment scheduling)
  - OpenAI API (for chatbot functionality)

### Development & Tooling
- **Language**: TypeScript
- **Package Manager**: npm
- **Linting & Formatting**: ESLint, Prettier
- **Task Management**: task-master-ai
- **Version Control**: Git
- **CI/CD**: Vercel

## Development Setup

### Environment Requirements
- Node.js (v20+)
- npm (v9+)
- Git

### Environment Variables
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# OpenAI
OPENAI_API_KEY=your-openai-key

# Redis (optional)
REDIS_URL=your-redis-url
```

### Development Workflow
1. Clone repository
2. Install dependencies (`npm install`)
3. Set up environment variables
4. Run development server (`npm run dev`)
5. Use task-master to track implementation progress

## Technical Constraints

### Performance Targets
- First Contentful Paint (FCP): < 1.8s
- Largest Contentful Paint (LCP): < 2.5s
- Cumulative Layout Shift (CLS): < 0.1
- First Input Delay (FID): < 100ms
- Time to Interactive (TTI): < 3.8s

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- IE not supported

### Accessibility Requirements
- WCAG 2.1 AA compliance target
- Keyboard navigation support
- Screen reader compatibility

### SEO Requirements
- Server-side rendering
- Dynamic sitemap generation
- Structured data implementation
- Meta tags and OpenGraph optimization
- Canonical URLs

## Dependencies

### Frontend Libraries
- next-cloudinary
- @supabase/auth-helpers-nextjs
- @supabase/supabase-js
- @tanstack/react-query
- framer-motion
- shadcn/ui components
- tailwindcss

### Backend Libraries
- ioredis (optional)
- openai

### Development Dependencies
- typescript
- eslint
- prettier
- husky
- lint-staged

## Database Schema

The application uses a comprehensive database schema with the following key tables:

1. **media_assets**: Cloudinary media assets metadata
2. **galleries**: Top-level gallery collections
3. **albums**: Collections within galleries
4. **cases**: Individual cases within albums
5. **case_images**: Images associated with cases
6. **articles**: Medical content
7. **article_categories**: Categories for articles
8. **team_members**: Healthcare providers and staff
9. **profiles**: User accounts
10. **bookmarks**: User-saved content
11. **appointments**: Scheduled appointments
12. **chat_messages**: Conversation history

## Integration Points

### Cloudinary Integration
- Direct use of Cloudinary public IDs
- CldImage and CldVideo components
- Server-side image optimization
- Responsive images with srcset

### Supabase Integration
- Authentication
- Database access
- Storage (for non-media files)
- Row-level security policies

### Zenoti Integration
- Appointment scheduling
- Customer management
- Service catalog

### OpenAI Integration
- Chatbot implementation
- Content generation assistance 