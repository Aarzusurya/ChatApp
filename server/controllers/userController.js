import bcrypt from "bcryptjs";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import jwt from "jsonwebtoken";
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
    const updatedData = {};

    if (typeof req.body.fullName === "string") {
      const fullName = req.body.fullName.trim();
      if (!fullName) {
        return res.status(400).json({ success: false, message: "Name cannot be empty" });
      }
      updatedData.fullName = fullName;
    }

    if (typeof req.body.bio === "string") {
      updatedData.bio = req.body.bio.trim();
    }

    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: "image" },
          (error, uploadedImage) => {
            if (error) {
              reject(error);
              return;
            }
            resolve(uploadedImage);
          }
        );
        stream.end(req.file.buffer);
      });
      updatedData.profilePic = result.secure_url;
    }

    if (Object.keys(updatedData).length === 0) {
      return res.status(400).json({ success: false, message: "No profile changes provided" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updatedData,
      { new: true }
    ).select("-password");

    res.json({ success: true, user });

  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: req.file ? "Profile picture upload failed" : "Profile update failed",
    });
  }
};

// ================= FORGOT PASSWORD =================
export const forgotPassword = async (req, res) => {
  try {
    const email = req.body.email?.trim();

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    if (!process.env.RESEND_API_KEY) {
      console.error("Forgot password email service is not configured");
      return res.status(503).json({
        success: false,
        message: "Password reset email is not configured. Set RESEND_API_KEY.",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "ChatApp <onboarding@resend.dev>",
        to: [email],
        subject: "Password Reset OTP",
        html: `<h2>Your OTP: ${otp}</h2>
               <p>This OTP is valid for 10 minutes.</p>`,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!emailResponse.ok) {
      const errorBody = await emailResponse.json().catch(() => ({}));
      const providerMessage = errorBody.message || "Unknown Resend error";
      const normalizedMessage = providerMessage.toLowerCase();
      const safeProviderMessage = providerMessage
        .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[email]")
        .replace(/\bre_[A-Za-z0-9_-]+\b/g, "[redacted]");
      console.error("Resend email API error:", {
        status: emailResponse.status,
        name: errorBody.name,
        message: safeProviderMessage,
      });

      let message = `Resend rejected the email (${errorBody.name || emailResponse.status}): ${safeProviderMessage}`;
      if (emailResponse.status === 401) {
        message = "Resend rejected the API key. Check RESEND_API_KEY in Render.";
      } else if (
        normalizedMessage.includes("testing emails") ||
        normalizedMessage.includes("only send") ||
        normalizedMessage.includes("own email") ||
        normalizedMessage.includes("only the account owner")
      ) {
        message = "Resend's test sender can only send to your Resend account email. Verify a domain and set EMAIL_FROM to send to other users.";
      } else if (
        normalizedMessage.includes("domain") ||
        normalizedMessage.includes("from address") ||
        normalizedMessage.includes("sender")
      ) {
        message = "Resend rejected the sender. Verify its domain in Resend, then set EMAIL_FROM in Render to an address on that domain.";
      } else if (emailResponse.status === 429) {
        message = "Resend rate limit reached. Wait a little and try again.";
      }

      return res.status(502).json({
        success: false,
        message,
      });
    }

    user.resetOTP = otp;
    user.resetOTPExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();

    res.json({ success: true, message: "OTP sent to email" });

  } catch (error) {
    console.error("Forgot password error:", error);
    const timedOut = error.name === "TimeoutError" || error.name === "AbortError";
    res.status(timedOut ? 504 : 500).json({
      success: false,
      message: timedOut
        ? "Email delivery timed out. Try again shortly."
        : "Failed to send OTP",
    });
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
