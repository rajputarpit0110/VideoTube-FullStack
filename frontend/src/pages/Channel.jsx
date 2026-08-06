import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import { useAuthStore } from '../store/useAuthStore';
import VideoCard from '../components/VideoCard';
import TweetCard from '../components/TweetCard';
import { VideoSkeleton } from '../components/Skeleton';
import { FiBell } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Channel() {
  const { username } = useParams();
  const { user } = useAuthStore();

  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('videos');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(0);

  useEffect(() => {
    fetchChannelProfile();
  }, [username]);

  const fetchChannelProfile = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/users/c/${username}`);
      const ch = res.data.data;
      setChannel(ch);
      setIsSubscribed(ch.isSubscribed || false);
      setSubscribersCount(ch.subscribersCount || 0);

      // Fetch Channel Videos
      const videosRes = await axiosInstance.get('/videos', { params: { userId: ch._id } });
      setVideos(videosRes.data.data.docs || []);

      // Fetch Channel Tweets
      const tweetsRes = await axiosInstance.get(`/tweets/user/${ch._id}`);
      setTweets(tweetsRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSubscribe = async () => {
    if (!user) {
      toast.error('Please sign in to subscribe');
      return;
    }
    if (user._id === channel?._id) {
      toast.error("You cannot subscribe to your own channel");
      return;
    }
    try {
      const res = await axiosInstance.post(`/subscriptions/c/${channel._id}`);
      const newSub = res.data.data.subscribed;
      setIsSubscribed(newSub);
      setSubscribersCount((prev) => (newSub ? prev + 1 : prev - 1));
      toast.success(newSub ? 'Subscribed!' : 'Unsubscribed');
    } catch (err) {
      toast.error('Failed to update subscription');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex flex-col gap-4 sm:gap-6 w-full min-w-0">
        <div className="h-32 sm:h-48 rounded-xl sm:rounded-3xl bg-[var(--bg-tertiary)] animate-pulse" />
        <div className="h-16 sm:h-20 bg-[var(--bg-tertiary)] rounded-xl sm:rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="py-16 sm:py-20 text-center text-base sm:text-lg text-[var(--text-secondary)]">
        Channel @{username} not found.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-4 sm:gap-6 py-2 w-full min-w-0">
      {/* Cover Image Banner */}
      <div className="relative h-32 sm:h-44 md:h-56 w-full rounded-xl sm:rounded-3xl overflow-hidden bg-zinc-800 border border-[var(--border-color)] shrink-0">
        <img
          src={channel.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80'}
          alt="Cover Banner"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Channel Details Header */}
      <div className="flex flex-wrap items-start sm:items-center justify-between gap-3 px-1 sm:px-2 w-full min-w-0">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <img
            src={channel.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
            alt={channel.fullName}
            className="w-14 h-14 sm:w-20 sm:h-20 rounded-full object-cover border-2 sm:border-4 border-[var(--bg-primary)] shadow-xl shrink-0"
          />
          <div className="flex flex-col min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold text-[var(--text-primary)] truncate">{channel.fullName}</h1>
            <p className="text-xs text-[var(--text-secondary)] truncate">@{channel.username}</p>
            <div className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-[var(--text-secondary)] mt-1">
              <span>{subscribersCount} subscriber{subscribersCount === 1 ? '' : 's'}</span>
              <span>•</span>
              <span>{channel.channelsSubscribedToCount || 0} subscribed</span>
            </div>
          </div>
        </div>

        {user?._id !== channel._id && (
          <button
            onClick={handleToggleSubscribe}
            className={`px-4 py-1.5 sm:px-6 sm:py-2.5 rounded-full font-semibold text-xs transition-all flex items-center gap-1.5 sm:gap-2 shrink-0 ${
              isSubscribed
                ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)]'
                : 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30'
            }`}
          >
            {isSubscribed && <FiBell size={13} className="sm:text-[14px]" />}
            <span>{isSubscribed ? 'Subscribed' : 'Subscribe'}</span>
          </button>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[var(--border-color)] w-full min-w-0">
        {['videos', 'tweets'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 font-semibold text-xs sm:text-sm capitalize border-b-2 transition-all ${
              activeTab === tab
                ? 'border-purple-600 text-purple-500'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'videos' ? (
        videos.length === 0 ? (
          <div className="py-12 text-center text-xs sm:text-sm text-[var(--text-secondary)]">
            This channel has not uploaded any videos yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 w-full min-w-0">
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        )
      ) : (
        tweets.length === 0 ? (
          <div className="py-12 text-center text-xs sm:text-sm text-[var(--text-secondary)]">
            This channel has not posted any tweets yet.
          </div>
        ) : (
          <div className="max-w-2xl mx-auto flex flex-col gap-3 sm:gap-4 w-full min-w-0">
            {tweets.map((tweet) => (
              <TweetCard key={tweet._id} tweet={tweet} />
            ))}
          </div>
        )
      )}
    </div>
  );
}
