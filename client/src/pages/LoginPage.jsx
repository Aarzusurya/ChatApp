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
    <div className="min-h-screen flex items-center justify-center gap-8 backdrop-blur-2xl">
      <img src={assets.logo_big} alt="Logo" className="w-[250px]" />

      <form
        onSubmit={onSubmitHandler}
        className="border bg-white/10 text-white border-gray-500 p-6 flex flex-col gap-5 rounded-lg"
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

        {currState === "Sign up" && !isDataSubmitted && (
          <input
            type="text"
            placeholder="Full Name"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="p-2 rounded-md"
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
              className="p-2 rounded-md"
            />

            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-2 rounded-md"
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
            className="p-2 rounded-md"
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
