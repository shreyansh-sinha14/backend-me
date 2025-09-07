import mongoose, { Schema } from 'mongoose';
import jwt from "jsonwebtoken"; // to generate token
import bcrypt from 'bcryptjs'; // to hash password



const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true, // Trim whitespace
            index: true  // Adding index for faster queries
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true, // Trim whitespace
        },
        fullname: {
            type: String,
            required: true,
            trim: true, // Trim whitespace
            index: true  // Adding index for faster queries
        },
        avatar: {
            type: String,  // cloudinary url will be used here
            required: true,
        },
         coverimage: {
            type: String,  // cloudinary url will be used here
        },
         watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video",
            }
         ],
         password: {
            type: String,
            required: [true, 'Password is required']
         },
         refreshToken: {
            type: String
         }
    },
    {
        timestamps: true
    }
);

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) {
        return next();
    }
    this.password = await bcrypt.hashSync(this.password, 10);
    next();
})

userSchema.methods.comparePassword = function (password) {
    return bcrypt.compareSync(password, this.password);
}

userSchema.methods.generateAccessToken = function () { // METHOD TO GENERATE ACCESS TOKEN
     return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname,
        },
        process.env.ACCESS_TOKEN_SECRET,{
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
     )
} 
userSchema.methods.generateRefreshToken = function () { // no need to store any user info in refresh token
     return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,{
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
     )
} // METHOD TO GENERATE REFRESH TOKEN

export const User = mongoose.model("User", userSchema) // User model to create user collection in db

