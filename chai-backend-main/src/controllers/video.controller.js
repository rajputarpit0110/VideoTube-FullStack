import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId } = req.query;

    const pipeline = [];

    // Match stage for filtering
    const matchConditions = {};

    if (query) {
        matchConditions.$or = [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
        ];
    }

    if (userId) {
        if (!isValidObjectId(userId)) {
            throw new ApiError(400, "Invalid userId");
        }
        matchConditions.owner = new mongoose.Types.ObjectId(userId);
    }

    // Only show published videos unless fetching own videos
    if (!userId || userId !== req.user?._id?.toString()) {
        matchConditions.isPublished = true;
    }

    pipeline.push({ $match: matchConditions });

    // Lookup owner details
    pipeline.push({
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
    });

    pipeline.push({
        $addFields: {
            owner: { $first: "$owner" }
        }
    });

    // Sort stage
    const sortOptions = {};
    sortOptions[sortBy] = sortType === "asc" ? 1 : -1;
    pipeline.push({ $sort: sortOptions });

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    };

    const videos = await Video.aggregatePaginate(Video.aggregate(pipeline), options);

    return res
        .status(200)
        .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    if ([title, description].some((field) => !field || field.trim() === "")) {
        throw new ApiError(400, "Title and description are required");
    }

    const videoLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    if (!videoLocalPath) {
        throw new ApiError(400, "Video file is required");
    }

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail file is required");
    }

    const videoFile = await uploadOnCloudinary(videoLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!videoFile) {
        throw new ApiError(500, "Error uploading video file to Cloudinary");
    }

    if (!thumbnail) {
        throw new ApiError(500, "Error uploading thumbnail file to Cloudinary");
    }

    const video = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        title,
        description,
        duration: videoFile.duration || 0,
        owner: req.user._id,
        isPublished: true
    });

    const createdVideo = await Video.findById(video._id).populate("owner", "fullName username avatar");

    return res
        .status(201)
        .json(new ApiResponse(201, createdVideo, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId");
    }

    // Increment views
    await Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } });

    // Add to user watch history if authenticated
    if (req.user?._id) {
        await User.findByIdAndUpdate(req.user._id, {
            $addToSet: { watchHistory: videoId }
        });
    }

    const video = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
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
                        $lookup: {
                            from: "subscriptions",
                            localField: "_id",
                            foreignField: "channel",
                            as: "subscribers"
                        }
                    },
                    {
                        $addFields: {
                            subscribersCount: { $size: "$subscribers" },
                            isSubscribed: {
                                $cond: {
                                    if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                                    then: true,
                                    else: false
                                }
                            }
                        }
                    },
                    {
                        $project: {
                            fullName: 1,
                            username: 1,
                            avatar: 1,
                            subscribersCount: 1,
                            isSubscribed: 1
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $addFields: {
                owner: { $first: "$owner" },
                likesCount: { $size: "$likes" },
                isLiked: {
                    $cond: {
                        if: { $in: [req.user?._id, "$likes.likedBy"] },
                        then: true,
                        else: false
                    }
                }
            }
        }
    ]);

    if (!video?.length) {
        throw new ApiError(404, "Video not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video[0], "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You do not have permission to update this video");
    }

    const updateData = {};
    if (title && title.trim() !== "") updateData.title = title;
    if (description && description.trim() !== "") updateData.description = description;

    if (req.file?.path) {
        const thumbnail = await uploadOnCloudinary(req.file.path);
        if (thumbnail?.url) {
            updateData.thumbnail = thumbnail.url;
        }
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        { $set: updateData },
        { new: true }
    ).populate("owner", "fullName username avatar");

    return res
        .status(200)
        .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You do not have permission to delete this video");
    }

    await Video.findByIdAndDelete(videoId);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You do not have permission to toggle publish status");
    }

    video.isPublished = !video.isPublished;
    await video.save();

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Publish status updated successfully"));
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
