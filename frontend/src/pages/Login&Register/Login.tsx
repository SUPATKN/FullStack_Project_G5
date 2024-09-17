import React, { FC, useState } from "react";
import axios from "axios";
import Layout from "../../Layout";
import { useNavigate, useLocation } from "react-router-dom";
import useAuth from "../../hook/useAuth";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const Login: FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, refetch } = useAuth();

  // Handle query parameters from URL
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
        // เรียก refetch เพื่ออัพเดตข้อมูลผู้ใช้หลังจากการล็อกอินเสร็จ
        const { data: updatedAuth } = await refetch(); // ดึงข้อมูล user ใหม่จาก refetch

        if (updatedAuth?.user?.isAdmin) {
          navigate("/profileadmin");
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
    // Redirect user to the Google OAuth URL
    window.location.href = "/api/login/oauth/google";
  };

  return (
    <Layout>
      <div className="header-login">
        <h5 className="text-center text-[#ff8833] ">LOGIN</h5>
        <h5 className="text-center text-[#ffffff] " >TO THE</h5>
        <h5 className="display-flex text-center text-[#ff8833] ">ART AND COMMUNITY </h5>
      </div>

      <div className="container-login flex justify-center  min-h-[60vh] bg-[#fafafa12] mt-3">
        <div className="w-full max-w-xs pt-8 pb-8 rounded-lg">
          <h3 className=" text-lg font-semibold mb-6 text-center text-white">
            Log in
          </h3>
          <h6 className="head-section">
            Email or Phone Number
          </h6>
          <input
            type="text"
            placeholder="Email Address Or Phone Number"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2.5 mb-4  rounded"
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
            className={`w-full p-2.5 mb-4 rounded `}
          />
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-[#ff8833] text-white font-semibold py-2 rounded hover:bg-[#f16501] transition duration-200"
          >
            {loading ? "Logging in..." : "LOG IN"}
          </button>
          {error && <p className="text-red-500 text-center mt-2">{error}</p>}
          {loginStatus && (
            <p className="text-green-500 text-center mt-2">{loginStatus}</p>
          )}

          <div className="text-center mt-4 text-gray-400 font-light letter-spacing-0-7px">
            Other log in options
          </div>
          <div className="flex justify-center mt-4">
            <button
              onClick={handleGoogleLogin}
              className="button-google flex items-center justify-center w-full py-2  rounded "
            >
              <img
                src="logo_google_g_icon.png"
                alt="Google logo"
                className="w-6 h-6 mr-2"
              />
              <span className="text-gray-700">Login with Google</span>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
