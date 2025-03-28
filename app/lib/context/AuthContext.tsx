import { createContext, useContext, useEffect, useState } from 'react';
import {
  type User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import type { User, AuthState, UserProfile, UserPermissions, UserRole } from '../types/auth';
import { DEFAULT_PERMISSIONS } from '../types/auth';

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserTokens: (tokensUsed: number) => Promise<void>;
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
  updateUserRole: (userId: string, role: UserRole) => Promise<void>;
  updateUserPermissions: (userId: string, permissions: Partial<UserPermissions>) => Promise<void>;
  getUserList: () => Promise<User[]>;
  suspendUser: (userId: string, suspended: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    console.log('Setting up auth state listener');
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser ? `User: ${firebaseUser.uid}` : 'No user');

      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            console.log('User document found:', userData);

            // Ensure we have all the latest fields by merging with defaults if needed
            const updatedUser = ensureUserFields(userData);

            // Update last login time
            await updateDoc(doc(db, 'users', firebaseUser.uid), {
              lastLoginAt: new Date(),
              ...(!userData.permissions && { permissions: DEFAULT_PERMISSIONS[userData.role] }),
            });

            setState({
              user: updatedUser,
              isLoading: false,
              error: null,
            });
          } else {
            console.log('Creating new user document');
            // Create new user document if it doesn't exist
            const newUser: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              role: 'user',
              tokensUsed: 0,
              isSubscribed: false,
              subscriptionTier: 'free',
              createdAt: new Date(),
              lastLoginAt: new Date(),
              permissions: DEFAULT_PERMISSIONS['user'],
              verified: false,
              profile: {
                displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              },
            };
            await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
            console.log('New user created:', newUser);
            setState({
              user: newUser,
              isLoading: false,
              error: null,
            });
          }
        } catch (error) {
          console.error('Error handling auth state change:', error);
          setState({
            user: null,
            isLoading: false,
            error: 'Failed to load user data',
          });
        }
      } else {
        console.log('User signed out or no user');
        setState({
          user: null,
          isLoading: false,
          error: null,
        });
      }
    });

    return () => {
      console.log('Cleaning up auth state listener');
      unsubscribe();
    };
  }, []);

  // Ensure user object has all required fields
  const ensureUserFields = (user: User): User => {
    const updatedUser = { ...user };

    // Add permissions if missing
    if (!updatedUser.permissions) {
      updatedUser.permissions = DEFAULT_PERMISSIONS[user.role];
    }

    // Add profile if missing
    if (!updatedUser.profile) {
      updatedUser.profile = {
        displayName: user.email?.split('@')[0] || 'User',
      };
    }

    // Add subscription tier if missing
    if (!updatedUser.subscriptionTier) {
      updatedUser.subscriptionTier = 'free';
    }

    return updatedUser;
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Sign in attempt with:', email);
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Sign in successful:', userCredential.user.uid);
      // No need to update state here, as the onAuthStateChanged listener will handle it
    } catch (error) {
      console.error('Sign in error:', error);
      setState((prev) => ({
        ...prev,
        isLoading: false, // Make sure to set loading to false on error
        error: error instanceof Error ? error.message : 'An error occurred',
      }));
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      console.log('Sign up attempt with:', email);
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Sign up successful:', userCredential.user.uid);
      // No need to update state here, as the onAuthStateChanged listener will handle it
    } catch (error) {
      console.error('Sign up error:', error);
      setState((prev) => ({
        ...prev,
        isLoading: false, // Make sure to set loading to false on error
        error: error instanceof Error ? error.message : 'An error occurred',
      }));
    }
  };

  const logout = async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      await signOut(auth);
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'An error occurred',
      }));
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const updateUserTokens = async (tokensUsed: number) => {
    if (!state.user) return;

    try {
      await updateDoc(doc(db, 'users', state.user.uid), {
        tokensUsed,
      });
      setState((prev) => ({
        ...prev,
        user: prev.user ? { ...prev.user, tokensUsed } : null,
      }));
    } catch (error) {
      console.error('Error updating tokens:', error);
    }
  };

  const updateUserProfile = async (profile: Partial<UserProfile>) => {
    if (!state.user) return;

    try {
      const updatedProfile = { ...state.user.profile, ...profile };
      await updateDoc(doc(db, 'users', state.user.uid), {
        profile: updatedProfile,
      });

      setState((prev) => ({
        ...prev,
        user: prev.user ? { ...prev.user, profile: updatedProfile } : null,
      }));
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  const updateUserRole = async (userId: string, role: UserRole) => {
    // Only admin users can update roles
    if (!state.user || state.user.role !== 'admin') {
      throw new Error('You do not have permission to update user roles');
    }

    try {
      // Get default permissions for the new role
      const permissions = DEFAULT_PERMISSIONS[role];

      await updateDoc(doc(db, 'users', userId), {
        role,
        permissions,
      });

      // Update local state if it's the current user
      if (state.user && state.user.uid === userId) {
        setState((prev) => ({
          ...prev,
          user: prev.user ? { ...prev.user, role, permissions } : null,
        }));
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  };

  const updateUserPermissions = async (userId: string, permissions: Partial<UserPermissions>) => {
    // Only admin users can update permissions
    if (!state.user || state.user.role !== 'admin') {
      throw new Error('You do not have permission to update user permissions');
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const userData = userDoc.data() as User;
      const updatedPermissions = { ...userData.permissions, ...permissions };

      await updateDoc(doc(db, 'users', userId), {
        permissions: updatedPermissions,
      });

      // Update local state if it's the current user
      if (state.user && state.user.uid === userId) {
        setState((prev) => ({
          ...prev,
          user: prev.user ? { ...prev.user, permissions: updatedPermissions } : null,
        }));
      }
    } catch (error) {
      console.error('Error updating user permissions:', error);
      throw error;
    }
  };

  const getUserList = async (): Promise<User[]> => {
    // Only admin or developer users can list all users
    if (!state.user || (state.user.role !== 'admin' && state.user.role !== 'developer')) {
      throw new Error('You do not have permission to view user list');
    }

    try {
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);

      return usersSnapshot.docs.map((doc) => doc.data() as User);
    } catch (error) {
      console.error('Error getting user list:', error);
      throw error;
    }
  };

  const suspendUser = async (userId: string, suspended: boolean) => {
    // Only admin users can suspend users
    if (!state.user || state.user.role !== 'admin') {
      throw new Error('You do not have permission to suspend users');
    }

    if (userId === state.user.uid) {
      throw new Error('You cannot suspend yourself');
    }

    try {
      await updateDoc(doc(db, 'users', userId), {
        suspended,
      });
    } catch (error) {
      console.error('Error suspending user:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signUp,
        logout,
        updateUserTokens,
        updateUserProfile,
        updateUserRole,
        updateUserPermissions,
        getUserList,
        suspendUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
