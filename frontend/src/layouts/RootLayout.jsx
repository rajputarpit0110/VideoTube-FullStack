import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import { Toaster } from 'react-hot-toast';

export default function RootLayout() {
  const { checkAuth, sidebarOpen } = useAuthStore();
  const { initTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
    checkAuth();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-200">
      <Toaster position="bottom-right" toastOptions={{ duration: 3000 }} />
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main
          className={`flex-1 transition-all duration-200 p-4 sm:p-6 min-h-[calc(100vh-4rem)] ${
            sidebarOpen ? 'ml-56' : 'ml-16'
          }`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
