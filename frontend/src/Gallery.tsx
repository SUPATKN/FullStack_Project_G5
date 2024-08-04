// src/Gallery.tsx
import { useState, useEffect } from "react";
import axios from "axios";
import { Image, Row, Col } from "react-bootstrap";
import Layout from "./Layout";

const Gallery = () => {
  const [photos, setPhotos] = useState<
    { id: string; path: string; user_id: string }[]
  >([]);
  const [users, setUsers] = useState<{ id: string; username: string }[]>([]);

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

  useEffect(() => {
    fetchUsers();
    fetchImages();
  }, []);

  const getUsername = (userId: string) => {
    const user = users.find((user) => user.id === userId);
    return user ? user.username : "Unknown User";
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
            <p className="mt-2 text-center">
              User : {getUsername(photo.user_id)}
            </p>
          </Col>
        ))}
      </Row>
    </Layout>
  );
};

export default Gallery;
