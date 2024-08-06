import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Image, Row, Col } from "react-bootstrap";
import Layout from "./Layout";

interface UserProfile {
  id: number;
  username: string;
  email: string;
}

const Gallery = () => {
  const [photos, setPhotos] = useState<
    { id: string; path: string; user_id: string; price: number }[]
  >([]);
  const [users, setUsers] = useState<{ id: string; username: string }[]>([]);
  const [likes, setLikes] = useState<{ photo_id: number; user_id: number }[]>(
    []
  );
  const [me, setMe] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const navigate = useNavigate(); // Initialize navigate function

  const fetchImages = async () => {
    try {
      const { data } = await axios.get<
        { id: string; path: string; user_id: string; price: number }[]
      >("/api/photo");
      setPhotos(data);
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

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
      setMe(response.data);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data.error || "Failed to fetch user profile");
      } else {
        setError("An unexpected error occurred");
      }
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get<{ id: string; username: string }[]>(
        "/api/allusers"
      );
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchLikes = async () => {
    try {
      const { data } = await axios.get<{ photo_id: number; user_id: number }[]>(
        "/api/getlikes"
      );
      setLikes(data);
    } catch (error) {
      console.error("Error fetching likes:", error);
    }
  };

  const handleLike = async (photo_id: string, user_id: string) => {
    const alreadyLiked = likes.some(
      (like) =>
        like.photo_id === parseInt(photo_id) &&
        like.user_id === parseInt(user_id)
    );
    if (alreadyLiked) {
      try {
        await axios.delete("/api/unlikes", { data: { photo_id, user_id } });
        await fetchLikes(); // Refresh likes after the unlike action
      } catch (error) {
        console.error("Error", error);
      }
    } else {
      try {
        await axios.post("/api/likes", { photo_id, user_id });
        await fetchLikes(); // Refresh likes after the like action
      } catch (error) {
        console.error("Error", error);
      }
    }
  };

  useEffect(() => {
    fetchMe();
    fetchUsers();
    fetchImages();
    fetchLikes();
  }, []);

  const getUsername = (userId: string) => {
    const user = users.find((user) => user.id === userId);
    return user ? user.username : "Unknown User";
  };

  const getLikeCount = (photoId: string) => {
    return likes.filter((like) => like.photo_id === parseInt(photoId)).length;
  };

  const handleUsernameClick = (userId: string) => {
    const user = users.find((user) => user.id === userId);
    if (user) {
      navigate(`/profile/${userId}`, { state: { user } });
    }
  };

  return (
    <Layout>
      <h3 className="mb-4 text-center">GALLERY</h3>
      <hr />
      <Row>
        {photos.map((photo) => (
          <Col key={photo.id} xs={12} md={4} lg={3} className="mb-4">
            <Image
              crossOrigin="anonymous"
              src={`/api/${photo.path}`}
              alt={`Image ${photo.id}`}
              thumbnail
              className="w-100"
            />
            {me && (
              <button onClick={() => handleLike(photo.id, me.id.toString())}>
                {likes.some(
                  (like) =>
                    like.photo_id === parseInt(photo.id) &&
                    like.user_id === me.id
                )
                  ? "unlike"
                  : "like"}
              </button>
            )}
            <h4>Likes count: {getLikeCount(photo.id)}</h4>
            <p
              className="mt-2"
              onClick={() => handleUsernameClick(photo.user_id)}
            >
              User: {getUsername(photo.user_id)}
            </p>
            <p className="mt-2">
              {photo.price > 0 ? `Price: $${photo.price}` : "Free Download"}
            </p>{" "}
          </Col>
        ))}
      </Row>
    </Layout>
  );
};

export default Gallery;
