import express from "express";
import { protectRoute } from "../middleware/auth.js";
import {
  getMessages,
  getUsersForSidebar,
  sendMessage,
  deleteChat,
} from "../controllers/messageController.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);
router.post("/send", protectRoute, sendMessage);
router.delete("/:id", protectRoute, deleteChat);

export default router;
