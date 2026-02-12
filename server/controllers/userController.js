import bcrypt from "bcryptjs";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import Conversation from "../models/conversation.js";

// ================= TOKEN =================
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// ================= SIGNUP =================
export const signup = async (req, res) => {
  try {
    const { fullName, email, password, bio } = req.body;

    if (!fullName || !email || !password || !bio) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Account already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      bio,
    });

    const token = generateToken(newUser._id);

    res.status(201).json({
      success: true,
      userData: {
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        bio: newUser.bio,
        profilePic: newUser.profilePic || "",
      },
      token,
      message: "Account created successfully",
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ success: false, message: "Signup failed" });
  }
};

// ================= LOGIN =================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      userData: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        bio: user.bio,
        profilePic: user.profilePic || "",
      },
      token,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Login failed" });
  }
};

// ================= CHECK AUTH =================
export const checkAuth = (req, res) => {
  res.json({ success: true, user: req.user });
};

// ================= GET ALL USERS (SHOW EVERYONE) =================
export const getAllUsers = async (req, res) => {
  try {
    const searchQuery = req.query.search?.trim() || "";

    let query = {
      _id: { $ne: req.user._id }, // khud ko exclude karega
    };

    // 🔎 agar search hai toh filter laga do
    if (searchQuery.length > 0) {
      query.$or = [
        { fullName: { $regex: searchQuery, $options: "i" } },
        { email: { $regex: searchQuery, $options: "i" } },
      ];
    }

    const users = await User.find(query).select("-password");

    res.json({ success: true, users });

  } catch (err) {
    console.error("GetAllUsers error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};

// ================= UPDATE PROFILE =================
export const updateProfile = async (req, res) => {
  try {
    const updatedData = {
      fullName: req.body.fullName,
      bio: req.body.bio,
    };

    if (req.file) {
      cloudinary.uploader.upload_stream(
        { resource_type: "image" },
        async (err, result) => {
          if (err) {
            return res.status(500).json({ success: false, message: "Image upload failed" });
          }

          updatedData.profilePic = result.secure_url;

          const user = await User.findByIdAndUpdate(
            req.user._id,
            updatedData,
            { new: true }
          );

          res.json({ success: true, user });
        }
      ).end(req.file.buffer);
      return;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updatedData,
      { new: true }
    );

    res.json({ success: true, user });

  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ success: false, message: "Profile update failed" });
  }
};

// ================= FORGOT PASSWORD =================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetOTP = otp;
    user.resetOTPExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"ChatApp Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset OTP",
      html: `<h2>Your OTP: ${otp}</h2>
             <p>This OTP is valid for 10 minutes.</p>`,
    });

    res.json({ success: true, message: "OTP sent to email" });

  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

// ================= RESET PASSWORD =================
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    const user = await User.findOne({ email });

    if (!user || user.resetOTP !== otp || user.resetOTPExpiry < Date.now()) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOTP = undefined;
    user.resetOTPExpiry = undefined;
    await user.save();

    res.json({ success: true, message: "Password reset successful" });

  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ success: false, message: "Reset password failed" });
  }
};
