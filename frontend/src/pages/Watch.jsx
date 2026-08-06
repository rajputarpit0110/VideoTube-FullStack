import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../utils/axios';
import { useAuthStore } from '../store/useAuthStore';
import VideoPlayer from '../components/VideoPlayer';
import CommentSection from '../components/CommentSection';
import PlaylistModal from '../components/PlaylistModal';
import VideoCard from '../components/VideoCard';
import { formatViews, timeAgo } from '../utils/formatters';
import { FiThumbsUp, FiBookmark, FiShare2, FiBell } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Watch() {
  const { videoId } = useParams();
  const { user } = useAuthStore();

  const [video, setVideo] = useState(null);
  const [relatedVideos, setRelatedVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);

  useEffect(() => {
    fetchVideoData();
    fetchRelatedVideos();
  }, [videoId]);

  const fetchVideoData = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/videos/${videoId}`);
      const v = res.data.data;
      setVideo(v);
      setIsLiked(v.isLiked || false);
      setLikesCount(v.likesCount || 0);
      setIsSubscribed(v.owner?.isSubscribed || false);
      setSubscribersCount(v.owner?.subscribersCount || 0);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load video');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedVideos = async () => {
    try {
      const res = await axiosInstance.get('/videos', { params: { limit: 10 } });
      setRelatedVideos((res.data.data.docs || []).filter((v) => v._id !== videoId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleLike = async () => {
    if (!user) {
      toast.error('Please sign in to like videos');
      return;
    }
    try {
      const res = await axiosInstance.post(`/likes/toggle/v/${videoId}`);
      const newLiked = res.data.data.isLiked;
      setIsLiked(newLiked);
      setLikesCount((prev) => (newLiked ? prev + 1 : prev - 1));
    } catch (err) {
      toast.error('Failed to update like');
    }
  };

  const handleToggleSubscribe = async () => {
    if (!user) {
      toast.error('Please sign in to subscribe');
      return;
    }
    if (user._id === video?.owner?._id) {
      toast.error("You cannot subscribe to your own channel");
      return;
    }
    try {
      const res = await axiosInstance.post(`/subscriptions/c/${video.owner._id}`);
      const newSub = res.data.data.subscribed;
      setIsSubscribed(newSub);
      setSubscribersCount((prev) => (newSub ? prev + 1 : prev - 1));
      toast.success(newSub ? 'Subscribed!' : 'Unsubscribed');
    } catch (err) {
      toast.error('Failed to update subscription');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Video link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4 max-w-7xl mx-auto py-4">
        <div className="w-full aspect-video rounded-3xl bg-[var(--bg-tertiary)] animate-pulse" />
        <div className="w-1/2 h-8 bg-[var(--bg-tertiary)] rounded animate-pulse" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="py-20 text-center text-lg text-[var(--text-secondary)]">
        Video not found.
      </div>
    );
  }

  const owner = video.owner || {};

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 py-2">
      {/* Left Column: Player & Video Info */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        <VideoPlayer src={video.videoFile} poster={video.thumbnail} />

        <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] leading-snug">
          {video.title}
        </h1>

        {/* Channel Info & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-b border-[var(--border-color)]">
          {/* Owner details */}
          <div className="flex items-center gap-3">
            <Link to={`/c/${owner.username}`}>
              <img
                src={owner.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                alt={owner.fullName}
                className="w-11 h-11 rounded-full object-cover border border-[var(--border-color)]"
              />
            </Link>
            <div className="flex flex-col">
              <Link to={`/c/${owner.username}`} className="font-bold text-sm text-[var(--text-primary)] hover:underline">
                {owner.fullName || owner.username}
              </Link>
              <span className="text-xs text-[var(--text-secondary)]">
                {subscribersCount} subscriber{subscribersCount === 1 ? '' : 's'}
              </span>
            </div>

            {user?._id !== owner._id && (
              <button
                onClick={handleToggleSubscribe}
                className={`ml-2 px-4 py-2 rounded-full font-semibold text-xs transition-all flex items-center gap-2 ${
                  isSubscribed
                    ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)]'
                    : 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30'
                }`}
              >
                {isSubscribed && <FiBell size={14} />}
                <span>{isSubscribed ? 'Subscribed' : 'Subscribe'}</span>
              </button>
            )}
          </div>

          {/* Video Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                isLiked
                  ? 'bg-pink-500/15 border-pink-500 text-pink-500'
                  : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
              }`}
            >
              <FiThumbsUp size={16} className={isLiked ? 'fill-pink-500' : ''} />
              <span>{likesCount}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all"
            >
              <FiShare2 size={16} />
              <span>Share</span>
            </button>

            {user && (
              <button
                onClick={() => setShowPlaylistModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all"
              >
                <FiBookmark size={16} />
                <span>Save</span>
              </button>
            )}
          </div>
        </div>

        {/* Video Description Box */}
        <div className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] flex flex-col gap-2">
          <div className="flex items-center gap-3 font-semibold text-[var(--text-secondary)]">
            <span>{formatViews(video.views)} views</span>
            <span>•</span>
            <span>{timeAgo(video.createdAt)}</span>
          </div>
          <p className="leading-relaxed whitespace-pre-line">{video.description}</p>
        </div>

        {/* Comment Section */}
        <CommentSection videoId={videoId} />
      </div>

      {/* Right Column: Related Videos */}
      <div className="flex flex-col gap-4">
        <h3 className="font-bold text-base text-[var(--text-primary)]">Related Videos</h3>
        <div className="flex flex-col gap-4">
          {relatedVideos.map((relVideo) => (
            <VideoCard key={relVideo._id} video={relVideo} />
          ))}
        </div>
      </div>

      {/* Playlist Save Modal */}
      {showPlaylistModal && (
        <PlaylistModal videoId={videoId} onClose={() => setShowPlaylistModal(false)} />
      )}
    </div>
  );
}
