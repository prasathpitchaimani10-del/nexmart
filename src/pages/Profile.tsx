import React, { useState } from 'react';
import { User, Lock, Phone, Mail, ShieldCheck, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export const Profile: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const { success, error: toastError } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      await api.updateProfile({ name, phone, profileImage });
      await refreshProfile();
      success('Profile updated successfully.');
    } catch (err: any) {
      toastError(err.message || 'Profile update failed.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toastError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toastError('New password and confirmation do not match.');
      return;
    }
    setIsChangingPassword(true);
    try {
      await api.changePassword({ currentPassword, newPassword });
      success('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      toastError(err.message || 'Failed to change password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-zinc-950 tracking-tight">Account & Security</h1>
        <p className="text-xs text-zinc-500 mt-0.5">Manage your personal identification, phone contacts, and security credentials.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Details Form */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-4 pb-4 border-b border-zinc-100">
            <div className="relative">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={user?.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-zinc-200"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-zinc-100 text-zinc-700 font-bold text-xl flex items-center justify-center border-2 border-zinc-200">
                  {user?.name.charAt(0)}
                </div>
              )}
            </div>
            <div>
              <div className="font-bold text-sm text-zinc-900">{user?.name}</div>
              <div className="text-xs text-zinc-500">{user?.email}</div>
              <span className="inline-block mt-1 text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {user?.role} Account
              </span>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-950"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Primary Email (Verified)</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full p-2.5 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-950"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Profile Photo URL</label>
              <input
                type="url"
                value={profileImage}
                onChange={(e) => setProfileImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full p-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-950"
              />
            </div>

            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="w-full py-2.5 rounded-xl bg-zinc-950 text-white font-semibold hover:bg-zinc-800 disabled:opacity-50 transition-colors shadow-sm"
            >
              {isUpdatingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-zinc-100 font-bold text-sm text-zinc-900">
            <Lock className="w-4 h-4 text-emerald-600" />
            <span>Update Password</span>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Current Password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-950"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1">New Password (min 6 characters)</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-950"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-zinc-200 focus:outline-none focus:border-zinc-950"
              />
            </div>

            <button
              type="submit"
              disabled={isChangingPassword}
              className="w-full py-2.5 rounded-xl bg-zinc-950 text-white font-semibold hover:bg-zinc-800 disabled:opacity-50 transition-colors shadow-sm"
            >
              {isChangingPassword ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
