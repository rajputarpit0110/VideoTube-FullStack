import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import axiosInstance from '../utils/axios';
import PlaylistModal from '../components/PlaylistModal';
import { FiFolder, FiPlus, FiTrash2, FiPlay } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Playlists() {
  const { user } = useAuthStore();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (user?._id) fetchPlaylists();
  }, [user]);

  const fetchPlaylists = async () => {
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

  const handleDeletePlaylist = async (playlistId, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this playlist?')) return;
    try {
      await axiosInstance.delete(`/playlist/${playlistId}`);
      setPlaylists((prev) => prev.filter((p) => p._id !== playlistId));
      toast.success('Playlist deleted');
    } catch (err) {
      toast.error('Failed to delete playlist');
    }
  };

  if (!user) {
    return (
      <div className="py-20 text-center flex flex-col items-center gap-3">
        <FiFolder size={48} className="text-purple-500" />
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Organize your favorite content</h2>
        <p className="text-sm text-[var(--text-secondary)]">Sign in to create and manage custom playlists.</p>
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
    <div className="max-w-7xl mx-auto flex flex-col gap-6 py-2">
      <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-600/15 text-purple-500">
            <FiFolder size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[var(--text-primary)]">Your Playlists</h1>
            <p className="text-xs text-[var(--text-secondary)]">{playlists.length} playlists created</p>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-all shadow-lg shadow-purple-600/30"
        >
          <FiPlus size={16} />
          <span>New Playlist</span>
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="h-48 rounded-2xl bg-[var(--bg-tertiary)] animate-pulse" />
          ))}
        </div>
      ) : playlists.length === 0 ? (
        <div className="py-20 text-center text-sm text-[var(--text-secondary)]">
          You haven't created any playlists yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {playlists.map((playlist) => {
            const firstVideo = playlist.videos?.[0];
            const coverImage = firstVideo?.thumbnail || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';

            return (
              <div
                key={playlist._id}
                className="group relative flex flex-col rounded-2xl overflow-hidden bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-purple-500/50 transition-all shadow-sm"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-zinc-800">
                  <img src={coverImage} alt={playlist.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="p-3 rounded-full bg-purple-600 text-white">
                      <FiPlay size={20} />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 text-white text-xs font-semibold">
                    {playlist.videos?.length || 0} video{playlist.videos?.length === 1 ? '' : 's'}
                  </div>
                </div>

                <div className="p-4 flex items-center justify-between gap-3">
                  <div className="flex flex-col">
                    <h3 className="font-bold text-sm text-[var(--text-primary)] truncate">{playlist.name}</h3>
                    <p className="text-xs text-[var(--text-secondary)] line-clamp-1">{playlist.description}</p>
                  </div>

                  <button
                    onClick={(e) => handleDeletePlaylist(playlist._id, e)}
                    className="p-2 rounded-full hover:bg-red-500/10 text-red-400 transition-colors"
                    title="Delete Playlist"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && <PlaylistModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
