import React, { useState } from 'react'
import axios from 'axios'

const InviteSection = ({ groups, selectedGroup, setSelectedGroup, token }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])

  const authHeader = { Authorization: `Bearer ${token}` }

  const handleSearch = async (query) => {
    if (query.length < 2 || !selectedGroup) return
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/invites/search?query=${query}`,
        { headers: authHeader }
      )
      setSearchResults(res.data)
    } catch (err) {
      console.error('Search failed', err)
    }
  }

  const sendInvite = async (toUserId) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/invites/send`,
        { toUserId, groupId: selectedGroup },
        { headers: authHeader }
      )
      alert('Invite sent!')
      setSearchQuery('')
      setSearchResults([])
    } catch (err) {
      console.error('Failed to send invite', err)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <label className="block font-semibold mb-1">Select Group to Invite Into:</label>
        <select
          value={selectedGroup || ''}
          onChange={(e) => setSelectedGroup(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">-- Select Group --</option>
          {groups.map((g) => (
            <option key={g._id} value={g._id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <label className="block font-semibold mb-1">Search User by Gmail:</label>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            const value = e.target.value
            setSearchQuery(value)
            handleSearch(value)
          }}
          placeholder="Enter Gmail..."
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="grid gap-2">
        {searchResults && searchResults.length > 0 ? (
          searchResults.map((u) => (
            <div key={u._id} className="flex justify-between items-center p-2 bg-white rounded shadow">
              <span>{u.gmail}</span>
              <button
                onClick={() => sendInvite(u._id)}
                className="bg-indigo-500 text-white px-3 py-1 rounded text-sm hover:bg-indigo-600"
              >
                Invite
              </button>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">No users found</p>
        )}
      </div>
    </div>
  )
}

export default InviteSection
