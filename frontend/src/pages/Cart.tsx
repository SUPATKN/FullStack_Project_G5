import { useState, useEffect } from "react";
import axios from "axios";
import { Row, Col, Button, Card, Spinner } from "react-bootstrap";
import Layout from "../Layout";
import "../global.css";
import useAuth from "../hook/useAuth";
import { toast, ToastContainer } from "react-toastify"; // รวม toast ที่นี่
import ConfirmCheckoutModal from "./ConfirmCheckoutModal";

const Cart = () => {
  const [cartItems, setCartItems] = useState<
    { id: string; path: string; user_id: string; price: number }[]
  >([]);
  const { user: me, refetch } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch the items in the user's cart
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

  // Fetch user profile on component mount
  useEffect(() => {
    refetch();
  }, [me]);

  // Fetch cart items when user profile is available
  useEffect(() => {
    fetchCartItems();
  }, [me]);

  // Handle deletion of an item from the cart
  const handleDelete = async (photoId: string) => {
    setLoading(true);
    if (!me) {
      toast.error("User not authenticated."); // ใช้ toast สำหรับการแจ้งเตือน
      setLoading(false);
      return;
    }

    try {
      const response = await axios.delete(`/api/cart/remove`, {
        data: { user_id: me.id, photo_id: photoId },
      });

      if (response.status === 200) {
        setCartItems((prevItems) =>
          prevItems.filter((item) => item.id !== photoId)
        );
        toast.success("Item removed from cart successfully.");
      }
    } catch (error) {
      console.error("Error deleting item from cart:", error);
      const errorMessage =
        axios.isAxiosError(error) && error.response
          ? error.response.data.error || "Unknown error occurred."
          : "Unknown error occurred.";
      toast.error(errorMessage); // แสดงข้อผิดพลาด
    } finally {
      setLoading(false);
    }
  };

  // Handle checkout process with confirmation
  const handleCheckout = async () => {
    if (!me) {
      toast.error("User not authenticated.");
      return;
    }

    if (cartItems.length === 0) {
      toast.error("No items in the cart."); // แจ้งเตือนเมื่อไม่มีรายการ
      return;
    }

    setIsModalOpen(true); // เปิด modal เพื่อยืนยันการชำระเงิน
  };

  // Confirm the checkout in the modal
  const confirmCheckout = async () => {
    setLoading(true);
    try {
      await axios.post("/api/cart/checkout", {
        user_id: me.id,
        items: cartItems.map((item) => item.id), // ส่งไอเท็มทั้งหมดในรถเข็น
      });

      fetchCartItems(); // Refresh cart items after successful checkout
      toast.success("Purchase successful!"); // แจ้งเตือนเมื่อสำเร็จ
    } catch (error) {
      console.error("Error processing purchase:", error);
      const errorMessage =
        axios.isAxiosError(error) && error.response
          ? error.response.data.error ||
            "Error processing purchase. Please try again."
          : "Error processing purchase. Please try again.";
      toast.error(errorMessage); // แสดงข้อผิดพลาดที่เกิดขึ้น
    } finally {
      setLoading(false);
      setIsModalOpen(false); // ปิด modal หลังจากการชำระเงิน
    }
  };

  // Calculate total price of all items
  const totalPrice = cartItems.reduce((acc, item) => acc + item.price, 0);

  return (
    <Layout>
      <h3 className="mt-3 mb-3 text-center text-[#ff8833] font-light letter-spacing-0-7px">
        MY CART
      </h3>
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
                          disabled={loading} // ปิดการใช้งานปุ่มเมื่อกำลังโหลด
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

      <hr className="hr-line" />

      <div className="Cart">
        <div className="p-3">
          <h4 className="Total-Price mb-2 text-center gap-2 flex justify-content-center align-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-5 mt-[5px] mr-[1px]"
            >
              <path
                fillRule="evenodd"
                d="M7.5 6v.75H5.513c-.96 0-1.764.724-1.865 1.679l-1.263 12A1.875 1.875 0 0 0 4.25 22.5h15.5a1.875 1.875 0 0 0 1.865-2.071l-1.263-12a1.875 1.875 0 0 0-1.865-1.679H16.5V6a4.5 4.5 0 1 0-9 0ZM12 3a3 3 0 0 0-3 3v.75h6V6a3 3 0 0 0-3-3Zm-3 8.25a3 3 0 1 0 6 0v-.75a.75.75 0 0 1 1.5 0v.75a4.5 4.5 0 1 1-9 0v-.75a.75.75 0 0 1 1.5 0v.75Z"
                clipRule="evenodd"
              />
            </svg>
            Total Price
          </h4>
          <div className="text-s text-center">
            <h4>${totalPrice.toFixed(2)}</h4>
          </div>
        </div>

        <div>
          <div
            onClick={handleCheckout} // เปิด modal เพื่อยืนยันการชำระเงิน
            className="checkout w-100 mb-2"
          >
            {loading ? <Spinner animation="border" /> : "Proceed to Checkout"}
          </div>

          <ConfirmCheckoutModal
            isOpen={isModalOpen}
            onRequestClose={() => setIsModalOpen(false)}
            onConfirm={confirmCheckout} // Confirm checkout when confirmed
          />
        </div>
      </div>

      <hr className="hr-line" />
      <ToastContainer />
    </Layout>
  );
};

export default Cart;
