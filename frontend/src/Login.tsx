import React, { useState } from "react";
import axios from "axios";
import Layout from "./Layout";
import { useNavigate } from "react-router-dom";

interface UserProfile {
  id: number;
  username: string;
  email: string;
}

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // const [me, setMe] = useState<UserProfile | null>(null);
  const navigate = useNavigate();

  const fetchMe = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("No access token found");
      return;
    }

    try {
      const response = await axios.get<UserProfile>(
        "http://localhost:3000/api/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // setMe(response.data);
      navigate(`/profile/${response.data.id}`); // Navigate after updating `me`
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data.error || "Failed to fetch user profile");
      } else {
        setError("An unexpected error occurred");
      }
    }
  };

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
      const { accessToken } = response.data;
      localStorage.setItem("accessToken", accessToken);
      await fetchMe(); // Fetch profile and navigate
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
      </div>
    </Layout>
  );
};

export default Login;


// import React, { useState } from "react";
// import axios from "axios";
// import Layout from "./Layout";
// import { useNavigate } from "react-router-dom";

// const Login: React.FC = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const navigate = useNavigate();

//   const handleLogin = async () => {
//     if (!email || !password) {
//       setError("Email and password are required.");
//       return;
//     }

//     if (!/\S+@\S+\.\S+/.test(email)) {
//       setError("Invalid email format.");
//       return;
//     }

//     setLoading(true);
//     setError(null);

//     try {
//       await axios.post("/api/login", { email, password }, { withCredentials: true });
//       navigate("/profile"); // Redirect to profile or another authenticated route
//     } catch (error) {
//       if (axios.isAxiosError(error)) {
//         setError(error.response?.data.error || "Login failed.");
//       } else {
//         setError("An unexpected error occurred.");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Layout>
//       <div>
//         <h2>Login</h2>
//         <input
//           type="email"
//           placeholder="Email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//         />
//         <input
//           type="password"
//           placeholder="Password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//         />
//         <button onClick={handleLogin} disabled={loading}>
//           {loading ? "Logging in..." : "Login"}
//         </button>
//         {error && <p style={{ color: "red" }}>{error}</p>}
//       </div>
//     </Layout>
//   );
// };

// export default Login;
