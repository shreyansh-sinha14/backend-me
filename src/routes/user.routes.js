import express from 'express';
import {loginUser, registerUser, logoutUser, refreshAccessToken, changeCurrentPassword} from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { verify } from 'jsonwebtoken';


const router = express.Router();

router.post("/register",
    upload.fields([
        { 
            name : 'avatar',
            maxCount : 1
        },
        {
            name : 'coverimage',
            maxCount : 1
        }
    ]),
    registerUser);

    router.route("/login").post(loginUser)

    router.route("/logout").post(verifyJWT, logoutUser)

    router.route("/refresh-token").post(refreshAccessToken)

    router.route("/change-password").post(verifyJWT, changeCurrentPassword)

    router.route("/current-user").get(verifyJWT, getCurrentUser)

    router.route("/update-account-details").patch(verifyJWT, updateAccountDetails)

    router.route("/avatar").patch(verifyJWT, upload.single('avatar'), updateUserAvatar)

    router.route("/coverimage").patch(verifyJWT, upload.single('coverimage'), updateUserCoverImage)
    
    router.route("/c/:username").get(verifyJWT, getUserChannelProfile)

    router.route("/history").get(verifyJWT, getWatchHistory)
    
export default router