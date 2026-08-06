import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { FaYoutube } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!usernameOrEmail.trim() || !password) {
      toast.error('Please enter credentials');
      return;
    }

    setLoading(true);
    try {
      const isEmail = usernameOrEmail.includes('@');
      const payload = isEmail
        ? { email: usernameOrEmail, password }
        : { username: usernameOrEmail, password };

      await login(payload);
      toast.success('Successfully logged in!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-8 shadow-2xl flex flex-col gap-6">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="bg-red-600 text-white p-3 rounded-2xl shadow-lg shadow-red-600/30">
            <FaYoutube size={32} />
          </div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Welcome to VideoTube</h1>
          <p className="text-xs text-[var(--text-secondary)]">Sign in to your creator account</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-[var(--text-secondary)]">Username or Email</label>
            <input
              type="text"
              placeholder="e.g. arpitrajput or user@example.com"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              className="w-full h-11 mt-1 px-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-[var(--text-secondary)]">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 mt-1 px-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-purple-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 mt-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold text-sm shadow-lg shadow-purple-600/30 transition-all"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-[var(--text-secondary)]">
          Don't have an account?{' '}
          <Link to="/register" className="text-purple-500 font-semibold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
