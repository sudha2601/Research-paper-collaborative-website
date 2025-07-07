import React, { useState, useCallback } from 'react';
import axios from 'axios';
import _ from 'lodash';
import { XCircle } from 'lucide-react';

const Creategroup = ({ onGroupChange }) => {
  const [form, setForm] = useState({ name: '', description: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  const token = localStorage.getItem('token');
  const authHeader = { Authorization: `Bearer ${token}` };

  const debouncedSearch = useCallback(
    _.debounce(async (query) => {
      if (!query) return;
      setLoading(true);
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/invites/search?query=${query}`, {
          headers: authHeader,
        });
        setSearchResults(res.data);
        setError(res.data.length === 0 ? 'No users found with this Gmail.' : '');
      } catch (err) {
        setError('Search failed. Please try again.');
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearch(value);
  };

  const toggleUser = (user) => {
    const exists = selectedUsers.some((u) => u._id === user._id);
    if (exists) {
      setSelectedUsers((prev) => prev.filter((u) => u._id !== user._id));
    } else {
      setSelectedUsers((prev) => [...prev, user]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) return setError('Group name is required.');
    if (selectedUsers.length === 0) return setError('Select at least one valid user.');

    setCreating(true);
    try {
      const groupRes = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/groups/create`,
        { name: form.name, description: form.description },
        { headers: authHeader }
      );

      const group = groupRes.data;

      await Promise.all(
        selectedUsers.map((user) =>
          axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/api/invites/send`,
            { groupId: group._id, toUserId: user._id },
            { headers: authHeader }
          )
        )
      );

      alert('Group created and invites sent!');
      setForm({ name: '', description: '' });
      setSearchQuery('');
      setSearchResults([]);
      setSelectedUsers([]);
      if (onGroupChange) onGroupChange();
    } catch (err) {
      setError('Group creation failed. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-lg w-full mx-auto mt-4 p-6 rounded-2xl border-0 shadow-xl bg-gradient-to-br from-indigo-50 to-white">
      <h2 className="text-2xl font-extrabold text-indigo-700 mb-6 text-center tracking-tight">
        <span className="inline-block bg-gradient-to-r from-indigo-600 to-purple-500 text-transparent bg-clip-text">
          Create a New Group
        </span>
      </h2>

      {error && (
        <div className="mb-4 text-sm text-red-700 bg-red-100 border border-red-200 p-3 rounded-lg flex items-center gap-2">
          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path d="M12 8v4m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-indigo-700 mb-2">Group Name</label>
          <input
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter group name"
            className="w-full p-3 border-0 rounded-xl shadow focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white/80 text-gray-900"
            required
            
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-indigo-700 mb-2">Group Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Optional description"
            rows={2}
            className="w-full p-3 border-0 rounded-xl shadow focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white/80 text-gray-900 resize-none"
            
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-indigo-700 mb-2">Invite Members</label>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search by Gmail"
            className="w-full p-3 border-0 rounded-xl shadow focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white/80 text-gray-900"
            
          />
          {loading && (
            <div className="text-xs text-indigo-500 mt-2">Searching...</div>
          )}
        </div>

        {/* Limit dropdown to max 3 results */}
        {searchResults.length > 0 && (
          <div className="space-y-2 mt-2 max-h-40 overflow-y-auto rounded-lg bg-white/90 shadow-inner border border-indigo-100 p-2">
            {searchResults.slice(0, 3).map((user) => (
              <div
                key={user._id}
                onClick={() => toggleUser(user)}
                className={`cursor-pointer px-4 py-2 rounded-lg transition font-medium flex items-center gap-2 ${
                  selectedUsers.some((u) => u._id === user._id)
                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                    : 'bg-gray-50 hover:bg-indigo-50 text-gray-700 border border-transparent'
                }`}
               
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 16v-4m0-4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                {user.gmail}
                {selectedUsers.some((u) => u._id === user._id) && (
                  <span className="ml-auto text-xs text-indigo-500 font-semibold">Selected</span>
                )}
              </div>
            ))}
          </div>
        )}

        {selectedUsers.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-semibold text-indigo-700 mb-2">Selected Members:</p>
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center gap-2 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 px-4 py-1 rounded-full text-sm shadow"
                  style={{ cursor: 'pointer' }}
                >
                  {user.gmail}
                  <button
                    type="button"
                    onClick={() => toggleUser(user)}
                    className="hover:text-red-500 transition cursor-pointer"
                  >
                    <XCircle size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={creating}
          className={`w-full py-3 rounded-xl font-bold text-lg shadow transition
            ${creating
              ? 'bg-indigo-300 text-white cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-600 to-purple-500 text-white hover:from-indigo-700 hover:to-purple-600'
            }`}
          style={{ cursor: creating ? 'not-allowed' : 'pointer' }}
        >
          {creating ? 'Creating...' : 'Create Group'}
        </button>
      </form>
    </div>
  );
};

export default Creategroup;