import React, { FC, useState } from "react";
import axios from "axios";
import Layout from "../../Layout";
import { useNavigate, useLocation } from "react-router-dom";

const Login: FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle query parameters from URL
  const [loginStatus, setLoginStatus] = useState<string | null>(null);

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
        navigate("/");
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

  const handleGoogleLogin = () => {
    // Redirect user to the Google OAuth URL
    window.location.href = "/api/login/oauth/google";
  };

  return (
    <Layout>
      <div>
        <h2>Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
        {loginStatus && <p style={{ color: "green" }}>{loginStatus}</p>}

        <h1>Social Login</h1>
        <article>
          <div style={{ display: "flex", gap: "2rem" }}>
            <button onClick={handleGoogleLogin}>
              <svg width="90" height="90">
                <image
                  xlinkHref="logos/google-icon.svg"
                  width="90"
                  height="90"
                />
              </svg>
              <span>Login with Google</span>
            </button>
          </div>
        </article>
      </div>
    </Layout>
  );
};

export default Login;
