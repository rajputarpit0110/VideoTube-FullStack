import React from 'react';
import { Link } from 'react-router-dom';
import { formatDuration, formatViews, timeAgo } from '../utils/formatters';

export default function VideoCard({ video }) {
  if (!video) return null;

  const owner = video.owner || {};

  return (
    <div className="group flex flex-col gap-2 rounded-2xl overflow-hidden cursor-pointer transition-transform hover:-translate-y-1">
      {/* Thumbnail Container */}
      <Link to={`/watch/${video._id}`} className="relative aspect-video w-full overflow-hidden rounded-2xl bg-zinc-800">
        <img
          src={video.thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 text-white text-xs font-semibold tracking-wider backdrop-blur-sm">
          {formatDuration(video.duration)}
        </div>
      </Link>

      {/* Info Container */}
      <div className="flex gap-3 px-1">
        <Link to={`/c/${owner.username}`} className="shrink-0">
          <img
            src={owner.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
            alt={owner.fullName}
            className="w-9 h-9 rounded-full object-cover border border-[var(--border-color)] hover:opacity-80 transition-opacity"
          />
        </Link>
        <div className="flex flex-col gap-1 overflow-hidden">
          <Link
            to={`/watch/${video._id}`}
            className="font-semibold text-sm line-clamp-2 text-[var(--text-primary)] group-hover:text-purple-500 transition-colors"
          >
            {video.title}
          </Link>
          <Link
            to={`/c/${owner.username}`}
            className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors truncate"
          >
            {owner.fullName || owner.username}
          </Link>
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            <span>{formatViews(video.views)} views</span>
            <span>•</span>
            <span>{timeAgo(video.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
