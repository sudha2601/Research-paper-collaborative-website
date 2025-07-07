import express from 'express';
import { protect } from '../middleware/authmiddleware.js';
import { addComment, getCommentsForPdf } from '../controllers/commentController.js';

const router = express.Router();

router.post('/add', protect, addComment);
router.get('/pdf', protect, getCommentsForPdf);

export default router;