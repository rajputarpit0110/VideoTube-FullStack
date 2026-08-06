import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import VideoCard from '../components/VideoCard';
import { VideoSkeleton } from '../components/Skeleton';

const CATEGORIES = ['All', 'Web Dev', 'AI & ML', 'UI/UX Design', 'Gaming', 'Music', 'Tech Reviews', 'Vlogs'];

export default function Home() {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetchVideos();
  }, [searchQuery, selectedCategory]);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      let queryParam = searchQuery;
      if (selectedCategory !== 'All') {
        queryParam = selectedCategory;
      }
      const res = await axiosInstance.get('/videos', {
        params: { query: queryParam, limit: 30 }
      });
      setVideos(res.data.data.docs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Category Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-purple-500/50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Videos Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, idx) => (
            <VideoSkeleton key={idx} />
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-lg font-semibold text-[var(--text-primary)]">No videos found</p>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Try searching for something else or clearing filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}
