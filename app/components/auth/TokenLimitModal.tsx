import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '~/lib/context/AuthContext';

interface TokenLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignUp: () => void;
  tokensUsed: number;
}

const GUEST_TOKEN_LIMIT = 150000;

export const TokenLimitModal = ({ isOpen, onClose, onSignUp, tokensUsed }: TokenLimitModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-[#0A0A0A]"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Token Limit Reached</h2>
              <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                <div className="i-ph:x w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                You've used {tokensUsed.toLocaleString()} out of {GUEST_TOKEN_LIMIT.toLocaleString()} tokens in guest
                mode.
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                Create an account to continue generating content and unlock additional features:
              </p>
              <ul className="list-inside list-disc space-y-2 text-gray-600 dark:text-gray-300">
                <li>Unlimited token generation</li>
                <li>Access to premium features</li>
                <li>Save your generation history</li>
                <li>Priority support</li>
              </ul>
            </div>

            <div className="mt-6 flex gap-4">
              <button
                onClick={onClose}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Continue as Guest
              </button>
              <button
                onClick={onSignUp}
                className="flex-1 rounded-lg bg-purple-500 px-4 py-2 text-white shadow-sm hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                Create Account
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
