import mongoose, { Schema } from 'mongoose';
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const videoSchema = new Schema(
    {
        videFile: {
            type: String, // cloudinary url will be used here
            required: true
        },
        thumbnail: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        duration: {
            type: Number,
            required: true
        },
        views: {
            type: Number,
            default: 0
        },
        isPublished: {
            type: Boolean,
            default: true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
    },
    {
        timestamps: true
    }
)

videoSchema.plugin(mongooseAggregatePaginate); // Add pagination plugin to the schema
export const Video = mongoose.model("Video", videoSchema)
