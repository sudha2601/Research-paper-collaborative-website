// HighlightPanel.jsx
import React, { useState } from 'react';

const HighlightPanel = ({ onHighlight, onCancel }) => {
  const [comment, setComment] = useState('');

  const handleHighlight = () => {
    onHighlight(comment);
    setComment('');
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: 'white',
        border: '1px solid #ccc',
        padding: '12px 16px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 9999,
        minWidth: '200px',
      }}
    >
      <p className="text-sm font-medium mb-2 text-gray-700">📝 Add Comment</p>
      <textarea
        rows={3}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write a comment..."
        className="w-full border rounded px-2 py-1 text-sm resize-none"
      />
      <button
        onClick={handleHighlight}
        className="w-full mt-2 text-sm text-black px-3 py-2 bg-yellow-100 hover:bg-yellow-200 rounded"
      >
        Highlight & Comment
      </button>
      <button
        onClick={onCancel}
        className="w-full mt-1 text-sm text-gray-500 hover:text-gray-700"
      >
        Cancel
      </button>
    </div>
  );
};

export default HighlightPanel;
