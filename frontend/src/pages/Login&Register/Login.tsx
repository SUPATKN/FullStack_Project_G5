import React, { FC, useState } from "react";
import axios from "axios";
import Layout from "./Layout";
import { useNavigate, useLocation } from "react-router-dom";
import useAuth from "../../hook/useAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const Login: FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, refetch } = useAuth();
  const [loginStatus, setLoginStatus] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  React.useEffect(() => {
    const query = new URLSearchParams(location.search);
    const status = query.get("login");
    if (status === "success") {
      setLoginStatus("Login was successful!");
    }
  }, [location.search]);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Invalid email format.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post("/api/login", { email, password });

      if (response.status === 200) {
        const { data: updatedAuth } = await refetch();
        if (updatedAuth?.user?.isAdmin) {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data.error || "Login failed.");
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleGoogleLogin = () => {
    window.location.href = "/api/login/oauth/google";
  };

  return (
    <Layout>
      <div className="flex justify-center items-center bg-gray-50">
        <div className="w-full max-w-md p-6 bg-white rounded-lg ">
          <h1 className="text-2xl font-bold text-center text-gray-800">
            Login
          </h1>
          <p className="text-center text-gray-500 mt-2 text-sm">
            Welcome back! Please login to your account.
          </p>

          <div className="mt-6">
            {/* Email Field */}
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email or Phone Number
            </label>
            <input
              id="email"
              type="text"
              placeholder="Email Address Or Phone Number"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8833] focus:border-[#ff8833] transition"
            />

            {/* Password Field */}
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mt-4"
            >
              Password
              <FontAwesomeIcon
                icon={showPassword ? faEye : faEyeSlash}
                onClick={toggleShowPassword}
                className="ml-2 text-gray-500 cursor-pointer"
              />
            </label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8833] focus:border-[#ff8833] transition"
            />

            {/* Error Message */}
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            {loginStatus && (
              <p className="text-green-500 text-sm mt-2">{loginStatus}</p>
            )}

            {/* Login Button */}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full mt-6 bg-[#ff8833] text-white font-semibold py-3 rounded-lg hover:bg-[#f16501] transition duration-200 ease-in-out disabled:bg-gray-400"
            >
              {loading ? "Logging in..." : "LOG IN"}
            </button>
            {/* / */}
            {/* Alternative Login */}
            <div className="flex items-center justify-center mt-2">
              <div className="border-t border-gray-300 w-1/4"></div>
              <p className="text-sm text-gray-500 mx-2">or login with</p>
              <div className="border-t border-gray-300 w-1/4"></div>
            </div>

            {/* Google Login Button */}
            <button
              onClick={handleGoogleLogin}
              className="flex items-center justify-center w-full mt-2 bg-white border border-gray-300 py-3 rounded-lg hover:bg-gray-100 transition"
            >
              <img
                src="logo_google_g_icon.png"
                alt="Google logo"
                className="w-5 h-5 mr-2"
              />
              <span className="text-gray-700 font-semibold">
                Login with Google
              </span>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
