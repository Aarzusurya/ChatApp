import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});

  const { socket, authUser, token } = useContext(AuthContext);

  /* ================= GET SIDEBAR USERS ================= */
  const getUsers = async () => {
    if (!authUser || !token) return;

    try {
      const { data } = await axios.get("/api/messages/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data?.success) {
        setUsers(data.users || []);
        setUnseenMessages(data.unseenMessages || {});
      }
    } catch (error) {
      console.error("Fetch sidebar users error:", error);
    }
  };

  useEffect(() => {
    getUsers(); // ✅ safe because token restored before this
  }, [authUser, token]);

  /* ================= GET MESSAGES ================= */
  const getMessages = async (userId) => {
    if (!authUser || !token || !userId) return;

    try {
      const { data } = await axios.get(`/api/messages/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(data?.messages || []);
    } catch {
      setMessages([]);
    }
  };

  /* ================= SEND MESSAGE ================= */
  const sendMessage = async (messageData) => {
    if (!selectedUser || !authUser || !token) return;

    try {
      const { data } = await axios.post(
        "/api/messages/send",
        {
          receiverId: selectedUser._id,
          ...messageData,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data?.newMessage) {
        setMessages((prev) => [...prev, data.newMessage]);
        getUsers(); // Refresh sidebar
      }
    } catch {
      toast.error("Failed to send message");
    }
  };

  /* ================= LOAD MESSAGES ================= */
  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);

      setUnseenMessages((prev) => {
        const copy = { ...prev };
        delete copy[selectedUser._id];
        return copy;
      });
    }
  }, [selectedUser]);

  /* ================= SOCKET LISTENER ================= */
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      if (!msg) return;

      if (selectedUser && msg.senderId === selectedUser._id) {
        setMessages((prev) => [...prev, msg]);
      } else {
        setUnseenMessages((prev) => ({
          ...prev,
          [msg.senderId]: (prev[msg.senderId] || 0) + 1,
        }));
        getUsers(); // refresh sidebar
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => socket.off("newMessage", handleNewMessage);
  }, [socket, selectedUser]);

  /* ================= DELETE CHAT ================= */
  const deleteChatUser = async (userId) => {
    if (!authUser || !token) return;

    try {
      await axios.delete(`/api/messages/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await getUsers(); // refresh sidebar

      setUnseenMessages((prev) => {
        const copy = { ...prev };
        delete copy[userId];
        return copy;
      });

      if (selectedUser?._id === userId) {
        setSelectedUser(null);
        setMessages([]);
      }

      toast.success("Chat deleted permanently");
    } catch {
      toast.error("Failed to delete chat");
    }
  };

  return (
    <ChatContext.Provider
      value={{
        users,
        messages,
        selectedUser,
        setSelectedUser,
        unseenMessages,
        getUsers,
        getMessages,
        sendMessage,
        deleteChatUser,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
