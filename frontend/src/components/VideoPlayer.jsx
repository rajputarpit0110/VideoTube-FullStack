import React, { useRef, useState, useEffect } from 'react';
import { 
  FiPlay, FiPause, FiVolume2, FiVolumeX, FiMaximize, FiMinimize, FiSettings 
} from 'react-icons/fi';
import { formatDuration } from '../utils/formatters';

export default function VideoPlayer({ src, poster }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e) => {
    const seekTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => console.log(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => console.log(err));
      setIsFullscreen(false);
    }
  };

  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const speedTimeoutRef = useRef(null);

  const handleSpeedMouseEnter = () => {
    if (speedTimeoutRef.current) clearTimeout(speedTimeoutRef.current);
    setShowSpeedMenu(true);
  };

  const handleSpeedMouseLeave = () => {
    speedTimeoutRef.current = setTimeout(() => {
      setShowSpeedMenu(false);
    }, 150);
  };

  return (
    <div
      ref={containerRef}
      className="relative group w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-[var(--border-color)]"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-contain cursor-pointer"
        onClick={togglePlay}
        autoPlay
      />

      {/* Video Overlay Controls */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-between p-4 transition-opacity duration-300 ${
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div />

        {/* Bottom Control Bar */}
        <div className="flex flex-col gap-2">
          {/* Progress Slider */}
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-white/30 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:h-2 transition-all"
          />

          <div className="flex items-center justify-between gap-4 text-white text-sm">
            {/* Play/Pause & Time & Volume */}
            <div className="flex items-center gap-4">
              <button onClick={togglePlay} className="p-1.5 rounded-full hover:bg-white/20 transition-colors">
                {isPlaying ? <FiPause size={20} /> : <FiPlay size={20} />}
              </button>

              <div className="flex items-center gap-2">
                <button onClick={toggleMute} className="p-1 rounded-full hover:bg-white/20 transition-colors">
                  {isMuted || volume === 0 ? <FiVolumeX size={18} /> : <FiVolume2 size={18} />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 bg-white/40 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>

              <span className="text-xs font-mono text-gray-300">
                {formatDuration(currentTime)} / {formatDuration(duration)}
              </span>
            </div>

            {/* Speed & Fullscreen */}
            <div className="flex items-center gap-3">
              <div
                className="relative"
                onMouseEnter={handleSpeedMouseEnter}
                onMouseLeave={handleSpeedMouseLeave}
              >
                <button
                  onClick={() => setShowSpeedMenu((prev) => !prev)}
                  className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <FiSettings size={14} />
                  <span>{playbackSpeed}x</span>
                </button>
                {showSpeedMenu && (
                  <div className="absolute right-0 bottom-full mb-2 flex flex-col bg-zinc-900/90 border border-zinc-700 rounded-lg p-1 text-xs z-20">
                    <div className="absolute left-0 right-0 -bottom-3 h-3 bg-transparent" />
                    {[0.5, 1, 1.25, 1.5, 2].map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          handleSpeedChange(s);
                          setShowSpeedMenu(false);
                        }}
                        className={`px-3 py-1 text-left rounded hover:bg-purple-600 transition-colors ${
                          playbackSpeed === s ? 'text-purple-400 font-bold' : 'text-gray-200'
                        }`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button onClick={toggleFullscreen} className="p-1.5 rounded-full hover:bg-white/20 transition-colors">
                {isFullscreen ? <FiMinimize size={18} /> : <FiMaximize size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
