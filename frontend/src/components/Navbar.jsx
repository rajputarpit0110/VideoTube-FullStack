import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import { 
  FiMenu, FiSearch, FiSun, FiMoon, FiVideo, FiUser, FiLogOut, FiLayout
} from 'react-icons/fi';
import { FaYoutube } from 'react-icons/fa';

export default function Navbar() {
  const { user, isAuthenticated, logout, toggleSidebar } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 h-16 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/90 backdrop-blur-md px-2.5 sm:px-4 flex items-center justify-between gap-1.5 sm:gap-4 w-full max-w-full">
      {/* Left section: Sidebar toggle & Logo */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        <button
          onClick={toggleSidebar}
          className="p-1.5 sm:p-2 rounded-full hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] transition-colors"
          title="Toggle Navigation"
        >
          <FiMenu size={20} />
        </button>
        <Link to="/" className="flex items-center gap-1.5 sm:gap-2 font-bold text-lg sm:text-xl tracking-tight text-[var(--text-primary)]">
          <div className="bg-red-600 text-white p-1.5 rounded-lg flex items-center justify-center shadow-lg shadow-red-600/30">
            <FaYoutube size={20} className="sm:text-[22px]" />
          </div>
          <span className="hidden sm:inline font-extrabold bg-gradient-to-r from-red-500 to-purple-600 bg-clip-text text-transparent">
            VideoTube
          </span>
        </Link>
      </div>

      {/* Middle section: Search Bar */}
      <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-1 sm:mx-2 min-w-0">
        <div className="relative flex items-center w-full">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 sm:h-10 pl-3 sm:pl-4 pr-9 sm:pr-12 rounded-full border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-purple-500 transition-all text-xs sm:text-sm"
          />
          <button
            type="submit"
            className="absolute right-1 h-7 w-7 sm:h-8 sm:w-10 flex items-center justify-center bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-full hover:bg-purple-600 hover:text-white transition-colors"
            title="Search"
          >
            <FiSearch size={14} className="sm:text-[16px]" />
          </button>
        </div>
      </form>

      {/* Right section: Theme, Upload, User profile */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        <button
          onClick={toggleTheme}
          className="p-1.5 sm:p-2.5 rounded-full hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] transition-colors"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? <FiSun size={18} className="text-amber-400 sm:text-[19px]" /> : <FiMoon size={18} className="text-slate-700 sm:text-[19px]" />}
        </button>

        {isAuthenticated ? (
          <>
            <Link
              to="/dashboard"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium text-xs shadow-md hover:opacity-90 transition-opacity"
            >
              <FiVideo size={14} />
              <span>Studio</span>
            </Link>

            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 p-0.5 sm:p-1 rounded-full border-2 border-purple-500 hover:scale-105 transition-transform"
              >
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                  alt={user?.fullName}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover"
                />
              </button>

              {showDropdown && (
                <div 
                  className="absolute right-0 mt-2 w-48 sm:w-56 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseLeave={() => setShowDropdown(false)}
                >
                  <div className="px-4 py-3 border-b border-[var(--border-color)]">
                    <p className="font-semibold text-sm text-[var(--text-primary)] truncate">{user?.fullName}</p>
                    <p className="text-xs text-[var(--text-secondary)] truncate">@{user?.username}</p>
                  </div>

                  <Link
                    to={`/c/${user?.username}`}
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                  >
                    <FiUser size={16} />
                    <span>Your Channel</span>
                  </Link>

                  <Link
                    to="/dashboard"
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                  >
                    <FiLayout size={16} />
                    <span>Creator Dashboard</span>
                  </Link>

                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <FiLogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-1.5 px-2.5 py-1 sm:px-4 sm:py-1.5 rounded-full border border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white font-medium text-xs sm:text-sm transition-all whitespace-nowrap"
          >
            <FiUser size={14} className="sm:text-[16px]" />
            <span>Sign In</span>
          </Link>
        )}
      </div>
    </header>
  );
}
