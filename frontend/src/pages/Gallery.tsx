import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Image, Row, Col, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import Layout from "../Layout";
import useAuth from "../hook/useAuth";
// import { format } from "date-fns";

interface UserProfile {
  id: number;
  username: string;
  email: string;
}

interface Comment {
  id: number;
  photo_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

const Gallery = () => {
  const [photos, setPhotos] = useState<
    { id: string; path: string; user_id: string; price: number }[]
  >([]);
  const [users, setUsers] = useState<{ id: string; username: string }[]>([]);

  const { user: me, refetch } = useAuth();
  // const [error, setError] = useState<string | null>(null);
  // const [success, setSuccess] = useState<string | null>(null);

  const [cartItems, setCartItems] = useState<
    { id: string; path: string; user_id: string; price: number }[]
  >([]);

  const navigate = useNavigate();

  const handlePhotoClick = (photoId: string) => {
    navigate(`/photo/${photoId}`);
  };

  const handlePhotoContextMenu = (
    e: React.MouseEvent<HTMLImageElement, MouseEvent>,
    photoId: string
  ) => {
    e.preventDefault(); // Prevent the default context menu
    // Implement your custom behavior here
    console.log(`Right-clicked on photo with ID: ${photoId}`);
    // For example, you might show a modal or perform another action
  };

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
    refetch();
    fetchUsers();
    fetchImages();
  }, [me]);

  const fetchCartItems = async () => {
    if (me) {
      try {
        const { data } = await axios.get<
          { id: string; path: string; user_id: string; price: number }[]
        >(`/api/cart/${me.id}`);
        setCartItems(data);
      } catch (error) {
        console.error("Error fetching cart items:", error);
      }
    }
  };

  useEffect(() => {
    if (me) {
      fetchCartItems(); // Fetch cart items when the user profile is available
    }
  }, [me]);

  const getUsername = (userId: string) => {
    const user = users.find((user) => user.id === userId);
    return user ? user.username : "Unknown User";
  };

  const handleUsernameClick = (userId: string) => {
    const user = users.find((user) => user.id === userId);
    if (user) {
      navigate(`/profile/${userId}`, { state: { user } });
    }
  };

  const handleAddToCart = async (photoId: string) => {
    if (!me) {
      console.error("User is not logged in");
      return;
    }

    const photo = photos.find((photo) => photo.id === photoId);

    if (!photo) {
      return;
    }

    // Check if the photo is already in the cart
    const alreadyInCart = cartItems.some((item) => item.id === photoId);

    if (alreadyInCart) {
      alert("This item is already in your cart.");
      return;
    }

    if (photo.user_id === me.id.toString()) {
      alert("You cannot add your own photo to the cart.");
      return;
    }

    try {
      const response = await axios.post("/api/cart/add", {
        user_id: me.id,
        photo_id: photoId,
      });

      alert(response.data.message); // Display success message
      fetchCartItems(); // Refresh cart items after successful addition
    } catch (error) {
      console.error("Error adding photo to cart:", error);
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
              onClick={() => handlePhotoClick(photo.id)}
              onContextMenu={(e) => handlePhotoContextMenu(e, photo.id)}
              style={{ cursor: "pointer" }}
            />
            <p
              className="mt-2"
              onClick={() => handleUsernameClick(photo.user_id)}
            >
              {getUsername(photo.user_id)}
            </p>
            {me && (
              <>
                <Button
                  variant="success"
                  className="mt-2"
                  onClick={() => handleAddToCart(photo.id)}
                >
                  Add to Cart
                </Button>
              </>
            )}
          </Col>
        ))}
      </Row>
    </Layout>
  );
};

export default Gallery;
