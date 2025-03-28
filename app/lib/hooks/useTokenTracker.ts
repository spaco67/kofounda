import { useCallback, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAuthModals } from './useAuthModals';

export const useTokenTracker = () => {
  const { user } = useAuth();
  const { handleTokenUsage } = useAuthModals();
  const [totalTokensUsed, setTotalTokensUsed] = useState(user?.tokensUsed || 0);

  const trackTokenUsage = useCallback(async (usage: { promptTokens: number; completionTokens: number; totalTokens: number }) => {
    if (!usage) return true;
    
    // Update local state for immediate feedback
    setTotalTokensUsed(prev => prev + usage.totalTokens);
    
    // Track in Firebase and check limits
    const canContinue = await handleTokenUsage(totalTokensUsed + usage.totalTokens);
    return canContinue;
  }, [handleTokenUsage, totalTokensUsed]);

  return {
    totalTokensUsed,
    trackTokenUsage
  };
}; 