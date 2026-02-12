import express from "express";
import {
  signup,
  login,
  checkAuth,
  updateProfile,
  getAllUsers,
  forgotPassword,
  resetPassword,
} from "../controllers/userController.js";

import { protectRoute } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

// AUTH
router.post("/signup", signup);
router.post("/login", login);

// CHECK AUTH
router.get("/check", protectRoute, checkAuth);

// USERS (Search + Previous Chat)
router.get("/all", protectRoute, getAllUsers);

// PROFILE
router.put(
  "/update-profile",
  protectRoute,
  upload.single("profilePic"),
  updateProfile
);

// FORGOT / RESET PASSWORD
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
