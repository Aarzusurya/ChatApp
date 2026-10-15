import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import toast from "react-hot-toast";
import axios from "axios";
import UserSearch from "../components/UserSearch";

const ProfilePage = () => {
  const { authUser, updateProfile, token } = useContext(AuthContext);
  const { setSelectedUser, getMessages } = useContext(ChatContext);
  const navigate = useNavigate();

  const [selectedImg, setSelectedImg] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
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

  useEffect(() => {
    if (!selectedImg) {
      setPreviewUrl("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(selectedImg);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedImg]);

  if (!authUser || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading profile...
      </div>
    );
  }

  const handleImageSelection = (event) => {
    const image = event.target.files?.[0];
    event.target.value = "";
    if (!image) return;

    if (!image.type.startsWith("image/")) {
      toast.error("Choose an image file");
      return;
    }

    if (image.size > 5 * 1024 * 1024) {
      toast.error("Image must be 5 MB or smaller");
      return;
    }

    setSelectedImg(image);
  };

  const handleImageUpload = async () => {
    if (!selectedImg) {
      toast.error("Choose a profile picture first");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("profilePic", selectedImg);

    try {
      const success = await updateProfile(formData);
      if (success) setSelectedImg(null);
    } finally {
      setLoading(false);
    }
  };

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
        setSelectedImg(null);
      }
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
    <div className="flex min-h-dvh items-center justify-center bg-cover bg-no-repeat px-3 py-2 sm:px-4 sm:py-6">
      <div className="my-auto flex w-full max-w-4xl flex-col items-stretch justify-between gap-3 rounded-lg border-2 border-gray-600 p-3 text-gray-300 backdrop-blur-2xl sm:gap-5 sm:p-5 md:flex-row md:items-start">
        {/* ================= Profile Form ================= */}
        <form onSubmit={handleSubmit} className="flex min-w-0 flex-1 flex-col gap-2 sm:gap-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg">Profile details</h3>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="shrink-0 rounded-md border border-white/30 px-3 py-2 text-sm text-white transition hover:bg-white/10"
            >
              ← Back to chats
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input
              type="file"
              id="avatar"
              accept="image/*"
              hidden
              onChange={handleImageSelection}
            />
            <img
              src={previewUrl || authUser.profilePic || assets.avatar_icon}
              onError={(event) => {
                event.currentTarget.src = assets.avatar_icon;
              }}
              alt="avatar"
              className="w-12 h-12 rounded-full object-cover"
            />
            <label
              htmlFor="avatar"
              className="cursor-pointer rounded-md border border-white/30 px-3 py-2 text-sm text-white transition hover:bg-white/10"
            >
              Choose photo
            </label>
            <button
              type="button"
              onClick={handleImageUpload}
              disabled={loading || !selectedImg}
              className="rounded-md bg-violet-600 px-3 py-2 text-sm text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Uploading..." : "Upload photo"}
            </button>
            {selectedImg && (
              <span className="max-w-full truncate text-xs text-gray-300">
                {selectedImg.name}
              </span>
            )}
          </div>

          <input
            type="text"
            required
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-gray-500 bg-black/20 p-2 text-white placeholder:text-gray-400 focus:border-violet-400 focus:outline-none"
          />

          <textarea
            rows={4}
            required
            placeholder="Write profile bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full resize-y rounded-md border border-gray-500 bg-black/20 p-2 text-white placeholder:text-gray-400 focus:border-violet-400 focus:outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-gradient-to-r from-purple-400 to-violet-600 p-2 text-lg text-white disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </form>

        {/* ================= Right Side ================= */}
        <div className="flex w-full min-w-0 flex-col gap-2 md:w-64 md:gap-5 lg:w-80">
          <div className="flex items-center gap-3 md:flex-col">
            <img
              src={authUser.profilePic || assets.avatar_icon}
              onError={(event) => {
                event.currentTarget.src = assets.avatar_icon;
              }}
              alt="profile"
              className="h-16 w-16 rounded-full object-cover md:mx-auto md:h-auto md:aspect-square md:w-full"
            />
            <h3 className="text-lg md:text-center">Start a Chat</h3>
          </div>
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
