import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { 
  FiHome, FiMessageSquare, FiTv, FiClock, FiThumbsUp, FiFolder, FiLayout, FiSettings 
} from 'react-icons/fi';

export default function Sidebar() {
  const { sidebarOpen } = useAuthStore();

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

  return (
    <aside
      className={`fixed left-0 top-16 bottom-0 z-40 bg-[var(--bg-secondary)] border-r border-[var(--border-color)] transition-all duration-200 overflow-y-auto ${
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
  );
}
