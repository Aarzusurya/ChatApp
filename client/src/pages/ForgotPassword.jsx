import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Email is required");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/user/forgot-password",
        { email }
      );

      // ✅ EMAIL SAVE KARO (MOST IMPORTANT)
      localStorage.setItem("resetEmail", email);

      toast.success(res.data.message || "OTP sent successfully");

      // ✅ RESET PAGE OPEN KARO
      navigate("/reset-password");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-50 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md bg-[#0f0f1a]/90 text-white p-8 rounded-2xl shadow-2xl">
        <h2 className="text-2xl font-bold text-center mb-2">
          Forgot Password 🔐
        </h2>

        <p className="text-sm text-gray-400 text-center mb-6">
          Enter your registered email to receive OTP
        </p>

        <form onSubmit={handleSendOTP} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full px-4 py-3 rounded-lg bg-[#1b1b2e] border border-gray-600"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 py-3 rounded-lg font-semibold"
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
