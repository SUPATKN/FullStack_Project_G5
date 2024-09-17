// src/components/Register.tsx
import React, { useState } from "react";
import axios from "axios";
import Layout from "../../Layout";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import {Link} from "react-router-dom";

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

      // Implement email verification logic here (refer to backend considerations)
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
    // Redirect user to the Google OAuth URL
    window.location.href = "/api/login/oauth/google";
  };

  return (
    <Layout>
      <div className="header-login mb-3">
        <h5 className="text-center text-[#ff8833] ">SIGN UP</h5>
        <h5 className="text-center text-[#ffffff] " >TO THE</h5>
        <h5 className="display-flex text-center text-[#ff8833] ">ART AND COMMUNITY </h5>
      </div>

      <div className="container-sign-up flex justify-center items-center min-h-[60vh] bg-[#fafafa12]">
        <div className="w-full max-w-xs pt-8 rounded-lg">
          <h3 className="text-lg font-semibold mb-6 text-center text-white">
            Sign Up
          </h3>
          <h6 className="head-section">
            Username
          </h6>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2.5 mb-4 rounded"
          />
          <h6 className="head-section">
            Email Address Or Phone Number
          </h6>
          <input
            type="email"
            placeholder="Email Address Or Phone Number"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2.5 mb-4 rounded"
          />
          <h6 className="head-section">
            Password
            <FontAwesomeIcon 
              icon={showPassword ? faEye : faEyeSlash} 
              onClick={toggleShowPassword} 
              style={{ cursor: "pointer", marginLeft: 10 ,color: "#b3b3b3"}} 
            />
            </h6>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2.5 mb-4 rounded"
            />
           

          <h6 className="head-section">
          Confirm Password
          <FontAwesomeIcon
            icon={showConfirmPassword ? faEye : faEyeSlash}
            onClick={toggleShowConfirmPassword}
            style={{ cursor: "pointer", marginLeft: 10 ,color: "#b3b3b3"}}
          />
          </h6>
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-2.5 mb-4 rounded"
          />
            
          <button
            onClick={handleRegister}
            disabled={loading}
            className="w-full bg-[#ff8833] text-white font-semibold py-2 rounded hover:bg-[#f16501] transition duration-200"
          >
            {loading ? "Signing Up..." : "SIGN UP"}
          </button>
          {error && <p className="text-red-500 text-center mt-2">{error}</p>}
          {success && <p className="text-green-500 text-center mt-2">{success}</p>}

          <div className="text-center mt-4 text-gray-400 font-light letter-spacing-0-7px">
            Other sign up options
          </div>
          
        </div>
        <div className="options-login flex justify-center mt-4">
        <button
              onClick={handleGoogleLogin}
              className="button-google flex items-center justify-center w-fit py-2  rounded "
            >
              <img
                src="logo_google_g_icon.png"
                alt="Google logo"
                className="w-6 h-6 "
              />
              <span className="text-gray-700">Sign Up with Google</span>
            </button>
          
          <button
            className="button-options-login flex items-center justify-center w-fit py-2 rounded "
          >
            <span className="text-gray-400 font-light">Already have an account? 
              <Link to="/login" className="textlogin text-[#ff8833] font-light hover:text-[#f16501] ">Log&nbsp;In</Link>
              </span>
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Register;