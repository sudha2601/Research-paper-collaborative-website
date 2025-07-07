import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import UserHeader from './UserHeader';
import GroupList from './GroupList';
import Creategroup from './Creategroup';
import { io } from 'socket.io-client';

const backgroundStyle = {
  minHeight: '100vh',
  width: '100%',
  backgroundImage: `
    linear-gradient(rgba(255,255,255,0.65), rgba(255,255,255,0.65)),
    url("https://images.pexels.com/photos/1925536/pexels-photo-1925536.jpeg?cs=srgb&dl=pexels-lilartsy-1925536.jpg&fm=jpg")
  `,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
};

const modalOverlayStyle = {
  position: 'fixed',
  inset: 0,
  zIndex: 50,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(0,0,0,0.35)',
  backdropFilter: 'blur(2px)',
};

const modalCardStyle = {
  background: 'rgba(255,255,255,0.97)',
  borderRadius: '1.25rem',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
  padding: '0',
  width: '100%',
  maxWidth: '420px',
  position: 'relative',
  margin: '0 16px',
  overflow: 'hidden',
  animation: 'slideUp 0.3s cubic-bezier(.4,0,.2,1)',
};

const closeBtnStyle = {
  position: 'absolute',
  top: 18,
  right: 22,
  color: '#a1a1aa',
  fontWeight: 'bold',
  fontSize: 24,
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  zIndex: 2,
  transition: 'color 0.2s',
};

const User = () => {
  const [groups, setGroups] = useState([]);
  const [showGroups, setShowGroups] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const socketRef = useRef(null);

  // Fetch user info and notifications
  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) return;
      try {
        const [userRes, inviteRes] = await Promise.all([
          axios.get('http://localhost:5000/api/user', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:5000/api/invites/pending', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setUser(userRes.data.user);
        setNotifications(inviteRes.data);
      } catch (err) {
        setUser(null);
        setNotifications([]);
      }
    };
    fetchUserData();
  }, [token]);

  // Fetch groups (always up-to-date)
  const fetchGroups = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/groups/my', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroups(res.data);
    } catch (err) {
      setGroups([]);
    }
  }, [token]);

  // Fetch groups on mount and when token changes
  useEffect(() => {
    if (token) fetchGroups();
  }, [token, fetchGroups]);

  // Fetch invites (for bell)
  const fetchInvites = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/invites/pending', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data);
    } catch (err) {
      setNotifications([]);
    }
  }, [token]);

  // Accept invite (update state in User.jsx)
  const acceptInvite = async (inviteId) => {
    try {
      await axios.post(`http://localhost:5000/api/invites/accept/${inviteId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchInvites();
      await fetchGroups();
    } catch (err) {
      // Optionally handle error
    }
  };

  // Reject invite (update state in User.jsx)
  const rejectInvite = async (inviteId) => {
    try {
      await axios.post(`http://localhost:5000/api/invites/reject/${inviteId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchInvites();
    } catch (err) {
      // Optionally handle error
    }
  };

  // --- FIX: Always connect socket on mount, not after user is set ---
  useEffect(() => {
    if (socketRef.current) return; // Prevent multiple connections
    const socket = io('http://localhost:5000');
    socketRef.current = socket;

    socket.on('refreshData', () => {
      console.log('refreshData received');
      fetchGroups();
      fetchInvites();
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [fetchGroups, fetchInvites]);
  // --- END FIX ---

  const handleDelete = (deletedId) => {
    setGroups((prev) => prev.filter((g) => g._id !== deletedId));
  };

  return (
    <div style={backgroundStyle}>
      <UserHeader
        fetchGroups={fetchGroups}
        notifications={notifications}
        fetchInvites={fetchInvites}
        user={user}
        acceptInvite={acceptInvite}
        rejectInvite={rejectInvite}
      />

      <div className="flex flex-col md:flex-row items-start justify-center gap-10 px-4 py-10 max-w-7xl mx-auto">
        <div className="flex-1 w-full md:w-2/3">
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <button
              onClick={() => setShowGroups(!showGroups)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-sm font-medium transition cursor-pointer"
            >
              {showGroups ? 'Hide Groups' : 'Show Groups'}
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-lg font-medium transition cursor-pointer"
            >
              ＋ Create Group
            </button>
          </div>

          {/* Always render GroupList, just hide/show visually */}
          <div
            className={`transition-all duration-500 ${
              showGroups
                ? 'opacity-100 max-h-[2000px] scale-100'
                : 'opacity-0 max-h-0 scale-95 pointer-events-none'
            } origin-top overflow-hidden`}
          >
            <GroupList groups={groups} onDelete={handleDelete} userId={user?.id || user?._id} />
          </div>
        </div>

        {showCreate && (
          <div style={modalOverlayStyle}>
            <div style={modalCardStyle}>
              <button
                onClick={() => setShowCreate(false)}
                style={closeBtnStyle}
                onMouseOver={e => (e.currentTarget.style.color = '#ef4444')}
                onMouseOut={e => (e.currentTarget.style.color = '#a1a1aa')}
                title="Close"
                className="cursor-pointer"
              >
                ×
              </button>
              <div className="p-0 md:p-0">
                <Creategroup
                  onGroupChange={() => {
                    fetchGroups();
                    setShowCreate(false);
                  }}
                />
              </div>
            </div>
            <style>
              {`
                @keyframes slideUp {
                  from { opacity: 0; transform: translateY(32px);}
                  to { opacity: 1; transform: translateY(0);}
                }
              `}
            </style>
          </div>
        )}
      </div>
    </div>
  );
};

export default User;
