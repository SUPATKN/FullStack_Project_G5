import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Image } from "react-bootstrap";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import Layout from "../../Layout";
import { User } from "../../types/api";
import "./AlbumPhotosPage.css";

interface Photo {
  id: string;
  path: string;
  user_id: string;
  price: number;
  title: string;
  description: string;
  created_at: string;
}

interface Album {
  title: string;
  description: string;
  user_id: string;
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

const ViewAlbumPhotos: React.FC = () => {
  const { albumId } = useParams();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [album, setAlbum] = useState<Album | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [overlayVisible, setOverlayVisible] = useState(false);

  const navigate = useNavigate();

  const fetchUserProfile = async (id: string) => {
    try {
      const response = await axios.get<User>(`/api/user/${id}`);
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const fetchAlbumPhotos = async () => {
    try {
      const response = await axios.get(`/api/album/${albumId}/photos`);
      setPhotos(response.data);
    } catch (error) {
      console.error("Error fetching album photos:", error);
    }
  };

  const fetchAlbumDetails = async () => {
    try {
      const response = await axios.get(`/api/album/${albumId}`);
      const albumData = response.data;
      setAlbum(albumData);
      if (albumData.user_id) {
        await fetchUserProfile(albumData.user_id);
      }
    } catch (error) {
      console.error("Error fetching album details:", error);
    }
  };

  const handleExportAlbum = async () => {
    try {
      const canvas = document.createElement("canvas");
      const canvasWidth = 1080;
      const canvasHeight = 1920;
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        console.error("Failed to get canvas context.");
        return;
      }

      ctx.fillStyle = "#b9b9b9b9";
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      ctx.fillStyle = "#000";
      ctx.font = "bold 36px 'Press Start 2P', cursive";
      ctx.textAlign = "center";
      ctx.fillText(`${album?.title || ""}`, canvasWidth / 2, 50);

      ctx.font = "28px Arial";
      ctx.fillText(`${user?.username || "Unknown"}`, canvasWidth / 2, 90);

      ctx.font = "60px Arial";
      ctx.fillText(
        `----------------------------------------------------`,
        canvasWidth / 2,
        150
      );

      const containerWidth = 500;
      const containerHeight = 500;
      const padding = 50;

      const positions = [
        { x: padding, y: 100 + padding },
        { x: padding + containerWidth + padding, y: 100 + padding },
        { x: padding, y: 100 + padding + containerHeight + padding },
        {
          x: padding + containerWidth + padding,
          y: 100 + padding + containerHeight + padding,
        },
        { x: padding, y: 100 + 2 * (containerHeight + padding) },
        {
          x: padding + containerWidth + padding,
          y: 100 + 2 * (containerHeight + padding),
        },
      ];

      await Promise.all(
        photos.slice(0, 6).map(async (photo, i) => {
          try {
            const response = await fetch(`/api/${photo.path}`);
            const blob = await response.blob();
            const imageBitmap = await createImageBitmap(blob);

            const scale = Math.min(
              containerWidth / imageBitmap.width,
              containerHeight / imageBitmap.height
            );
            const width = imageBitmap.width * scale;
            const height = imageBitmap.height * scale;

            const offsetX = (containerWidth - width) / 2;
            const offsetY = (containerHeight - height) / 2;

            const pos = positions[i];

            ctx.drawImage(
              imageBitmap,
              pos.x + offsetX,
              pos.y + offsetY,
              width,
              height
            );
          } catch (error) {
            console.error(
              `Failed to fetch or render image: ${photo.path}`,
              error
            );
          }
        })
      );

      const now = new Date();
      const date = now.toLocaleDateString();
      const time = now.toLocaleTimeString();

      ctx.fillStyle = "#000";
      ctx.font = "24px Arial";
      ctx.textAlign = "center";
      ctx.fillText(`Date: ${date}`, canvasWidth / 2, canvasHeight - 120);
      ctx.fillText(`Time: ${time}`, canvasWidth / 2, canvasHeight - 90);

      ctx.font = "60px Arial";
      ctx.fillText(
        `----------------------------------------------------`,
        canvasWidth / 2,
        canvasHeight - 40
      );

      const previewUrl = canvas.toDataURL("image/png");
      setPreviewImage(previewUrl);
    } catch (error) {
      console.error("Error exporting album:", error);
    }
  };

  const handleDownload = () => {
    if (previewImage) {
      const link = document.createElement("a");
      link.download = "album-preview.png";
      link.href = previewImage;
      link.click();
    }
  };

  const handleNextPhoto = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % photos.length);
  };

  const toggleOverlay = () => {
    setOverlayVisible(!overlayVisible);
  };

  useEffect(() => {
    fetchAlbumPhotos();
    fetchAlbumDetails();
  }, [albumId]);

  useEffect(() => {
    if (photos.length > 0) {
      // Update the background image
      const prevIndex = (currentIndex - 1 + photos.length) % photos.length;
      const prevPhoto = photos[prevIndex];

      // ทำให้การเปลี่ยนพื้นหลังมีการเคลื่อนไหวที่สมูท
      document.body.style.transition =
        "background-image 1s ease-in-out, background-size 1s ease-in-out, background-position 1s ease-in-out";
      document.body.style.backgroundImage = `url(/api/${prevPhoto.path})`;
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
      document.body.style.backgroundRepeat = "no-repeat";
      document.body.classList.add("dark-overlay");
    }

    return () => {
      document.body.style.transition = ""; // ลบ transition เมื่อลบพื้นหลัง
      document.body.style.backgroundImage = "";
      document.body.classList.remove("dark-overlay");
    };
  }, [currentIndex, photos]);

  const currentPhoto = photos[currentIndex];

  return (
    <Layout>
      <div
        className={`overlay ${overlayVisible ? "active" : ""}`}
        onClick={toggleOverlay}
      />
      <div className="album-container">
        <div className="album-details">
          <h1>{album?.title}</h1>
          <p>{album?.description}</p>
        </div>
        <div className="card-container">
          {photos.length > 0 && (
            <TransitionGroup>
              <CSSTransition
                key={photos[currentIndex].id}
                timeout={500}
                classNames="fade"
              >
                <div className="card-content">
                  <div className="photo-info">
                    <h4>{photos[currentIndex].title}</h4>
                    <p>{photos[currentIndex].description}</p>
                    <p>
                      <strong>Date:</strong>{" "}
                      {formatDate(photos[currentIndex].created_at)}
                    </p>
                    <p>
                      <strong>Price:</strong> {photos[currentIndex].price}
                    </p>
                  </div>
                  <div className="photo-image-container">
                    <Image
                      src={`/api/${photos[currentIndex].path}`}
                      thumbnail
                      className="photo-image"
                      alt={`Image ${photos[currentIndex].id}`}
                    />
                  </div>
                </div>
              </CSSTransition>
            </TransitionGroup>
          )}
          <Button onClick={handleNextPhoto} className="mt-3">
            Next Photo
          </Button>
        </div>
        <div className="export-container">
          <Button
            variant="success"
            onClick={handleExportAlbum}
            className="me-2"
          >
            Export Album
          </Button>
          <Button variant="secondary" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
        {previewImage && (
          <div className="preview-container">
            <h3>Album Preview:</h3>
            <img
              src={previewImage}
              alt="Album Preview"
              className="preview-image"
            />
            <Button onClick={handleDownload} className="mt-2">
              Download Preview
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ViewAlbumPhotos;