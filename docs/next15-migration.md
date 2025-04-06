# Next.js 15 Compatibility Migration

## Overview

Next.js 15 introduces several breaking changes compared to previous versions:

1. **Dynamic APIs are now asynchronous**: Functions like `cookies()`, `headers()`, and `draftMode()` are now Promise-based.
2. **SearchParams are now Promise-based**: Page components using searchParams need to await them.
3. **React 19 Integration**: Next.js 15 uses React 19 which introduces its own changes.

This document outlines the changes made to ensure compatibility with Next.js 15.

## Key Changes

### 1. Updated Supabase Client

A new Supabase client helper has been created that properly handles the async nature of Next.js 15's cookies API:

```typescript
// lib/supabase-client.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs/client';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs/server';
import { createServerActionClient } from '@supabase/auth-helpers-nextjs/server';

// Usage in server components
export async function createServerClient() {
  const cookies = await import('next/headers').then(mod => mod.cookies);
  return createServerComponentClient({ cookies });
}

// Usage in server actions
export async function createActionClient() {
  const cookies = await import('next/headers').then(mod => mod.cookies);
  return createServerActionClient({ cookies });
}

// Usage in client components
export function createBrowserClient() {
  return createClientComponentClient();
}
```

### 2. Updated Middleware

The middleware has been updated to properly handle Next.js 15's async APIs:

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  // In Next.js 15, nextUrl itself is not a Promise, only its components might be
  const pathname = request.nextUrl.pathname;
  const search = request.nextUrl.search;
  
  // Rest of the middleware code...
}
```

### 3. Automatic Migration Script

A script has been created to automatically update common patterns:

```bash
npm run next15:migrate
```

This script will:
- Make middleware functions async
- Add await to dynamic API calls
- Update page components to handle async searchParams 
- Fix API routes to properly handle async request properties

## Usage Guide

### Server Components

When using dynamic APIs in server components:

```typescript
// Before (Next.js 14)
import { cookies } from 'next/headers';

export default function Page() {
  const cookieStore = cookies();
  // ...
}

// After (Next.js 15)
import { cookies } from 'next/headers';

export default async function Page() {
  const cookieStore = await cookies();
  // ...
}
```

### SearchParams in Page Props

When using searchParams in page components:

```typescript
// Before (Next.js 14)
export default function Page({ searchParams }) {
  const query = searchParams.q || '';
  // ...
}

// After (Next.js 15)
export default async function Page({ searchParams }) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || '';
  // ...
}
```

### Supabase in Server Components

When using Supabase in server components:

```typescript
// Before (Next.js 14)
import { createClient } from '@/lib/supabase';

export default function ProfilePage() {
  const supabase = createClient();
  // ...
}

// After (Next.js 15)
import { createServerClient } from '@/lib/supabase-client';

export default async function ProfilePage() {
  const supabase = await createServerClient();
  // ...
}
```

### Supabase in Server Actions

When using Supabase in server actions:

```typescript
// Before (Next.js 14)
import { createClient } from '@/lib/supabase';

export async function updateProfile(formData) {
  'use server';
  const supabase = createClient();
  // ...
}

// After (Next.js 15)
import { createActionClient } from '@/lib/supabase-client';

export async function updateProfile(formData) {
  'use server';
  const supabase = await createActionClient();
  // ...
}
```

## Verification and Testing

After running the migration script and making manual updates:

1. **Run Type Checking**: `npm run type-check` to catch any type errors
2. **Test Key Flows**: Ensure authentication, API routes, and page rendering work correctly
3. **Check Server Components**: Verify all server components are properly using async/await
4. **Monitor Console**: Check for any warnings or errors related to missing await

## Common Issues

1. **Missing Await**: Error "You're trying to use a client feature (Deferrable) in a server component" often means a missing await on a dynamic API
2. **Type Errors**: If TypeScript complains about Promise types, make sure you've properly awaited the promise
3. **Supabase Auth Issues**: If authentication stops working, ensure you're using the proper client for the context

If you encounter any other issues, please document them and their solutions here.
