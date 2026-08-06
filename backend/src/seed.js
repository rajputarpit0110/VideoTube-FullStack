import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "./models/user.model.js";
import { Video } from "./models/video.model.js";
import { Tweet } from "./models/tweet.model.js";
import { Comment } from "./models/comment.model.js";
import { Like } from "./models/like.model.js";
import { Playlist } from "./models/playlist.model.js";
import { Subscription } from "./models/subscription.model.js";

dotenv.config({ path: "./.env" });

const SAMPLE_VIDEOS = [
    {
        title: "Big Buck Bunny - Animated Short Film",
        description: "A large and lovable rabbit deals with bullying forest creatures in this iconic open-source 3D animated comedy short film.",
        videoFile: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        thumbnail: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80",
        duration: 596,
        views: 14250
    },
    {
        title: "Elephant's Dream - Open Source Cinema",
        description: "The story of two strange workers in a giant machine world. A futuristic exploration of sound and visuals.",
        videoFile: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
        duration: 653,
        views: 8920
    },
    {
        title: "For Bigger Blazes - Chromecast Test Stream",
        description: "Experience high-definition video streaming performance with vibrant colors and fast-paced tech demo visuals.",
        videoFile: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80",
        duration: 15,
        views: 24500
    },
    {
        title: "For Bigger Escapes - Nature & Adventure",
        description: "Breathtaking landscapes, mountain ranges, and scenic view streams for outdoor enthusiasts.",
        videoFile: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        thumbnail: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
        duration: 15,
        views: 31200
    },
    {
        title: "For Bigger Fun - Sports & Action",
        description: "High energy skateboarding and extreme sports showcase captured in ultra-smooth slow motion video.",
        videoFile: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
        thumbnail: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1200&q=80",
        duration: 60,
        views: 18400
    },
    {
        title: "For Bigger Joyrides - Car Enthusiast Special",
        description: "Cruising down scenic highways in modern high-performance vehicles.",
        videoFile: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
        thumbnail: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80",
        duration: 15,
        views: 27800
    },
    {
        title: "For Bigger Meltdowns - Tech & Innovation",
        description: "In-depth review of next-generation hardware cooling solutions and extreme stress test benchmarks.",
        videoFile: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
        thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80",
        duration: 15,
        views: 15300
    },
    {
        title: "Sintel - Fantasy Animated Film Trailer",
        description: "The emotional story of a girl named Sintel on a quest to rescue her beloved dragon hatchling.",
        videoFile: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
        thumbnail: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
        duration: 52,
        views: 45000
    },
    {
        title: "Subaru OutBack On Location - Car Review",
        description: "Off-road testing, interior tour, and feature rundown of the latest all-wheel drive adventure SUV.",
        videoFile: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnLocation.mp4",
        thumbnail: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80",
        duration: 594,
        views: 12400
    },
    {
        title: "Tears of Steel - Sci-Fi VFX Short",
        description: "Set in dystopian Amsterdam where a group of rebels attempts to rescue the world using ancient holographic technology.",
        videoFile: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
        thumbnail: "https://images.unsplash.com/photo-1535378917042-10a22c95931a?auto=format&fit=crop&w=1200&q=80",
        duration: 734,
        views: 62000
    }
];

const SAMPLE_USERS = [
    {
        fullName: "Hitesh Choudhary",
        username: "hiteshchoudhary",
        email: "hitesh@videotube.dev",
        password: "password123",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
        coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80"
    },
    {
        fullName: "Alex Rivera",
        username: "alexcode",
        email: "alex@videotube.dev",
        password: "password123",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
        coverImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1600&q=80"
    },
    {
        fullName: "Sophia Chen",
        username: "sophiadesign",
        email: "sophia@videotube.dev",
        password: "password123",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
        coverImage: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80"
    },
    {
        fullName: "Marcus Johnson",
        username: "marcus_dev",
        email: "marcus@videotube.dev",
        password: "password123",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
        coverImage: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?auto=format&fit=crop&w=1600&q=80"
    },
    {
        fullName: "Elena Rostova",
        username: "elena_vfx",
        email: "elena@videotube.dev",
        password: "password123",
        avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
        coverImage: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=80"
    },
    {
        fullName: "David Kim",
        username: "david_ai",
        email: "david@videotube.dev",
        password: "password123",
        avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80",
        coverImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1600&q=80"
    },
    {
        fullName: "Sarah Connor",
        username: "sarah_sec",
        email: "sarah@videotube.dev",
        password: "password123",
        avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80",
        coverImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80"
    },
    {
        fullName: "Ryan Patel",
        username: "ryan_cloud",
        email: "ryan@videotube.dev",
        password: "password123",
        avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80",
        coverImage: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1600&q=80"
    },
    {
        fullName: "Jessica Taylor",
        username: "jessica_fullstack",
        email: "jessica@videotube.dev",
        password: "password123",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
        coverImage: "https://images.unsplash.com/photo-1535378917042-10a22c95931a?auto=format&fit=crop&w=1600&q=80"
    },
    {
        fullName: "Lucas Vance",
        username: "lucas_games",
        email: "lucas@videotube.dev",
        password: "password123",
        avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
        coverImage: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1600&q=80"
    }
];

