import express from 'express';
import { protect } from '../middleware/authmiddleware.js';
import { addChat , getChatForPdf} from '../controllers/chatcontroller.js';

const router = express.Router();

router.post('/add',protect, addChat);
router.get('/getchat', protect, getChatForPdf);

export default router;