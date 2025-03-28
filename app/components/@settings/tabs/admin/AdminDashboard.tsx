import { useState, useEffect } from 'react';
import { classNames } from '~/utils/classNames';
import { toast } from 'react-toastify';
import { useAuth } from '~/lib/context/AuthContext';
import { useRBAC } from '~/lib/hooks/useRBAC';
import type { User, UserRole } from '~/lib/types/auth';
import { withRoleProtection } from '~/lib/hooks/useRBAC';

function AdminDashboardContent() {
  const { getUserList, updateUserRole, suspendUser, user } = useAuth();
  const { canManageUsers, isAdmin } = useRBAC();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');

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
              avatarUrl: null,
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
              avatarUrl: null,
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
              avatarUrl: null,
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
              avatarUrl: null,
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
        ];

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
