import { useContext, useEffect, useRef, useState } from "react";
import assets from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";

const Sidebar = () => {
  const navigate = useNavigate();
  const sidebarRef = useRef(null);

  const {
    users = [],
    getUsers,
    getMessages,
    selectedUser,
    setSelectedUser,
    unseenMessages = {},
    deleteChatUser,
  } = useContext(ChatContext);

  const { logout, onlineUsers = [], authUser } =
    useContext(AuthContext);

  const [input, setInput] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState({
    show: false,
    x: 0,
    y: 0,
    user: null,
  });

  /* 🔄 LOAD USERS WHEN USER READY */
  useEffect(() => {
    if (authUser) {
      getUsers();
    }
  }, [authUser]);

  /* ❌ CLOSE RIGHT CLICK MENU */
  useEffect(() => {
    const close = () =>
      setContextMenu({ show: false, x: 0, y: 0, user: null });

    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  /* 🔍 SEARCH FILTER */
  const filteredUsers = input
    ? users.filter((u) =>
        u.fullName?.toLowerCase().includes(input.toLowerCase())
      )
    : users;

  /* 👉 SELECT USER */
  const handleSelectUser = (user) => {
    setSelectedUser(user);
    getMessages(user._id); // 🔥 load messages
    setMenuOpen(false);
  };

  /* 👉 RIGHT CLICK HANDLER */
  const handleRightClick = (e, user) => {
    e.preventDefault();
    if (!sidebarRef.current) return;

    const rect = sidebarRef.current.getBoundingClientRect();

    setContextMenu({
      show: true,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top + sidebarRef.current.scrollTop,
      user,
    });
  };

  return (
    <div
      ref={sidebarRef}
      className="relative bg-[#8185B2]/10 h-full p-5 text-white overflow-y-auto"
    >
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <img src={assets.logo} className="max-w-36" alt="logo" />

        <div className="relative">
          <img
            src={assets.menu_icon}
            className="w-5 cursor-pointer"
            onClick={() => setMenuOpen((p) => !p)}
            alt="menu"
          />

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-32 bg-[#282142] p-3 rounded-md border border-gray-600 z-50">
              <p
                onClick={() => navigate("/profile")}
                className="text-sm cursor-pointer hover:text-violet-400"
              >
                Edit Profile
              </p>
              <hr className="my-2 border-gray-600" />
              <p
                onClick={logout}
                className="text-sm cursor-pointer hover:text-red-400"
              >
                Logout
              </p>
            </div>
          )}
        </div>
      </div>

      {/* SEARCH */}
      <div className="flex items-center gap-2 bg-[#282142] rounded-full px-4 py-2 mt-4">
        <img src={assets.search_icon} className="w-3" alt="search" />
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="bg-transparent outline-none text-xs flex-1"
          placeholder="Search user..."
        />
      </div>

      {/* USERS */}
      <div className="mt-4 flex flex-col gap-1">
        {filteredUsers.length === 0 ? (
          <p className="text-center text-xs text-white/60 mt-10">
            No chats yet
          </p>
        ) : (
          filteredUsers.map((user) => {
            const isOnline = onlineUsers.includes(user._id);
            const unseen = unseenMessages[user._id] || 0;

            return (
              <div
                key={user._id}
                onClick={() => handleSelectUser(user)}
                onContextMenu={(e) => handleRightClick(e, user)}
                className={`flex items-center gap-3 p-2 rounded cursor-pointer transition ${
                  selectedUser?._id === user._id
                    ? "bg-[#282142]/60"
                    : "hover:bg-[#282142]/40"
                }`}
              >
                <div className="relative">
                  <img
                    src={user.profilePic || assets.avatar_icon}
                    className="w-9 h-9 rounded-full object-cover"
                    alt={user.fullName}
                  />
                  {isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#282142] rounded-full" />
                  )}
                </div>

                <div className="flex-1">
                  <p className="text-sm">{user.fullName}</p>
                  <span
                    className={`text-xs ${
                      isOnline ? "text-green-400" : "text-gray-400"
                    }`}
                  >
                    {isOnline ? "Online" : "Offline"}
                  </span>
                </div>

                {unseen > 0 && (
                  <span className="bg-violet-500/70 text-xs px-2 rounded-full">
                    {unseen}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* RIGHT CLICK MENU */}
      {contextMenu.show && (
        <div
          className="absolute bg-[#1f1f1f] border border-gray-600 rounded-md z-50"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <p
            onClick={() => {
              deleteChatUser(contextMenu.user._id);
              setContextMenu({
                show: false,
                x: 0,
                y: 0,
                user: null,
              });
            }}
            className="px-4 py-2 text-red-400 cursor-pointer hover:bg-[#333]"
          >
            Delete chat
          </p>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
