# React.use() Patterns for Client Components in Next.js 15

## Overview

Next.js 15, along with React 19, introduces a new pattern for handling promises in client components using `React.use()`. This document provides guidance on how to migrate from traditional useEffect-based data fetching to React.use().

## Key Concepts

### What is React.use()?

`React.use()` is a new React hook that unwraps the value from a Promise, Thenable, or Context. It can be used directly in component render functions to handle async data.

### Benefits

- Simplified data fetching code - no more useState/useEffect boilerplate
- Suspense integration - automatically shows fallbacks while data loads
- Better error handling - works with error boundaries
- Cleaner component code - fewer state variables and side effects

## Implementation Patterns

### Basic Usage

```tsx
'use client';
import { use } from 'react';

// Create a function that returns a promise
function fetchData() {
  return fetch('/api/data').then(res => res.json());
}

export default function ClientComponent() {
  // Use the promise directly in your component
  const dataPromise = fetchData();
  const data = use(dataPromise);
  
  return <div>{data.title}</div>;
}
```

### With Suspense

```tsx
'use client';
import { use, Suspense } from 'react';

function DataComponent() {
  const dataPromise = fetch('/api/data').then(res => res.json());
  const data = use(dataPromise);
  
  return <div>{data.title}</div>;
}

export default function ClientPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DataComponent />
    </Suspense>
  );
}
```

### With Error Boundaries

```tsx
'use client';
import { use, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

function DataComponent() {
  const dataPromise = fetch('/api/data').then(res => {
    if (!res.ok) throw new Error('Failed to fetch data');
    return res.json();
  });
  
  const data = use(dataPromise);
  return <div>{data.title}</div>;
}

export default function ClientPage() {
  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <Suspense fallback={<div>Loading...</div>}>
        <DataComponent />
      </Suspense>
    </ErrorBoundary>
  );
}
```

### With useSearchParams

```tsx
'use client';
import { use } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ClientComponent() {
  // In Next.js 15, useSearchParams returns a Promise
  const searchParamsPromise = useSearchParams();
  const searchParams = use(searchParamsPromise);
  
  const query = searchParams.get('q') || '';
  
  return <div>Searching for: {query}</div>;
}
```

### With Traditional State (Hybrid Approach)

Sometimes you still need state for user interactions. Here's how to combine React.use() with traditional state:

```tsx
'use client';
import { use, useState } from 'react';

function fetchData(id) {
  return fetch(`/api/items/${id}`).then(res => res.json());
}

export default function ClientComponent() {
  const [id, setId] = useState(1);
  // Create a new promise for each render with the current ID
  const dataPromise = fetchData(id);
  const data = use(dataPromise);
  
  return (
    <div>
      <h1>{data.title}</h1>
      <button onClick={() => setId(id + 1)}>Next Item</button>
    </div>
  );
}
```

## Best Practices

1. **Place use() at the top level**: Don't put `use()` inside conditionals or loops

2. **Memoize promise creation**: For expensive operations, consider memoizing the promise creation

3. **Use Suspense boundaries**: Always wrap components that use `use()` in Suspense

4. **Add error boundaries**: Always use error boundaries to catch and handle errors

5. **Consider cache**: For data that doesn't change often, implement caching

6. **Watch for waterfalls**: Be careful of sequential data fetching creating "request waterfalls"

## Common Issues

### "Cannot update a component while rendering a different component"

This happens when you try to update state during render. Solution: Move state updates to event handlers.

### "React.use can only be used in Suspense-enabled components"

Make sure your app is using React 19 and has proper Suspense boundaries.

### "Text content does not match server-rendered content"

This happens with hydration mismatches. Ensure your server and client renders are consistent.

## Migration Guide

### From useState/useEffect:

Before:
```tsx
'use client';
import { useState, useEffect } from 'react';

export default function ClientComponent() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setIsLoading(false);
      })
      .catch(err => {
        setError(err);
        setIsLoading(false);
      });
  }, []);
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return null;
  
  return <div>{data.title}</div>;
}
```

After:
```tsx
'use client';
import { use, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

function DataDisplay() {
  const dataPromise = fetch('/api/data').then(res => res.json());
  const data = use(dataPromise);
  
  return <div>{data.title}</div>;
}

export default function ClientComponent() {
  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <Suspense fallback={<div>Loading...</div>}>
        <DataDisplay />
      </Suspense>
    </ErrorBoundary>
  );
}
```

## Conclusion

React.use() offers a more declarative and simpler way to handle async data in client components. By following these patterns, you can create more maintainable and robust client components in Next.js 15.
