import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId");
    }

    const commentsAggregate = Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
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
                from: "likes",
                localField: "_id",
                foreignField: "comment",
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
        },
        {
            $sort: { createdAt: -1 }
        }
    ]);

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    };

    const comments = await Comment.aggregatePaginate(commentsAggregate, options);

    return res
        .status(200)
        .json(new ApiResponse(200, comments, "Comments fetched successfully"));
});

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { content } = req.body;

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId");
    }

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Content is required");
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user._id
    });

    const populatedComment = await Comment.findById(comment._id).populate("owner", "fullName username avatar");

    return res
        .status(201)
        .json(new ApiResponse(201, populatedComment, "Comment added successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid commentId");
    }

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Content is required");
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if (comment.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You do not have permission to update this comment");
    }

    comment.content = content;
    await comment.save();

    const updatedComment = await Comment.findById(commentId).populate("owner", "fullName username avatar");

    return res
        .status(200)
        .json(new ApiResponse(200, updatedComment, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid commentId");
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if (comment.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You do not have permission to delete this comment");
    }

    await Comment.findByIdAndDelete(commentId);

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Comment deleted successfully"));
});

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}
