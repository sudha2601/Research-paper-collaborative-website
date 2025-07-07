import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import PdfUploader from './PdfUploader';
import PdfList from './PdfList';
import PdfViewer from './PdfViewer';
import UserHeader from './UserHeader';
import { io } from 'socket.io-client';
import Chat from './Chat';

const Maingroup = () => {
  const { groupId } = useParams();
  const fileInputRef = useRef();
  const [selectedFile, setSelectedFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState('');
  const [title, setTitle] = useState('');
  const [numPages, setNumPages] = useState(null);
  const [pdfs, setPdfs] = useState([]);
  const [selectedPdfId, setSelectedPdfId] = useState(null);
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(false); // <-- Chat toggle state
  const socketRef = useRef(null);

  useEffect(() => {
    const fetchGroupName = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/groups/${groupId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setGroupName(res.data.name || 'Group');
      } catch (err) {
        setGroupName('Group');
      }
    };
    fetchGroupName();
  }, [groupId]);

  const fetchPdfs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/pdf/group/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPdfs(res.data);
    } catch (err) {
      setPdfs([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (socketRef.current) return;
    const socket = io(import.meta.env.VITE_BACKEND_URL);
    socketRef.current = socket;

    socket.on('refreshData', () => {
      fetchPdfs();
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [fetchPdfs]);

  useEffect(() => {
    fetchPdfs();
    // eslint-disable-next-line
  }, [groupId]);

  const getUserId = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('No token found, please login.');
      return null;
    }
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/user`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return res.data.user?._id || res.data.user?.id;
    } catch (err) {
      alert('Unable to fetch user info');
      return null;
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !title) {
      alert('Please select a PDF file and enter a title.');
      return;
    }
    if (pdfs.length >= 3) {
      alert('Only 3 PDFs allowed per group');
      return;
    }
    const userId = await getUserId();
    if (!userId) return;
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', title);
    formData.append('groupId', groupId);
    formData.append('userId', userId);
    const token = localStorage.getItem('token');
    setLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/pdf/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      setPdfUrl(res.data.pdfUrl);
      setSelectedPdfId(res.data._id);
      fetchPdfs();
      alert('PDF uploaded successfully!');
    } catch (err) {
      alert('Upload failed');
    }
    setLoading(false);
  };

  const handleDelete = async (pdfId) => {
    if (!window.confirm('Are you sure you want to delete this PDF?')) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/pdf/${pdfId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPdfs();
      if (selectedPdfId === pdfId) {
        setPdfUrl('');
        setSelectedPdfId(null);
      }
    } catch (err) {
      alert('Failed to delete PDF.');
    }
    setLoading(false);
  };

  const handleSelectPdf = (pdf) => {
    setPdfUrl(pdf.pdfUrl);
    setSelectedPdfId(pdf._id);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
        {/* Loading Bar */}
        {loading && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: 4,
            background: 'linear-gradient(90deg, #6366f1 0%, #60a5fa 100%)',
            zIndex: 1000,
            animation: 'loading-bar 1s linear infinite'
          }}>
            <style>
              {`
                @keyframes loading-bar {
                  0% { left: -100%; width: 100%; }
                  50% { left: 0; width: 100%; }
                  100% { left: 100%; width: 10%; }
                }
              `}
            </style>
          </div>
        )}

        {/* Navbar */}
        <nav className="flex items-center justify-between px-8 py-4 bg-white shadow-md sticky top-0 z-40">
          <div className="flex items-center gap-6">
            <UserHeader hideLogo />
            <div className="ml-8 flex items-center gap-2">
              <span className="text-lg font-semibold text-indigo-700">Group:</span>
              <span className="text-lg font-bold text-indigo-900">{groupName}</span>
            </div>
          </div>
        </nav>

        <div className="p-6 max-w-7xl mx-auto mt-8">
          <div className="flex flex-col md:flex-row gap-10">
            {/* Left: Uploader and List */}
            <div className="w-[340px] min-w-[280px] max-w-[380px]">
              <div className="mb-8 bg-white/90 rounded-2xl shadow p-6">
                <PdfUploader
                  fileInputRef={fileInputRef}
                  selectedFile={selectedFile}
                  title={title}
                  setTitle={setTitle}
                  handleFileChange={(e) => setSelectedFile(e.target.files[0])}
                  handleUpload={handleUpload}
                  pdfs={pdfs}
                />
              </div>
              <div className="bg-white/90 rounded-2xl shadow p-6 mt-6">
                <PdfList
                  pdfs={pdfs}
                  onSelect={handleSelectPdf}
                  onDelete={handleDelete}
                  selectedPdfId={selectedPdfId}
                />
              </div>
            </div>
            {/* Right: PDF Viewer + Chat Side by Side */}
            <div className="flex-1 flex flex-col items-end">
              <button
                className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded shadow hover:bg-indigo-700 transition self-end"
                onClick={() => setShowChat((prev) => !prev)}
              >
                {showChat ? "Hide Chat" : "Show Chat"}
              </button>
              <div className="flex-1 w-full flex flex-row gap-6">
                <div className="flex-1 flex flex-col items-center">
                  {pdfUrl ? (
                    <PdfViewer
                      key={selectedPdfId}
                      pdfUrl={pdfUrl}
                      pdfId={selectedPdfId}
                      numPages={numPages}
                      setNumPages={setNumPages}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <svg width="80" height="80" fill="none" viewBox="0 0 24 24" className="mb-4">
                        <rect x="3" y="6" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                        <path d="M3 10h18" stroke="currentColor" strokeWidth="2" />
                        <path d="M7 14h2v2H7zM11 14h2v2h-2zM15 14h2v2h-2z" fill="currentColor" />
                      </svg>
                      <span className="text-lg">Select a PDF to preview</span>
                    </div>
                  )}
                </div>
                {showChat && (
                  <div className="w-[350px] min-w-[260px] max-w-[400px] bg-white/90 rounded-2xl shadow p-4 flex flex-col h-[70vh]">
                    <Chat getUserId={getUserId} groupId={groupId} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <style>{`
          button, .cursor-pointer {
            cursor: pointer;
          }
        `}</style>
      </div>
    </>
  );
};

export default Maingroup;