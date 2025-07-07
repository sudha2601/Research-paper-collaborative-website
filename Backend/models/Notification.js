import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema(
  {
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
    message: String,
    type: { type: String, enum: ['invite'], default: 'invite' },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  },
  { timestamps: true }
)

export default mongoose.model('Notification', notificationSchema)
