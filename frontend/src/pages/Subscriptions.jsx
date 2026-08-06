import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import axiosInstance from '../utils/axios';
import VideoCard from '../components/VideoCard';
import { VideoSkeleton } from '../components/Skeleton';
import { FiTv, FiBell } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Subscriptions() {
  const { user } = useAuthStore();
  const [subscribedChannels, setSubscribedChannels] = useState([]);
  const [subscriptionVideos, setSubscriptionVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?._id) fetchSubscriptions();
  }, [user]);

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/subscriptions/c/${user._id}`);
      const channels = res.data.data || [];
      setSubscribedChannels(channels);

      // Fetch videos for all subscribed channels
      let feedVideos = [];
      for (const item of channels) {
        const channelId = item.subscribedChannel?._id;
        if (channelId) {
          try {
            const vRes = await axiosInstance.get('/videos', { params: { userId: channelId, limit: 6 } });
            feedVideos = [...feedVideos, ...(vRes.data.data.docs || [])];
          } catch (e) {
            // Ignore single channel fetch error
          }
        }
      }

      setSubscriptionVideos(feedVideos);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async (channelId) => {
    try {
      await axiosInstance.post(`/subscriptions/c/${channelId}`);
      setSubscribedChannels((prev) => prev.filter((item) => item.subscribedChannel?._id !== channelId));
      setSubscriptionVideos((prev) => prev.filter((v) => v.owner?._id !== channelId));
      toast.success('Unsubscribed');
    } catch (err) {
      toast.error('Failed to unsubscribe');
    }
  };

  if (!user) {
    return (
      <div className="py-20 text-center flex flex-col items-center gap-3">
        <FiTv size={48} className="text-purple-500" />
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Sign in to view Subscriptions</h2>
        <p className="text-sm text-[var(--text-secondary)]">Don't miss new videos from your favorite creators.</p>
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
    <div className="max-w-7xl mx-auto flex flex-col gap-8 py-2">
      {/* Channels Bar */}
      <div className="flex flex-col gap-4 border-b border-[var(--border-color)] pb-6">
        <h1 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <FiTv size={22} className="text-purple-500" />
          <span>Subscribed Channels ({subscribedChannels.length})</span>
        </h1>

        {subscribedChannels.length === 0 && !loading ? (
          <p className="text-sm text-[var(--text-secondary)]">You haven't subscribed to any channels yet.</p>
        ) : (
          <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-none">
            {subscribedChannels.map((item) => {
              const ch = item.subscribedChannel || {};
              return (
                <div key={ch._id} className="flex flex-col items-center gap-2 shrink-0 group">
                  <Link to={`/c/${ch.username}`} className="relative">
                    <img
                      src={ch.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                      alt={ch.fullName}
                      className="w-16 h-16 rounded-full object-cover border-2 border-purple-500 group-hover:scale-105 transition-transform"
                    />
                  </Link>
                  <Link to={`/c/${ch.username}`} className="font-semibold text-xs text-[var(--text-primary)] hover:underline truncate max-w-[80px] text-center">
                    {ch.fullName || ch.username}
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Subscription Feed */}
      <div>
        <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Latest Uploads</h2>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, idx) => (
              <VideoSkeleton key={idx} />
            ))}
          </div>
        ) : subscriptionVideos.length === 0 ? (
          <div className="py-12 text-center text-sm text-[var(--text-secondary)]">
            No recent videos from subscribed channels.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {subscriptionVideos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
