import express from 'express';
import {loginUser, registerUser, logoutUser, refreshAccessToken} from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';


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

export default router