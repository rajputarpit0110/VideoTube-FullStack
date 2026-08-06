import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import axiosInstance from '../utils/axios';
import { FiUser, FiLock, FiImage, FiSettings } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user, updateUser } = useAuthStore();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [updatingAccount, setUpdatingAccount] = useState(false);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const [avatar, setAvatar] = useState(null);
  const [updatingAvatar, setUpdatingAvatar] = useState(false);

  const [coverImage, setCoverImage] = useState(null);
  const [updatingCover, setUpdatingCover] = useState(false);

  if (!user) {
    return (
      <div className="py-20 text-center text-lg text-[var(--text-secondary)]">
        Please sign in to access account settings.
      </div>
    );
  }

  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    setUpdatingAccount(true);
    try {
      const res = await axiosInstance.patch('/users/update-account', { fullName, email });
      updateUser(res.data.data);
      toast.success('Account details updated!');
    } catch (err) {
      toast.error('Failed to update details');
    } finally {
      setUpdatingAccount(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) return;

    setUpdatingPassword(true);
    try {
      await axiosInstance.post('/users/change-password', { oldPassword, newPassword });
      toast.success('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleUpdateAvatar = async (e) => {
    e.preventDefault();
    if (!avatar) return;

    setUpdatingAvatar(true);
    const formData = new FormData();
    formData.append('avatar', avatar);

    try {
      const res = await axiosInstance.patch('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      updateUser({ avatar: res.data.data.avatar });
      toast.success('Avatar updated!');
      setAvatar(null);
    } catch (err) {
      toast.error('Failed to update avatar');
    } finally {
      setUpdatingAvatar(false);
    }
  };

  const handleUpdateCover = async (e) => {
    e.preventDefault();
    if (!coverImage) return;

    setUpdatingCover(true);
    const formData = new FormData();
    formData.append('coverImage', coverImage);

    try {
      const res = await axiosInstance.patch('/users/cover-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      updateUser({ coverImage: res.data.data.coverImage });
      toast.success('Cover image updated!');
      setCoverImage(null);
    } catch (err) {
      toast.error('Failed to update cover image');
    } finally {
      setUpdatingCover(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 py-2">
      <div className="flex items-center gap-3 border-b border-[var(--border-color)] pb-4">
        <div className="p-2.5 rounded-xl bg-purple-600/15 text-purple-500">
          <FiSettings size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Account Settings</h1>
          <p className="text-xs text-[var(--text-secondary)]">Manage profile information, images, and security</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Personal Details */}
        <form onSubmit={handleUpdateDetails} className="p-6 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex flex-col gap-4">
          <div className="flex items-center gap-2 font-bold text-sm text-[var(--text-primary)] border-b border-[var(--border-color)] pb-3">
            <FiUser size={16} className="text-purple-500" />
            <span>Profile Information</span>
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--text-secondary)]">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full h-10 mt-1 px-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--text-secondary)]">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-10 mt-1 px-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={updatingAccount}
            className="mt-2 w-full py-2 rounded-full text-xs font-semibold bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white transition-colors"
          >
            {updatingAccount ? 'Saving...' : 'Save Profile Details'}
          </button>
        </form>

        {/* Change Password */}
        <form onSubmit={handleChangePassword} className="p-6 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex flex-col gap-4">
          <div className="flex items-center gap-2 font-bold text-sm text-[var(--text-primary)] border-b border-[var(--border-color)] pb-3">
            <FiLock size={16} className="text-purple-500" />
            <span>Change Password</span>
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--text-secondary)]">Current Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full h-10 mt-1 px-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--text-secondary)]">New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full h-10 mt-1 px-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={updatingPassword}
            className="mt-2 w-full py-2 rounded-full text-xs font-semibold bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white transition-colors"
          >
            {updatingPassword ? 'Updating...' : 'Update Password'}
          </button>
        </form>

        {/* Avatar Image Update */}
        <form onSubmit={handleUpdateAvatar} className="p-6 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex flex-col gap-4">
          <div className="flex items-center gap-2 font-bold text-sm text-[var(--text-primary)] border-b border-[var(--border-color)] pb-3">
            <FiImage size={16} className="text-purple-500" />
            <span>Update Avatar</span>
          </div>

          <div className="flex items-center gap-4">
            <img src={user.avatar} alt="Avatar" className="w-14 h-14 rounded-full object-cover border border-[var(--border-color)] shrink-0" />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAvatar(e.target.files[0])}
              className="w-full text-xs text-[var(--text-secondary)] file:mr-2 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white"
              required
            />
          </div>

          <button
            type="submit"
            disabled={updatingAvatar || !avatar}
            className="w-full py-2 rounded-full text-xs font-semibold bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white transition-colors"
          >
            {updatingAvatar ? 'Uploading...' : 'Upload Avatar'}
          </button>
        </form>

        {/* Cover Image Update */}
        <form onSubmit={handleUpdateCover} className="p-6 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex flex-col gap-4">
          <div className="flex items-center gap-2 font-bold text-sm text-[var(--text-primary)] border-b border-[var(--border-color)] pb-3">
            <FiImage size={16} className="text-purple-500" />
            <span>Update Cover Image</span>
          </div>

          <div className="flex flex-col gap-3">
            {user.coverImage && (
              <img src={user.coverImage} alt="Cover" className="w-full h-16 rounded-xl object-cover border border-[var(--border-color)]" />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCoverImage(e.target.files[0])}
              className="w-full text-xs text-[var(--text-secondary)] file:mr-2 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-purple-600 file:text-white"
              required
            />
          </div>

          <button
            type="submit"
            disabled={updatingCover || !coverImage}
            className="w-full py-2 rounded-full text-xs font-semibold bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white transition-colors"
          >
            {updatingCover ? 'Uploading...' : 'Upload Cover Image'}
          </button>
        </form>
      </div>
    </div>
  );
}
