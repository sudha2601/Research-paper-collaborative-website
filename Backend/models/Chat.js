import mongoose from 'mongoose'

const chatSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  createdBy: {
        type: String,
        required: true
  },
  groupID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const Chat = mongoose.model('Chat', chatSchema)
export default Chat