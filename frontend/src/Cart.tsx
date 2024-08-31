import { useState, useEffect } from "react";
import axios from "axios";
import { Image, Row, Col, Button } from "react-bootstrap";
import Layout from "./Layout";

const Cart = () => {
  const [cartItems, setCartItems] = useState<
    { id: string; path: string; user_id: string; price: number }[]
  >([]);
  const [me, setMe] = useState<{
    id: number;
    username: string;
    email: string;
  } | null>(null);

  const fetchCartItems = async () => {
    try {
      if (me) {
        const { data } = await axios.get<
          { id: string; path: string; user_id: string; price: number }[]
        >(`/api/cart?userId=${me.id}`);
        setCartItems(data);
      }
    } catch (error) {
      console.error("Error fetching cart items:", error);
    }
  };

  const fetchMe = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      return;
    }

    try {
      const response = await axios.get<{
        id: number;
        username: string;
        email: string;
      }>("http://localhost:3000/api/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMe(response.data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const handleCheckout = () => {
    alert("Proceeding to checkout...");
    // Implement the logic for checkout, e.g., redirect to payment page
  };

  useEffect(() => {
    fetchMe();
  }, []);

  useEffect(() => {
    if (me) {
      fetchCartItems();
    }
  }, [me]);

  return (
    <Layout>
      <h3 className="mb-4 text-center">My Cart</h3>
      <Row>
        {cartItems.length > 0 ? (
          cartItems.map((photo) => (
            <Col key={photo.id} xs={12} md={4} lg={3} className="mb-4">
              <Image
                crossOrigin="anonymous"
                src={`/api/${photo.path}`}
                alt={`Image ${photo.id}`}
                thumbnail
                className="w-100"
              />
              <p className="mt-2">Price: ${photo.price}</p>
            </Col>
          ))
        ) : (
          <p className="text-center">Your cart is empty.</p>
        )}
      </Row>
      {cartItems.length > 0 && (
        <div className="text-center">
          <Button variant="primary" onClick={handleCheckout}>
            Proceed to Checkout
          </Button>
        </div>
      )}
    </Layout>
  );
};

export default Cart;
