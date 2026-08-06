import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import axiosInstance from '../utils/axios';
import TweetCard from '../components/TweetCard';
import { TweetSkeleton } from '../components/Skeleton';
import { FiSend, FiMessageSquare } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Tweets() {
  const { user } = useAuthStore();
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTweet, setNewTweet] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTweets();
  }, []);

  const fetchTweets = async () => {
    setLoading(true);
    try {
      // Fetch tweets by fetching current user's or all demo users' tweets
      const usersRes = await axiosInstance.get('/users/search?query=a');
      const usersList = usersRes.data.data || [];
      
      let allTweets = [];
      if (user?._id) {
        const userTweetsRes = await axiosInstance.get(`/tweets/user/${user._id}`);
        allTweets = [...allTweets, ...(userTweetsRes.data.data || [])];
      }

      for (const u of usersList.slice(0, 5)) {
        if (u._id !== user?._id) {
          try {
            const res = await axiosInstance.get(`/tweets/user/${u._id}`);
            allTweets = [...allTweets, ...(res.data.data || [])];
          } catch (err) {
            // Ignore single user fetch error
          }
        }
      }

      // Deduplicate by tweet _id and sort by date
      const uniqueMap = new Map();
      allTweets.forEach((t) => uniqueMap.set(t._id, t));
      const sorted = Array.from(uniqueMap.values()).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setTweets(sorted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTweet = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to post tweets');
      return;
    }
    if (!newTweet.trim()) return;

    setSubmitting(true);
    try {
      const res = await axiosInstance.post('/tweets', { content: newTweet });
      setTweets([res.data.data, ...tweets]);
      setNewTweet('');
      toast.success('Tweet posted!');
    } catch (err) {
      toast.error('Failed to post tweet');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTweet = (tweetId) => {
    setTweets((prev) => prev.filter((t) => t._id !== tweetId));
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6 py-2">
      {/* Page Header */}
      <div className="flex items-center gap-3 border-b border-[var(--border-color)] pb-4">
        <div className="p-2.5 rounded-xl bg-purple-600/15 text-purple-500">
          <FiMessageSquare size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Community Tweets</h1>
          <p className="text-xs text-[var(--text-secondary)]">Share thoughts, updates, and discussions</p>
        </div>
      </div>

      {/* Tweet Composer */}
      {user && (
        <form onSubmit={handleCreateTweet} className="p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex gap-4">
          <img
            src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
            alt="Avatar"
            className="w-10 h-10 rounded-full object-cover shrink-0 border border-[var(--border-color)]"
          />
          <div className="flex-1 flex flex-col gap-3">
            <textarea
              placeholder="What's happening in tech today?"
              value={newTweet}
              onChange={(e) => setNewTweet(e.target.value)}
              rows={3}
              className="w-full bg-transparent text-[var(--text-primary)] text-sm outline-none resize-none placeholder-[var(--text-secondary)]"
            />
            <div className="flex justify-between items-center border-t border-[var(--border-color)] pt-3">
              <span className="text-xs text-[var(--text-secondary)]">{280 - newTweet.length} characters left</span>
              <button
                type="submit"
                disabled={submitting || !newTweet.trim()}
                className="flex items-center gap-2 px-5 py-2 rounded-full font-semibold text-xs bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white shadow-lg shadow-purple-600/25 transition-all"
              >
                <FiSend size={14} />
                <span>Post Tweet</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Tweet Feed */}
      {loading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <TweetSkeleton key={idx} />
          ))}
        </div>
      ) : tweets.length === 0 ? (
        <div className="py-20 text-center text-sm text-[var(--text-secondary)]">
          No tweets posted yet. Be the first to share something!
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {tweets.map((tweet) => (
            <TweetCard key={tweet._id} tweet={tweet} onDelete={handleDeleteTweet} />
          ))}
        </div>
      )}
    </div>
  );
}
