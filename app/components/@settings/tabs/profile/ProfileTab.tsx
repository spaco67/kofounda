import { useState, useCallback, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { classNames } from '~/utils/classNames';
import { profileStore, updateProfile } from '~/lib/stores/profile';
import { toast } from 'react-toastify';
import { debounce } from '~/utils/debounce';
import { useAuth } from '~/lib/context/AuthContext';
import { useRBAC } from '~/lib/hooks/useRBAC';

export default function ProfileTab() {
  const { user, updateUserProfile } = useAuth();
  const { isAdmin, isDeveloper } = useRBAC();
  const [isUploading, setIsUploading] = useState(false);
  const [localProfile, setLocalProfile] = useState({
    displayName: user?.profile?.displayName || '',
    bio: user?.profile?.bio || '',
    avatarUrl: user?.profile?.avatarUrl || '',
    website: user?.profile?.website || '',
    location: user?.profile?.location || '',
    company: user?.profile?.company || '',
    twitterHandle: user?.profile?.twitterHandle || '',
    githubHandle: user?.profile?.githubHandle || '',
  });

  // Update local state when user changes
  useEffect(() => {
    if (user?.profile) {
      setLocalProfile({
        displayName: user.profile.displayName || '',
        bio: user.profile.bio || '',
        avatarUrl: user.profile.avatarUrl || '',
        website: user.profile.website || '',
        location: user.profile.location || '',
        company: user.profile.company || '',
        twitterHandle: user.profile.twitterHandle || '',
        githubHandle: user.profile.githubHandle || '',
      });
    }
  }, [user]);

  // Create debounced update functions
  const debouncedUpdate = useCallback(
    debounce(async (field: string, value: string) => {
      try {
        await updateUserProfile({ [field]: value });
        toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} updated`);
      } catch (error) {
        toast.error('Failed to update profile');
      }
    }, 1000),
    [updateUserProfile],
  );

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setIsUploading(true);

      // Convert the file to base64
      const reader = new FileReader();

      reader.onloadend = async () => {
        const base64String = reader.result as string;
        try {
          await updateUserProfile({ avatarUrl: base64String });
          setLocalProfile((prev) => ({ ...prev, avatarUrl: base64String }));
          toast.success('Profile picture updated');
        } catch (error) {
          toast.error('Failed to update profile picture');
        } finally {
          setIsUploading(false);
        }
      };

      reader.onerror = () => {
        console.error('Error reading file:', reader.error);
        setIsUploading(false);
        toast.error('Failed to update profile picture');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setIsUploading(false);
      toast.error('Failed to update profile picture');
    }
  };

  const handleProfileUpdate = (field: string, value: string) => {
    // Update the local state immediately for UI responsiveness
    setLocalProfile((prev) => ({ ...prev, [field]: value }));

    // Debounce the actual update to Firebase
    debouncedUpdate(field, value);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="space-y-6">
        {/* Personal Information Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h2>
            <div className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-medium inline-flex items-center">
              {isDeveloper ? (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center">
                  <div className="i-ph:code mr-1.5 w-3.5 h-3.5" />
                  Developer
                </span>
              ) : isAdmin ? (
                <span className="text-purple-600 dark:text-purple-400 flex items-center">
                  <div className="i-ph:crown mr-1.5 w-3.5 h-3.5" />
                  Admin
                </span>
              ) : (
                <span className="text-blue-600 dark:text-blue-400 flex items-center">
                  <div className="i-ph:user mr-1.5 w-3.5 h-3.5" />
                  User
                </span>
              )}
            </div>
          </div>

          {/* Avatar Upload */}
          <div className="flex items-start gap-6 mb-8">
            <div
              className={classNames(
                'w-24 h-24 rounded-full overflow-hidden',
                'bg-gray-100 dark:bg-gray-800/50',
                'flex items-center justify-center',
                'ring-1 ring-gray-200 dark:ring-gray-700',
                'relative group',
                'transition-all duration-300 ease-out',
                'hover:ring-purple-500/30 dark:hover:ring-purple-500/30',
                'hover:shadow-lg hover:shadow-purple-500/10',
              )}
            >
              {localProfile.avatarUrl ? (
                <img
                  src={localProfile.avatarUrl}
                  alt="Profile"
                  className={classNames(
                    'w-full h-full object-cover',
                    'transition-all duration-300 ease-out',
                    'group-hover:scale-105 group-hover:brightness-90',
                  )}
                />
              ) : (
                <div className="i-ph:user-circle-fill w-16 h-16 text-gray-400 dark:text-gray-500 transition-colors group-hover:text-purple-500/70 transform -translate-y-1" />
              )}

              <label
                className={classNames(
                  'absolute inset-0',
                  'flex items-center justify-center',
                  'bg-black/0 group-hover:bg-black/40',
                  'cursor-pointer transition-all duration-300 ease-out',
                  isUploading ? 'cursor-wait' : '',
                )}
              >
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                  disabled={isUploading}
                />
                {isUploading ? (
                  <div className="i-ph:spinner-gap w-6 h-6 text-white animate-spin" />
                ) : (
                  <div className="i-ph:camera-plus w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out transform group-hover:scale-110" />
                )}
              </label>
            </div>

            <div className="flex-1 pt-1">
              <label className="block text-base font-medium text-gray-900 dark:text-gray-100 mb-1">
                Profile Picture
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400">Upload a profile picture or avatar</p>

              <div className="mt-3 flex items-center">
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                  <div className="i-ph:envelope-simple mr-1" />
                  {user?.email}
                </div>
                {user?.verified ? (
                  <div className="ml-2 px-1.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs flex items-center">
                    <div className="i-ph:check-circle mr-0.5 w-3 h-3" />
                    Verified
                  </div>
                ) : (
                  <div className="ml-2 px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs flex items-center">
                    <div className="i-ph:warning-circle mr-0.5 w-3 h-3" />
                    Unverified
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Display Name Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Display Name</label>
            <div className="relative group">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                <div className="i-ph:user-circle-fill w-5 h-5 text-gray-400 dark:text-gray-500 transition-colors group-focus-within:text-purple-500" />
              </div>
              <input
                type="text"
                value={localProfile.displayName}
                onChange={(e) => handleProfileUpdate('displayName', e.target.value)}
                className={classNames(
                  'w-full pl-11 pr-4 py-2.5 rounded-xl',
                  'bg-white dark:bg-gray-800/50',
                  'border border-gray-200 dark:border-gray-700/50',
                  'text-gray-900 dark:text-white',
                  'placeholder-gray-400 dark:placeholder-gray-500',
                  'focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50',
                  'transition-all duration-300 ease-out',
                )}
                placeholder="Enter your display name"
              />
            </div>
          </div>

          {/* Bio Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Bio</label>
            <div className="relative group">
              <div className="absolute left-3.5 top-3">
                <div className="i-ph:text-aa w-5 h-5 text-gray-400 dark:text-gray-500 transition-colors group-focus-within:text-purple-500" />
              </div>
              <textarea
                value={localProfile.bio}
                onChange={(e) => handleProfileUpdate('bio', e.target.value)}
                className={classNames(
                  'w-full pl-11 pr-4 py-2.5 rounded-xl',
                  'bg-white dark:bg-gray-800/50',
                  'border border-gray-200 dark:border-gray-700/50',
                  'text-gray-900 dark:text-white',
                  'placeholder-gray-400 dark:placeholder-gray-500',
                  'focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50',
                  'transition-all duration-300 ease-out',
                  'resize-none',
                  'h-32',
                )}
                placeholder="Tell us about yourself"
              />
            </div>
          </div>

          {/* Extra Profile Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Website Input */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Website</label>
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                  <div className="i-ph:globe w-5 h-5 text-gray-400 dark:text-gray-500 transition-colors group-focus-within:text-purple-500" />
                </div>
                <input
                  type="url"
                  value={localProfile.website}
                  onChange={(e) => handleProfileUpdate('website', e.target.value)}
                  className={classNames(
                    'w-full pl-11 pr-4 py-2.5 rounded-xl',
                    'bg-white dark:bg-gray-800/50',
                    'border border-gray-200 dark:border-gray-700/50',
                    'text-gray-900 dark:text-white',
                    'placeholder-gray-400 dark:placeholder-gray-500',
                    'focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50',
                    'transition-all duration-300 ease-out',
                  )}
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>

            {/* Location Input */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Location</label>
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                  <div className="i-ph:map-pin w-5 h-5 text-gray-400 dark:text-gray-500 transition-colors group-focus-within:text-purple-500" />
                </div>
                <input
                  type="text"
                  value={localProfile.location}
                  onChange={(e) => handleProfileUpdate('location', e.target.value)}
                  className={classNames(
                    'w-full pl-11 pr-4 py-2.5 rounded-xl',
                    'bg-white dark:bg-gray-800/50',
                    'border border-gray-200 dark:border-gray-700/50',
                    'text-gray-900 dark:text-white',
                    'placeholder-gray-400 dark:placeholder-gray-500',
                    'focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50',
                    'transition-all duration-300 ease-out',
                  )}
                  placeholder="City, Country"
                />
              </div>
            </div>

            {/* Company Input */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Company</label>
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                  <div className="i-ph:buildings w-5 h-5 text-gray-400 dark:text-gray-500 transition-colors group-focus-within:text-purple-500" />
                </div>
                <input
                  type="text"
                  value={localProfile.company}
                  onChange={(e) => handleProfileUpdate('company', e.target.value)}
                  className={classNames(
                    'w-full pl-11 pr-4 py-2.5 rounded-xl',
                    'bg-white dark:bg-gray-800/50',
                    'border border-gray-200 dark:border-gray-700/50',
                    'text-gray-900 dark:text-white',
                    'placeholder-gray-400 dark:placeholder-gray-500',
                    'focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50',
                    'transition-all duration-300 ease-out',
                  )}
                  placeholder="Company name"
                />
              </div>
            </div>

            {/* Social Media Section */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">GitHub</label>
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                  <div className="i-ph:github-logo w-5 h-5 text-gray-400 dark:text-gray-500 transition-colors group-focus-within:text-purple-500" />
                </div>
                <input
                  type="text"
                  value={localProfile.githubHandle}
                  onChange={(e) => handleProfileUpdate('githubHandle', e.target.value)}
                  className={classNames(
                    'w-full pl-11 pr-4 py-2.5 rounded-xl',
                    'bg-white dark:bg-gray-800/50',
                    'border border-gray-200 dark:border-gray-700/50',
                    'text-gray-900 dark:text-white',
                    'placeholder-gray-400 dark:placeholder-gray-500',
                    'focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50',
                    'transition-all duration-300 ease-out',
                  )}
                  placeholder="GitHub username"
                />
              </div>
            </div>

            {/* Twitter Input */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Twitter</label>
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
                  <div className="i-ph:twitter-logo w-5 h-5 text-gray-400 dark:text-gray-500 transition-colors group-focus-within:text-purple-500" />
                </div>
                <input
                  type="text"
                  value={localProfile.twitterHandle}
                  onChange={(e) => handleProfileUpdate('twitterHandle', e.target.value)}
                  className={classNames(
                    'w-full pl-11 pr-4 py-2.5 rounded-xl',
                    'bg-white dark:bg-gray-800/50',
                    'border border-gray-200 dark:border-gray-700/50',
                    'text-gray-900 dark:text-white',
                    'placeholder-gray-400 dark:placeholder-gray-500',
                    'focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50',
                    'transition-all duration-300 ease-out',
                  )}
                  placeholder="Twitter handle"
                />
              </div>
            </div>
          </div>

          {/* Account Information Section */}
          <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700/50">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Information</h2>

            <div className="bg-gray-50 dark:bg-gray-800/30 rounded-xl p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Membership Status</p>
                  <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {user?.isSubscribed ? (
                      <span className="text-emerald-600 dark:text-emerald-500 flex items-center">
                        <div className="i-ph:check-circle-fill mr-1 w-4 h-4" />
                        {user?.subscriptionTier?.charAt(0).toUpperCase() + user?.subscriptionTier?.slice(1)}
                      </span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-500 flex items-center">
                        <div className="i-ph:star mr-1 w-4 h-4" />
                        Free Plan
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Token Usage</p>
                  <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                    <span className="flex items-center">
                      <div className="i-ph:chart-bar mr-1 w-4 h-4 text-purple-500" />
                      {user?.tokensUsed.toLocaleString()} used
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Account Created</p>
                  <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Last Login</p>
                  <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