const TWEETS_CONTENT = [
    "Just released a new tutorial on React 19 Server Components! Check it out on VideoTube 🔥",
    "Building fullstack apps with Node.js, Express, and MongoDB is such a smooth developer experience.",
    "Tailwind CSS v4 + Framer Motion makes UI design feel like magic. What's your favorite styling tool?",
    "Clean architecture and aggregation pipelines in MongoDB make API performance 10x faster!",
    "Coffee, dark mode, and resolving 50 build warnings in one go. Peak dev satisfaction ☕✨",
    "Excited to announce our open source VideoTube community project! Star it on GitHub 🌟",
    "TypeScript strict mode saved me from 5 runtime bugs today. Never building JS apps without it again.",
    "Which state management library do you prefer in 2026? Zustand, Redux Toolkit, or Jotai?"
];

async function seedDatabase() {
    try {
        console.log("Connecting to Database...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB!");

        // Clear existing data
        console.log("Cleaning old database collections...");
        await User.deleteMany({});
        await Video.deleteMany({});
        await Tweet.deleteMany({});
        await Comment.deleteMany({});
        await Like.deleteMany({});
        await Playlist.deleteMany({});
        await Subscription.deleteMany({});

        // 1. Create Users
        console.log("Creating 10 Users...");
        const createdUsers = [];
        for (const userData of SAMPLE_USERS) {
            const user = await User.create(userData);
            createdUsers.push(user);
        }
        console.log(`Created ${createdUsers.length} users successfully!`);

        // 2. Create 50 Videos
        console.log("Creating 50 Videos...");
        const createdVideos = [];
        for (let i = 0; i < 50; i++) {
            const baseVideo = SAMPLE_VIDEOS[i % SAMPLE_VIDEOS.length];
            const owner = createdUsers[i % createdUsers.length];
            
            const video = await Video.create({
                title: `${baseVideo.title} ${i > 9 ? `(Vol. ${Math.floor(i / 10) + 1})` : ""}`,
                description: `${baseVideo.description} In this video, ${owner.fullName} breaks down key concepts and shares pro tips.`,
                videoFile: baseVideo.videoFile,
                thumbnail: baseVideo.thumbnail,
                duration: baseVideo.duration,
                views: Math.floor(Math.random() * 50000) + 500,
                isPublished: true,
                owner: owner._id
            });
            createdVideos.push(video);
        }
        console.log(`Created ${createdVideos.length} videos!`);

        // 3. Create Tweets
        console.log("Creating Tweets...");
        const createdTweets = [];
        for (let i = 0; i < 25; i++) {
            const owner = createdUsers[i % createdUsers.length];
            const content = TWEETS_CONTENT[i % TWEETS_CONTENT.length];
            const tweet = await Tweet.create({
                content: `${content} #${owner.username}`,
                owner: owner._id
            });
            createdTweets.push(tweet);
        }
        console.log(`Created ${createdTweets.length} tweets!`);

        // 4. Create Subscriptions
        console.log("Creating Subscriptions...");
        for (let i = 0; i < createdUsers.length; i++) {
            for (let j = 0; j < createdUsers.length; j++) {
                if (i !== j && (i + j) % 2 === 0) {
                    await Subscription.create({
                        subscriber: createdUsers[i]._id,
                        channel: createdUsers[j]._id
                    });
                }
            }
        }
        console.log("Created Subscriptions!");

        // 5. Create Comments
        console.log("Creating Comments...");
        const createdComments = [];
        for (let i = 0; i < 60; i++) {
            const video = createdVideos[i % createdVideos.length];
            const owner = createdUsers[(i + 1) % createdUsers.length];
            const comment = await Comment.create({
                content: `Awesome video breakdown! Really helped me understand line ${i + 10}. Keep it up! 🚀`,
                video: video._id,
                owner: owner._id
            });
            createdComments.push(comment);
        }
        console.log("Created Comments!");

        // 6. Create Likes
        console.log("Creating Likes...");
        for (let i = 0; i < createdVideos.length; i++) {
            const video = createdVideos[i];
            // Add 3-5 likes per video
            for (let u = 0; u < 4; u++) {
                const user = createdUsers[(i + u) % createdUsers.length];
                await Like.create({
                    video: video._id,
                    likedBy: user._id
                });
            }
        }
        for (let i = 0; i < createdTweets.length; i++) {
            const tweet = createdTweets[i];
            for (let u = 0; u < 3; u++) {
                const user = createdUsers[(i + u) % createdUsers.length];
                await Like.create({
                    tweet: tweet._id,
                    likedBy: user._id
                });
            }
        }
        console.log("Created Likes!");

        // 7. Create Playlists
        console.log("Creating Playlists...");
        const PLAYLIST_NAMES = [
            "Fullstack Web Development 2026",
            "UI/UX Design Inspirations & Demos",
            "Cloud Engineering & DevOps Essentials",
            "AI & Machine Learning Deep Dives",
            "Top Coding Streams & Chill Beats"
        ];
        for (let i = 0; i < PLAYLIST_NAMES.length; i++) {
            const owner = createdUsers[i % createdUsers.length];
            const playlistVideos = createdVideos.slice(i * 5, (i + 1) * 5).map(v => v._id);
            await Playlist.create({
                name: PLAYLIST_NAMES[i],
                description: `Curated list of top videos covering ${PLAYLIST_NAMES[i]} created by ${owner.fullName}.`,
                owner: owner._id,
                videos: playlistVideos
            });
        }
        console.log("Created Playlists!");

        // 8. Populate Watch History for User 0
        console.log("Populating Watch History...");
        const user0 = createdUsers[0];
        const watchHistoryVideos = createdVideos.slice(0, 8).map(v => v._id);
        await User.findByIdAndUpdate(user0._id, {
            $set: { watchHistory: watchHistoryVideos }
        });

        console.log("🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY! 🎉");
        process.exit(0);
    } catch (error) {
        console.error("Error Seeding Database:", error);
        process.exit(1);
    }
}

seedDatabase();
