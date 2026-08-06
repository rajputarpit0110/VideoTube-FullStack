import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { FaYoutube } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuthStore();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !username || !email || !password || !avatar) {
      toast.error('Please fill required fields and upload an avatar');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('username', username);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('avatar', avatar);
    if (coverImage) formData.append('coverImage', coverImage);

    try {
      await register(formData);
      toast.success('Registration successful! Please sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-3 sm:p-4 w-full min-w-0">
      <div className="w-full max-w-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl flex flex-col gap-4 sm:gap-6">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="bg-red-600 text-white p-2.5 sm:p-3 rounded-2xl shadow-lg shadow-red-600/30">
            <FaYoutube size={28} className="sm:text-[32px]" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)]">Create Your Account</h1>
          <p className="text-xs text-[var(--text-secondary)]">Join the VideoTube creator network</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="text-xs font-semibold text-[var(--text-secondary)]">Full Name *</label>
              <input
                type="text"
                placeholder="Arpit Rajput"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full h-9 sm:h-10 mt-1 px-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] text-xs sm:text-sm focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text-secondary)]">Username *</label>
              <input
                type="text"
                placeholder="arpitrajput"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-9 sm:h-10 mt-1 px-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] text-xs sm:text-sm focus:outline-none focus:border-purple-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--text-secondary)]">Email *</label>
            <input
              type="email"
              placeholder="user@videotube.dev"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-9 sm:h-10 mt-1 px-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] text-xs sm:text-sm focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--text-secondary)]">Password *</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-9 sm:h-10 mt-1 px-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] text-xs sm:text-sm focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="text-xs font-semibold text-[var(--text-secondary)]">Avatar Image *</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setAvatar(e.target.files[0])}
                className="w-full text-xs text-[var(--text-secondary)] mt-1 file:mr-2 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-[11px] sm:file:text-xs file:font-semibold file:bg-purple-600 file:text-white"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text-secondary)]">Cover Image (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCoverImage(e.target.files[0])}
                className="w-full text-xs text-[var(--text-secondary)] mt-1 file:mr-2 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-[11px] sm:file:text-xs file:font-semibold file:bg-purple-600 file:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 sm:h-11 mt-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-purple-600/30 transition-all"
          >
            {loading ? 'Registering...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-xs text-[var(--text-secondary)]">
          Already have an account?{' '}
          <Link to="/login" className="text-purple-500 font-semibold hover:underline">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
}
