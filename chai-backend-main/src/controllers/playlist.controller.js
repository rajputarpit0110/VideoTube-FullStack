import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if ([name, description].some((field) => !field || field.trim() === "")) {
        throw new ApiError(400, "Name and description are required");
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user._id,
        videos: []
    });

    return res
        .status(201)
        .json(new ApiResponse(201, playlist, "Playlist created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid userId");
    }

    const playlists = await Playlist.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: { $first: "$owner" }
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                totalVideos: { $size: "$videos" },
                totalViews: { $sum: "$videos.views" }
            }
        }
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, playlists, "User playlists fetched successfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlistId");
    }

    const playlist = await Playlist.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(playlistId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: { $first: "$owner" }
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: { $first: "$owner" },
                totalVideos: { $size: "$videos" },
                totalViews: { $sum: "$videos.views" }
            }
        }
    ]);

    if (!playlist?.length) {
        throw new ApiError(404, "Playlist not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, playlist[0], "Playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlistId or videoId");
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (playlist.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You do not have permission to modify this playlist");
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $addToSet: { videos: videoId }
        },
        { new: true }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, updatedPlaylist, "Video added to playlist successfully"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid playlistId or videoId");
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (playlist.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You do not have permission to modify this playlist");
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: { videos: videoId }
        },
        { new: true }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, updatedPlaylist, "Video removed from playlist successfully"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlistId");
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (playlist.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You do not have permission to delete this playlist");
    }

    await Playlist.findByIdAndDelete(playlistId);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlistId");
    }

    if (!name || !description || name.trim() === "" || description.trim() === "") {
        throw new ApiError(400, "Name and description are required");
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (playlist.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You do not have permission to update this playlist");
    }

    playlist.name = name;
    playlist.description = description;
    await playlist.save();

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Playlist updated successfully"));
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
