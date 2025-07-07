import mongoose from 'mongoose'

const commentSchema = new mongoose.Schema({
  savingPdf: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SavingPdf',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  highlightedText: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const Comment = mongoose.model('Comment', commentSchema)
export default Comment