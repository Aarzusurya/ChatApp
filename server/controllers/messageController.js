import User from "../models/User.js";
import Message from "../models/Message.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../server.js";

/* ================= GET USERS FOR SIDEBAR ================= */
export const getUsersForSidebar = async (req, res) => {
  try {
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [{ senderId: myId }, { receiverId: myId }],
    });

    const userIds = new Set();

    messages.forEach((msg) => {
      if (msg.senderId.toString() !== myId.toString()) {
        userIds.add(msg.senderId.toString());
      }
      if (msg.receiverId.toString() !== myId.toString()) {
        userIds.add(msg.receiverId.toString());
      }
    });

    const users = await User.find(
      { _id: { $in: Array.from(userIds) } },
      "-password"
    );

    const unseenMessages = {};

    await Promise.all(
      users.map(async (user) => {
        const count = await Message.countDocuments({
          senderId: user._id,
          receiverId: myId,
          seen: false,
        });

        if (count > 0) unseenMessages[user._id] = count;
      })
    );

    res.json({ success: true, users, unseenMessages });
  } catch (error) {
    console.log("getUsersForSidebar error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= GET MESSAGES ================= */
export const getMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: id },
        { senderId: id, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    await Message.updateMany(
      { senderId: id, receiverId: myId, seen: false },
      { seen: true }
    );

    res.json({ success: true, messages });
  } catch (error) {
    console.log("getMessages error:", error.message);
    res.status(500).json({ success: false });
  }
};

/* ================= SEND MESSAGE ================= */
export const sendMessage = async (req, res) => {
  try {
    const { text, image, receiverId } = req.body;
    const senderId = req.user._id;

    if (!receiverId) {
      return res.status(400).json({ success: false });
    }

    let imageUrl = "";

    if (image) {
      const uploadRes = await cloudinary.uploader.upload(image);
      imageUrl = uploadRes.secure_url;
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.json({ success: true, newMessage });
  } catch (error) {
    console.log("sendMessage error:", error.message);
    res.status(500).json({ success: false });
  }
};

/* ================= DELETE CHAT ================= */
export const deleteChat = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id } = req.params;

    await Message.deleteMany({
      $or: [
        { senderId: myId, receiverId: id },
        { senderId: id, receiverId: myId },
      ],
    });

    res.json({ success: true, message: "Chat deleted permanently" });
  } catch (error) {
    console.log("deleteChat error:", error.message);
    res.status(500).json({ success: false });
  }
};
