import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  gmail: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  picture: { type: String }, // ✅ NEW FIELD
})

const User = mongoose.model('User', userSchema)
export default User
