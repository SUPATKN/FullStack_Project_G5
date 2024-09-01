// Layout.tsx
import React, { useEffect, useState } from "react";
import NavBar from "./Navbar";
import { Container } from "react-bootstrap";
import { AuthProvider } from "./AuthContext";
import axios from "axios";

interface User {
  id: number;
  username: string;
  email: string;
}

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  // const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      // setError("No access token found");
      return;
    }

    try {
      const response = await axios.get<User>(
        "http://localhost:3000/api/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUser(response.data);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        // setError(error.response?.data.error || "Failed to fetch user profile");
      } else {
        // setError("An unexpected error occurred");
      }
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  return (
    <AuthProvider>
      <div>
        <NavBar user={user} />
        <Container className="my-4">{children}</Container>
      </div>
    </AuthProvider>
  );
};

export default Layout;
