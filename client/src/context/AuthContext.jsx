import { createContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [token, setToken] = useState(null);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  axios.defaults.baseURL = backendUrl;

  // ✅ Restore user + token from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("authUser");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      setAuthUser(JSON.parse(storedUser));
      setToken(storedToken);
      axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
    }

    setLoading(false);
  }, []);

  // ================= LOGIN / SIGNUP =================
  const login = async (type, credentials) => {
    try {
      const { data } = await axios.post(`/api/user/${type}`, credentials);

      if (!data.success) {
        toast.error(data.message);
        return false;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("authUser", JSON.stringify(data.userData));

      axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;

      setAuthUser(data.userData);
      setToken(data.token);

      toast.success(data.message);
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Authentication failed");
      return false;
    }
  };

  // ================= UPDATE PROFILE =================
  const updateProfile = async (formData) => {
    try {
      const { data } = await axios.put("/api/user/update-profile", formData);
      if (!data.success) {
        toast.error(data.message);
        return false;
      }

      setAuthUser(data.user);
      localStorage.setItem("authUser", JSON.stringify(data.user));
      toast.success("Profile updated successfully");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Profile update failed");
      return false;
    }
  };

  // ================= LOGOUT =================
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("authUser");
    delete axios.defaults.headers.common["Authorization"];

    if (socket) socket.disconnect();

    setAuthUser(null);
    setToken(null);
    setOnlineUsers([]);
    setSocket(null);

    toast.success("Logged out");
  };

  // ================= SOCKET =================
  useEffect(() => {
    if (!authUser || !token) return;

    const newSocket = io(backendUrl, {
      auth: { token }, // ✅ token for backend socket auth
      query: { userId: authUser._id },
    });

    newSocket.on("getOnlineUsers", (users) => setOnlineUsers(users));
    newSocket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, [authUser, token]);

  if (loading) return null;

  return (
    <AuthContext.Provider
      value={{
        authUser,
        token,
        onlineUsers,
        login,
        logout,
        socket,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


// client/
//  ├─ src/
//  │   ├─ context/
//  │   │   └─ AuthContext.jsx  ✅
//  │   ├─ pages/
//  │   │   └─ LoginPage.jsx
