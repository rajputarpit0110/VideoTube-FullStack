import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { timeAgo } from '../utils/formatters';
import axiosInstance from '../utils/axios';
import { FiHeart, FiMessageCircle, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function TweetCard({ tweet, onDelete }) {
  const { user } = useAuthStore();
  const [likesCount, setLikesCount] = useState(tweet.likesCount || 0);
  const [isLiked, setIsLiked] = useState(tweet.isLiked || false);
  const [isDeleting, setIsDeleting] = useState(false);

  const owner = tweet.owner || {};
  const isOwner = user?._id === owner._id;

  const handleLike = async () => {
    if (!user) {
      toast.error('Please sign in to like tweets');
      return;
    }
    try {
      const res = await axiosInstance.post(`/likes/toggle/t/${tweet._id}`);
      setIsLiked(res.data.data.isLiked);
      setLikesCount((prev) => (res.data.data.isLiked ? prev + 1 : prev - 1));
    } catch (err) {
      toast.error('Failed to update like');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this tweet?')) return;
    setIsDeleting(true);
    try {
      await axiosInstance.delete(`/tweets/${tweet._id}`);
      toast.success('Tweet deleted');
      if (onDelete) onDelete(tweet._id);
    } catch (err) {
      toast.error('Failed to delete tweet');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex gap-3 sm:gap-4 p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-purple-500/30 transition-all shadow-sm w-full max-w-full min-w-0">
      {/* Avatar */}
      <Link to={`/c/${owner.username}`} className="shrink-0">
        <img
          src={owner.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
          alt={owner.fullName}
          className="w-9 h-9 sm:w-11 sm:h-11 rounded-full object-cover border border-[var(--border-color)]"
        />
      </Link>

      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-1.5 sm:gap-2 min-w-0">
        {/* Header: Name, Handle, Time, Owner Actions */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap text-xs sm:text-sm min-w-0">
            <Link to={`/c/${owner.username}`} className="font-bold text-[var(--text-primary)] hover:underline truncate max-w-[140px] sm:max-w-none">
              {owner.fullName || 'Anonymous'}
            </Link>
            <span className="text-[var(--text-secondary)] text-[10px] sm:text-xs truncate">@{owner.username}</span>
            <span className="text-[var(--text-secondary)] hidden xs:inline">•</span>
            <span className="text-[var(--text-secondary)] text-[10px] sm:text-xs">{timeAgo(tweet.createdAt)}</span>
          </div>

          {isOwner && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-1 sm:p-1.5 rounded-full hover:bg-red-500/10 text-red-400 transition-colors shrink-0"
              title="Delete Tweet"
            >
              <FiTrash2 size={15} className="sm:text-[16px]" />
            </button>
          )}
        </div>

        {/* Tweet Body */}
        <p className="text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-line break-words min-w-0">
          {tweet.content}
        </p>

        {/* Footer Actions: Likes & Comments */}
        <div className="flex items-center gap-6 pt-1.5 sm:pt-2">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
              isLiked ? 'text-pink-500' : 'text-[var(--text-secondary)] hover:text-pink-500'
            }`}
          >
            <FiHeart size={15} className={`sm:text-[16px] ${isLiked ? 'fill-pink-500' : ''}`} />
            <span>{likesCount}</span>
          </button>

          <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            <FiMessageCircle size={15} className="sm:text-[16px]" />
            <span>Reply</span>
          </div>
        </div>
      </div>
    </div>
  );
}
