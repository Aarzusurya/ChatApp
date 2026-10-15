import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import assets from "../assets/assets";

const UserSearch = ({ onSelectUser }) => {
  const { authUser, token } = useContext(AuthContext);

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!authUser || !token || !search.trim()) {
        setUsers([]);
        return;
      }

      try {
        setLoading(true);

        const { data } = await axios.get(
          `/api/user/all?search=${encodeURIComponent(search.trim())}`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // ✅ send valid token
            },
          }
        );

        if (data?.success) {
          setUsers(data.users || []);
        } else {
          setUsers([]);
        }
      } catch (err) {
        console.error("Failed to fetch users", err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [authUser, token, search]);

  return (
    <div className="p-2">
      {/* SEARCH INPUT */}
      <input
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border p-2 rounded w-full mb-2 outline-none focus:ring-1 focus:ring-violet-500"
      />

      {/* RESULTS */}
      {loading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : users.length === 0 ? (
        <p className="text-gray-400 text-sm">No users found</p>
      ) : (
        <ul className="max-h-32 overflow-y-auto">
          {users.map((user) => (
            <li
              key={user._id}
              onClick={() => onSelectUser(user)}
              className="flex cursor-pointer items-center gap-2 rounded p-2 text-white transition-colors hover:bg-violet-500/30 hover:text-white focus-within:bg-violet-500/30"
            >
              <img
                src={user.profilePic || assets.avatar_icon}
                onError={(event) => {
                  event.currentTarget.src = assets.avatar_icon;
                }}
                alt={user.fullName}
                className="w-8 h-8 rounded-full object-cover"
              />
              <span>{user.fullName}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserSearch;
