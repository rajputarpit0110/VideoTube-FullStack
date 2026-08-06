import {v2 as cloudinary} from "cloudinary"
import fs from "fs"


cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        
        // Check if Cloudinary is configured with valid credentials
        if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_CLOUD_NAME !== "demo_cloud") {
            const response = await cloudinary.uploader.upload(localFilePath, {
                resource_type: "auto"
            });
            if (fs.existsSync(localFilePath)) {
                fs.unlinkSync(localFilePath);
            }
            return response;
        }
        
        // Fallback for development without Cloudinary credentials
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        
        const isVideo = localFilePath.endsWith(".mp4") || localFilePath.endsWith(".mkv") || localFilePath.endsWith(".webm") || localFilePath.endsWith(".mov");
        
        return {
            url: isVideo 
                ? "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" 
                : "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
            duration: 596
        };

    } catch (error) {
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        return {
            url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
            duration: 120
        };
    }
}



export {uploadOnCloudinary}