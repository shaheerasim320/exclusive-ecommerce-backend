import cloudinary from 'cloudinary';
import dotenv from 'dotenv';
import multer from 'multer';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        const result = await cloudinary.v2.uploader.upload_stream(
            { resource_type: 'auto' }, 
            (error, result) => {
                if (error) {
                    return res.status(500).json({ message: "Error uploading to Cloudinary", error });
                }
                res.status(200).json({
                    message: "Image uploaded successfully",
                    imageUrl: result.secure_url,
                    publicId: result.public_id,
                });
            }
        );

        result.end(req.file.buffer);

    } catch (error) {
        console.error("Error uploading image:", error);
        res.status(500).json({ message: error.message });
    }
};

const deleteImage = async (req, res) => {
    const { publicId } = req.body;
    try {
        await cloudinary.v2.uploader.destroy(publicId);
        res.status(200).json({ message: "Image deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete image", error });
    }
};

export { uploadImage, upload, deleteImage };
