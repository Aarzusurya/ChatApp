import { useContext } from "react";
import assets from "../assets/assets";
import { ChatContext } from "../context/ChatContext";
import { AuthContext } from "../context/AuthContext";

const RightSidebar = ({ selectedUser }) => {
  const { messages } = useContext(ChatContext);
  const { logout } = useContext(AuthContext);

  if (!selectedUser) return null;

  // ✅ FIXED MEDIA FILTER
  const mediaMessages = messages.filter((msg) => msg.image);

  return (
    <div className="bg-[#8185B2]/10 text-white w-full h-full relative overflow-y-auto max-md:hidden">
      {/* USER INFO */}
      <div className="pt-16 flex flex-col items-center gap-2 text-xs font-light">
        <img
          src={selectedUser.profilePic || assets.avatar_icon}
          className="w-20 h-20 rounded-full object-cover"
        />

        <h1 className="text-xl font-medium flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          {selectedUser.fullName}
        </h1>

        <p className="px-6 text-white/70 text-center">
          {selectedUser.bio || "Hey there! I am using ChatApp"}
        </p>
      </div>

      <hr className="border-white/30 my-4" />

      {/* MEDIA */}
      <div className="px-5 text-xs">
        <p className="mb-2">Media</p>

        {mediaMessages.length === 0 ? (
          <p className="text-white/60 text-center">No media shared</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 max-h-[220px] overflow-y-auto">
            {mediaMessages.map((msg, i) => (
              <img
                key={i}
                src={msg.image}
                onClick={() => window.open(msg.image, "_blank")}
                className="rounded-md w-full h-24 object-cover cursor-pointer"
              />
            ))}
          </div>
        )}
      </div>

      {/* LOGOUT */}
      <button
        onClick={logout}
        className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-400 to-violet-600 py-2 px-16 rounded-full text-sm"
      >
        Logout
      </button>
    </div>
  );
};

export default RightSidebar;
