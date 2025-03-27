import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

export const useAuthModals = () => {
  const { user, updateUserTokens } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showTokenLimitModal, setShowTokenLimitModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  const GUEST_TOKEN_LIMIT = 150000;

  const handleTokenUsage = useCallback(async (tokensUsed: number) => {
    if (!user) {
      // For guest users, check if they've reached the limit
      if (tokensUsed >= GUEST_TOKEN_LIMIT) {
        setShowTokenLimitModal(true);
        return false;
      }
      return true;
    }
    // For registered users, update their token usage
    await updateUserTokens(tokensUsed);
    return true;
  }, [user, updateUserTokens]);

  const handleSignUp = useCallback(() => {
    setShowTokenLimitModal(false);
    setAuthMode('signup');
    setShowAuthModal(true);
  }, [setShowTokenLimitModal, setAuthMode, setShowAuthModal]);

  const handleSignIn = useCallback(() => {
    setShowTokenLimitModal(false);
    setAuthMode('signin');
    setShowAuthModal(true);
  }, [setShowTokenLimitModal, setAuthMode, setShowAuthModal]);

  return {
    showAuthModal,
    setShowAuthModal,
    showTokenLimitModal,
    setShowTokenLimitModal,
    authMode,
    setAuthMode,
    handleTokenUsage,
    handleSignUp,
    handleSignIn,
  };
}; 