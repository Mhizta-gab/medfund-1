# Authentication Provider Setup Guide

## Problem: Build Errors with Authentication

When using the custom `useAuth` hook from `@/context/AuthContext`, we were encountering build errors during server-side rendering because the hook was being called outside of an `AuthProvider` context:

```
Error occurred prerendering page "/admin". Read more: https://nextjs.org/docs/messages/prerender-error
Error: useAuth must be used within an AuthProvider
```

## Solution: withAuth Higher-Order Component

We've created a `withAuth` HOC (Higher-Order Component) to easily wrap any component that uses the `useAuth` hook with the required `AuthProvider`.

### How to Use the withAuth HOC

1. Import the `withAuth` HOC at the top of your file:

```tsx
import withAuth from '@/utils/withAuth';
```

2. Wrap your component with the HOC when exporting:

```tsx
const MyPage = () => {
  const { user } = useAuth();
  return <div>Hello, {user?.email}</div>;
};

export default withAuth(MyPage);
```

### Alternative Manual Approach

If you prefer more explicit control, you can manually structure your components like this:

```tsx
'use client';

import { AuthProvider, useAuth } from '@/context/AuthContext';

// Component that uses useAuth hook
const MyPageContent = () => {
  const { user } = useAuth();
  return <div>Hello, {user?.email}</div>;
};

// Wrapper component that provides the context
const MyPage = () => {
  return (
    <AuthProvider>
      <MyPageContent />
    </AuthProvider>
  );
};

export default MyPage;
```

### Routes Configuration

We've also updated the middleware to allow certain paths to handle their own authentication:

```tsx
// In middleware.ts
const isPublicRoute = createRouteMatcher([
  '/',
  '/login(.*)',
  '/register(.*)',
  '/api/webhooks(.*)',
  '/admin(.*)',   // All admin routes handle auth internally
  '/settings(.*)', // Settings pages handle auth internally
  '/profile(.*)',  // Profile pages handle auth internally
]);
```

## Best Practices

1. **Always** use the `withAuth` HOC or wrap components manually with `AuthProvider` if they use the `useAuth` hook.
2. Add new protected routes to the middleware's public routes list if they'll handle auth internally.
3. For components that are used within already wrapped components, you can use the `useAuth` hook directly without additional wrapping.

## Technical Background

During Next.js Static Site Generation (SSG) and Server-Side Rendering (SSR), React components are rendered on the server to generate HTML. If a component calls `useAuth()` during this phase, but there's no `AuthProvider` in the component tree, the error occurs.

By wrapping components with `AuthProvider`, we ensure the context is always available, even during server rendering.

## Components Already Using This Pattern

The following components have been updated to use this pattern:

- `/src/app/admin/login/page.tsx`
- `/src/app/admin/page.tsx`
- `/src/app/settings/page.tsx`
- `/src/app/profile/page.tsx`

When adding new pages that use authentication, remember to use the `withAuth` HOC or manually wrap them with `AuthProvider`. 