import mongoose from 'mongoose';

const highlightSchema = new mongoose.Schema({
  pdfId: { type: String, required: true }, // or pdfUrl if you use URLs
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  position: { type: Object, required: true }, // store react-pdf-highlighter position object
  content: { type: Object, required: true },  // store react-pdf-highlighter content object
  comment: { type: String },
  color: { type: String, default: '#ffe066' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Highlight', highlightSchema);