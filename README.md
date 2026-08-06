# VideoTube - Full Stack YouTube & Twitter (X) Clone

A production-ready Full Stack Web Application built on **Node.js, Express, MongoDB, Mongoose, JWT authentication**, and a **Vite + React, Tailwind CSS, Framer Motion, Zustand, and TanStack Query** frontend.

---

## Features

### 🎬 Video Streaming & Management
- **Video Upload**: Support for uploading high-definition videos and thumbnails via Cloudinary with automatic duration calculation.
- **Custom Video Player**: Native HTML5 player with timeline scrub controls, custom volume/mute controls, playback speed options (0.5x - 2x), and fullscreen mode.
- **Video Discovery**: Category chips, title/description regex search, views counter, and relative timestamp display.
- **Watch History**: Automatic watch history logging with history clearance capability.

### 🐦 Twitter/X Style Tweet Platform
- **Community Feed**: Post tweets with character count limits, like tweets, reply, and view user timeline feeds.
- **Real-Time Like Counters**: Instant UI state updates with persistent backend MongoDB storage.

### 👤 User Authentication & Profiles
- **JWT Authentication**: Access tokens and Refresh Token rotation via secure HTTP-Only cookies.
- **Profile Customization**: Custom avatar & cover image uploads, full name updates, and password changes.
- **Channels**: Public channel pages with subscriber metrics and tabbed navigation (Videos & Tweets).

### 📁 Playlists & Subscriptions
- **Playlists**: Create custom public/private playlists, add videos to playlists, and remove videos.
- **Subscriptions**: Subscribe/Unsubscribe to channels with real-time channel statistics.

### 📊 Creator Dashboard
- **Channel Analytics**: Total views, subscriber count, total likes, and total published videos.
- **Studio Table**: Manage videos, toggle publish/draft status, edit video metadata, or delete videos.

---

## Tech Stack

### Frontend
- **Framework**: React 18 / 19 (Vite)
- **Styling**: Tailwind CSS v4, Vanilla CSS Design System, Glassmorphism
- **State Management**: Zustand
- **Data Fetching**: Axios with Automatic Token Refresh Interceptors
- **Icons & Motion**: React Icons, Lucide Icons, Framer Motion
- **Notifications**: React Hot Toast

### Backend
- **Runtime & Framework**: Node.js, Express.js
- **Database**: MongoDB with Mongoose Schema & Aggregation Pipelines
- **Authentication**: JWT, Bcrypt Password Hashing, Cookie Parser
- **File Uploads**: Cloudinary API with Multer local disk storage fallback

---

## Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas or local MongoDB instance

### 1. Backend Setup
```bash
cd chai-backend-main
npm install

# Configure environment variables in .env
PORT=8000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/videotube
CORS_ORIGIN=http://localhost:5173
ACCESS_TOKEN_SECRET=videotube-secret-access-token-key-2026
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=videotube-secret-refresh-token-key-2026
REFRESH_TOKEN_EXPIRY=10d

# Seed the database with realistic sample data (10 users, 50 videos, tweets, comments)
npm run seed

# Start development server
npm run dev
```

### 2. Frontend Setup
```bash
cd ../frontend
npm install

# Start Vite React development server
npm run dev
```

---

## API Endpoints Summary

| Module | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/v1/users/register` | Register new user with avatar & cover image |
| **Auth** | `POST` | `/api/v1/users/login` | Login user and issue access & refresh cookies |
| **Auth** | `POST` | `/api/v1/users/logout` | Clear cookies & invalidate refresh token |
| **User** | `GET` | `/api/v1/users/current-user` | Fetch currently logged in user profile |
| **User** | `GET` | `/api/v1/users/c/:username` | Fetch public channel profile with subscriber info |
| **Videos** | `GET` | `/api/v1/videos` | Fetch paginated videos with query & sort filters |
| **Videos** | `POST` | `/api/v1/videos` | Publish a video with video file & thumbnail |
| **Videos** | `GET` | `/api/v1/videos/:videoId` | Fetch video details, add to watch history & view count |
| **Tweets** | `POST` | `/api/v1/tweets` | Post a new tweet |
| **Tweets** | `GET` | `/api/v1/tweets/user/:userId` | Get user's tweets feed |
| **Likes** | `POST` | `/api/v1/likes/toggle/v/:videoId` | Toggle video like status |
| **Likes** | `POST` | `/api/v1/likes/toggle/t/:tweetId` | Toggle tweet like status |
| **Comments** | `GET` | `/api/v1/comments/:videoId` | Get comments for video |
| **Comments** | `POST` | `/api/v1/comments/:videoId` | Add comment to video |
| **Playlists** | `GET` | `/api/v1/playlist/user/:userId` | Get user playlists |
| **Dashboard** | `GET` | `/api/v1/dashboard/stats` | Get creator analytics stats |
