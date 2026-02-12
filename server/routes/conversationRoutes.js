import express from "express";
import Conversation from "../models/conversation.js";
import { protectRoute } from "../middleware/auth.js";

const router = express.Router();

// Start a new conversation
router.post("/", protectRoute, async (req, res) => {
  const { receiverId } = req.body;

  if (!receiverId) return res.status(400).json({ success: false, message: "Receiver ID required" });

  try {
    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      members: { $all: [req.user._id, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        members: [req.user._id, receiverId],
      });
    }

    res.json({ success: true, conversation });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to start conversation" });
  }
});

// Get all conversations of logged-in user
router.get("/", protectRoute, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      members: { $in: [req.user._id] },
    }).populate("members", "fullName profilePic");

    res.json({ success: true, conversations });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch conversations" });
  }
});

export default router;
