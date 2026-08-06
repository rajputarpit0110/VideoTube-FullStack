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
      <div className="py-20 text-center flex flex-col items-center gap-3">
        <FiClock size={48} className="text-purple-500" />
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Keep track of what you watch</h2>
        <p className="text-sm text-[var(--text-secondary)]">Sign in to access your watch history.</p>
        <Link
          to="/login"
          className="mt-2 px-6 py-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm transition-colors shadow-lg shadow-purple-600/30"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 py-2">
      <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-600/15 text-purple-500">
            <FiClock size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">Watch History</h1>
            <p className="text-xs text-[var(--text-secondary)]">Videos you have recently watched</p>
          </div>
        </div>

        {historyVideos.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-red-500/30 text-red-400 hover:bg-red-500/10 font-semibold text-xs transition-colors"
          >
            <FiTrash2 size={14} />
            <span>Clear Watch History</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, idx) => (
            <VideoSkeleton key={idx} />
          ))}
        </div>
      ) : historyVideos.length === 0 ? (
        <div className="py-20 text-center text-sm text-[var(--text-secondary)]">
          Your watch history is empty. Start watching videos to build your history!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {historyVideos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}
