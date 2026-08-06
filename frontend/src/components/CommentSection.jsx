import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import axiosInstance from '../utils/axios';
import { timeAgo } from '../utils/formatters';
import { FiSend, FiHeart, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function CommentSection({ videoId }) {
  const { user } = useAuthStore();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [videoId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/comments/${videoId}`);
      setComments(res.data.data.docs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to comment');
      return;
    }
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const res = await axiosInstance.post(`/comments/${videoId}`, { content: newComment });
      setComments([res.data.data, ...comments]);
      setNewComment('');
      toast.success('Comment added');
    } catch (err) {
      toast.error('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleLike = async (commentId) => {
    if (!user) {
      toast.error('Please sign in to like comments');
      return;
    }
    try {
      const res = await axiosInstance.post(`/likes/toggle/c/${commentId}`);
      const isLiked = res.data.data.isLiked;
      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId
            ? {
                ...c,
                isLiked,
                likesCount: isLiked ? (c.likesCount || 0) + 1 : (c.likesCount || 1) - 1
              }
            : c
        )
      );
    } catch (err) {
      toast.error('Failed to update like');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await axiosInstance.delete(`/comments/c/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      toast.success('Comment deleted');
    } catch (err) {
      toast.error('Failed to delete comment');
    }
  };

  return (
    <div className="flex flex-col gap-6 mt-8 pt-6 border-t border-[var(--border-color)]">
      <h3 className="font-bold text-lg text-[var(--text-primary)]">
        {comments.length} Comment{comments.length === 1 ? '' : 's'}
      </h3>

      {/* Add comment box */}
      <form onSubmit={handleAddComment} className="flex gap-4">
        <img
          src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
          alt="Avatar"
          className="w-10 h-10 rounded-full object-cover shrink-0 border border-[var(--border-color)]"
        />
        <div className="flex-1 flex flex-col gap-2">
          <input
            type="text"
            placeholder={user ? "Add a comment..." : "Sign in to leave a comment"}
            value={newComment}
            disabled={!user}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full bg-[var(--bg-secondary)] border-b border-[var(--border-color)] focus:border-purple-500 text-[var(--text-primary)] text-sm px-3 py-2 outline-none transition-colors"
          />
          {user && (
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setNewComment('')}
                className="px-4 py-1.5 rounded-full text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="px-4 py-1.5 rounded-full text-xs font-semibold bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white transition-colors"
              >
                Comment
              </button>
            </div>
          )}
        </div>
      </form>

      {/* Comments List */}
      {loading ? (
        <div className="text-sm text-[var(--text-secondary)]">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="text-sm text-[var(--text-secondary)] italic">No comments yet. Be the first to comment!</div>
      ) : (
        <div className="flex flex-col gap-5">
          {comments.map((comment) => {
            const owner = comment.owner || {};
            const isOwner = user?._id === owner._id;

            return (
              <div key={comment._id} className="flex gap-4">
                <img
                  src={owner.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                  alt={owner.fullName}
                  className="w-9 h-9 rounded-full object-cover shrink-0 border border-[var(--border-color)]"
                />
                <div className="flex-1 flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-[var(--text-primary)]">@{owner.username || 'user'}</span>
                    <span className="text-[10px] text-[var(--text-secondary)]">{timeAgo(comment.createdAt)}</span>
                  </div>
                  <p className="text-sm text-[var(--text-primary)] leading-relaxed">{comment.content}</p>

                  <div className="flex items-center gap-4 mt-1">
                    <button
                      onClick={() => handleToggleLike(comment._id)}
                      className={`flex items-center gap-1.5 text-xs font-medium ${
                        comment.isLiked ? 'text-pink-500' : 'text-[var(--text-secondary)] hover:text-pink-500'
                      }`}
                    >
                      <FiHeart size={14} className={comment.isLiked ? 'fill-pink-500' : ''} />
                      <span>{comment.likesCount || 0}</span>
                    </button>

                    {isOwner && (
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="text-xs text-red-400 hover:text-red-500 transition-colors"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
