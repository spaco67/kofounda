import { useStore } from '@nanostores/react';
import { ClientOnly } from 'remix-utils/client-only';
import { chatStore } from '~/lib/stores/chat';
import { classNames } from '~/utils/classNames';
import { HeaderActionButtons } from './HeaderActionButtons.client';
import { ChatDescription } from '~/lib/persistence/ChatDescription.client';
import { useAuth } from '~/lib/context/AuthContext';
import { useAuthModals } from '~/lib/hooks/useAuthModals';
import { Link } from '@remix-run/react';

export const Header = () => {
  const chat = useStore(chatStore);
  const { user, logout } = useAuth();
  const { setShowAuthModal, setAuthMode } = useAuthModals();

  const handleSignIn = () => {
    console.log('Sign In clicked');
    setAuthMode('signin');
    setShowAuthModal(true);
  };

  const handleSignUp = () => {
    console.log('Sign Up clicked');
    setAuthMode('signup');
    setShowAuthModal(true);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-800 dark:bg-[#0A0A0A]/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo-light-styled.svg" alt="Kofounda" className="h-8 w-8" />
            <span className="text-xl font-semibold text-gray-900 dark:text-white">Kofounda</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">{user.email}</span>
              <button
                onClick={logout}
                className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSignIn}
                className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Sign In
              </button>
              <button
                onClick={handleSignUp}
                className="rounded-lg bg-purple-500 px-3 py-1.5 text-sm text-white hover:bg-purple-600"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
