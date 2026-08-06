import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import axiosInstance from '../utils/axios';
import { formatViews } from '../utils/formatters';
import { 
  FiVideo, FiEye, FiUsers, FiThumbsUp, FiUpload, FiTrash2, FiToggleLeft, FiToggleRight, FiX 
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuthStore();

  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Upload Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user?._id) fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const statsRes = await axiosInstance.get('/dashboard/stats');
      setStats(statsRes.data.data);

      const videosRes = await axiosInstance.get('/dashboard/videos');
      setVideos(videosRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (videoId) => {
    try {
      const res = await axiosInstance.patch(`/videos/toggle/publish/${videoId}`);
      const updated = res.data.data;
      setVideos((prev) => prev.map((v) => (v._id === videoId ? { ...v, isPublished: updated.isPublished } : v)));
      toast.success(updated.isPublished ? 'Video published' : 'Video unpublished');
    } catch (err) {
      toast.error('Failed to toggle publish status');
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('Delete this video permanently?')) return;
    try {
      await axiosInstance.delete(`/videos/${videoId}`);
      setVideos((prev) => prev.filter((v) => v._id !== videoId));
      toast.success('Video deleted');
    } catch (err) {
      toast.error('Failed to delete video');
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !videoFile || !thumbnail) {
      toast.error('Please fill all fields and select files');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('videoFile', videoFile);
    formData.append('thumbnail', thumbnail);

    try {
      await axiosInstance.post('/videos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Video uploaded successfully!');
      setShowUploadModal(false);
      setTitle('');
      setDescription('');
      setVideoFile(null);
      setThumbnail(null);
      fetchDashboardData();
    } catch (err) {
      toast.error('Failed to upload video');
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return (
      <div className="py-16 sm:py-20 text-center text-base sm:text-lg text-[var(--text-secondary)]">
        Sign in to access Creator Dashboard.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-6 sm:gap-8 py-2 w-full min-w-0">
      {/* Header & Upload Button */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-color)] pb-4 w-full min-w-0">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-2xl font-bold text-[var(--text-primary)] truncate">Welcome back, {user.fullName}! 👋</h1>
          <p className="text-[11px] sm:text-xs text-[var(--text-secondary)] truncate">Channel analytics and video management studio</p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-1.5 sm:gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white font-semibold text-xs shadow-lg shadow-purple-600/30 transition-all shrink-0"
        >
          <FiUpload size={14} className="sm:text-[16px]" />
          <span>Upload Video</span>
        </button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 w-full min-w-0">
        <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center gap-3 sm:gap-4">
          <div className="p-2.5 sm:p-3 rounded-xl bg-purple-600/15 text-purple-500 shrink-0">
            <FiEye size={20} className="sm:text-[24px]" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] sm:text-xs font-medium text-[var(--text-secondary)]">Total Views</p>
            <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] truncate">{formatViews(stats?.totalViews)}</h3>
          </div>
        </div>

        <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center gap-3 sm:gap-4">
          <div className="p-2.5 sm:p-3 rounded-xl bg-blue-500/15 text-blue-500 shrink-0">
            <FiUsers size={20} className="sm:text-[24px]" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] sm:text-xs font-medium text-[var(--text-secondary)]">Total Subscribers</p>
            <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] truncate">{stats?.totalSubscribers || 0}</h3>
          </div>
        </div>

        <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center gap-3 sm:gap-4">
          <div className="p-2.5 sm:p-3 rounded-xl bg-pink-500/15 text-pink-500 shrink-0">
            <FiThumbsUp size={20} className="sm:text-[24px]" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] sm:text-xs font-medium text-[var(--text-secondary)]">Total Likes</p>
            <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] truncate">{stats?.totalLikes || 0}</h3>
          </div>
        </div>

        <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center gap-3 sm:gap-4">
          <div className="p-2.5 sm:p-3 rounded-xl bg-emerald-500/15 text-emerald-500 shrink-0">
            <FiVideo size={20} className="sm:text-[24px]" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] sm:text-xs font-medium text-[var(--text-secondary)]">Total Videos</p>
            <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] truncate">{stats?.totalVideos || 0}</h3>
          </div>
        </div>
      </div>

      {/* Video Management Table */}
      <div className="flex flex-col gap-3 sm:gap-4 w-full min-w-0">
        <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">Uploaded Videos</h2>
        <div className="rounded-xl sm:rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-x-auto shadow-sm w-full min-w-0">
          <table className="w-full text-left text-xs sm:text-sm text-[var(--text-primary)]">
            <thead className="bg-[var(--bg-tertiary)] text-[var(--text-secondary)] uppercase text-[10px] sm:text-xs">
              <tr>
                <th className="px-3 sm:px-4 py-2.5 sm:py-3">Status</th>
                <th className="px-3 sm:px-4 py-2.5 sm:py-3">Video</th>
                <th className="px-3 sm:px-4 py-2.5 sm:py-3">Views</th>
                <th className="px-3 sm:px-4 py-2.5 sm:py-3">Likes</th>
                <th className="px-3 sm:px-4 py-2.5 sm:py-3">Uploaded</th>
                <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {videos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-[var(--text-secondary)] text-xs sm:text-sm">
                    No videos uploaded yet. Click "Upload Video" to start sharing!
                  </td>
                </tr>
              ) : (
                videos.map((video) => (
                  <tr key={video._id} className="hover:bg-[var(--bg-tertiary)]/50 transition-colors">
                    <td className="px-3 sm:px-4 py-2.5 sm:py-3">
                      <button
                        onClick={() => handleTogglePublish(video._id)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold whitespace-nowrap ${
                          video.isPublished ? 'bg-emerald-500/15 text-emerald-500' : 'bg-amber-500/15 text-amber-500'
                        }`}
                      >
                        {video.isPublished ? <FiToggleRight size={14} /> : <FiToggleLeft size={14} />}
                        <span>{video.isPublished ? 'Published' : 'Draft'}</span>
                      </button>
                    </td>
                    <td className="px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2.5 sm:gap-3 min-w-[200px] sm:min-w-[240px]">
                      <img src={video.thumbnail} alt={video.title} className="w-12 h-8 sm:w-16 sm:h-10 rounded-lg object-cover bg-zinc-800 shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-xs sm:text-sm line-clamp-1">{video.title}</span>
                        <span className="text-[10px] sm:text-xs text-[var(--text-secondary)] line-clamp-1">{video.description}</span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-[11px] sm:text-xs whitespace-nowrap">{formatViews(video.views)}</td>
                    <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-[11px] sm:text-xs whitespace-nowrap">{video.likesCount || 0}</td>
                    <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-[11px] sm:text-xs whitespace-nowrap">{new Date(video.createdAt).toLocaleDateString()}</td>
                    <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-right">
                      <button
                        onClick={() => handleDeleteVideo(video._id)}
                        className="p-1.5 sm:p-2 rounded-full hover:bg-red-500/10 text-red-400 transition-colors"
                        title="Delete Video"
                      >
                        <FiTrash2 size={15} className="sm:text-[16px]" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Video Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl sm:rounded-3xl w-full max-w-lg p-4 sm:p-6 shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[var(--border-color)]">
              <h3 className="font-bold text-base sm:text-lg text-[var(--text-primary)]">Upload New Video</h3>
              <button onClick={() => setShowUploadModal(false)} className="p-1.5 sm:p-2 rounded-full hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)]">
                <FiX size={18} className="sm:text-[20px]" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="flex flex-col gap-3 sm:gap-4 mt-3 sm:mt-4">
              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)]">Title</label>
                <input
                  type="text"
                  placeholder="Enter video title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-9 sm:h-10 mt-1 px-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] text-xs sm:text-sm focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)]">Description</label>
                <textarea
                  placeholder="Describe your video..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] text-xs sm:text-sm focus:outline-none focus:border-purple-500 resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)]">Video File (MP4/WebM)</label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideoFile(e.target.files[0])}
                    className="w-full text-xs text-[var(--text-secondary)] mt-1 file:mr-2 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-[11px] file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)]">Thumbnail (JPG/PNG)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setThumbnail(e.target.files[0])}
                    className="w-full text-xs text-[var(--text-secondary)] mt-1 file:mr-2 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-[11px] file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 sm:gap-3 mt-3 sm:mt-4">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-1.5 sm:px-5 sm:py-2 rounded-full text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-1.5 sm:px-6 sm:py-2 rounded-full text-xs font-semibold bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white shadow-lg shadow-purple-600/30 transition-all"
                >
                  {uploading ? 'Uploading...' : 'Publish Video'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
