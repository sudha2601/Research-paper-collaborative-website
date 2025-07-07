// routes/authRoutes.js
import express from 'express'
import {
  loginUser,
  googleLogin,
  getUser,
  registerUser,
} from '../controllers/authcontroller.js'
import { protect } from '../middleware/authmiddleware.js'

const router = express.Router()

// Public routes
router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/google-login', googleLogin)

// Protected route (requires token)
router.get('/user', protect, getUser)

export default router
