import { useAuth } from '../context/AuthContext';
import type { UserRole, UserPermissions } from '../types/auth';

interface RBACHookReturn {
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  hasPermission: (permission: keyof UserPermissions) => boolean;
  isAdmin: boolean;
  isDeveloper: boolean;
  isSuspended: boolean;
  isVerified: boolean;
  canAccessAdmin: boolean;
  canManageUsers: boolean;
  canViewAnalytics: boolean;
}

export function useRBAC(): RBACHookReturn {
  const { user } = useAuth();

  // Check if user has one of the specified roles
  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!user) return false;

    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }

    return user.role === roles;
  };

  // Check if user has the specified permission
  const hasPermission = (permission: keyof UserPermissions): boolean => {
    if (!user || !user.permissions) return false;

    // If the user is an admin, they have all permissions
    if (user.role === 'admin') return true;

    return !!user.permissions[permission];
  };

  // Common permission checks as convenience properties
  const isAdmin = hasRole('admin');
  const isDeveloper = hasRole('developer');
  const isSuspended = !!user?.suspended;
  const isVerified = !!user?.verified;

  // Direct permission checks
  const canAccessAdmin = hasPermission('canAccessAdmin');
  const canManageUsers = hasPermission('canManageUsers');
  const canViewAnalytics = hasPermission('canViewAnalytics');

  return {
    hasRole,
    hasPermission,
    isAdmin,
    isDeveloper,
    isSuspended,
    isVerified,
    canAccessAdmin,
    canManageUsers,
    canViewAnalytics,
  };
}

// HOC to protect components based on role
export function withRoleProtection(Component: React.ComponentType, requiredRoles: UserRole | UserRole[]) {
  return function ProtectedComponent(props: any) {
    const { hasRole } = useRBAC();
    const hasAccess = hasRole(requiredRoles);

    if (!hasAccess) {
      return (
        <div className="p-8 flex flex-col items-center justify-center">
          <div className="i-ph:prohibit-fill w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
            You don't have permission to access this feature. Please contact an administrator if you believe this is an
            error.
          </p>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

// HOC to protect components based on permission
export function withPermissionProtection(Component: React.ComponentType, requiredPermission: keyof UserPermissions) {
  return function ProtectedComponent(props: any) {
    const { hasPermission } = useRBAC();
    const hasAccess = hasPermission(requiredPermission);

    if (!hasAccess) {
      return (
        <div className="p-8 flex flex-col items-center justify-center">
          <div className="i-ph:prohibit-fill w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
            You don't have permission to access this feature. Please contact an administrator if you believe this is an
            error.
          </p>
        </div>
      );
    }

    return <Component {...props} />;
  };
}
