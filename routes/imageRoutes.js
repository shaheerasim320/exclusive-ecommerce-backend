import express from 'express';
import { uploadImage, upload, deleteImage } from '../controllers/imageController.js';
import { verifyAccessToken, verifyAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/upload', verifyAccessToken, verifyAdmin, upload.single("image"), uploadImage);
router.post('/delete', verifyAccessToken, verifyAdmin, deleteImage);

export default router;