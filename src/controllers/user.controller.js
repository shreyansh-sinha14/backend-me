import { asyncHandler } from '../utils/asyncHandler.js';
import { apiError } from '../utils/apiError.js';
import { User } from '../models/user.models.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';
import { apiResponse } from '../utils/apiResponse.js';


const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return response
    
    // get user details from frontend
    const {fullName, email, username, password} = req.body
    console.log("email, username, password", email, username, password);

    if(
        [fullName, email, username, password].some((field) =>
        filed?.trim() === "")
    ) {
        throw new apiError(400, "All fields are required");
    }

    // check if user already exists: username, email
    const existedUser = User.findOne({
        $or: [{email}, {username}]
    })
    // check if user already exists
    if(existedUser) {
        throw new apiError(409, "User already exists with this email or username");
    }

    // get files from req.files
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverimageLocalPath = req.files?.coverimage[0]?.path;

    if(!avatarLocalPath){
        throw new apiError(400, "Avatar is required");
    }

    // upload to cloudinary
    const avatar = await uploadToCloudinary(avatarLocalPath);
    const coverimage = await uploadToCloudinary(coverimageLocalPath);

    if(!avatar){
        throw new apiError(500, "Error while uploading avatar to cloudinary");
    }

    // create user object - create entry in db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverimage: coverimage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })
    // database is in another continent

    // to check if user is created in db
    const craetedUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new apiError(500, "Something went wrong while registering the user")
    }

    // response return
    return res.status(201).json(
        new apiResponse(200, createdUser, "User registered successfully")
    )






})


export {registerUser};