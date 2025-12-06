import express from 'express';
import multer from 'multer';
import {
    uploadData,
    getResearchData,
    getMyUploads,
    deleteUpload
} from '../controllers/researchDataController.js';
import { verifyToken, requireResearcher } from '../controllers/authController.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
            cb(null, true);
        } else {
            cb(new Error('Only CSV files are allowed'));
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Public route - anyone can view research data
router.get('/data', getResearchData);

// Protected routes - researcher only
router.post('/upload', verifyToken, requireResearcher, upload.single('file'), uploadData);
router.get('/my-uploads', verifyToken, requireResearcher, getMyUploads);
router.delete('/upload/:id', verifyToken, requireResearcher, deleteUpload);

export default router;
