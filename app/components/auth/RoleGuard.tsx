import { ReactNode } from 'react';
import { useAuth } from '~/lib/context/AuthContext';
import { useRBAC } from '~/lib/hooks/useRBAC';
import { UserRole, UserPermissions } from '~/lib/types/auth';
import { Navigate } from '@remix-run/react';

interface RoleGuardProps {
  children: ReactNode;
  requiredRoles?: UserRole | UserRole[];
  requiredPermission?: keyof UserPermissions;
  redirectTo?: string;
}

export function RoleGuard({ children, requiredRoles, requiredPermission, redirectTo = '/' }: RoleGuardProps) {
  const { user, isLoading } = useAuth();
  const { hasRole, hasPermission } = useRBAC();

  // Show loading indicator while authenticating
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="i-ph:spinner-gap w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Checking permissions...</p>
        </div>
      </div>
    );
  }

  // If no user is logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If the user is suspended, show suspended screen
  if (user.suspended) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <div className="i-ph:prohibit-fill w-20 h-20 text-red-500 mb-6" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Account Suspended</h1>
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-lg mb-8">
          Your account has been suspended. Please contact the administrator for more information.
        </p>
        <button
          onClick={() => (window.location.href = '/')}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg text-gray-900 dark:text-gray-100"
        >
          Return to Home
        </button>
      </div>
    );
  }

  // If roles are required, check if the user has one of them
  if (requiredRoles && !hasRole(requiredRoles)) {
    return <Navigate to={redirectTo} replace />;
  }

  // If a specific permission is required, check if the user has it
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to={redirectTo} replace />;
  }

  // User has the required roles/permissions, render children
  return <>{children}</>;
}

// Special guard for admin routes
export function AdminGuard({
  children,
  redirectTo = '/',
}: Omit<RoleGuardProps, 'requiredRoles' | 'requiredPermission'>) {
  return (
    <RoleGuard requiredPermission="canAccessAdmin" redirectTo={redirectTo}>
      {children}
    </RoleGuard>
  );
}

// Special guard for developer routes
export function DeveloperGuard({
  children,
  redirectTo = '/',
}: Omit<RoleGuardProps, 'requiredRoles' | 'requiredPermission'>) {
  return (
    <RoleGuard requiredRoles={['developer', 'admin']} redirectTo={redirectTo}>
      {children}
    </RoleGuard>
  );
}

// Component to show when user is denied access
export function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="i-ph:prohibit-fill w-20 h-20 text-red-500 mb-6" />
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Access Denied</h1>
      <p className="text-gray-600 dark:text-gray-400 text-center max-w-lg mb-8">
        You don't have permission to access this page. Please contact an administrator if you believe this is an error.
      </p>
      <button
        onClick={() => (window.location.href = '/')}
        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg text-gray-900 dark:text-gray-100"
      >
        Return to Home
      </button>
    </div>
  );
}
