import React from 'react';
import { useNavigate } from 'react-router-dom';

const UserHeader = ({
  fetchGroups,
  notifications,
  fetchInvites,
  user,
  acceptInvite,
  rejectInvite,
}) => {
  const navigate = useNavigate();
  notifications = Array.isArray(notifications) ? notifications : [];

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <header className="flex justify-between items-center px-6 py-4 bg-white shadow">
      {/* Logo */}
      <div onClick={() => navigate('/')} className="text-2xl font-bold text-indigo-600 cursor-pointer">
        easy<span className="text-gray-500 font-normal">re</span>search
      </div>

      <div className="flex items-center gap-6">
        {/* Notifications */}
        <div className="relative group cursor-pointer">
          <span className="text-xl">🔔</span>
          {notifications && notifications.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1">
              {notifications.length}
            </span>
          )}
          <div className="absolute top-8 right-0 bg-white shadow-lg rounded-md w-64 p-3 opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all z-50">
            <p className="font-semibold mb-2">Invites:</p>
            {!notifications || notifications.length === 0 ? (
              <p className="text-gray-500 text-sm">No invites</p>
            ) : (
              notifications.map((invite) => (
                <div key={invite._id} className="mb-2">
                  <p className="text-sm">
                    <b>{invite.fromUser?.name || "Someone"}</b> invited you to <b>{invite.group?.name || "a group"}</b>
                  </p>
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={() => acceptInvite(invite._id)}
                      className="text-green-600 text-sm hover:underline cursor-pointer"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => rejectInvite(invite._id)}
                      className="text-red-600 text-sm hover:underline cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* User Info */}
        {user && (
          <div className="relative group cursor-pointer">
            <div className="flex items-center gap-2">
              <img
                src={user.picture || `https://ui-avatars.com/api/?name=${user.name}`}
                alt="Profile"
                className="w-9 h-9 rounded-full object-cover border-2 border-indigo-400"
              />
              <span className="text-sm font-semibold text-gray-700">{user.name}</span>
            </div>
            <div className="absolute top-12 right-0 bg-white border rounded shadow p-2 w-32 opacity-0 group-hover:opacity-100 group-hover:visible transition-all z-10 invisible">
              <button
                onClick={handleLogout}
                className="block w-full text-left text-sm text-red-500 hover:text-red-700 hover:bg-gray-100 px-2 py-1 rounded"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default UserHeader;
