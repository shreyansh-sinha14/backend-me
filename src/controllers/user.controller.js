import { asyncHandler } from '../utils/asyncHandler.js';
import { apiError } from '../utils/apiError.js';
import { User } from '../models/user.models.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { apiResponse } from '../utils/apiResponse.js';
import jwt from 'jsonwebtoken';

    const generateAccessAndRefreshToken = async (userId) => {
        try{
            const user = await User.findById(userId); // fetch user from db
            const accessToken = user.generateAccessToken() // generate access token
            const refreshToken = user.generateRefreshToken() // generate refresh token

            user.refreshToken = refreshToken; // store refresh token in db
            await user.save({ validateBeforeSave: false}); // to avoid password required error
            return {accessToken, refreshToken};

        }catch(error){
            throw new apiError(500, "Error while generating tokens");
        }
    }

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
    
    // get user details 
    // create user object - create entry in db
    const {fullname, email, username, password} = req.body
    console.log("fullname, email, username, password", fullname, email, username, password);

    if(
        [fullname, email, username, password].some((field) =>
        field?.trim() === "")
    ) {
        throw new apiError(400, "All fields are required");
    }

    // check if user already exists: username, email
    const existedUser = await User.findOne({
        $or: [{email}, {username}]
    })
    // check if user already exists
    if(existedUser) {
        throw new apiError(409, "User already exists with this email or username");
    }
    //console.log("req.files", req.files);

    // get files from req.files
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    //const coverimageLocalPath = req.files?.coverimage[0]?.path;

    let coverimageLocalPath;
    if(req.files && Array.isArray(req.files.coverimage) && req.files.coverimage.length > 0){
        coverimageLocalPath = req.files.coverimage[0].path
    }

    if(!avatarLocalPath){
        throw new apiError(400, "Avatar is required");
    }

    // upload to cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverimage = await uploadOnCloudinary(coverimageLocalPath);

    if(!avatar){
        throw new apiError(500, "Error while uploading avatar to cloudinary");
    }
    // create user object - create entry in db
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverimage: coverimage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })
    // database is in another continent

    // to check if user is created in db
    const createdUser = await User.findById(user._id).select(
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

const loginUser = asyncHandler(async (req, res) => {
    // request body - username, email, password
    // username or email
    // find user based on username or email
    // password check
    // access token, refresh token
    // send cookies

    const {username, email, password} = req.body;
    if(!(username || email)){ // at least one is required
        throw new apiError(400, "Username or email is required to login");
    }
    const user = await User.findOne({
        $or: [{username}, {email}] // find user based on username or email
})
    if(!user){
        throw new apiError(404, "User not found with this username or email");
    }
    // password check
    const isPasswordValid = await user.comparePassword(password); // will return true or false
    if(!isPasswordValid){ // password is incorrect
        throw new apiError(401, "Password is incorrect");
    }

    // access token, refresh token
    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)
    
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken") // to remove password and refresh token from response

    // send cookies - refresh token in http only cookie
    const options = {
        httpOnly: true, // to prevent client side js to access the cookie
        secure: false, // to send cookie only on https
        sameSite: "lax"
    }
    return res
    .status(200) // status code 200 - ok
    .cookie("accessToken", accessToken, options) // send access token in cookie
    .cookie("refreshToken", refreshToken, options) // send refresh token in cookie

    .json( // json response
        new apiResponse(200, // data
            {
                user: loggedInUser,  // user details without password and refresh token
                accessToken, // accessToken
                refreshToken // refreshToken
            }, "User logged in successfully")
    )
})

const logoutUser = asyncHandler(async (req, res) => {
    // clear cookies
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    }
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new apiResponse(200, {}, "User logged out successfully"))
})


const refreshAccessToken = asyncHandler(async (req, res) => 
    {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

        if(!incomingRefreshToken){
            throw new apiError(401, "Refresh token is missing");
        }

        // verify refresh token
        try {
            const decodedToken = jwt.verify(
                incomingRefreshToken,
                process.env.REFRESH_TOKEN_SECRET,
            )
    const user = User.findById(decodedToken?._id)
    
    if(!user){
        throw new apiError(401, "User not found");
    }
    if(user?.refreshToken !== incomingRefreshToken){
        throw new apiError(401, "Invalid refresh token");
    }
      const options = {
        httpOnly: true,
        secure: true
      }
      const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)
    
      return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new apiResponse(
            200, 
            {accessToken, refreshToken: newRefreshToken},
            "Access token refreshed successfully"
        )
    )
        } catch (error) {
            throw new apiError(401, "Invalid refresh token");
        }

})

const changeCurrentPassword = asyncHandler(async (req, res) => {

    const {oldPassword, newPassword} = req.body

    const user = await User.findById(req.user._id)
    const isPasswordValid = await user.comparePassword(oldPassword)
    if(!isPasswordValid){
        throw new apiError(400, "Old password is incorrect");
    }
    user.password = newPassword
    await user.save({validateBeforeSave: false})
    return res
    .status(200)
    .json(new apiResponse(200, {}, "Password changed successfully"))
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
    .status(200)
    .json(new apiResponse(200, req.user, "Current user fetched successfully"))
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const {fullname, email} = req.body
    if(!fullname || !email){
        throw new apiError(400, "Fullname and email are required");
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {
                fullname, 
                email : email
            }
        },
        {new : true}
    ).select("-password")

    return res
    .status(200)
    .json(new apiResponse(200, updatedUser, "Account details updated successfully"))
})

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new apiError(400, "Avatar image is required");
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if(!avatar.url){
        throw new apiError(400, "Error while uploading avatar to cloudinary");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {
                avatar : avatar.url
            }
        },
        {new : true}
    ).select("-password")

    return res
    .status(200)
    .json(new apiResponse(200, user, "Avatar updated successfully"))
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath){
        throw new apiError(400, "coverImage image is required");
    }
    const coverimage = await uploadOnCloudinary(coverImageLocalPath)
    if(!coverimage.url){
        throw new apiError(400, "Error while uploading coverImage to cloudinary");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {
                coverimage : coverimage.url
            }
        },
        {new : true}
    ).select("-password")

    return res
    .status(200)
    .json(new apiResponse(200, user, "Cover image updated successfully"))
})
export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
}