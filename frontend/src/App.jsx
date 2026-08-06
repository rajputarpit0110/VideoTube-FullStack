import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RootLayout from './layouts/RootLayout';
import Home from './pages/Home';
import Watch from './pages/Watch';
import Tweets from './pages/Tweets';
import Subscriptions from './pages/Subscriptions';
import History from './pages/History';
import LikedVideos from './pages/LikedVideos';
import Playlists from './pages/Playlists';
import Channel from './pages/Channel';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="watch/:videoId" element={<Watch />} />
          <Route path="tweets" element={<Tweets />} />
          <Route path="subscriptions" element={<Subscriptions />} />
          <Route path="history" element={<History />} />
          <Route path="liked-videos" element={<LikedVideos />} />
          <Route path="playlists" element={<Playlists />} />
          <Route path="c/:username" element={<Channel />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="settings" element={<Settings />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
