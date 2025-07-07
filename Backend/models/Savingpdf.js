import mongoose from 'mongoose'

const savingPdfSchema = new mongoose.Schema({
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  title: String,
  pdfUrl: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const Savingpdf = mongoose.model('SavingPdf', savingPdfSchema)
export default Savingpdf
