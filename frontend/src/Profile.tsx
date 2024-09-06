import React, { useEffect, ChangeEvent, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import Layout from "./Layout";
import axios from "axios";
import { Button, Form, Image, Row, Col } from "react-bootstrap";

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

interface ProfilePicture {
  id: string;
  path: string;
  user_id: string;
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
  const [file, setFile] = useState<File | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const location = useLocation();
  const { userId } = useParams(); // Get userId from URL params
  const [user, setUser] = useState<UserProfile | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null); // State for current user
  const [error, setError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [myProPic, setMyProPic] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [isUpload, setIsUpload] = useState(false);
  const navigate = useNavigate(); // For navigation

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files[0];
      setFile(file);
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first!");
      return;
    }

    const formData = new FormData();
    formData.append("profilePic", file);
    formData.append("user_id", user?.id?.toString() || "");

    try {
      await axios.post("/api/profilePic/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setError(null);
      fetchProfilePicture(); // Update the profile picture after upload
      setSelectedImage("");
      setIsUpload(false);
    } catch (error) {
      console.error("Error uploading file:", error);
      setError("Failed to upload file.");
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await axios.get<UserProfile>("/api/profile", {
        withCredentials: true,
      });
      setCurrentUser(response.data);
    } catch (error) {
      setError("Failed to fetch current user profile");
    }
  };

  const fetchUserProfile = async (id: number) => {
    try {
      const response = await axios.get<UserProfile>(`/api/user/${id}`);
      setUser(response.data);
    } catch (error) {
      setError("Failed to fetch user profile");
    }
  };

  const fetchPhotos = async () => {
    try {
      const { data } = await axios.get<Photo[]>("/api/photo");
      setPhotos(data);
    } catch (error) {
      setError("Failed to fetch photos");
    }
  };

  const fetchProfilePicture = async () => {
    try {
      const { data } = await axios.get<ProfilePicture[]>("/api/profilePic/get");
      setMyProfilePic(data);
    } catch (error) {
      setError("Failed to fetch profile picture");
    }
  };

  const setMyProfilePic = (pics: ProfilePicture[]) => {
    if (userId) {
      const profilePicPath = pics.find((img) => img.user_id == userId)?.path;
      setMyProPic(profilePicPath || "");
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    if (location.state && location.state.user) {
      setUser(location.state.user);
    } else if (userId) {
      fetchUserProfile(parseInt(userId, 10));
    } else {
      setError("User profile not found");
    }
    fetchProfilePicture();
    fetchPhotos();
  }, [location.state, userId]);

  const handleEdit = () => {
    setIsEdit(!isEdit);
  };

  const handleUploadPic = () => {
    setIsUpload(!isUpload);
  };

  const handleDelete = async (filename: string) => {
    try {
      await axios.delete(`/api/photo/${filename}`);
      setError(null);

      const updatedPhotos = photos.filter(
        (photo) => photo.path.split("/").pop() !== filename
      );
      setPhotos(updatedPhotos);
    } catch (error) {
      setError("Failed to delete file.");
    }
  };

  const handleViewPurchasedPhotos = () => {
    if (user) {
      navigate("/purchased-photos", { state: { userId: user.id } });
    }
  };

  return (
    <Layout>
      <div>
        <h2>Profile</h2>
        <div className="mt-3">
          {myProPic ? (
            <Image
              src={`/api/profilePic/${myProPic}`}
              alt="Profile Picture"
              roundedCircle
              width={150}
              height={150}
            />
          ) : (
            <Image
              src="https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg"
              alt="Default Avatar"
              roundedCircle
              width={150}
              height={150}
            />
          )}
        </div>

        {error ? (
          <p>{error}</p>
        ) : (
          user && (
            <div className="mt-3">
              <h5>Hello, {user.username}</h5>
              <p>Email: {user.email}</p>
              <p>ID: {user.id}</p>
            </div>
          )
        )}
      </div>
      <Button variant="secondary" className="mb-3" onClick={handleUploadPic}>
        Upload profile picture
      </Button>
      {isUpload && (
        <div>
          <Form>
            <Form.Group controlId="formFile" className="mb-3">
              <Form.Label>Select Image</Form.Label>
              <Form.Control type="file" onChange={handleFileChange} />
            </Form.Group>
            {selectedImage && (
              <div className="mb-3">
                <h3>Image Preview:</h3>
                <Image
                  src={selectedImage}
                  alt="Selected Image"
                  width="200"
                  thumbnail
                />
              </div>
            )}
          </Form>
          <Button variant="primary" onClick={handleUpload}>
            Upload
          </Button>
        </div>
      )}

      <h1>My photos</h1>
      {currentUser?.id === user?.id && (
        <Button variant="secondary" className="mb-3" onClick={handleEdit}>
          Edit
        </Button>
      )}
      <Button
        variant="primary"
        className="mb-3"
        onClick={handleViewPurchasedPhotos}
      >
        View Purchased Photos
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
                />
                {isEdit && (
                  <Button
                    variant="danger"
                    className="position-absolute top-0 end-0 m-2"
                    onClick={() => handleDelete(photo.path.split("/").pop()!)}
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
