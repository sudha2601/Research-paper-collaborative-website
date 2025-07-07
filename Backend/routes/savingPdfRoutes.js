import express from 'express';
import { uploadPdf,deletePdf } from '../controllers/savingPdfController.js';
import multer from 'multer';
import SavingPdf from '../models/Savingpdf.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('file'), uploadPdf);

router.get('/group/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    const pdfs = await SavingPdf.find({ group: groupId });
    res.json(pdfs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch PDFs' });
  }
});

router.delete('/:id', deletePdf);

export default router;