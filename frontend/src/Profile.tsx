import React, { useEffect, useState } from "react";
import Layout from "./Layout";
import axios from "axios";
import { Link } from "react-router-dom";
import { Nav } from "react-bootstrap";

interface UserProfile {
  id: number;
  username: string;
  email: string;
}

const Profile: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
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
        setUser(response.data);
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          setError(
            error.response?.data.error || "Failed to fetch user profile"
          );
        } else {
          setError("An unexpected error occurred");
        }
      }
    };

    fetchUserProfile();
  }, []);

  return (
    <Layout>
      <div>
        <h2>Profile</h2>
        {error ? (
          <p>{error}</p>
        ) : (
          user && (
            <div>
              <h5>Hello, {user.username}</h5>
              <p>Email: {user.email}</p>
              <p>ID: {user.id}</p>

              <Nav.Item className=" d-flex">
                <Nav.Link
                  as={Link}
                  to="/upload"
                  style={{
                    fontSize: "15px",
                    backgroundColor: "#ffffff",
                    borderRadius: "25px",
                    color: "#37517e",
                    boxShadow:
                      "0 3px 8px 0 rgba(0,0,0,0.2), 0 5px 10px 0 rgba(0,0,0,0.10)",
                    padding: "5px 10px",
                    // margin: "10px 0 5px 5px",
                    width: "max-content",
                    textAlign: "center",
                  }}
                  data-cy="start-upload-button"
                >
                  Start Upload
                </Nav.Link>
              </Nav.Item>
            </div>
          )
        )}
      </div>
    </Layout>
  );
};

export default Profile;
