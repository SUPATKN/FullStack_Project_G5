// PurchasedPhotos.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, Col, Row } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import Layout from "../Layout";

// interface Photo {
//   id: string;
//   path: string;
//   price: number;
//   purchased_at: string;
// }
interface PhotoOwner {
  id: string;
  path: string;
  price: number;
  purchased_at: string;
}

const PurchasedPhotos: React.FC = () => {
  const [photos, setPhotos] = useState<PhotoOwner[]>([]);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const userId = location.state?.userId;

  const fetchPurchasedPhotos = async () => {
    try {
      const response = await axios.get<PhotoOwner[]>(
        `/api/user/${userId}/purchased-photos`
      );
      setPhotos(response.data);
    } catch (error) {
      console.error("Error fetching purchased photos:", error);
      setError("Failed to fetch purchased photos");
    }
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

    // ใช้ toLocaleDateString และ toLocaleTimeString พร้อม options เพื่อแสดงเวลาในรูปแบบ 24 ชั่วโมง
    const dateOptions: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };

    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false, // ใช้ 24 ชั่วโมง
    };

    const formattedDate = date.toLocaleDateString("en-GB", dateOptions);
    const formattedTime = date.toLocaleTimeString("en-GB", timeOptions);

    return `${formattedDate} ${formattedTime}`;
  };

  return (
    <Layout>
      <div className="container mt-4">
        <h2 className="mb-4 text-white">Purchased Photos</h2>
        {error ? (
          <p>{error}</p>
        ) : (
          <Row>
            {photos.length > 0 ? (
              photos.map((photo) => (
                <Col key={photo.id} xs={12} md={6} lg={4} className="mb-4">
                  <Card>
                    <Card.Img
                      variant="top"
                      src={`/api/${photo.path}`}
                      alt={`Image ${photo.id}`}
                      crossOrigin="anonymous"
                      style={{
                        width: "100%",
                        height: "auto",
                        objectFit: "cover",
                      }}
                    />
                    <Card.Body>
                      <Card.Title>Photo ID: {photo.id}</Card.Title>
                      <Card.Text>
                        <small className="text-muted">
                          Date: {formatDate(photo.purchased_at)}
                        </small>

                        <br />
                        <strong>Price: ${photo.price}</strong>
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            ) : (
              <p className="text-white">No photos purchased yet.</p>
            )}
          </Row>
        )}
      </div>
    </Layout>
  );
};

export default PurchasedPhotos;
