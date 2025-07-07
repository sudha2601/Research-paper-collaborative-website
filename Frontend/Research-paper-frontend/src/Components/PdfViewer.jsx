import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import axios from 'axios';
import { io } from 'socket.io-client';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PdfViewer = ({ pdfUrl, pdfId, setNumPages }) => {
  const viewerRef = useRef();
  const socketRef = useRef(null);

  const [showPanel, setShowPanel] = useState(false);
  const [selectionBox, setSelectionBox] = useState(null);
  const [highlights, setHighlights] = useState([]);
  const [activeHighlight, setActiveHighlight] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/user`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCurrentUser(res.data.user);
      } catch (err) {
        console.error('Failed to fetch user', err);
      }
    };
    fetchUser();
  }, []);

  // Fetch highlights
  const fetchHighlights = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/highlights/list?pdfId=${encodeURIComponent(pdfId)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const normalized = res.data.map(h => ({ ...h, id: h._id }));
      setHighlights(normalized);
    } catch (err) {
      console.error('Failed to fetch highlights', err);
    }
  }, [pdfId]);

  useEffect(() => {
    if (pdfId) fetchHighlights();
  }, [pdfId, fetchHighlights]);

  // Socket for real-time update
  useEffect(() => {
    if (socketRef.current) return;
    const socket = io(import.meta.env.VITE_BACKEND_URL);
    socketRef.current = socket;

    socket.on('refreshData', () => {
      
        console.log('🔄 Refreshing highlights from socket...');
        fetchHighlights();
      
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [fetchHighlights, pdfId]);

  // Selection
  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      const selectedText = selection.toString().trim();

      if (selectedText && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const containerRect = viewerRef.current.getBoundingClientRect();

        const relativeTop = rect.top - containerRect.top + viewerRef.current.scrollTop;
        const relativeLeft = rect.left - containerRect.left + viewerRef.current.scrollLeft;

        setSelectionBox({
          boundingClientRect: {
            top: relativeTop,
            left: relativeLeft,
            width: rect.width,
            height: rect.height,
          },
          content: { text: selectedText },
        });

        setShowPanel(true);
      } else {
        setShowPanel(false);
        setSelectionBox(null);
      }
    };

    const viewer = viewerRef.current;
    viewer?.addEventListener('mouseup', handleMouseUp);
    return () => viewer?.removeEventListener('mouseup', handleMouseUp);
  }, []);

  // Add highlight
  const addHighlight = async () => {
    if (!selectionBox || !pdfId) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/highlights/add`,
        {
          pdfId,
          position: selectionBox,
          content: selectionBox.content,
          comment: commentText,
          color: '#fff59d',
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refresh happens via socket
    } catch (err) {
      console.error('Error saving highlight', err);
    }

    setSelectionBox(null);
    setShowPanel(false);
    setCommentText('');
    window.getSelection().removeAllRanges();
  };

  // Delete highlight
  const deleteHighlight = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/highlights/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Refresh happens via socket
      setActiveHighlight(null);
    } catch (err) {
      console.error('Error deleting highlight', err);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => setNumPages(numPages);

  useEffect(() => {
    // Reset highlight state when a new PDF is loaded
    setHighlights([]);
    setActiveHighlight(null);
    setSelectionBox(null);
    setShowPanel(false);
    setCommentText('');
  }, [pdfId, pdfUrl]);

  return (
    <div className="mt-6 relative">
      <h3 className="text-lg font-semibold mb-2">PDF Preview</h3>

      {showPanel && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-white shadow-lg border border-gray-200 p-4 rounded-lg z-50 w-96">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add your comment..."
            className="w-full p-2 border rounded mb-4"
          />
          <div className="flex justify-end gap-2">
            <button onClick={addHighlight} className="bg-yellow-300 hover:bg-yellow-400 px-4 py-2 rounded">Highlight</button>
            <button
              onClick={() => {
                setShowPanel(false);
                window.getSelection().removeAllRanges();
              }}
              className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
            >Cancel</button>
          </div>
        </div>
      )}

      <div
        className="border rounded-md shadow bg-white p-4 max-h-[80vh] overflow-y-auto relative"
        ref={viewerRef}
      >
        {highlights.map((hl) => (
          <div
            key={hl.id}
            onClick={() => setActiveHighlight(hl)}
            style={{
              position: 'absolute',
              top: `${hl.position.boundingClientRect.top}px`,
              left: `${hl.position.boundingClientRect.left}px`,
              width: `${hl.position.boundingClientRect.width}px`,
              height: `${hl.position.boundingClientRect.height}px`,
              backgroundColor: hl.color || '#ffe066',
              opacity: 0.5,
              borderRadius: '3px',
              cursor: 'pointer',
              zIndex: 40,
            }}
          />
        ))}

        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<p className="text-center py-4 text-gray-500">Loading PDF...</p>}
        >
          {Array.from(new Array(10), (_, index) => (
            <Page
              key={`page_${index + 1}`}
              pageNumber={index + 1}
              width={600}
              renderTextLayer
              renderAnnotationLayer
            />
          ))}
        </Document>
      </div>

      {activeHighlight && (
        <div className="fixed top-24 right-8 bg-white shadow-lg border border-gray-300 p-4 rounded-lg w-96 z-50">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-blue-700 font-bold">📝 Highlight</h4>
            <button onClick={() => setActiveHighlight(null)} className="text-gray-400 hover:text-black">✖</button>
          </div>
          <div className="text-sm mb-2">
            <p className="font-medium text-gray-700 mb-1">Comment:</p>
            <p className="bg-blue-50 p-2 rounded text-gray-800">{activeHighlight.comment || <i>No comment</i>}</p>
          </div>
          <div className="text-sm text-gray-600">
            <p className="font-medium">By:</p>
            <p className="italic">{activeHighlight.user?.name || "Unknown"}</p>
          </div>
          {currentUser?.id === activeHighlight.user?._id && (
            <button
              onClick={() => deleteHighlight(activeHighlight.id)}
              className="mt-3 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >Delete</button>
          )}
        </div>
      )}
    </div>
  );
};

export default PdfViewer;
