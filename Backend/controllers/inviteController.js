import User from '../models/User.js'
import Group from '../models/Group.js'
import Notification from '../models/Notification.js'

// 🔍 Search users by Gmail
export const searchUsersByEmail = async (req, res) => {
  const { query } = req.query

  if (!query || query.length < 2) {
    return res.status(400).json({ message: 'Search query too short' })
  }

  try {
    const users = await User.find({
      gmail: { $regex: query, $options: 'i' },
      _id: { $ne: req.user.id } // exclude the logged-in user
    }).select('name gmail picture _id')

    res.json(users)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// ✉️ Send invite
export const sendInvite = async (req, res) => {
  const { toUserId, groupId } = req.body

  try {
    const fromUser = await User.findById(req.user.id)
    const toUser = await User.findById(toUserId)
    const group = await Group.findById(groupId)

    if (!fromUser || !toUser || !group) {
      return res.status(404).json({ message: 'User or group not found' })
    }

    // Prevent duplicate invites
    const existingInvite = await Notification.findOne({
      toUser: toUserId,
      group: groupId,
      type: 'invite',
      status: 'pending',
    })

    if (existingInvite) {
      return res.status(400).json({ message: 'Invite already sent' })
    }

    let invite = await Notification.create({
      toUser: toUserId,
      fromUser: fromUser._id,
      group: groupId,
      message: `${fromUser.name} invited you to join ${group.name}`,
      type: 'invite',
    })

    // Populate for frontend
    invite = await Notification.findById(invite._id)
      .populate('fromUser', 'name gmail')
      .populate('group', 'name');

    const io = req.app.get('io');
    io.emit('refreshData');
     // Broadcast to all users
     console.log('refreshData emitted');


    res.status(201).json(invite)
  } catch (err) {
    res.status(500).json({ message: 'Failed to send invite', error: err.message })
  }
}

// ✅ Get pending invites for the logged-in user
export const getPendingInvites = async (req, res) => {
  try {
    const invites = await Notification.find({
      toUser: req.user.id,
      type: 'invite',
      status: 'pending',
    })
      .populate('fromUser', 'name gmail')
      .populate('group', 'name')

    res.json(invites)
  } catch (err) {
    res.status(500).json({ message: 'Error fetching invites', error: err.message })
  }
}

// 👍 Accept invite
export const acceptInvite = async (req, res) => {
  const { inviteId } = req.params

  try {
    const invite = await Notification.findById(inviteId)

    if (!invite || invite.toUser.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Invite not found' })
    }

    invite.status = 'accepted'
    await invite.save()

    await Group.findByIdAndUpdate(invite.group, {
      $addToSet: { members: req.user.id },
    })

    // Fetch the updated group with members and createdBy populated
    const group = await Group.findById(invite.group)
      .populate('createdBy', '_id name gmail')
      .populate('members', '_id name gmail');

    const io = req.app.get('io');
    io.emit('refreshData'); // Broadcast to all users
    console.log('refreshData emitted');


    res.json({ message: 'Invite accepted and added to group' })
  } catch (err) {
    res.status(500).json({ message: 'Error accepting invite', error: err.message })
  }
}

// ❌ Reject invite
export const rejectInvite = async (req, res) => {
  const { inviteId } = req.params

  try {
    const invite = await Notification.findById(inviteId)

    if (!invite || invite.toUser.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Invite not found' })
    }

    invite.status = 'rejected'
    await invite.save()

    res.json({ message: 'Invite rejected' })
  } catch (err) {
    res.status(500).json({ message: 'Error rejecting invite', error: err.message })
  }
}
