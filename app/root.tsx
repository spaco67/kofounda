import { useStore } from '@nanostores/react';
import type { LinksFunction } from '@remix-run/cloudflare';
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react';
import tailwindReset from '@unocss/reset/tailwind-compat.css?url';
import { themeStore } from './lib/stores/theme';
import { stripIndents } from './utils/stripIndent';
import { createHead } from 'remix-island';
import { useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ClientOnly } from 'remix-utils/client-only';

import reactToastifyStyles from 'react-toastify/dist/ReactToastify.css?url';
import globalStyles from './styles/index.scss?url';
import xtermStyles from '@xterm/xterm/css/xterm.css?url';

import 'virtual:uno.css';
import { AuthProvider } from '~/lib/context/AuthContext';
import { AuthModal } from '~/components/auth/AuthModal';
import { TokenLimitModal } from '~/components/auth/TokenLimitModal';
import { useAuthModals } from '~/lib/hooks/useAuthModals';

export const links: LinksFunction = () => [
  {
    rel: 'icon',
    href: '/favicon.svg',
    type: 'image/svg+xml',
  },
  {
    rel: 'apple-touch-icon',
    href: '/apple-touch-icon.svg',
  },
  {
    rel: 'apple-touch-icon-precomposed',
    href: '/apple-touch-icon-precomposed.svg',
  },
  { rel: 'stylesheet', href: reactToastifyStyles },
  { rel: 'stylesheet', href: tailwindReset },
  { rel: 'stylesheet', href: globalStyles },
  { rel: 'stylesheet', href: xtermStyles },
  {
    rel: 'preconnect',
    href: 'https://fonts.googleapis.com',
  },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  },
];

const inlineThemeCode = stripIndents`
  setTutorialKitTheme();

  function setTutorialKitTheme() {
    let theme = localStorage.getItem('kofounda_theme');

    if (!theme) {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    document.querySelector('html')?.setAttribute('data-theme', theme);
  }
`;

export const Head = createHead(() => (
  <>
    <meta charSet="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <Meta />
    <Links />
    <script dangerouslySetInnerHTML={{ __html: inlineThemeCode }} />
  </>
));

export function Layout({ children }: { children: React.ReactNode }) {
  const theme = useStore(themeStore);

  useEffect(() => {
    document.querySelector('html')?.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <>
      <ClientOnly>{() => <DndProvider backend={HTML5Backend}>{children}</DndProvider>}</ClientOnly>
      <ScrollRestoration />
      <Scripts />
    </>
  );
}

import { logStore } from './lib/stores/logs';

export default function App() {
  const theme = useStore(themeStore);

  useEffect(() => {
    logStore.logSystem('Application initialized', {
      theme,
      platform: navigator.platform,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    });
  }, []);

  return (
    <html lang="en" data-theme={theme}>
      <Head />
      <body>
        <AuthProvider>
          <AppContent theme={theme} />
        </AuthProvider>
      </body>
    </html>
  );
}

function AppContent({ theme }: { theme: string }) {
  const {
    showAuthModal,
    setShowAuthModal,
    showTokenLimitModal,
    setShowTokenLimitModal,
    authMode,
    setAuthMode,
    handleSignUp,
  } = useAuthModals();

  useEffect(() => {
    console.log('Root: Auth modal state:', { showAuthModal, authMode });

    // Initialize event listener to handle modal triggers via custom events
    const handleModalTrigger = (e: CustomEvent) => {
      const { modalType, modalMode } = e.detail;
      console.log('Custom event received:', e.detail);

      if (modalType === 'auth') {
        if (modalMode) {
          setAuthMode(modalMode);
        }
        setShowAuthModal(true);
      } else if (modalType === 'tokenLimit') {
        setShowTokenLimitModal(true);
      }
    };

    window.addEventListener('triggerModal' as any, handleModalTrigger as any);

    return () => {
      window.removeEventListener('triggerModal' as any, handleModalTrigger as any);
    };
  }, [showAuthModal, authMode, setShowAuthModal, setAuthMode, setShowTokenLimitModal]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Outlet />
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          mode={authMode}
          onClose={() => setShowAuthModal(false)}
          onModeChange={setAuthMode}
        />
      )}
      {showTokenLimitModal && (
        <TokenLimitModal
          isOpen={showTokenLimitModal}
          onClose={() => setShowTokenLimitModal(false)}
          onSignUp={handleSignUp}
          tokensUsed={0}
        />
      )}
    </div>
  );
}
