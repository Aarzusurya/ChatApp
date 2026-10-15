import { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import assets from "../assets/assets";
import { AuthContext } from "../context/AuthContext";

const LoginPage = () => {
  const [currState, setCurrState] = useState("Login");
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
        <h2 className="flex items-center justify-between text-2xl font-semibold">
          {currState}
        </h2>

        {isDataSubmitted && (
          <button
            type="button"
            onClick={() => setIsDataSubmitted(false)}
            className="w-fit cursor-pointer rounded-md border border-white/30 px-3 py-2 text-sm text-white transition hover:border-violet-300 hover:bg-violet-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
          >
            ← Back to details
          </button>
        )}

        {currState === "Sign up" && !isDataSubmitted && (
          <p className="-mt-3 text-sm text-gray-200">
            Create your account to start chatting.
          </p>
        )}

        {currState === "Sign up" && isDataSubmitted && (
          <p className="-mt-3 text-sm text-gray-200">
            Add a short bio so others can get to know you.
          </p>
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
          className="cursor-pointer rounded-md bg-gradient-to-r from-purple-400 to-violet-600 py-3 font-semibold text-white shadow-md shadow-violet-950/30 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          {currState === "Sign up" ? "Create Account" : "Login Now"}
        </button>

        <p className="text-base font-medium text-white">
          {currState === "Sign up" ? (
            <>
              Already have an account?{" "}
              <button
                type="button"
                className="cursor-pointer rounded font-bold text-white underline decoration-violet-300 decoration-2 underline-offset-4 transition hover:text-violet-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
                onClick={() => {
                  setCurrState("Login");
                  setIsDataSubmitted(false);
                }}
              >
                Login
              </button>
            </>
          ) : (
            <>
              Create an account{" "}
              <button
                type="button"
                className="cursor-pointer rounded font-bold text-white underline decoration-violet-300 decoration-2 underline-offset-4 transition hover:text-violet-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
                onClick={() => {
                  setCurrState("Sign up");
                  setIsDataSubmitted(false);
                }}
              >
                Sign up
              </button>
            </>
          )}
        </p>

        {currState === "Login" && (
          <Link
            to="/forgot-password"
            className="w-fit cursor-pointer rounded-md border border-violet-200/70 bg-violet-950/80 px-3 py-2 text-base font-bold text-white underline decoration-violet-200 decoration-2 underline-offset-4 shadow-sm shadow-black/30 transition hover:bg-violet-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Forgot Password?
          </Link>
        )}

      </form>
    </div>
  );
};

export default LoginPage;
