export type UserRole = 'guest' | 'user' | 'admin' | 'developer';

export interface UserPermissions {
  canAccessAdmin: boolean;
  canManageUsers: boolean;
  canViewAnalytics: boolean;
  maxTokensPerMonth: number;
  maxProjectsAllowed: number;
}

export interface UserProfile {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  website?: string;
  location?: string;
  company?: string;
  twitterHandle?: string;
  githubHandle?: string;
}

export interface User {
  uid: string;
  email: string | null;
  role: UserRole;
  tokensUsed: number;
  isSubscribed: boolean;
  subscriptionTier?: 'free' | 'basic' | 'pro' | 'enterprise';
  subscriptionEndDate?: Date;
  createdAt: Date;
  lastLoginAt: Date;
  profile?: UserProfile;
  permissions?: UserPermissions;
  suspended?: boolean;
  verified?: boolean;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

// Default permissions based on role
export const DEFAULT_PERMISSIONS: Record<UserRole, UserPermissions> = {
  guest: {
    canAccessAdmin: false,
    canManageUsers: false,
    canViewAnalytics: false,
    maxTokensPerMonth: 1000,
    maxProjectsAllowed: 1
  },
  user: {
    canAccessAdmin: false,
    canManageUsers: false,
    canViewAnalytics: false,
    maxTokensPerMonth: 10000,
    maxProjectsAllowed: 5
  },
  admin: {
    canAccessAdmin: true,
    canManageUsers: true,
    canViewAnalytics: true,
    maxTokensPerMonth: 100000,
    maxProjectsAllowed: 100
  },
  developer: {
    canAccessAdmin: true,
    canManageUsers: false,
    canViewAnalytics: true,
    maxTokensPerMonth: 50000,
    maxProjectsAllowed: 20
  }
}; 