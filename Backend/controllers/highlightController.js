import Highlight from '../models/Highlight.js';

export const addHighlight = async (req, res) => {
  try {
    const { pdfId, position, content, comment, color } = req.body;
    const user = req.user?.id;

    console.log("📩 Incoming request to add highlight:");
    console.log("pdfId:", pdfId);
    console.log("user:", user);
    console.log("position:", position);
    console.log("content:", content);
    console.log("comment:", comment);
    console.log("color:", color);

    if (!pdfId || !user || !position || !content) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const highlight = await Highlight.create({
      pdfId,
      user,
      position,
      content,
      comment,
      color,
    });

    console.log("✅ Highlight added:", highlight);
    const io = req.app.get('io');
    io.emit('refreshData'); // Broadcast to all users
    res.status(201).json(highlight);
  } catch (err) {
    console.error("❌ Failed to add highlight:", err);
    res.status(500).json({ message: "Failed to add highlight", error: err.message });
  }
};

export const getHighlights = async (req, res) => {
  try {
    const { pdfId } = req.query;
    const highlights = await Highlight.find({ pdfId }).populate('user', 'name _id');
    res.json(highlights);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch highlights', error: err.message });
  }
};

// ❌ Delete a highlight if it belongs to the logged-in user
export const deleteHighlight = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const highlight = await Highlight.findById(id);
    if (!highlight) {
      return res.status(404).json({ message: 'Highlight not found' });
    }

    if (highlight.user.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this highlight' });
    }

    await Highlight.findByIdAndDelete(id);
    const io = req.app.get('io');
    io.emit('refreshData'); // Broadcast to all users
    res.json({ message: 'Highlight deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete highlight', error: err.message });
  }
};