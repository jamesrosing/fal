# Next.js 15 Compatibility Fixes

## Current Issues

The project is using Next.js 15, which introduces several breaking changes compared to older versions. Key issues include:

1. **Dynamic APIs are now Asynchronous**: Functions like `cookies()`, `headers()`, and `draftMode()` from next/headers are now asynchronous and must be properly awaited.

2. **Supabase Integration Compatibility**: The Supabase helpers for Next.js may not be fully compatible with Next.js 15.

3. **SearchParams Changes**: SearchParams are now Promise-based in Next.js 15.

4. **React 19 Compatibility**: Next.js 15 is designed to work with React 19, which may require adjustments to existing components.

## Recommended Fixes

### 1. Update Dynamic APIs Usage

Find and fix instances where dynamic APIs are not properly awaited:

```typescript
// Before (Next.js 14)
import { cookies } from 'next/headers';

export default function Page() {
  const cookieStore = cookies();
  const theme = cookieStore.get('theme');
  // ...
}

// After (Next.js 15)
import { cookies } from 'next/headers';

export default async function Page() {
  const cookieStore = await cookies();
  const theme = cookieStore.get('theme');
  // ...
}
```

Use a search pattern to find all instances:

```bash
grep -r "cookies()" --include="*.tsx" --include="*.ts" ./app
grep -r "headers()" --include="*.tsx" --include="*.ts" ./app
grep -r "draftMode()" --include="*.tsx" --include="*.ts" ./app
```

### 2. Update Supabase Client Implementation

Update the Supabase client implementation to be Next.js 15 compatible:

```typescript
// lib/supabase-client.ts

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from './database.types';

// Helper for Server Components
export async function createServerClient() {
  const cookies = await import('next/headers').then(mod => mod.cookies());
  return createServerComponentClient<Database>({ cookies });
}

// Helper for Server Actions
export async function createActionClient() {
  const { cookies } = await import('next/headers');
  return createServerComponentClient<Database>({ cookies: cookies() });
}

// Helper for Client Components (unchanged)
export function createBrowserClient() {
  const { createClientComponentClient } = require('@supabase/auth-helpers-nextjs');
  return createClientComponentClient<Database>();
}
```

### 3. Fix SearchParams Handling

Update components that use searchParams to handle the Promise-based interface:

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

For client components using the `useSearchParams` hook:

```typescript
// Before (Next.js 14)
'use client';
import { useSearchParams } from 'next/navigation';

export default function ClientComponent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  // ...
}

// After (Next.js 15)
'use client';
import { useSearchParams } from 'next/navigation';
import { use } from 'react';

export default function ClientComponent() {
  const searchParamsPromise = useSearchParams();
  const searchParams = use(searchParamsPromise);
  const query = searchParams.get('q') || '';
  // ...
}
```

### 4. Update React.use() for Data Fetching

Implement `React.use()` for data fetching in client components:

```typescript
// Before (Next.js 14)
'use client';
import { useState, useEffect } from 'react';

export default function ClientComponent() {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(setData);
  }, []);
  
  if (!data) return <p>Loading...</p>;
  
  return <div>{data.title}</div>;
}

// After (Next.js 15)
'use client';
import { use } from 'react';

function fetchData() {
  return fetch('/api/data').then(res => res.json());
}

export default function ClientComponent() {
  const dataPromise = fetchData();
  const data = use(dataPromise);
  
  return <div>{data.title}</div>;
}
```

### 5. Update Server Components with Proper Async/Await

Ensure all Server Components properly use async/await:

```typescript
// Before (Next.js 14)
export default function Page() {
  const res = fetch('https://...');
  const data = res.json();
  
  return <div>{data.title}</div>;
}

// After (Next.js 15)
export default async function Page() {
  const res = await fetch('https://...');
  const data = await res.json();
  
  return <div>{data.title}</div>;
}
```

### 6. Fix Supabase Authentication

Update the Supabase authentication implementation:

```typescript
// lib/auth.ts
import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { redirect } from 'next/navigation';
import { Database } from './database.types';

export async function getSession() {
  const cookieStore = await cookies();
  const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore });
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function requireAuth() {
  const session = await getSession();
  
  if (!session) {
    redirect('/auth/login');
  }
  
  return session;
}
```

Update the login component:

```typescript
'use client';
import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const router = useRouter();
  const supabase = createClientComponentClient();
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      router.refresh();
      router.push('/dashboard');
    } catch (error) {
      setError(error.message);
    }
  };
  
  // Rest of the component...
}
```

