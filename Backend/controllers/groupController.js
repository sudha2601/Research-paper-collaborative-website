import Group from '../models/Group.js'

export const createGroup = async (req, res) => {
  const { name } = req.body

  if (!name) {
    return res.status(400).json({ message: 'Group name is required' })
  }

  try {
    const group = await Group.create({
      name,
      createdBy: req.user.id,
      members: [req.user.id],
    })

    // Populate members and createdBy for real-time update
    const populatedGroup = await Group.findById(group._id)
      .populate('createdBy', '_id name gmail')
      .populate('members', '_id name gmail');

    // Emit socket event to all users
    const io = req.app.get('io');
    io.emit('refreshData'); // Broadcast to all users
    console.log('refreshData emitted');

    res.status(201).json(populatedGroup)
  } catch (err) {
    res.status(500).json({ message: 'Failed to create group', error: err.message })
  }
}

// Get groups user belongs to, with all member names
export const getMyGroups = async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user.id })
      .populate('createdBy', '_id name gmail')
      .populate('members', '_id name gmail'); // <-- populate members with name and gmail
    res.json(groups)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch groups', error: err.message })
  }
}

export const deleteGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    // Only owner can delete
    if (group.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the owner can delete this group' });
    }

    await Group.findByIdAndDelete(groupId);

    // Emit socket event
    const io = req.app.get('io');
    io.emit('refreshData'); // Broadcast to all users
    console.log('refreshData emitted');

    res.json({ message: 'Group deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete group' });
  }
};

// Get group by ID (for group name and details)
export const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).select('name _id');
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch group', error: err.message });
  }
};
