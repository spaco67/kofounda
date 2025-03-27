export type UserRole = 'guest' | 'user' | 'admin';

export interface User {
  uid: string;
  email: string | null;
  role: UserRole;
  tokensUsed: number;
  isSubscribed: boolean;
  subscriptionEndDate?: Date;
  createdAt: Date;
  lastLoginAt: Date;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
} 