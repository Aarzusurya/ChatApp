import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";
import { AuthContext } from "../context/AuthContext";

const LoginPage = () => {
  const [currState, setCurrState] = useState("Sign up");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);

  const { login, authUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // ✅ redirect AFTER login
  useEffect(() => {
    if (authUser) {
      navigate("/profile");
    }
  }, [authUser, navigate]);

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    // Step 1: move to bio in signup
    if (currState === "Sign up" && !isDataSubmitted) {
      setIsDataSubmitted(true);
      return;
    }

    const payload =
      currState === "Sign up"
        ? { fullName, email, password, bio }
        : { email, password };

    await login(
      currState === "Sign up" ? "signup" : "login",
      payload
    );
  };

  return (
    <div className="flex min-h-dvh items-center justify-center gap-8 px-4 py-8 backdrop-blur-2xl max-md:flex-col max-md:gap-5">
      <img src={assets.logo_big} alt="Logo" className="w-40 max-md:w-32" />

      <form
        onSubmit={onSubmitHandler}
        className="flex w-full max-w-md flex-col gap-5 rounded-lg border border-gray-500 bg-white/10 p-5 text-white sm:p-6"
      >
        <h2 className="text-2xl flex justify-between items-center">
          {currState}
          {isDataSubmitted && (
            <img
              src={assets.arrow_icon}
              alt="Back"
              className="w-5 cursor-pointer"
              onClick={() => setIsDataSubmitted(false)}
            />
          )}
        </h2>

        {currState === "Sign up" && (
          <button
            type="button"
            onClick={() => {
              setCurrState("Login");
              setIsDataSubmitted(false);
            }}
            className="self-start text-sm text-violet-300 hover:text-violet-200"
          >
            ← Back to login
          </button>
        )}

        {currState === "Sign up" && !isDataSubmitted && (
          <input
            type="text"
            placeholder="Full Name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded-md border border-white/30 bg-[#111827]/90 p-3 text-white placeholder:text-white/60 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/30"
          />
        )}

        {!isDataSubmitted && (
          <>
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-white/30 bg-[#111827]/90 p-3 text-white placeholder:text-white/60 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/30"
            />

            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-white/30 bg-[#111827]/90 p-3 text-white placeholder:text-white/60 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/30"
            />
          </>
        )}

        {currState === "Sign up" && isDataSubmitted && (
          <textarea
            rows={4}
            placeholder="Write your bio..."
            required
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full resize-y rounded-md border border-white/30 bg-[#111827]/90 p-3 text-white placeholder:text-white/60 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-400/30"
          />
        )}

        <button
          type="submit"
          className="py-3 bg-gradient-to-r from-purple-400 to-violet-600 rounded-md"
        >
          {currState === "Sign up" ? "Create Account" : "Login Now"}
        </button>

        <p className="text-sm text-gray-300">
          {currState === "Sign up" ? (
            <>
              Already have an account?{" "}
              <span
                className="text-violet-400 cursor-pointer"
                onClick={() => {
                  setCurrState("Login");
                  setIsDataSubmitted(false);
                }}
              >
                Login
              </span>
            </>
          ) : (
            <>
              Create an account{" "}
              <span
                className="text-violet-400 cursor-pointer"
                onClick={() => setCurrState("Sign up")}
              >
                Sign up
              </span>
            </>
          )}
        </p>

<p
  className="text-sm text-blue-500 cursor-pointer"
  onClick={() => navigate("/forgot-password")}
>
  Forgot Password?
</p>

      </form>
    </div>
  );
};

export default LoginPage;
