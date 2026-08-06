import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import axiosInstance from '../utils/axios';
import VideoCard from '../components/VideoCard';
import { VideoSkeleton } from '../components/Skeleton';
import { FiClock, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function History() {
  const { user } = useAuthStore();
  const [historyVideos, setHistoryVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?._id) fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/users/history');
      setHistoryVideos(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to clear your watch history?')) return;
    try {
      await axiosInstance.delete('/users/history/clear');
      setHistoryVideos([]);
      toast.success('Watch history cleared');
    } catch (err) {
      toast.error('Failed to clear history');
    }
  };

  if (!user) {
    return (
      <div className="py-16 sm:py-20 text-center flex flex-col items-center gap-3 px-4">
        <FiClock size={40} className="text-purple-500 sm:text-[48px]" />
        <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">Keep track of what you watch</h2>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)]">Sign in to access your watch history.</p>
        <Link
          to="/login"
          className="mt-2 px-5 py-2 sm:px-6 sm:py-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs sm:text-sm transition-colors shadow-lg shadow-purple-600/30"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-4 sm:gap-6 py-2 w-full min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-color)] pb-4 w-full min-w-0">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="p-2 sm:p-2.5 rounded-xl bg-purple-600/15 text-purple-500 shrink-0">
            <FiClock size={20} className="sm:text-[24px]" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] truncate">Watch History</h1>
            <p className="text-[11px] sm:text-xs text-[var(--text-secondary)] truncate">Videos you have recently watched</p>
          </div>
        </div>

        {historyVideos.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-red-500/30 text-red-400 hover:bg-red-500/10 font-semibold text-xs transition-colors shrink-0"
          >
            <FiTrash2 size={14} />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 w-full min-w-0">
          {Array.from({ length: 4 }).map((_, idx) => (
            <VideoSkeleton key={idx} />
          ))}
        </div>
      ) : historyVideos.length === 0 ? (
        <div className="py-16 sm:py-20 text-center text-xs sm:text-sm text-[var(--text-secondary)]">
          Your watch history is empty. Start watching videos to build your history!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 w-full min-w-0">
          {historyVideos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}
