import SavingPdf from '../models/Savingpdf.js'
import Highlight from '../models/Highlight.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();


cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

export const uploadPdf = async (req, res) => {
  try {
    const { groupId, title, userId } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ error: 'No file uploaded' });

let result;
try {
  result = await cloudinary.uploader.upload(file.path, {
  resource_type: 'raw', // << IMPORTANT FIX
  folder: 'pdfs',
  public_id: title.replace(/\s+/g, '_'),
  overwrite: true
});

} catch (cloudErr) {
  console.error('Cloudinary upload error:', cloudErr);
  return res.status(500).json({ error: 'Cloudinary upload failed' });
}

console.log('Upload result:', result);




    const newPdf = new SavingPdf({
      group: groupId,
      title,
      pdfUrl: result.secure_url,
      uploadedBy: userId
    });

    await newPdf.save();
    fs.unlinkSync(file.path); // remove temp file

    const io = req.app.get('io');
    io.emit('refreshData'); // Broadcast to all users

    res.status(201).json(newPdf);
  } catch (err) {
    console.error('Upload failed:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
};

export const deletePdf = async (req, res) => {
  try {
    const pdf = await SavingPdf.findById(req.params.id);
    if (!pdf) return res.status(404).json({ error: 'PDF not found' });

    // This assumes `public_id` = title with underscores and in the `pdfs` folder
    const publicId = `pdfs/${pdf.title.replace(/\s+/g, '_')}`;

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });

    // Delete from DB
    await SavingPdf.findByIdAndDelete(req.params.id);

    await Highlight.deleteMany({ pdfId: req.params.id });

    const io = req.app.get('io');
    io.emit('refreshData'); // Broadcast to all users

    res.status(200).json({ message: 'PDF deleted successfully' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Failed to delete PDF' });
  }
};