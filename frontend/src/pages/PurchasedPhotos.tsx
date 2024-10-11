import React, { useEffect, useState } from "react";
import axios from "axios";
import { Col, Row, Spinner, Alert, Button } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../Layout";

interface PhotoOwner {
  id: string;
  path: string;
  price: number;
  title: string;
  image_id: number;
  sellerName: string;
  purchased_at: string;
}

const PurchasedPhotos: React.FC = () => {
  const [photos, setPhotos] = useState<PhotoOwner[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const location = useLocation();
  const userId = location.state?.userId;
  const navigate = useNavigate();

  const fetchPurchasedPhotos = async () => {
    setLoading(true);
    try {
      const response = await axios.get<PhotoOwner[]>(
        `/api/user/${userId}/purchased-photos`
      );
      setPhotos(response.data);
    } catch (error) {
      console.error("Error fetching purchased photos:", error);
      setError("Failed to fetch purchased photos");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoClick = (photoId: string) => {
    navigate(`/photo/${photoId}`);
  };

  useEffect(() => {
    if (userId) {
      fetchPurchasedPhotos();
    }
  }, [userId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }

    const dateOptions: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };

    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };

    const formattedDate = date.toLocaleDateString("en-GB", dateOptions);
    const formattedTime = date.toLocaleTimeString("en-GB", timeOptions);

    return `${formattedDate} ${formattedTime}`;
  };

  return (
    <Layout>
      <div className="container mt-4">
        <h2 className="mb-4 text-[#ff8833] text-center">Purchased Photos</h2>

        {loading ? (
          <div className="d-flex justify-content-center">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : (
          <>
            {photos.length > 0 ? (
              <Row>
                {photos.map((photo) => (
                  <Col key={photo.id} xs={12} md={6} lg={4} className="mb-4">
                    {/* ใช้ div แทน Card */}
                    <div
                      className="photo-container border rounded shadow-sm p-3 h-100 bg-white"
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        handlePhotoClick(photo.image_id.toString())
                      }
                    >
                      <img
                        src={`/api/${photo.path}`}
                        alt={`Image ${photo.id}`}
                        crossOrigin="anonymous"
                        style={{
                          width: "100%",
                          height: "auto",
                          objectFit: "cover",
                        }}
                      />
                      <div className="mt-3">
                        <h5 className="text-orange mb-3">{photo.title}</h5>{" "}
                        {/* เว้นบรรทัดหลังชื่อ */}
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="text-muted">
                            Price: ${photo.price}
                          </span>
                        </div>
                        <div className="mt-2">
                          {" "}
                          <small className="text-muted">
                            Purchased: {formatDate(photo.purchased_at)}
                          </small>
                          <div className="mt-2">
                            {" "}
                            <small className="text-muted">
                              Seller: {photo.sellerName}
                            </small>{" "}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            ) : (
              <div className="text-center">
                <p className="text-white">No photos purchased yet.</p>
                <Button
                  style={{ backgroundColor: "#ff8833", borderColor: "#ff8833" }}
                  onClick={() => navigate("/")}
                >
                  Browse Marketplace
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default PurchasedPhotos;
