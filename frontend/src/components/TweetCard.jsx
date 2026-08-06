import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { timeAgo } from '../utils/formatters';
import axiosInstance from '../utils/axios';
import { FiHeart, FiMessageCircle, FiTrash2, FiEdit2 } from 'react-icons/fi';
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
    <div className="flex gap-4 p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-purple-500/30 transition-all shadow-sm">
      {/* Avatar */}
      <Link to={`/c/${owner.username}`} className="shrink-0">
        <img
          src={owner.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
          alt={owner.fullName}
          className="w-11 h-11 rounded-full object-cover border border-[var(--border-color)]"
        />
      </Link>

      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-2">
        {/* Header: Name, Handle, Time, Owner Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap text-sm">
            <Link to={`/c/${owner.username}`} className="font-bold text-[var(--text-primary)] hover:underline">
              {owner.fullName || 'Anonymous'}
            </Link>
            <span className="text-[var(--text-secondary)] text-xs">@{owner.username}</span>
            <span className="text-[var(--text-secondary)]">•</span>
            <span className="text-[var(--text-secondary)] text-xs">{timeAgo(tweet.createdAt)}</span>
          </div>

          {isOwner && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-1.5 rounded-full hover:bg-red-500/10 text-red-400 transition-colors"
              title="Delete Tweet"
            >
              <FiTrash2 size={16} />
            </button>
          )}
        </div>

        {/* Tweet Body */}
        <p className="text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-line">
          {tweet.content}
        </p>

        {/* Footer Actions: Likes & Comments */}
        <div className="flex items-center gap-6 pt-2">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 text-xs font-medium transition-colors ${
              isLiked ? 'text-pink-500' : 'text-[var(--text-secondary)] hover:text-pink-500'
            }`}
          >
            <FiHeart size={16} className={isLiked ? 'fill-pink-500' : ''} />
            <span>{likesCount}</span>
          </button>

          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            <FiMessageCircle size={16} />
            <span>Reply</span>
          </div>
        </div>
      </div>
    </div>
  );
}
