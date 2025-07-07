import express from 'express';
import { protect } from '../middleware/authmiddleware.js';
import { addHighlight, getHighlights,deleteHighlight } from '../controllers/highlightController.js';

const router = express.Router();

router.post('/add', protect, addHighlight);
router.get('/list', protect, getHighlights);
router.delete('/delete/:id', protect, deleteHighlight); // 🆕 delete route

export default router;