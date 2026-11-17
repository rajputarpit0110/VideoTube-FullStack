import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async(req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        
        // console.log(token);
        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if (!user) {
            
            throw new ApiError(401, "Invalid Access Token")
        }
    
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
    
})

export const optionalVerifyJWT = asyncHandler(async(req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        
        if (!token) {
            return next()
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if (user) {
            req.user = user;
        }
        return next()
    } catch (error) {
        // Continue as unauthenticated guest if token is invalid or expired
        return next()
    }
})
