import Chat from '../models/Chat.js';

export const addChat = async (req, res) => {
  try {
    const { text, createdBy, groupID } = req.body;

    const chat = await Chat.create({
      text,
      createdBy,
      groupID,
    });

    // Emit the chat message using Socket.IO
    const io = req.app.get('io'); // Get io instance from app
    if (io) {
      io.emit('receiveMessage', chat); // Broadcast to all clients
    }

    res.status(201).json(chat);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add chat', error: err.message });
  }
};


export const getChatForPdf = async (req, res) => {
  try {
    const { groupID} = req.query;
    const chat = await Chat.find({ groupID })
    res.json(chat);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch chat', error: err.message });
  }
};