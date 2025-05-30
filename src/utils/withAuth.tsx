'use client';

import React from 'react';
import { AuthProvider } from '@/context/AuthContext';

/**
 * Higher-Order Component that wraps any component with the AuthProvider
 * Use this for any page that needs to use the useAuth hook
 * 
 * @example
 * // Instead of:
 * const MyPage = () => {
 *   const { user } = useAuth();
 *   return <div>Hello, {user?.email}</div>;
 * };
 * 
 * // Use:
 * import withAuth from '@/utils/withAuth';
 * 
 * const MyPage = () => {
 *   const { user } = useAuth();
 *   return <div>Hello, {user?.email}</div>;
 * };
 * 
 * export default withAuth(MyPage);
 */
export default function withAuth<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  const WithAuthWrapper: React.FC<P> = (props) => {
    return (
      <AuthProvider>
        <Component {...props} />
      </AuthProvider>
    );
  };

  // Update the display name for debugging
  const componentName = Component.displayName || Component.name || 'Component';
  WithAuthWrapper.displayName = `withAuth(${componentName})`;

  return WithAuthWrapper;
} 