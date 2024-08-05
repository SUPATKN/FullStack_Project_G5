import React, { useEffect, useState } from "react";
import Layout from "./Layout";
import axios from "axios";
import { Button, Image, Row, Col } from "react-bootstrap";

interface UserProfile {
  id: number;
  username: string;
  email: string;
}
interface Photo {
  id: string;
  path: string;
  user_id: string;
  price: number;
  created_at: string;
}
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}/${month}/${day} : ${hours}:${minutes}`;
};

const Profile: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);

  const [isEdit, setIsEdit] = useState(false);

  const fetchImages = async () => {
    try {
      const { data } = await axios.get<
        { id: string; path: string; user_id: string }[]
      >("/api/photo");
      setPhotos(data);
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

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
        setError(error.response?.data.error || "Failed to fetch user profile");
      } else {
        setError("An unexpected error occurred");
      }
    }
  };

  const handleEdit = () => {
    setIsEdit(!isEdit);
  };
  console.log("isEdit", isEdit);

  const handleDelete = async (filename: string) => {
    try {
      await axios.delete(`/api/photo/${filename}`);
      setSuccess("File deleted successfully!");
      setError(null);

      const updatedPhotos = photos.filter(
        (photo) => photo.path.split("/").pop() !== filename
      );
      setPhotos(updatedPhotos);
    } catch (error) {
      console.error("Error deleting file:", error);
      setSuccess(null);
      setError("Failed to delete file.");
    }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchImages();
  }, []);

  useEffect(() => {
    if (photos.length <= 0) {
      setIsEdit(false);
    }
  }, [photos]);
  const fetchPhotos = async () => {
    try {
      const { data } = await axios.get<Photo[]>("/api/photo");
      setPhotos(data);
    } catch (error) {
      console.error("Error fetching photos:", error);
      setError("Failed to fetch photos");
    }
  };

  useEffect(() => {
    fetchPhotos();
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
            </div>
          )
        )}
      </div>
      <h1>My photos</h1>
      <Button
        variant="secondary"
        className="mb-3"
        onClick={() => handleEdit()}
        // data-cy={`delete-button-${photo.id}`}
      >
        Edit
      </Button>
      <Row>
        {photos
          .filter((photo) => photo.user_id == user?.id?.toString())
          .map((photo) => (
            <Col key={photo.id} xs={12} md={4} lg={3} className="mb-4">
              <div className="position-relative">
                <Image
                  crossOrigin="anonymous"
                  src={`/api/${photo.path}`}
                  alt={`Image ${photo.id}`}
                  thumbnail
                  className="w-100"
                  data-cy={`photo-${photo.id}`}
                />
                {isEdit && (
                  <Button
                    variant="danger"
                    className="position-absolute top-0 end-0 m-2"
                    onClick={() => handleDelete(photo.path.split("/").pop()!)}
                    data-cy={`delete-button-${photo.id}`}
                  >
                    Delete
                  </Button>
                )}
                Date: {formatDate(photo.created_at)}
                <br />
                Price: {photo.price}
              </div>
            </Col>
          ))}
      </Row>
    </Layout>
  );
};

export default Profile;
