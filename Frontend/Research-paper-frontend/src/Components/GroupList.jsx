import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Trash2 } from 'lucide-react';

const GroupList = ({ groups, onDelete, userId }) => {
  const navigate = useNavigate();

  const handleDelete = async (groupId) => {
    if (!window.confirm('Are you sure you want to delete this group?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/groups/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (onDelete) onDelete(groupId);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete group.');
    }
  };

  const isOwner = (group, userId) => {
    if (!group.createdBy || !userId) return false;
    if (typeof group.createdBy === 'object' && group.createdBy._id) {
      return group.createdBy._id === userId;
    }
    return group.createdBy === userId;
  };

  if (!groups || groups.length === 0) {
    return (
      <div className="text-center text-gray-700 mt-16">
        <h2 className="text-2xl font-semibold mb-2">No Groups Available</h2>
        <p className="text-gray-500">Use "Create Group" to start collaborating.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {groups.map((group) => (
        <div
          key={group._id}
          className="relative bg-white border border-gray-200 shadow-sm rounded-xl p-6 hover:shadow-md transition duration-300 cursor-pointer"
        >
          {isOwner(group, userId) && (
            <button
              onClick={() => handleDelete(group._id)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 cursor-pointer"
            >
              <Trash2 size={18} />
            </button>
          )}

          <div
            onClick={() => navigate(`/group/${group._id}`)}
            className="cursor-pointer"
          >
            <h3 className="text-lg font-semibold mb-1 text-gray-900">{group.name}</h3>
            <p className="text-sm text-gray-500 mb-4">
              Created: {new Date(group.createdAt || Date.now()).toLocaleDateString()}
            </p>
            <div className="flex flex-wrap gap-2">
              {group.members?.length ? (
                group.members.map((member, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full"
                  >
                    {typeof member === 'object' && member.name
                      ? member.name
                      : typeof member === 'string'
                        ? member
                        : 'Unknown'}
                  </span>
                ))
              ) : (
                <span className="text-xs italic text-gray-400">No members</span>
              )}
            </div>
            <div className="text-sm mt-4 text-blue-600 hover:underline cursor-pointer">
              View details →
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GroupList;
