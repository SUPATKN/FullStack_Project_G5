import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Image } from "react-bootstrap";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import Layout from "../../Layout";
import { User } from "../../types/api";
import useAuth from "../../hook/useAuth";
import "./AlbumPhotosPage.css";
import { ChevronRight, ChevronLeft } from "lucide-react";

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

const ViewAlbumPhotos: React.FC = () => {
  const { albumId } = useParams();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [album, setAlbum] = useState<Album | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const { user: currentUser, refetch } = useAuth();

  const navigate = useNavigate();

  const fetchUserProfile = async (id: string) => {
    try {
      const response = await axios.get<User>(`/api/user/${id}`);
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  console.log("DATA", currentUser?.username);

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
  
      // Gradient Background
      const gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
      gradient.addColorStop(0, "#a8edea");
      gradient.addColorStop(1, "#fed6e3");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  
      // Album Title
      ctx.fillStyle = "#3e3e3e";
      ctx.font = "bold 56px 'Press Start 2P', cursive";
      ctx.textAlign = "center";
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 8;
      ctx.fillText(`${album?.title || "Album Title"}`, canvasWidth / 2, 120);
  
      // Username
      ctx.font = "40px 'Arial', sans-serif";
      ctx.fillStyle = "#555";
      ctx.fillText(`${currentUser?.username || "Unknown User"}`, canvasWidth / 2, 180);
  
      // Decorative Line
      ctx.font = "30px Arial";
      ctx.fillStyle = "#888";
      ctx.fillText("––––––––––––––––––––––––", canvasWidth / 2, 240);
  
      // Image positions
      const containerWidth = 450;
      const containerHeight = 450;
      const padding = 40;
  
      const positions = [
        { x: padding, y: 300 + padding },
        { x: padding + containerWidth + padding, y: 300 + padding },
        { x: padding, y: 300 + padding + containerHeight + padding },
        { x: padding + containerWidth + padding, y: 300 + padding + containerHeight + padding },
        { x: padding, y: 300 + 2 * (containerHeight + padding) },
        { x: padding + containerWidth + padding, y: 300 + 2 * (containerHeight + padding) },
      ];
  
      await Promise.all(
        photos.slice(0, 6).map(async (photo, i) => {
          try {
            const response = await fetch(`/api/${photo.path}`);
            const blob = await response.blob();
            const imageBitmap = await createImageBitmap(blob);
  
            const scale = Math.min(containerWidth / imageBitmap.width, containerHeight / imageBitmap.height);
            const width = imageBitmap.width * scale;
            const height = imageBitmap.height * scale;
  
            const offsetX = (containerWidth - width) / 2;
            const offsetY = (containerHeight - height) / 2;
  
            const pos = positions[i];
  
            // Shadow and Border for Images
            ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
            ctx.shadowBlur = 15;
            ctx.drawImage(imageBitmap, pos.x + offsetX, pos.y + offsetY, width, height);
            
            ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
            ctx.shadowBlur = 5;
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 5;
            ctx.strokeRect(pos.x + offsetX, pos.y + offsetY, width, height);
            ctx.shadowBlur = 0;
  
          } catch (error) {
            console.error(`Failed to fetch or render image: ${photo.path}`, error);
          }
        })
      );
  
      const logoImage = new window.Image(); 
logoImage.src = '/LOGOArtandCommunity.png';

await new Promise<void>((resolve) => {
  logoImage.onload = () => {
    const logoWidth = 200; // ขนาดโลโก้
    const logoHeight = 100; // ขนาดโลโก้
    ctx.drawImage(logoImage, canvasWidth - logoWidth - 20, 70, logoWidth, logoHeight); // วางโลโก้ในมุมขวาบน โดยเลื่อนลงมา 50px
    resolve();
  };
});

  
      // Date and Time
      const now = new Date();
      const date = now.toLocaleDateString();
      const time = now.toLocaleTimeString();
  
      ctx.fillStyle = "#3e3e3e";
      ctx.font = "bold 30px Arial";
      ctx.fillText(`Date: ${date}`, canvasWidth / 2, canvasHeight - 180);
      ctx.fillText(`Time: ${time}`, canvasWidth / 2, canvasHeight - 140);
  
      // Decorative Line at the Bottom
      ctx.font = "30px Arial";
      ctx.fillStyle = "#888";
      ctx.fillText("––––––––––––––––––––––––", canvasWidth / 2, canvasHeight - 80);
  
      // Create preview URL
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

  // const handleNextPhoto = () => {
  //   setCurrentIndex((prevIndex) => (prevIndex + 1) % photos.length);
  // };

  const toggleOverlay = () => {
    setOverlayVisible(!overlayVisible);
  };

  useEffect(() => {
    fetchAlbumPhotos();
    fetchAlbumDetails();
  }, [albumId]);

  const handlePreviousPhoto = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + photos.length) % photos.length
    );
  };

  const handleNextPhoto = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % photos.length);
  };

  // Get the previous photo to set as background
  const previousIndex = (currentIndex - 1 + photos.length) % photos.length;
  const backgroundImage =
    photos.length > 0 ? `/api/${photos[previousIndex].path}` : "";

  // const visiblePhotos = [
  //   photos[currentIndex % photos.length],
  //   photos[(currentIndex + 1) % photos.length],
  //   photos[(currentIndex + 2) % photos.length],
  // ];

  return (
    <Layout>
      <div
        className={`overlay ${overlayVisible ? "active" : ""}`}
        onClick={toggleOverlay}
      />
      <div
        className="album-container mt-3 mb-5"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: "cover", // Cover the entire area
          backgroundPosition: "center", // Center the image
          padding: "20px", // Add some padding for content
          position: "relative", // Make positioning relative for overlay
          color: "white", // Text color for readability
        }}
      >
        <div className="flex flex-col items-start justify-start">
          {" "}
          {/* ใช้ items-start และ justify-start */}
          <h1 className="text-[#ff8833] text-[40px] font-bold">
            {album?.title}  -  {album?.description}
          </h1>
        </div>

        <div className="card-container">
          {photos.length > 0 && (
            <TransitionGroup>
              <CSSTransition
                key={photos[currentIndex].id}
                timeout={500}
                classNames="fade"
              >
                <div className="card-content flex items-center">
                  <div className="photo-navigation flex-shrink-0">
                    <div
                      className="w-12 h-12 flex items-center justify-center rounded-full text-black bg-white shadow-lg cursor-pointer hover:text-[#ff8833]"
                      onClick={handlePreviousPhoto}
                    >
                      <ChevronLeft />
                    </div>
                  </div>
                  
                  <div className="photo-info flex-grow mb-5">
                    <h4 className="mt-2">{photos[currentIndex].title}</h4>{" "}
                    {/* ปรับ margin-top */}
                    <p className="custom-text-size mb-5">
                      {" "}
                      {/* ปรับ margin-top */}
                      {photos[currentIndex].description}
                    </p>
                  </div>

                  <div className="photo-image-container">
                    <Image
                      src={`/api/${photos[currentIndex].path}`}
                      thumbnail
                      className="photo-image w-full h-auto"
                      alt={`Image ${photos[currentIndex].id}`}
                    />
                  </div>
                  <div className="photo-navigation flex-shrink-0">
                    <div
                      className="w-12 h-12 flex items-center justify-center rounded-full bg-white text-black shadow-lg cursor-pointer hover:text-[#ff8833]"
                      onClick={handleNextPhoto}
                    >
                      <ChevronRight />
                    </div>
                  </div>
                </div>
              </CSSTransition>
            </TransitionGroup>
          )}

          
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
              <div className="flex items-center justify-center gap-2 flex-row">
                <Button onClick={handleDownload} className="mt-2">
                  Download Preview
                </Button>
                <Button
                  onClick={() => setPreviewImage(null)}
                  className="mt-2"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ViewAlbumPhotos;
