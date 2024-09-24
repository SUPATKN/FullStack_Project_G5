import { useState, useEffect } from "react";
import axios from "axios";
import { Row, Col, Button, Card, Spinner, Alert } from "react-bootstrap";
import Layout from "../Layout";
import "../global.css";
import useAuth from "../hook/useAuth";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";


const Cart = () => {
  const [cartItems, setCartItems] = useState<
    { id: string; path: string; user_id: string; price: number }[]
  >([]);
  const { user: me, refetch } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch the items in the user's cart
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

  // Fetch user profile on component mount
  useEffect(() => {
    refetch();
  }, [me]);

  // Fetch cart items when user profile is available
  useEffect(() => {
    if (me) {
      fetchCartItems();
    }
  }, [me]);

  // Handle deletion of an item from the cart
  const handleDelete = async (photoId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Ensure user is authenticated
      if (!me) {
        setError("User not authenticated.");
        return;
      }

      // Make the DELETE request to the API
      const response = await axios.delete(`/api/cart/remove`, {
        data: { user_id: me.id, photo_id: photoId },
      });

      if (response.status === 200) {
        // Update the cart items state
        setCartItems((prevItems) =>
          prevItems.filter((item) => item.id !== photoId)
        );
        setSuccess("Item removed from cart successfully.");
      } else {
        throw new Error(
          `Failed to delete item. Status code: ${response.status}`
        );
      }
    } catch (error) {
      console.error("Error deleting item from cart:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle checkout process with confirmation
  const handleCheckout = async () => {
    if (!me) {
      setError("User not authenticated.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to proceed with the purchase?"
    );

    if (!confirmed) {
      return; // Exit the function if the user cancels
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (cartItems.length === 0) {
        setError("No items in the cart.");
        setLoading(false);
        return;
      }

      await axios.post("/api/cart/checkout", {
        user_id: me.id,
        items: cartItems.map((item) => item.id), // ส่งไอเท็มทั้งหมดในรถเข็น
      });

      fetchCartItems(); // Refresh cart items after successful checkout
      setSuccess("Purchase successful!");
    } catch (error) {
      console.error("Error processing purchase:", error);
      setError("Error processing purchase. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate total price of all items
  const totalPrice = cartItems.reduce((acc, item) => acc + item.price, 0);

  return (
    <Layout>
      <h3 className="mt-3 mb-3 text-center text-[#ff8833] font-light letter-spacing-0-7px">MY CART</h3>
        <p className="instructor-p mb-4 text-center">
        Add the images you want to buy to your cart and pay in one go
        </p>
      <Row>
        <Col md={12}>
          {cartItems.length > 0 ? (
            <Row>
              {cartItems.map((photo) => (
                <Col key={photo.id} xs={12} md={6} lg={2} className="mb-4">
                  <Card className="h-fit">
                    <Card.Img
                      variant="top"
                      src={`/api/${photo.path}`}
                      alt={`Image ${photo.id}`}
                      crossOrigin="anonymous"
                    />
                    <Card.Body className="d-flex flex-column justify-content-between">
                      <Card.Text className="mb-3">
                        Price: ${photo.price.toFixed(2)}
                      </Card.Text>
                      <div className="d-flex justify-content-end">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(photo.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            <p className="text-center w-100">Your cart is empty.</p>
          )}
        </Col> 
      </Row>

      <hr className="hr-line"/>

      <div className="Cart">
        <div className="p-3">
          <h4 className="Total-Price mb-2 text-center">Total Price</h4>
            <div className="text-s text-center">
              <h4 >${totalPrice.toFixed(2)}</h4>
            </div>
          
        </div>
        <div
            onClick={handleCheckout}
            className="checkout w-100 mb-2"
          >
            {loading ? (
              <Spinner animation="border" />
            ) : (
              "Proceed to Checkout"
            )}
        </div>
      </div>

      <hr className="hr-line"/>
      
    </Layout>
  );
};

export default Cart;
