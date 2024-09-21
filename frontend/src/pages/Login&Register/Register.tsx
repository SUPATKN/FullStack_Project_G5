// src/components/Register.tsx
import React, { useState } from "react";
import axios from "axios";
import Layout from "./Layout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const Register: React.FC = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Invalid email format.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axios.post("/api/register", {
        username,
        email,
        password,
      });
      setSuccess(response.data.message);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data.error || "Registration failed.");
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
  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  const handleGoogleLogin = () => {
    window.location.href = "/api/login/oauth/google";
  };

  return (
    <Layout>
      <div className="flex justify-center items-center  bg-gray-50">
        <div className="w-full max-w-md p-6 bg-white rounded-lg ">
          <h1 className="text-2xl font-bold text-center text-[#ff8833]">
            Create Account
          </h1>
          <p className="text-center text-gray-500 mt-2">
            Join our community today!
          </p>

          <div className="mt-6">
            {/* Username Field */}
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8833] focus:border-[#ff8833] transition"
            />

            {/* Email Field */}
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mt-4"
            >
              Email Address or Phone Number
            </label>
            <input
              id="email"
              type="email"
              placeholder="Email Address or Phone Number"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8833] focus:border-[#ff8833] transition"
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
              className="mt-1 block w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8833] focus:border-[#ff8833] transition"
            />

            {/* Confirm Password Field */}
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mt-4"
            >
              Confirm Password
              <FontAwesomeIcon
                icon={showConfirmPassword ? faEye : faEyeSlash}
                onClick={toggleShowConfirmPassword}
                className="ml-2 text-gray-500 cursor-pointer"
              />
            </label>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff8833] focus:border-[#ff8833] transition"
            />

            {/* Error and Success Messages */}
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            {success && (
              <p className="text-green-500 text-sm mt-2">{success}</p>
            )}

            {/* Register Button */}
            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full mt-6 bg-[#ff8833] text-white font-semibold py-2.5 rounded-lg hover:bg-[#f16501] transition duration-200 ease-in-out disabled:bg-gray-400"
            >
              {loading ? "Signing Up..." : "SIGN UP"}
            </button>

            {/* Alternative Sign-Up Options */}
            <div className="flex items-center justify-center mt-3">
              <div className="border-t border-gray-300 w-1/4"></div>
              <p className="text-sm text-gray-500 mx-4">or sign up with</p>
              <div className="border-t border-gray-300 w-1/4"></div>
            </div>

            {/* Google Sign-Up Button */}
            <button
              onClick={handleGoogleLogin}
              className="flex items-center justify-center w-full mt-2 bg-white border border-gray-300 py-2.5 rounded-lg hover:bg-gray-100 transition"
            >
              <img
                src="logo_google_g_icon.png"
                alt="Google logo"
                className="w-5 h-5 mr-2"
              />
              <span className="text-gray-700 font-semibold">
                Sign Up with Google
              </span>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Register;
