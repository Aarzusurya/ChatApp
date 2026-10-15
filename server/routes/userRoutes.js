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

const parseProfileUpload = (req, res, next) => {
  upload.single("profilePic")(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.code === "LIMIT_FILE_SIZE"
          ? "Profile picture must be 5 MB or smaller"
          : error.message,
      });
    }

    next();
  });
};

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
  parseProfileUpload,
  updateProfile
);

// FORGOT / RESET PASSWORD
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
