import { createContext, useContext, useEffect, useState } from 'react';
import {
  type User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import type { User, AuthState } from '../types/auth';

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserTokens: (tokensUsed: number) => Promise<void>;
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

            // Update last login time
            await updateDoc(doc(db, 'users', firebaseUser.uid), {
              lastLoginAt: new Date(),
            });

            setState({
              user: userData,
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
              createdAt: new Date(),
              lastLoginAt: new Date(),
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

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signUp,
        logout,
        updateUserTokens,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
