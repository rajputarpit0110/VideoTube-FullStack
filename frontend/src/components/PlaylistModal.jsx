import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import axiosInstance from '../utils/axios';
import { FiX, FiPlus, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function PlaylistModal({ videoId, onClose }) {
  const { user } = useAuthStore();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user?._id) fetchUserPlaylists();
  }, [user]);

  const fetchUserPlaylists = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/playlist/user/${user._id}`);
      setPlaylists(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVideo = async (playlist) => {
    const hasVideo = playlist.videos.some((v) => (v._id || v) === videoId);
    try {
      if (hasVideo) {
        await axiosInstance.patch(`/playlist/remove/${videoId}/${playlist._id}`);
        toast.success(`Removed from ${playlist.name}`);
      } else {
        await axiosInstance.patch(`/playlist/add/${videoId}/${playlist._id}`);
        toast.success(`Added to ${playlist.name}`);
      }
      fetchUserPlaylists();
    } catch (err) {
      toast.error('Failed to update playlist');
    }
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;

    setSubmitting(true);
    try {
      const res = await axiosInstance.post('/playlist', { name, description });
      const newPlaylist = res.data.data;
      if (videoId) {
        await axiosInstance.patch(`/playlist/add/${videoId}/${newPlaylist._id}`);
      }
      toast.success('Playlist created!');
      setName('');
      setDescription('');
      setShowCreate(false);
      fetchUserPlaylists();
    } catch (err) {
      toast.error('Failed to create playlist');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl sm:rounded-3xl w-full max-w-md p-4 sm:p-6 shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[var(--border-color)]">
          <h3 className="font-bold text-base sm:text-lg text-[var(--text-primary)]">Save video to...</h3>
          <button onClick={onClose} className="p-1.5 sm:p-2 rounded-full hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
            <FiX size={18} className="sm:text-[20px]" />
          </button>
        </div>

        <div className="py-3 sm:py-4 max-h-60 overflow-y-auto flex flex-col gap-2.5 sm:gap-3">
          {loading ? (
            <div className="text-xs sm:text-sm text-[var(--text-secondary)]">Loading playlists...</div>
          ) : playlists.length === 0 ? (
            <div className="text-xs sm:text-sm text-[var(--text-secondary)] italic">No playlists created yet.</div>
          ) : (
            playlists.map((playlist) => {
              const inPlaylist = playlist.videos.some((v) => (v._id || v) === videoId);
              return (
                <button
                  key={playlist._id}
                  onClick={() => handleToggleVideo(playlist)}
                  className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl hover:bg-[var(--bg-tertiary)] text-[var(--text-primary)] transition-colors text-left"
                >
                  <span className="font-medium text-xs sm:text-sm truncate">{playlist.name}</span>
                  <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md flex items-center justify-center border ${inPlaylist ? 'bg-purple-600 border-purple-600 text-white' : 'border-[var(--border-color)]'}`}>
                    {inPlaylist && <FiCheck size={14} className="sm:text-[16px]" />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {!showCreate ? (
          <button
            onClick={() => setShowCreate(true)}
            className="w-full flex items-center justify-center gap-2 py-2 sm:py-2.5 rounded-full border border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white font-medium text-xs sm:text-sm transition-all mt-2"
          >
            <FiPlus size={16} />
            <span>Create new playlist</span>
          </button>
        ) : (
          <form onSubmit={handleCreatePlaylist} className="flex flex-col gap-3 pt-3 border-t border-[var(--border-color)]">
            <input
              type="text"
              placeholder="Playlist name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-9 sm:h-10 px-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] text-xs sm:text-sm focus:outline-none focus:border-purple-500"
              required
            />
            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full h-9 sm:h-10 px-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] text-xs sm:text-sm focus:outline-none focus:border-purple-500"
              required
            />
            <div className="flex gap-2 justify-end mt-2">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-3 py-1.5 sm:px-4 sm:py-1.5 rounded-full text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-3 py-1.5 sm:px-4 sm:py-1.5 rounded-full text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white transition-colors"
              >
                Create
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
