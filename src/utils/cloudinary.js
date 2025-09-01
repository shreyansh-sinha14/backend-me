import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs' // to remove file from server after upload

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => { // async function to upload file to cloudinary
    try {
        if(!localFilePath) return null
        //uploading file to cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, { // await for the upload to complete
            resource_type: "auto" // jpeg, png, mp4, pdf
        })
        // file has been uploaded, now we can remove it from server
        console.log("File uploaded to cloudinary successfully", response.url);
        return response;
     } catch (error) {
        fs.unlinkSync(localFilePath) // remove file from server
        console.log("Error while uploading file to cloudinary", error);
        return null;
     }
}

export {uploadOnCloudinary}