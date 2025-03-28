import { useState, useEffect } from 'react';
import { classNames } from '~/utils/classNames';
import { toast } from 'react-toastify';
import { useAuth } from '~/lib/context/AuthContext';
import { useRBAC } from '~/lib/hooks/useRBAC';
import type { User, UserRole, UserProfile, UserPermissions } from '~/lib/types/auth';
import { withRoleProtection } from '~/lib/hooks/useRBAC';
import { DEFAULT_PERMISSIONS } from '~/lib/types/auth';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '~/lib/firebase/config';
import { doc, setDoc } from 'firebase/firestore';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

// Create User Modal Component
function CreateUserModal({ isOpen, onClose, onSuccess }: CreateUserModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [displayName, setDisplayName] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate input
      if (!email || !password || password.length < 6) {
        throw new Error('Please provide a valid email and a password with at least 6 characters');
      }

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      // Get permissions for selected role
      const permissions = DEFAULT_PERMISSIONS[role];

      // Create user document in Firestore
      const newUser: User = {
        uid: userId,
        email: email,
        role: role,
        tokensUsed: 0,
        isSubscribed: isSubscribed,
        subscriptionTier: isSubscribed ? 'pro' : 'free',
        createdAt: new Date(),
        lastLoginAt: new Date(),
        profile: {
          displayName: displayName || email.split('@')[0],
          avatarUrl: undefined,
        },
        permissions: permissions,
        verified: true,
      };

      await setDoc(doc(db, 'users', userId), newUser);

      toast.success(`User ${email} created successfully`);
      onSuccess(newUser);
      onClose();
    } catch (error) {
      console.error('Error creating user:', error);
      setError(error instanceof Error ? error.message : 'Failed to create user');
      toast.error(error instanceof Error ? error.message : 'Failed to create user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <div className="i-ph:x-bold w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Create New User</h2>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 p-3 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={classNames(
                'w-full px-3 py-2 rounded-md border',
                'bg-white dark:bg-gray-800/80',
                'border-gray-300 dark:border-gray-700',
                'focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50',
              )}
              placeholder="user@example.com"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={classNames(
                'w-full px-3 py-2 rounded-md border',
                'bg-white dark:bg-gray-800/80',
                'border-gray-300 dark:border-gray-700',
                'focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50',
              )}
              placeholder="••••••••"
              minLength={6}
              required
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className={classNames(
                'w-full px-3 py-2 rounded-md border',
                'bg-white dark:bg-gray-800/80',
                'border-gray-300 dark:border-gray-700',
                'focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50',
              )}
              placeholder="User's display name (optional)"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className={classNames(
                'w-full px-3 py-2 rounded-md border',
                'bg-white dark:bg-gray-800/80',
                'border-gray-300 dark:border-gray-700',
                'focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50',
              )}
              disabled={isLoading}
            >
              <option value="user">User</option>
              <option value="developer">Developer</option>
              <option value="admin">Admin</option>
              <option value="guest">Guest</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isSubscribed"
              checked={isSubscribed}
              onChange={(e) => setIsSubscribed(e.target.checked)}
              className="h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
              disabled={isLoading}
            />
            <label htmlFor="isSubscribed" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Pro subscription
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={classNames(
                'px-4 py-2 rounded-md',
                'text-gray-700 dark:text-gray-300',
                'bg-gray-100 dark:bg-gray-800',
                'hover:bg-gray-200 dark:hover:bg-gray-700',
                'transition-colors duration-200',
              )}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={classNames(
                'px-4 py-2 rounded-md',
                'text-white font-medium',
                'bg-purple-600 hover:bg-purple-700',
                'transition-colors duration-200',
                isLoading ? 'opacity-70 cursor-not-allowed' : '',
              )}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <div className="i-ph:spinner-gap animate-spin mr-2 w-4 h-4" />
                  Creating...
                </span>
              ) : (
                'Create User'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdminDashboardContent() {
  const { getUserList, updateUserRole, suspendUser, user } = useAuth();
  const { canManageUsers, isAdmin } = useRBAC();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      let userList;

      try {
        // Try to get actual users from Firebase
        userList = await getUserList();
      } catch (error) {
        console.error('Firebase error:', error);
        // Fallback to mock data if Firebase access fails due to security rules
        const currentUser = user;
        userList = [
          {
            uid: currentUser?.uid || '9nlO0vQpJbhX41ysDclaZFmn2q62',
            email: currentUser?.email || 'admin@kofounda.com',
            role: 'admin',
            tokensUsed: 1250,
            isSubscribed: true,
            subscriptionTier: 'pro',
            createdAt: new Date(),
            lastLoginAt: new Date(),
            profile: {
              displayName: 'Admin User',
              bio: 'Administrator account',
              avatarUrl: undefined,
            },
            permissions: {
              canAccessAdmin: true,
              canManageUsers: true,
              canViewAnalytics: true,
              maxTokensPerMonth: 100000,
              maxProjectsAllowed: 100,
            },
            verified: true,
          },
          {
            uid: 'user1',
            email: 'user1@example.com',
            role: 'user',
            tokensUsed: 550,
            isSubscribed: false,
            subscriptionTier: 'free',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
            lastLoginAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            profile: {
              displayName: 'Regular User',
              bio: 'Just a regular user',
              avatarUrl: undefined,
            },
            permissions: {
              canAccessAdmin: false,
              canManageUsers: false,
              canViewAnalytics: false,
              maxTokensPerMonth: 10000,
              maxProjectsAllowed: 5,
            },
            verified: true,
          },
          {
            uid: 'user2',
            email: 'developer@example.com',
            role: 'developer',
            tokensUsed: 2500,
            isSubscribed: true,
            subscriptionTier: 'pro',
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
            lastLoginAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
            profile: {
              displayName: 'Developer User',
              bio: 'Developer with extended access',
              avatarUrl: undefined,
            },
            permissions: {
              canAccessAdmin: true,
              canManageUsers: false,
              canViewAnalytics: true,
              maxTokensPerMonth: 50000,
              maxProjectsAllowed: 20,
            },
            verified: true,
          },
          {
            uid: 'user3',
            email: 'suspended@example.com',
            role: 'user',
            tokensUsed: 9500,
            isSubscribed: false,
            subscriptionTier: 'free',
            createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
            lastLoginAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
            profile: {
              displayName: 'Suspended User',
              bio: 'This account has been suspended',
              avatarUrl: undefined,
            },
            permissions: {
              canAccessAdmin: false,
              canManageUsers: false,
              canViewAnalytics: false,
              maxTokensPerMonth: 10000,
              maxProjectsAllowed: 5,
            },
            suspended: true,
            verified: true,
          },
        ] as User[];

        toast.info('Using demo data while Firebase rules are being configured');
      }

      setUsers(userList);
    } catch (error) {
      toast.error('Failed to load users');
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserCreated = (newUser: User) => {
    setUsers([...users, newUser]);
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await updateUserRole(userId, newRole);
      setUsers(users.map((user) => (user.uid === userId ? { ...user, role: newRole } : user)));
      toast.success('User role updated successfully');
    } catch (error) {
      toast.error('Failed to update user role');
      console.error('Error updating user role:', error);
    }
  };

  const handleToggleSuspension = async (userId: string, currentStatus: boolean) => {
    try {
      await suspendUser(userId, !currentStatus);
      setUsers(users.map((user) => (user.uid === userId ? { ...user, suspended: !currentStatus } : user)));
      toast.success(`User ${!currentStatus ? 'suspended' : 'reactivated'} successfully`);
    } catch (error) {
      toast.error(`Failed to ${!currentStatus ? 'suspend' : 'reactivate'} user`);
      console.error('Error toggling user suspension:', error);
    }
  };

  // Filter users based on search query and role filter
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.profile?.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.uid.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage users and monitor system activity</p>
        </div>
        <div className="flex gap-2">
          {canManageUsers && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className={classNames(
                'px-4 py-2 rounded-lg',
                'bg-emerald-600 hover:bg-emerald-700',
                'text-white font-medium',
                'transition-colors duration-200',
                'inline-flex items-center',
              )}
            >
              <div className="i-ph:user-plus mr-2 w-4 h-4" />
              Create User
            </button>
          )}
          <button
            onClick={loadUsers}
            className={classNames(
              'px-4 py-2 rounded-lg',
              'bg-purple-600 hover:bg-purple-700',
              'text-white font-medium',
              'transition-colors duration-200',
              'inline-flex items-center',
              isLoading ? 'opacity-70 cursor-not-allowed' : '',
            )}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="i-ph:spinner-gap animate-spin mr-2 w-4 h-4" />
                Loading...
              </>
            ) : (
              <>
                <div className="i-ph:arrows-clockwise mr-2 w-4 h-4" />
                Refresh
              </>
            )}
          </button>
        </div>
      </div>

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleUserCreated}
      />

      {/* Search and Filter Controls */}
      <div className="bg-white dark:bg-gray-800/50 rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <div className="i-ph:magnifying-glass text-gray-400 w-5 h-5" />
              </div>
              <input
                type="search"
                placeholder="Search users by email, name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={classNames(
                  'w-full pl-10 pr-4 py-2 rounded-lg',
                  'border border-gray-200 dark:border-gray-700',
                  'bg-white dark:bg-gray-800',
                  'text-gray-900 dark:text-white',
                  'focus:outline-none focus:ring-2 focus:ring-purple-500/50',
                  'placeholder-gray-400',
                )}
              />
            </div>
          </div>
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
              className={classNames(
                'px-4 py-2 rounded-lg',
                'border border-gray-200 dark:border-gray-700',
                'bg-white dark:bg-gray-800',
                'text-gray-900 dark:text-white',
                'focus:outline-none focus:ring-2 focus:ring-purple-500/50',
              )}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="developer">Developer</option>
              <option value="user">User</option>
              <option value="guest">Guest</option>
            </select>
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white dark:bg-gray-800/50 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  User
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Role
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Token Usage
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Last Activity
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex items-center justify-center">
                      <div className="i-ph:spinner-gap animate-spin w-5 h-5 mr-2" />
                      Loading users...
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.uid}
                    className={classNames(
                      user.suspended ? 'bg-red-50 dark:bg-red-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/70',
                    )}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {user.profile?.avatarUrl ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={user.profile.avatarUrl}
                              alt={user.profile.displayName || 'User avatar'}
                            />
                          ) : (
                            <div
                              className={classNames(
                                'h-10 w-10 rounded-full flex items-center justify-center',
                                'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
                              )}
                            >
                              <div className="i-ph:user-circle-fill w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.profile?.displayName || 'Unnamed User'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                          <div className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                            {user.uid.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {canManageUsers ? (
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.uid, e.target.value as UserRole)}
                          className={classNames(
                            'px-2 py-1 rounded text-sm',
                            'border border-gray-200 dark:border-gray-700',
                            'bg-white dark:bg-gray-800',
                            'text-gray-900 dark:text-white',
                            'focus:outline-none focus:ring-1 focus:ring-purple-500/50',
                          )}
                          disabled={!isAdmin}
                        >
                          <option value="admin">Admin</option>
                          <option value="developer">Developer</option>
                          <option value="user">User</option>
                          <option value="guest">Guest</option>
                        </select>
                      ) : (
                        <span
                          className={classNames(
                            'px-2 py-1 text-xs rounded-full',
                            user.role === 'admin'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                              : user.role === 'developer'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                : user.role === 'user'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
                          )}
                        >
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={classNames(
                          'px-2 py-1 text-xs rounded-full flex items-center w-fit',
                          user.suspended
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
                        )}
                      >
                        <div
                          className={classNames(
                            'w-2 h-2 rounded-full mr-1.5',
                            user.suspended ? 'bg-red-500' : 'bg-green-500',
                          )}
                        />
                        {user.suspended ? 'Suspended' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {user.tokensUsed.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {canManageUsers && (
                          <button
                            onClick={() => handleToggleSuspension(user.uid, user.suspended || false)}
                            className={classNames(
                              'p-1.5 rounded-full',
                              user.suspended
                                ? 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30'
                                : 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30',
                              'transition-colors duration-200',
                            )}
                            title={user.suspended ? 'Reactivate user' : 'Suspend user'}
                          >
                            {user.suspended ? (
                              <div className="i-ph:check-circle w-4 h-4" />
                            ) : (
                              <div className="i-ph:prohibit w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800/50 rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{users.length}</p>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full p-3">
              <div className="i-ph:users-three-fill w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800/50 rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {users.filter((u) => !u.suspended).length}
              </p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-3">
              <div className="i-ph:check-circle-fill w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800/50 rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Suspended Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {users.filter((u) => u.suspended).length}
              </p>
            </div>
            <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-3">
              <div className="i-ph:prohibit-fill w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800/50 rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Tokens Used</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {users.reduce((acc, user) => acc + user.tokensUsed, 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-3">
              <div className="i-ph:chart-line-fill w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export with role protection HOC
export default withRoleProtection(AdminDashboardContent, ['admin', 'developer']);
