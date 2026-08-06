import React from 'react';

export function VideoSkeleton() {
  return (
    <div className="flex flex-col gap-2 rounded-2xl animate-pulse">
      <div className="w-full aspect-video rounded-2xl bg-[var(--bg-tertiary)]" />
      <div className="flex gap-3 px-1">
        <div className="w-9 h-9 rounded-full bg-[var(--bg-tertiary)] shrink-0" />
        <div className="flex-1 flex flex-col gap-2">
          <div className="w-full h-4 rounded bg-[var(--bg-tertiary)]" />
          <div className="w-2/3 h-3 rounded bg-[var(--bg-tertiary)]" />
        </div>
      </div>
    </div>
  );
}

export function TweetSkeleton() {
  return (
    <div className="flex gap-4 p-5 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] animate-pulse">
      <div className="w-11 h-11 rounded-full bg-[var(--bg-tertiary)] shrink-0" />
      <div className="flex-1 flex flex-col gap-3">
        <div className="w-1/3 h-4 rounded bg-[var(--bg-tertiary)]" />
        <div className="w-full h-12 rounded bg-[var(--bg-tertiary)]" />
      </div>
    </div>
  );
}