### 7. Update Image Component Usage

Ensure all instances of next/image are using the latest patterns:

```typescript
// Before (Next.js 14)
import Image from 'next/image';

export default function Component() {
  return (
    <Image
      src="/image.jpg"
      width={500}
      height={300}
      alt="Description"
      layout="responsive"
    />
  );
}

// After (Next.js 15)
import Image from 'next/image';

export default function Component() {
  return (
    <Image
      src="/image.jpg"
      width={500}
      height={300}
      alt="Description"
      style={{ width: '100%', height: 'auto' }}  // Use style instead of layout
    />
  );
}
```

### 8. Update Route Handlers

Update API route handlers to properly use async/await:

```typescript
// Before (Next.js 14)
export function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');
  
  return Response.json({ query });
}

// After (Next.js 15)
export async function GET(request) {
  const searchParams = await request.nextUrl.searchParams;
  const query = searchParams.get('query');
  
  return Response.json({ query });
}
```

### 9. Update Middleware

Ensure middleware properly awaits dynamic APIs:

```typescript
// Before (Next.js 14)
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export function middleware(request) {
  const cookieStore = cookies();
  const token = cookieStore.get('token');
  
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

// After (Next.js 15)
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function middleware(request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');
  
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}
```

## Automated Migration Script

Create a script to automatically identify and fix some common issues:

```typescript
// scripts/next15-migration.js
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all TS/TSX files in the app directory
const files = glob.sync('app/**/*.{ts,tsx}');

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let modified = false;
  
  // Fix cookies() usage
  if (content.includes('cookies()') && !content.includes('await cookies()')) {
    content = content.replace(/const\s+(\w+)\s+=\s+cookies\(\);/g, 'const $1 = await cookies();');
    modified = true;
  }
  
  // Fix headers() usage
  if (content.includes('headers()') && !content.includes('await headers()')) {
    content = content.replace(/const\s+(\w+)\s+=\s+headers\(\);/g, 'const $1 = await headers();');
    modified = true;
  }
  
  // Fix draftMode() usage
  if (content.includes('draftMode()') && !content.includes('await draftMode()')) {
    content = content.replace(/const\s+(\w+)\s+=\s+draftMode\(\);/g, 'const $1 = await draftMode();');
    modified = true;
  }
  
  // Make Page component async if it contains fetch but isn't async
  if (
    content.includes('export default function Page') && 
    content.includes('fetch(') && 
    !content.includes('export default async function Page')
  ) {
    content = content.replace(
      /export\s+default\s+function\s+Page/g, 
      'export default async function Page'
    );
    modified = true;
  }
  
  // Fix searchParams usage in page components
  if (
    content.includes('export default function Page') && 
    content.includes('searchParams') && 
    !content.includes('await searchParams')
  ) {
    content = content.replace(
      /const\s+(\w+)\s+=\s+searchParams\.(\w+)/g, 
      'const $1 = (await searchParams).$2'
    );
    modified = true;
  }
  
  // Save the modified file
  if (modified) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
}

console.log('Migration completed!');
```

## Manual Review Checklist

Create a checklist for manual review of the codebase:

1. **Server Components**
   - [ ] Ensure all data fetching uses proper `await`
   - [ ] Check usage of `cookies()`, `headers()`, and `draftMode()`
   - [ ] Verify searchParams handling

2. **Client Components**
   - [ ] Check useSearchParams implementations
   - [ ] Review data fetching patterns for React.use()
   - [ ] Check setTimeout and setInterval cleanup

3. **Authentication**
   - [ ] Verify Supabase auth flows
   - [ ] Check session management
   - [ ] Test protected routes

4. **API Routes**
   - [ ] Ensure proper async/await usage
   - [ ] Test request parameter handling

5. **Middleware**
   - [ ] Check for async middleware functions
   - [ ] Verify cookies and headers access

6. **Image Component**
   - [ ] Update deprecated props
   - [ ] Check responsive image patterns

## Implementation Strategy

1. **Start with automated fixes**
   - Run the migration script to catch common issues
   - Run the type checker to identify type errors

2. **Focus on critical paths**
   - Authentication flows
   - API routes
   - Main page components

3. **Test incrementally**
   - Fix and test one route at a time
   - Verify functionality after each change

4. **Update dependencies**
   - Ensure all Next.js packages are at matching versions
   - Update React to version 19
   - Update other dependencies as needed

5. **End-to-end testing**
   - Verify all main user flows
   - Check for performance regressions
