import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Button, Image } from "react-bootstrap";
import Layout from "./Layout";

interface PhotoDetailProps {
  id: number;
  path: string;
  user_id: number;
  price: number;
}

interface UserProfile {
  id: number;
  username: string;
  email: string;
}

const PhotoDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [photo, setPhoto] = useState<PhotoDetailProps | null>(null);
  const [hasPurchased, setHasPurchased] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Fetch current user when component mounts
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      try {
        const response = await axios.get<UserProfile>(
          "http://localhost:3000/api/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCurrentUser(response.data);
      } catch (error: unknown) {
        console.error("Error fetching current user:", error);
      }
    };

    fetchCurrentUser();
  }, []); // Dependency array is empty, so this only runs once on mount

  // Fetch photo details and purchase status when `id` or `currentUser` changes
  useEffect(() => {
    const fetchPhotoDetails = async () => {
      try {
        // Fetch photo details
        const photoResponse = await axios.get<PhotoDetailProps>(
          `/api/photo/${id}`
        );
        setPhoto(photoResponse.data);

        // Re-check purchase status after fetching photo details
        if (currentUser) {
          const purchaseResponse = await axios.get<{ purchased: boolean }>(
            `/api/photo/${id}/user/${currentUser.id}/status`
          );
          setHasPurchased(purchaseResponse.data.purchased);
        }
      } catch (error) {
        console.error("Error fetching photo detail:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id && currentUser) {
      fetchPhotoDetails();
    }
  }, [id, currentUser]); // Run when `id` or `currentUser` changes

  const handlePurchase = async () => {
    if (photo && currentUser) {
      try {
        await axios.post(`/api/photo/${photo.id}/buy`, {
          userId: currentUser.id,
        });
        setHasPurchased(true); // Update purchase status immediately
      } catch (error) {
        console.error("Error purchasing photo:", error);
      }
    }
  };

  // Handle right-click on the image
  const handleImageContextMenu = (
    e: React.MouseEvent<HTMLImageElement, MouseEvent>
  ) => {
    e.preventDefault();
    console.log("Right-click on the photo");
  };

  return (
    <Layout>
      <h3 className="mb-4 text-center">Photo Detail</h3>
      {loading ? (
        <p>Loading...</p>
      ) : photo ? (
        <div className="text-center">
          <h2>PhotoID: {photo.id}</h2>
          <Image
            crossOrigin="anonymous"
            src={`/api/${photo.path}`}
            alt={`Image ${photo.id}`}
            thumbnail
            className="w-50"
            onContextMenu={handleImageContextMenu}
          />
          <h4>
            Price: {photo.price > 0 ? `$${photo.price}` : "Free Download"}
          </h4>
          {photo.price > 0 && !hasPurchased ? (
            <Button variant="primary" onClick={handlePurchase}>
              Buy for ${photo.price}
            </Button>
          ) : (
            <Button variant="primary" href={`/api/${photo.path}`}>
              Download
            </Button>
          )}
          {currentUser && (
            <p className="mt-3">Logged in as: {currentUser.username}</p>
          )}
        </div>
      ) : (
        <p>Photo not found</p>
      )}
    </Layout>
  );
};

export default PhotoDetail;
