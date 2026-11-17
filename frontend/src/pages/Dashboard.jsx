import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import axiosInstance from '../utils/axios';
import { formatViews, timeAgo } from '../utils/formatters';
import { 
  FiVideo, FiEye, FiUsers, FiThumbsUp, FiUpload, FiTrash2, 
  FiToggleLeft, FiToggleRight, FiX, FiSearch, FiExternalLink, 
  FiCalendar, FiLayout, FiImage, FiFilm
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuthStore();

  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'published' | 'draft'
  const [searchQuery, setSearchQuery] = useState('');

  // Upload Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const videoInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);

  useEffect(() => {
    if (user?._id) fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, videosRes] = await Promise.all([
        axiosInstance.get('/dashboard/stats'),
        axiosInstance.get('/dashboard/videos')
      ]);
      setStats(statsRes.data.data);
      setVideos(videosRes.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (videoId) => {
    setActionLoadingId(videoId);
    try {
      const res = await axiosInstance.patch(`/videos/toggle/publish/${videoId}`);
      const updated = res.data.data;
      setVideos((prev) =>
        prev.map((v) => (v._id === videoId ? { ...v, isPublished: updated.isPublished } : v))
      );
      toast.success(updated.isPublished ? 'Video published' : 'Saved as draft');
    } catch (err) {
      console.error(err);
      toast.error('Failed to toggle publish status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('Are you sure you want to delete this video permanently?')) return;
    try {
      await axiosInstance.delete(`/videos/${videoId}`);
      setVideos((prev) => prev.filter((v) => v._id !== videoId));
      toast.success('Video deleted');
      // Refresh stats after deletion
      const statsRes = await axiosInstance.get('/dashboard/stats');
      setStats(statsRes.data.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete video');
    }
  };

  const handleThumbnailChange = (file) => {
    if (!file) return;
    setThumbnail(file);
    try {
      setThumbnailPreview(URL.createObjectURL(file));
    } catch {
      setThumbnailPreview(null);
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
    formData.append('title', title.trim());
    formData.append('description', description.trim());
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
      setThumbnailPreview(null);
      fetchDashboardData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload video');
    } finally {
      setUploading(false);
    }
  };

  // Filtered videos based on status and search query
  const filteredVideos = videos.filter((video) => {
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'published' && video.isPublished) ||
      (statusFilter === 'draft' && !video.isPublished);

    const matchesSearch =
      !searchQuery.trim() ||
      video.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="p-4 rounded-2xl bg-purple-600/15 text-purple-500 mb-4 shadow-sm">
          <FiLayout size={36} className="sm:text-[44px]" />
        </div>
        <h2 className="text-lg sm:text-2xl font-bold text-[var(--text-primary)]">Creator Studio</h2>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5 max-w-sm">
          Sign in to view your channel analytics, upload content, and manage your videos.
        </p>
        <Link
          to="/login"
          className="mt-6 px-6 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-purple-600/30 hover:opacity-90 transition-opacity"
        >
          Sign In to Studio
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-4 sm:gap-6 lg:gap-8 py-2 w-full min-w-0">
      {/* Header & Upload Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-color)] pb-3.5 sm:pb-4 w-full min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-2xl font-bold text-[var(--text-primary)] truncate">
              Creator Studio
            </h1>
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-600/15 text-purple-400 border border-purple-500/20">
              Admin
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-[var(--text-secondary)] mt-0.5 truncate">
            Welcome back, {user.fullName}! Manage channel content & analytics.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 active:scale-[0.98] text-white font-semibold text-xs sm:text-sm shadow-md sm:shadow-lg shadow-purple-600/30 transition-all shrink-0 w-full sm:w-auto"
        >
          <FiUpload size={16} />
          <span>Upload Video</span>
        </button>
      </div>

      {/* Analytics Cards - 2x2 on Mobile, 4 columns on Desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-6 w-full min-w-0">
        {/* Total Views */}
        <div className="p-3 sm:p-4 lg:p-5 rounded-xl sm:rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center gap-2.5 sm:gap-4 min-w-0 shadow-xs">
          <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-purple-600/15 text-purple-500 shrink-0">
            <FiEye size={18} className="sm:text-[22px]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] sm:text-xs font-medium text-[var(--text-secondary)] truncate">Total Views</p>
            <h3 className="text-base sm:text-xl font-bold text-[var(--text-primary)] truncate mt-0.5">
              {loading ? (
                <span className="inline-block w-12 h-5 bg-[var(--bg-tertiary)] rounded animate-pulse" />
              ) : (
                formatViews(stats?.totalViews)
              )}
            </h3>
          </div>
        </div>

        {/* Total Subscribers */}
        <div className="p-3 sm:p-4 lg:p-5 rounded-xl sm:rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center gap-2.5 sm:gap-4 min-w-0 shadow-xs">
          <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-blue-500/15 text-blue-500 shrink-0">
            <FiUsers size={18} className="sm:text-[22px]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] sm:text-xs font-medium text-[var(--text-secondary)] truncate">Subscribers</p>
            <h3 className="text-base sm:text-xl font-bold text-[var(--text-primary)] truncate mt-0.5">
              {loading ? (
                <span className="inline-block w-12 h-5 bg-[var(--bg-tertiary)] rounded animate-pulse" />
              ) : (
                stats?.totalSubscribers || 0
              )}
            </h3>
          </div>
        </div>

        {/* Total Likes */}
        <div className="p-3 sm:p-4 lg:p-5 rounded-xl sm:rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center gap-2.5 sm:gap-4 min-w-0 shadow-xs">
          <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-pink-500/15 text-pink-500 shrink-0">
            <FiThumbsUp size={18} className="sm:text-[22px]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] sm:text-xs font-medium text-[var(--text-secondary)] truncate">Total Likes</p>
            <h3 className="text-base sm:text-xl font-bold text-[var(--text-primary)] truncate mt-0.5">
              {loading ? (
                <span className="inline-block w-12 h-5 bg-[var(--bg-tertiary)] rounded animate-pulse" />
              ) : (
                stats?.totalLikes || 0
              )}
            </h3>
          </div>
        </div>

        {/* Total Videos */}
        <div className="p-3 sm:p-4 lg:p-5 rounded-xl sm:rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center gap-2.5 sm:gap-4 min-w-0 shadow-xs">
          <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-emerald-500/15 text-emerald-500 shrink-0">
            <FiVideo size={18} className="sm:text-[22px]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] sm:text-xs font-medium text-[var(--text-secondary)] truncate">Uploaded Videos</p>
            <h3 className="text-base sm:text-xl font-bold text-[var(--text-primary)] truncate mt-0.5">
              {loading ? (
                <span className="inline-block w-12 h-5 bg-[var(--bg-tertiary)] rounded animate-pulse" />
              ) : (
                stats?.totalVideos || 0
              )}
            </h3>
          </div>
        </div>
      </div>

      {/* Video Management Section */}
      <div className="flex flex-col gap-3 sm:gap-4 w-full min-w-0">
        {/* Controls: Title, Filter Tabs & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 w-full min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="text-sm sm:text-lg font-bold text-[var(--text-primary)] truncate">
              Uploaded Videos
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)]">
              {filteredVideos.length}
            </span>
          </div>

          <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 w-full sm:w-auto min-w-0">
            {/* Status Filter Tabs */}
            <div className="flex items-center p-1 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-xs shrink-0 self-start xs:self-auto">
              {[
                { id: 'all', label: 'All' },
                { id: 'published', label: 'Published' },
                { id: 'draft', label: 'Drafts' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-medium transition-all ${
                    statusFilter === tab.id
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Video Search input */}
            <div className="relative flex-1 sm:w-56 min-w-0">
              <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
              <input
                type="text"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 sm:h-9 pl-8 pr-7 text-xs bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-purple-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-0.5"
                >
                  <FiX size={12} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Loading Skeletons */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center gap-3 animate-pulse"
              >
                <div className="w-16 h-10 sm:w-20 sm:h-12 rounded-lg bg-[var(--bg-tertiary)] shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="w-1/2 h-3.5 bg-[var(--bg-tertiary)] rounded" />
                  <div className="w-1/3 h-2.5 bg-[var(--bg-tertiary)] rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredVideos.length === 0 ? (
          /* Empty State */
          <div className="p-8 sm:p-12 rounded-xl sm:rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-center flex flex-col items-center justify-center gap-2">
            <div className="p-3 rounded-full bg-[var(--bg-tertiary)] text-[var(--text-secondary)] mb-1">
              <FiVideo size={24} />
            </div>
            <p className="font-semibold text-xs sm:text-sm text-[var(--text-primary)]">
              {searchQuery || statusFilter !== 'all' ? 'No matching videos found' : 'No videos uploaded yet'}
            </p>
            <p className="text-[11px] sm:text-xs text-[var(--text-secondary)] max-w-xs">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search query or switching filters.'
                : 'Click "Upload Video" above to publish your first content!'}
            </p>
            {(searchQuery || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                className="mt-2 text-xs font-semibold text-purple-400 hover:underline"
              >
                Reset filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* MOBILE VIEW: Touch-friendly Card List (Hidden on desktop md:) */}
            <div className="flex flex-col gap-3 md:hidden w-full min-w-0">
              {filteredVideos.map((video) => (
                <div
                  key={video._id}
                  className="p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] flex flex-col gap-2.5 shadow-xs transition-all w-full min-w-0"
                >
                  {/* Top: Thumbnail, Title, Description */}
                  <div className="flex items-start gap-2.5 min-w-0">
                    <Link
                      to={`/watch/${video._id}`}
                      className="relative w-24 aspect-video rounded-lg overflow-hidden bg-zinc-800 shrink-0 border border-[var(--border-color)] group"
                    >
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </Link>

                    <div className="flex-1 min-w-0 flex flex-col">
                      <Link
                        to={`/watch/${video._id}`}
                        className="font-semibold text-xs text-[var(--text-primary)] line-clamp-2 leading-tight hover:text-purple-400 transition-colors"
                      >
                        {video.title}
                      </Link>
                      <p className="text-[10px] text-[var(--text-secondary)] line-clamp-1 mt-1 leading-normal">
                        {video.description || 'No description'}
                      </p>
                    </div>
                  </div>

                  {/* Middle: Stats Pills Row */}
                  <div className="flex items-center gap-3 text-[10px] text-[var(--text-secondary)] border-t border-[var(--border-color)] pt-2">
                    <span className="flex items-center gap-1 font-medium">
                      <FiEye size={12} className="text-purple-400" />
                      {formatViews(video.views)} views
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-medium">
                      <FiThumbsUp size={11} className="text-pink-400" />
                      {video.likesCount || 0}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <FiCalendar size={11} />
                      {timeAgo(video.createdAt)}
                    </span>
                  </div>

                  {/* Bottom: Status Toggle & Actions Row */}
                  <div className="flex items-center justify-between gap-2 border-t border-[var(--border-color)] pt-2">
                    {/* Status Toggle Button */}
                    <button
                      onClick={() => handleTogglePublish(video._id)}
                      disabled={actionLoadingId === video._id}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-all active:scale-95 ${
                        video.isPublished
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25'
                          : 'bg-amber-500/15 border-amber-500/30 text-amber-400 hover:bg-amber-500/25'
                      }`}
                    >
                      {video.isPublished ? <FiToggleRight size={15} /> : <FiToggleLeft size={15} />}
                      <span>{video.isPublished ? 'Published' : 'Draft'}</span>
                    </button>

                    {/* Action Buttons: Watch Link & Delete */}
                    <div className="flex items-center gap-1">
                      <Link
                        to={`/watch/${video._id}`}
                        className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:text-purple-400 hover:bg-[var(--bg-tertiary)] transition-colors"
                        title="Watch video"
                      >
                        <FiExternalLink size={15} />
                      </Link>

                      <button
                        onClick={() => handleDeleteVideo(video._id)}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/15 transition-colors"
                        title="Delete video"
                      >
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP VIEW: Data Table (Hidden on mobile < md) */}
            <div className="hidden md:block rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-x-auto shadow-sm w-full min-w-0">
              <table className="w-full text-left text-xs sm:text-sm text-[var(--text-primary)]">
                <thead className="bg-[var(--bg-tertiary)] text-[var(--text-secondary)] uppercase text-[10px] sm:text-xs">
                  <tr>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Video</th>
                    <th className="px-4 py-3">Views</th>
                    <th className="px-4 py-3">Likes</th>
                    <th className="px-4 py-3">Uploaded</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  {filteredVideos.map((video) => (
                    <tr key={video._id} className="hover:bg-[var(--bg-tertiary)]/50 transition-colors">
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleTogglePublish(video._id)}
                          disabled={actionLoadingId === video._id}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                            video.isPublished
                              ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25'
                              : 'bg-amber-500/15 text-amber-400 hover:bg-amber-500/25'
                          }`}
                        >
                          {video.isPublished ? <FiToggleRight size={14} /> : <FiToggleLeft size={14} />}
                          <span>{video.isPublished ? 'Published' : 'Draft'}</span>
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3 min-w-[240px] max-w-[360px]">
                          <Link to={`/watch/${video._id}`} className="shrink-0 group">
                            <img
                              src={video.thumbnail}
                              alt={video.title}
                              className="w-16 h-10 rounded-lg object-cover bg-zinc-800 shrink-0 border border-[var(--border-color)] group-hover:scale-105 transition-transform"
                            />
                          </Link>
                          <div className="flex flex-col min-w-0">
                            <Link
                              to={`/watch/${video._id}`}
                              className="font-semibold text-xs sm:text-sm text-[var(--text-primary)] hover:text-purple-400 transition-colors line-clamp-1"
                            >
                              {video.title}
                            </Link>
                            <span className="text-[10px] sm:text-xs text-[var(--text-secondary)] line-clamp-1">
                              {video.description || 'No description'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap font-medium text-[var(--text-primary)]">
                        {formatViews(video.views)}
                      </td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap text-[var(--text-secondary)]">
                        {video.likesCount || 0}
                      </td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap text-[var(--text-secondary)]">
                        {new Date(video.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/watch/${video._id}`}
                            className="p-1.5 sm:p-2 rounded-full hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-purple-400 transition-colors"
                            title="Watch Video"
                          >
                            <FiExternalLink size={15} />
                          </Link>
                          <button
                            onClick={() => handleDeleteVideo(video._id)}
                            className="p-1.5 sm:p-2 rounded-full hover:bg-red-500/15 text-red-400 transition-colors"
                            title="Delete Video"
                          >
                            <FiTrash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Upload Video Modal - Fully Mobile Optimized */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl sm:rounded-3xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[var(--border-color)] shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-600/15 text-purple-400">
                  <FiUpload size={16} />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-[var(--text-primary)]">Upload New Video</h3>
              </div>
              <button
                onClick={() => {
                  if (!uploading) setShowUploadModal(false);
                }}
                disabled={uploading}
                className="p-1.5 rounded-full hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] transition-colors"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleUploadSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-3.5 sm:gap-4">
              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] flex items-center justify-between">
                  <span>Title *</span>
                  <span className="text-[10px] text-[var(--text-secondary)]">{title.length}/100</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter a descriptive video title"
                  value={title}
                  maxLength={100}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-9 sm:h-10 mt-1 px-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] text-xs sm:text-sm focus:outline-none focus:border-purple-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)]">Description *</label>
                <textarea
                  placeholder="Tell viewers what your video is about..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-primary)] text-xs sm:text-sm focus:outline-none focus:border-purple-500 resize-none transition-colors"
                  required
                />
              </div>

              {/* File Selectors - Custom Touch Zones */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Video File Picker */}
                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)]">Video File *</label>
                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    onChange={(e) => setVideoFile(e.target.files[0] || null)}
                    className="hidden"
                    required
                  />
                  <div
                    onClick={() => videoInputRef.current?.click()}
                    className={`mt-1 border border-dashed rounded-xl p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                      videoFile
                        ? 'border-purple-500 bg-purple-600/10'
                        : 'border-[var(--border-color)] bg-[var(--bg-primary)] hover:border-purple-500/50'
                    }`}
                  >
                    <FiFilm size={20} className={videoFile ? 'text-purple-400' : 'text-[var(--text-secondary)]'} />
                    <span className="text-[11px] font-semibold text-[var(--text-primary)] mt-1.5 truncate max-w-[180px]">
                      {videoFile ? videoFile.name : 'Select video file'}
                    </span>
                    <span className="text-[10px] text-[var(--text-secondary)]">
                      {videoFile
                        ? `${(videoFile.size / (1024 * 1024)).toFixed(1)} MB`
                        : 'MP4, WebM (tap to browse)'}
                    </span>
                  </div>
                </div>

                {/* Thumbnail Picker */}
                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)]">Thumbnail *</label>
                  <input
                    ref={thumbnailInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleThumbnailChange(e.target.files[0] || null)}
                    className="hidden"
                    required
                  />
                  <div
                    onClick={() => thumbnailInputRef.current?.click()}
                    className={`mt-1 border border-dashed rounded-xl p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-colors overflow-hidden relative ${
                      thumbnail
                        ? 'border-purple-500 bg-purple-600/10'
                        : 'border-[var(--border-color)] bg-[var(--bg-primary)] hover:border-purple-500/50'
                    }`}
                  >
                    {thumbnailPreview ? (
                      <div className="flex items-center gap-2">
                        <img
                          src={thumbnailPreview}
                          alt="Thumbnail preview"
                          className="w-12 h-8 rounded-md object-cover border border-[var(--border-color)] shrink-0"
                        />
                        <div className="text-left min-w-0">
                          <p className="text-[11px] font-semibold text-[var(--text-primary)] truncate max-w-[100px]">
                            {thumbnail.name}
                          </p>
                          <p className="text-[10px] text-[var(--text-secondary)]">Tap to change</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <FiImage size={20} className="text-[var(--text-secondary)]" />
                        <span className="text-[11px] font-semibold text-[var(--text-primary)] mt-1.5">
                          Select thumbnail
                        </span>
                        <span className="text-[10px] text-[var(--text-secondary)]">JPG, PNG (16:9 recommended)</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-2.5 sm:gap-3 mt-2 pt-3 border-t border-[var(--border-color)]">
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 disabled:opacity-50 text-white shadow-md shadow-purple-600/30 transition-all"
                >
                  {uploading ? (
                    <>
                      <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Uploading to Cloudinary...</span>
                    </>
                  ) : (
                    <>
                      <FiUpload size={14} />
                      <span>Publish Video</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
