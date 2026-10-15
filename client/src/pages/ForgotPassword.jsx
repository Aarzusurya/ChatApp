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
    <div className="relative z-50 flex min-h-dvh items-center justify-center px-4 py-6">
      <div className="w-full max-w-md rounded-2xl bg-[#0f0f1a]/95 p-5 text-white shadow-2xl sm:p-8">
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="mb-4 text-sm text-violet-300 hover:text-violet-200"
        >
          ← Back to login
        </button>

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
            className="w-full rounded-lg border border-white/30 bg-[#111827] px-4 py-3 text-white placeholder:text-white/60 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/30"
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
