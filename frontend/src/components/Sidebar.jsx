import React, { useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { 
  FiHome, FiMessageSquare, FiTv, FiClock, FiThumbsUp, FiFolder, FiLayout, FiSettings, FiMenu 
} from 'react-icons/fi';
import { FaYoutube } from 'react-icons/fa';

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useAuthStore();

  // Close sidebar on initial mount if on mobile device (< 768px)
  useEffect(() => {
    if (window.innerWidth < 768 && sidebarOpen) {
      toggleSidebar();
    }
  }, []);

  // Control body scroll lock when mobile drawer is open
  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  const navItems = [
    { label: 'Home', path: '/', icon: FiHome },
    { label: 'Tweets (X)', path: '/tweets', icon: FiMessageSquare },
    { label: 'Subscriptions', path: '/subscriptions', icon: FiTv },
    { label: 'History', path: '/history', icon: FiClock },
    { label: 'Liked Videos', path: '/liked-videos', icon: FiThumbsUp },
    { label: 'Playlists', path: '/playlists', icon: FiFolder },
    { label: 'Dashboard', path: '/dashboard', icon: FiLayout },
    { label: 'Settings', path: '/settings', icon: FiSettings }
  ];

  const handleNavClick = () => {
    if (window.innerWidth < 768 && sidebarOpen) {
      toggleSidebar();
    }
  };

  return (
    <>
      {/* Mobile Off-Canvas Backdrop - Full Screen Inset-0, Z-60 */}
      <div
        onClick={toggleSidebar}
        className={`fixed inset-0 bg-black/60 backdrop-blur-xs z-[60] md:hidden transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Mobile Off-Canvas Drawer - Above all content, Z-70 */}
      <aside
        className={`fixed inset-y-0 left-0 z-[70] w-[80%] max-w-[300px] bg-[var(--bg-secondary)] border-r border-[var(--border-color)] shadow-2xl transition-transform duration-300 ease-in-out md:hidden flex flex-col overflow-y-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header inside Mobile Drawer */}
        <div className="h-16 px-4 flex items-center gap-3 border-b border-[var(--border-color)] shrink-0">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-full hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] transition-colors"
            title="Close Menu"
          >
            <FiMenu size={20} />
          </button>
          <Link
            to="/"
            onClick={handleNavClick}
            className="flex items-center gap-2 font-bold text-lg tracking-tight text-[var(--text-primary)]"
          >
            <div className="bg-red-600 text-white p-1.5 rounded-lg flex items-center justify-center shadow-lg shadow-red-600/30">
              <FaYoutube size={20} />
            </div>
            <span className="font-extrabold bg-gradient-to-r from-red-500 to-purple-600 bg-clip-text text-transparent">
              VideoTube
            </span>
          </Link>
        </div>

        {/* Navigation Items */}
        <div className="py-4 px-3 flex flex-col gap-1 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-3 py-3 rounded-xl font-medium text-sm transition-all ${
                    isActive
                      ? 'bg-purple-600/15 text-purple-500 font-semibold'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
                  }`
                }
              >
                <Icon size={20} className="shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </aside>

      {/* Desktop Sidebar (>= 768px) - Completely Unchanged */}
      <aside
        className={`hidden md:block fixed left-0 top-16 bottom-0 z-40 bg-[var(--bg-secondary)] border-r border-[var(--border-color)] transition-all duration-200 overflow-y-auto ${
          sidebarOpen ? 'w-56' : 'w-16'
        }`}
      >
        <div className="py-3 px-2 flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-3 py-3 rounded-xl font-medium text-sm transition-all ${
                    isActive
                      ? 'bg-purple-600/15 text-purple-500 font-semibold'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
                  }`
                }
                title={!sidebarOpen ? item.label : undefined}
              >
                <Icon size={20} className="shrink-0" />
                {sidebarOpen && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </div>
      </aside>
    </>
  );
}
