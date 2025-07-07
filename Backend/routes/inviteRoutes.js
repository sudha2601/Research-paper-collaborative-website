import express from 'express'
import {
  searchUsersByEmail,
  sendInvite,
  getPendingInvites,
  acceptInvite,
  rejectInvite,
} from '../controllers/inviteController.js'
import {protect}from '../middleware/authmiddleware.js'

const router = express.Router()

router.get('/search', protect, searchUsersByEmail)
router.post('/send', protect, sendInvite)
router.get('/pending', protect, getPendingInvites)
router.post('/accept/:inviteId', protect, acceptInvite)
router.post('/reject/:inviteId', protect, rejectInvite)

export default router
