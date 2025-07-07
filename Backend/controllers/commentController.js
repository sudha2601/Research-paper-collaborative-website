import Comment from '../models/Comment.js';

export const addComment = async (req, res) => {
  try {
    const { savingPdf, text, highlightedText } = req.body;
    const user = req.user.id;
    const comment = await Comment.create({
      savingPdf,
      text,
      highlightedText,
      user,
    });
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add comment', error: err.message });
  }
};

export const getCommentsForPdf = async (req, res) => {
  try {
    const { savingPdf } = req.query;
    const comments = await Comment.find({ savingPdf }).populate('user', 'name _id');
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch comments', error: err.message });
  }
};