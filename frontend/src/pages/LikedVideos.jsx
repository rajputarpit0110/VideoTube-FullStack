import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import axiosInstance from '../utils/axios';
import VideoCard from '../components/VideoCard';
import { VideoSkeleton } from '../components/Skeleton';
import { FiThumbsUp } from 'react-icons/fi';

export default function LikedVideos() {
  const { user } = useAuthStore();
  const [likedVideos, setLikedVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?._id) fetchLikedVideos();
  }, [user]);

  const fetchLikedVideos = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/likes/videos');
      const items = res.data.data || [];
      const videos = items.map((item) => item.video).filter(Boolean);
      setLikedVideos(videos);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="py-16 sm:py-20 text-center flex flex-col items-center gap-3 px-4">
        <FiThumbsUp size={40} className="text-purple-500 sm:text-[48px]" />
        <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">Save your favorite videos</h2>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)]">Sign in to view your liked videos.</p>
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
      <div className="flex items-center gap-2.5 sm:gap-3 border-b border-[var(--border-color)] pb-4 w-full min-w-0">
        <div className="p-2 sm:p-2.5 rounded-xl bg-pink-500/15 text-pink-500 shrink-0">
          <FiThumbsUp size={20} className="sm:text-[24px]" />
        </div>
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] truncate">Liked Videos</h1>
          <p className="text-[11px] sm:text-xs text-[var(--text-secondary)] truncate">{likedVideos.length} videos liked by you</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 w-full min-w-0">
          {Array.from({ length: 4 }).map((_, idx) => (
            <VideoSkeleton key={idx} />
          ))}
        </div>
      ) : likedVideos.length === 0 ? (
        <div className="py-16 sm:py-20 text-center text-xs sm:text-sm text-[var(--text-secondary)]">
          You haven't liked any videos yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 w-full min-w-0">
          {likedVideos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}
