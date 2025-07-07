import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { FaSmile } from 'react-icons/fa';

const socket = io('http://localhost:5000');

const Chat = ({ groupId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isSomeoneTyping, setIsSomeoneTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/user', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsername(res.data.user.name);
      } catch (err) {
        console.error('Failed to fetch user', err);
      }
    };
    fetchUser();
  }, []);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/api/chat/getchat`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { groupID: groupId },
      });
      const sorted = response.data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      setMessages(sorted);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !username.trim()) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/chat/add',
        { text: input, createdBy: username, groupID: groupId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setInput('');
      socket.emit('stopTyping', groupId);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    socket.on('receiveMessage', fetchMessages);
    socket.on('userTyping', () => setIsSomeoneTyping(true));
    socket.on('stopTyping', () => setIsSomeoneTyping(false));
    return () => {
      socket.off('receiveMessage');
      socket.off('userTyping');
      socket.off('stopTyping');
    };
  }, [groupId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleTyping = (e) => {
    setInput(e.target.value);
    if (!typing) {
      setTyping(true);
      socket.emit('userTyping', groupId);
    }
    clearTimeout(window.typingTimeout);
    window.typingTimeout = setTimeout(() => {
      setTyping(false);
      socket.emit('stopTyping', groupId);
    }, 1000);
  };

  const formatDateHeader = (dateStr) => {
    const today = new Date();
    const messageDate = new Date(dateStr);
    if (today.toDateString() === messageDate.toDateString()) return 'Today';
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (yesterday.toDateString() === messageDate.toDateString()) return 'Yesterday';
    return messageDate.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
  };

  let lastDate = '';

  return (
    <div className="mt-6 max-w-3xl mx-auto p-4 bg-white rounded-xl shadow-xl flex flex-col h-[600px] border border-gray-200">
      <h2 className="text-2xl font-semibold text-center mb-4 text-gray-800">Group Chat</h2>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 rounded-lg">
        {messages.length === 0 ? (
          <p className="text-gray-400 text-center">No messages yet.</p>
        ) : (
          messages.map((msg, idx) => {
            const isCurrentUser = msg.createdBy === username;
            const currentDate = new Date(msg.createdAt).toDateString();
            const showDateHeader = currentDate !== lastDate;
            lastDate = currentDate;
            return (
              <React.Fragment key={idx}>
                {showDateHeader && (
                  <div className="text-center text-xs text-gray-500 my-2">
                    {formatDateHeader(msg.createdAt)}
                  </div>
                )}
                <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-xs sm:max-w-sm p-3 rounded-xl shadow-md ${
                      isCurrentUser
                        ? 'bg-gradient-to-br from-[#4facfe] to-[#00f2fe] text-white rounded-br-none'
                        : 'bg-gradient-to-br from-[#fdfbfb] to-[#ebedee] text-gray-800 rounded-bl-none'
                    }`}
                  >
                    <div className="text-xs font-semibold mb-1">{msg.createdBy}</div>
                    <div className="text-sm whitespace-pre-wrap break-words">{msg.text}</div>
                    <div className="text-[10px] text-right mt-1 opacity-70">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      |{' '}
                      {new Date(msg.createdAt).toLocaleDateString([], {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })
        )}
        {isSomeoneTyping && (
          <div className="text-xs text-gray-400 italic">Someone is typing...</div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex mt-4 gap-2 items-center">
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
          value={input}
          onChange={handleTyping}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button
          className="bg-indigo-600 hover:bg-indigo-700 transition text-white px-5 py-2 rounded-full shadow disabled:opacity-50"
          onClick={sendMessage}
          disabled={loading || !input.trim()}
        >
          Send
        </button>
        <button className="text-indigo-500 text-xl hover:text-indigo-700">
          <FaSmile />
        </button>
      </div>
    </div>
  );
};

export default Chat;
