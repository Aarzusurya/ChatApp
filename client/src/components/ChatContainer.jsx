import { useEffect, useRef, useState, useContext } from "react";
import assets from "../assets/assets";
import { formatMessageTime } from "../lib/utils";
import { ChatContext } from "../context/ChatContext";
import { AuthContext } from "../context/AuthContext";
import toast from "react-hot-toast";

const ChatContainer = () => {
  const {
    messages = [],
    selectedUser,
    setSelectedUser,
    sendMessage,
    getMessages,
  } = useContext(ChatContext);

  const { authUser, onlineUsers = [] } = useContext(AuthContext);

  const scrollRef = useRef(null);
  const [input, setInput] = useState("");

  // 📤 SEND TEXT
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    await sendMessage({ text: input.trim() });
    setInput("");
  };

  // 🖼 SEND IMAGE
  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Select a valid image");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      await sendMessage({ image: reader.result });
      e.target.value = "";
    };

    reader.readAsDataURL(file);
  };

  // 📥 LOAD MESSAGES
  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser]);

  // 🔽 AUTO SCROLL
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 💤 EMPTY STATE
  if (!selectedUser) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 bg-white/10 text-gray-400 max-md:hidden">
        <img src={assets.logo_icon} className="max-w-16" />
        <p className="text-lg font-medium text-white">
          Select a chat to start messaging
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex h-full min-h-0 min-w-0 flex-col overflow-hidden backdrop-blur-lg">
      {/* HEADER */}
      <div className="flex shrink-0 items-center gap-3 border-b border-stone-500 px-3 py-3 sm:px-4">
        <button
          type="button"
          onClick={() => setSelectedUser(null)}
          className="flex size-8 shrink-0 items-center justify-center md:hidden"
          aria-label="Back to chats"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="size-6 text-white"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 18l-6-6 6-6M9 12h12"
            />
          </svg>
        </button>

        <img
          src={selectedUser.profilePic || assets.avatar_icon}
          onError={(event) => {
            event.currentTarget.src = assets.avatar_icon;
          }}
          className="w-9 h-9 rounded-full"
        />

        <div className="flex-1">
          <p className="text-white font-medium flex items-center gap-2">
            {selectedUser.fullName}
            {onlineUsers.includes(selectedUser._id) && (
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
            )}
          </p>
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex min-h-0 flex-1 flex-col space-y-3 overflow-y-auto p-3 sm:p-4">
        {messages.length === 0 && (
          <p className="text-center text-sm text-white/60 mt-10">
            No messages yet. Say hi 👋
          </p>
        )}

        {messages.map((msg, index) => {
          const senderId =
            typeof msg.senderId === "object"
              ? msg.senderId?._id
              : msg.senderId;

          const isMe = senderId === authUser?._id;

          return (
            <div
              key={index}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex items-end gap-2 max-w-[70%] ${
                  isMe ? "flex-row-reverse" : ""
                }`}
              >
                <img
                  src={
                    isMe
                      ? authUser?.profilePic || assets.avatar_icon
                      : selectedUser?.profilePic || assets.avatar_icon
                  }
                  onError={(event) => {
                    event.currentTarget.src = assets.avatar_icon;
                  }}
                  className="w-7 h-7 rounded-full"
                />

                <div>
                  {msg.image ? (
                    <img
                      src={msg.image}
                      className="max-w-[220px] rounded-2xl border border-gray-600"
                    />
                  ) : (
                    <div
                      className={`px-4 py-2 text-sm text-white rounded-2xl break-words ${
                        isMe
                          ? "bg-violet-600 rounded-br-sm"
                          : "bg-gray-700 rounded-bl-sm"
                      }`}
                    >
                      {msg.text}
                    </div>
                  )}

                  <p
                    className={`text-[10px] mt-1 text-gray-400 ${
                      isMe ? "text-right" : "text-left"
                    }`}
                  >
                    {formatMessageTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        <div ref={scrollRef} />
      </div>

      {/* INPUT */}
      <form
        onSubmit={handleSendMessage}
        className="flex shrink-0 gap-2 bg-black/20 p-2 sm:gap-3 sm:p-3"
      >
        <div className="flex-1 flex items-center bg-gray-100/10 px-4 rounded-full">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Send a message"
            className="min-w-0 flex-1 bg-transparent py-3 text-sm text-white outline-none placeholder-gray-400"
          />

          <input
            type="file"
            id="image"
            hidden
            accept="image/*"
            onChange={handleSendImage}
          />

          <label htmlFor="image">
            <img src={assets.gallery_icon} className="w-5 cursor-pointer" />
          </label>
        </div>

        <button type="submit">
          <img src={assets.send_button} className="w-8 cursor-pointer" />
        </button>
      </form>
    </div>
  );
};

export default ChatContainer;
