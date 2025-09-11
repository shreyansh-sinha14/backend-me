import { asyncHandler } from "../utils/asyncHandler";
import { apiError } from "../utils/apiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
    // check if access token is present in cookies
    try{
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "") // to check in header also
        if(!token){
            throw new apiError(401, "Access token is missing");
        }
        // verify token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        // attach user to request object
        const user = await User.findById(decoded._id).select("-password -refreshToken") // to remove password and refresh token from response
        if(!user){
            throw new apiError(404, "User not found");
        }
        req.user = user; // attach user to request object
        next(); // proceed to next middleware or route handler
    }catch(error){
        throw new apiError(401, "Invalid access token");
    }
})