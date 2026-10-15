import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const navigate = useNavigate();
  const email = localStorage.getItem("resetEmail");

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      toast.error("Please enter email first");
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    const cleanOtp = otp.trim();
    const cleanNewPassword = newPassword.trim();
    const cleanConfirmPassword = confirmPassword.trim();

    if (cleanOtp.length !== 6) {
      toast.error("OTP must be 6 digits");
      return;
    }

    if (!cleanNewPassword || !cleanConfirmPassword) {
      toast.error("Password cannot be empty");
      return;
    }

    if (cleanNewPassword !== cleanConfirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        "http://localhost:5000/api/user/reset-password",
        {
          email,
          otp: cleanOtp,
          newPassword: cleanNewPassword,
          confirmPassword: cleanConfirmPassword, // 🔥 VERY IMPORTANT
        }
      );

      toast.success("Password reset successful 🎉");
      localStorage.removeItem("resetEmail");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-black px-4 py-6">
      <div className="w-full max-w-md rounded-2xl bg-[#0f0f1a] p-5 text-white sm:p-8">
        <h2 className="text-2xl font-bold text-center mb-6">
          Reset Password 🔑
        </h2>

        <form onSubmit={handleResetPassword} className="space-y-4">
          <input
            type="text"
            placeholder="Enter OTP"
            maxLength={6}
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value.replace(/\D/g, ""))
            }
            className="w-full rounded-lg border border-white/30 bg-[#111827] px-4 py-3 text-white placeholder:text-white/60 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/30"
          />

          <input
            type="password"
            placeholder="New Password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full rounded-lg border border-white/30 bg-[#111827] px-4 py-3 text-white placeholder:text-white/60 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/30"
          />

          <input
            type="password"
            placeholder="Confirm New Password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-lg border border-white/30 bg-[#111827] px-4 py-3 text-white placeholder:text-white/60 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/30"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 py-3 rounded-lg font-semibold"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
