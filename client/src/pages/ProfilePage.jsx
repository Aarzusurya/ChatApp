import { useState, useContext, useEffect } from "react";
import assets from "../assets/assets";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import toast from "react-hot-toast";
import axios from "axios";
import UserSearch from "../components/UserSearch";

const ProfilePage = () => {
  const { authUser, updateProfile, token } = useContext(AuthContext);
  const { setSelectedUser, getMessages } = useContext(ChatContext);

  const [selectedImg, setSelectedImg] = useState(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationLoading, setConversationLoading] = useState(false);

  useEffect(() => {
    if (authUser) {
      setName(authUser.fullName || "");
      setBio(authUser.bio || "");
    }
  }, [authUser]);

  if (!authUser || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading profile...
      </div>
    );
  }

  // ================= Update Profile =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("fullName", name);
      formData.append("bio", bio);
      if (selectedImg) formData.append("profilePic", selectedImg);

      const success = await updateProfile(formData);

      if (success) {
        toast.success("Profile updated successfully!");
        setSelectedImg(null);
      }
    } catch {
      toast.error("Profile update failed");
    } finally {
      setLoading(false);
    }
  };

  // ================= Start Conversation =================
  const startConversation = async (user) => {
    if (!token) {
      toast.error("Unauthorized. Please login again.");
      return;
    }

    setConversationLoading(true);
    try {
      const { data } = await axios.post(
        "/api/conversations",
        { receiverId: user._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success(`Conversation started with ${user.fullName}`);
        // ✅ Set user in chat
        setSelectedUser(user);
        getMessages(user._id);
      } else {
        toast.error("Failed to start conversation");
      }
    } catch (err) {
      console.error("Start conversation error:", err);
      toast.error("Failed to start conversation");
    } finally {
      setConversationLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-cover bg-no-repeat px-4 py-6">
      <div className="flex w-full max-w-4xl flex-col-reverse items-stretch justify-between gap-5 rounded-lg border-2 border-gray-600 p-4 text-gray-300 backdrop-blur-2xl sm:p-5 md:flex-row md:items-start">
        {/* ================= Profile Form ================= */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 flex-1">
          <h3 className="text-lg">Profile details</h3>

          <label htmlFor="avatar" className="flex items-center gap-3 cursor-pointer">
            <input
              type="file"
              id="avatar"
              accept=".png,.jpg,.jpeg"
              hidden
              onChange={(e) => setSelectedImg(e.target.files[0])}
            />
            <img
              src={selectedImg ? URL.createObjectURL(selectedImg) : authUser.profilePic || assets.avatar_icon}
              alt="avatar"
              className="w-12 h-12 rounded-full object-cover"
            />
            <span>Upload profile image</span>
          </label>

          <input
            type="text"
            required
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="p-2 border border-gray-500 rounded-md"
          />

          <textarea
            rows={4}
            required
            placeholder="Write profile bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="p-2 border border-gray-500 rounded-md"
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-purple-400 to-violet-600 text-white p-2 rounded-full text-lg disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </form>

        {/* ================= Right Side ================= */}
        <div className="flex w-full flex-col gap-5 md:w-64 lg:w-80">
          <img
            src={authUser.profilePic || assets.avatar_icon}
            alt="profile"
            className="mx-auto aspect-square w-36 rounded-full object-cover md:w-full"
          />

          <h3 className="text-lg">Start a Chat</h3>
          <UserSearch onSelectUser={startConversation} />

          {conversationLoading && (
            <p className="text-sm text-gray-400">Starting conversation...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
