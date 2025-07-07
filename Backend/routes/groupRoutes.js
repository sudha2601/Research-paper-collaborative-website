import express from 'express'
import { createGroup, getMyGroups, deleteGroup, getGroupById } from '../controllers/groupController.js'
import { protect } from '../middleware/authmiddleware.js'

const router = express.Router()

router.post('/create', protect, createGroup)
router.get('/my', protect, getMyGroups)
router.delete('/:id', protect, deleteGroup)
router.get('/:id', protect, getGroupById)

export default router
