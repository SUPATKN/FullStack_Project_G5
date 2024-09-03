import { useState, useEffect } from "react";
import axios from "axios";
import { Row, Col, Button, Card, Spinner, Alert } from "react-bootstrap";
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchCartItems = async () => {
    try {
      if (me) {
        const { data } = await axios.get<
          { id: string; path: string; user_id: string; price: number }[]
        >(`/api/cart/${me.id}`);
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

  useEffect(() => {
    fetchMe();
  }, []);

  useEffect(() => {
    if (me) {
      fetchCartItems();
    }
  }, [me]);

  // Calculate total price
  const totalPrice = cartItems.reduce((acc, item) => acc + item.price, 0);

  const handleCheckout = async () => {
    if (!me) {
      setError("User not authenticated.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Send purchase requests
      const purchasePromises = cartItems.map((item) =>
        axios.post(`/api/photo/${item.id}/buy`, { userId: me.id })
      );

      await Promise.all(purchasePromises);

      // Clear cart items on success
      setCartItems([]);
      setSuccess("Purchase successful!");
    } catch (error) {
      console.error("Error processing purchase:", error);
      setError("Error processing purchase. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <h3 className="mb-4 text-center">My Cart</h3>
      <Row>
        <Col md={8}>
          {cartItems.length > 0 ? (
            <Row>
              {cartItems.map((photo) => (
                <Col key={photo.id} xs={12} md={6} lg={4} className="mb-4">
                  <Card>
                    <Card.Img
                      variant="top"
                      src={`/api/${photo.path}`}
                      alt={`Image ${photo.id}`}
                      crossOrigin="anonymous"
                    />
                    <Card.Body>
                      <Card.Text>Price: ${photo.price.toFixed(2)}</Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <p className="text-center w-100">Your cart is empty.</p>
          )}
        </Col>
        <Col md={4}>
          <Card className="p-3">
            <Card.Body>
              <Card.Title>Total Price</Card.Title>
              <Card.Text className="mb-4">
                <h3>${totalPrice.toFixed(2)}</h3>
              </Card.Text>
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}
              <Button
                variant="primary"
                onClick={handleCheckout}
                disabled={loading}
              >
                {loading ? (
                  <Spinner animation="border" />
                ) : (
                  "Proceed to Checkout"
                )}
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Layout>
  );
};

export default Cart;
