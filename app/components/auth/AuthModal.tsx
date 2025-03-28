import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '~/lib/context/AuthContext';
import { classNames } from '~/utils/classNames';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'signin' | 'signup';
  onModeChange: (mode: 'signin' | 'signup') => void;
}

export const AuthModal = ({ isOpen, onClose, mode, onModeChange }: AuthModalProps) => {
  const { signIn, signUp, error, isLoading, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  // Auto-close the modal when authentication is successful
  useEffect(() => {
    if (user && isOpen) {
      console.log('User logged in, closing modal:', user);
      onClose();
    }
  }, [user, isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      console.log('Auth modal opened in mode:', mode, 'Loading:', isLoading, 'User:', user);
      document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open

      // Focus the modal when it opens
      if (modalRef.current) {
        modalRef.current.focus();
      }
    } else {
      document.body.style.overflow = ''; // Re-enable scrolling when modal is closed
    }
    return () => {
      document.body.style.overflow = ''; // Cleanup
    };
  }, [isOpen, mode, isLoading, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`Submitting ${mode} form with email:`, email);
    if (mode === 'signin') {
      await signIn(email, password);
    } else {
      await signUp(email, password);
    }
  };

  // Use the Portal to ensure the modal is rendered at the root level
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
          style={{ backdropFilter: 'blur(8px)' }}
          onClick={() => onClose()}
        >
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-md rounded-2xl border-4 border-purple-500 bg-white p-6 shadow-2xl dark:bg-[#0A0A0A]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {mode === 'signin' ? 'Sign In' : 'Create Account'}
              </h2>
              <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                <div className="i-ph:x w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={classNames(
                    'w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                    { 'cursor-not-allowed': isLoading },
                  )}
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={classNames(
                    'w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                    { 'cursor-not-allowed': isLoading },
                  )}
                  required
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={classNames(
                  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                  { 'cursor-not-allowed': isLoading },
                )}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="i-svg-spinners:90-ring-with-bg w-5 h-5 mr-2"></div>
                    Loading...
                  </div>
                ) : mode === 'signin' ? (
                  'Sign In'
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                onClick={() => onModeChange(mode === 'signin' ? 'signup' : 'signin')}
                className="text-sm text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300"
                disabled={isLoading}
              >
                {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
