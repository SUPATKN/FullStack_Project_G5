import React, { useEffect, ChangeEvent, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import Layout from "../../Layout";
import axios from "axios";
import { Button, Form, Image, Row, Col } from "react-bootstrap";
import useAuth from "../../hook/useAuth";
import { User, Album } from "../../types/api";
import CreateAlbumForm from "./CreateAlbumForm"; // นำเข้าฟอร์ม
import SelectAlbumModal from "../../components/SelectAlbumModal"; // Import modal component
import "../global.css";

interface Photo {
  id: string;
  path: string;
  user_id: string;
  price: number;
  created_at: string;
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

const Profile: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const location = useLocation();
  const { userId } = useParams(); // Get userId from URL params
  const [user, setUser] = useState<User | null>(null);
  const { user: currentUser, refetch } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isEdit, setIsEdit] = useState(false);
  const [isUpload, setIsUpload] = useState(false);
  const [isCreateAlbum, setCreateAlbum] = useState(false);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [albumPhotosMap, setAlbumPhotosMap] = useState<Record<string, Photo[]>>(
    {}
  );

  const [showSelectAlbumModal, setShowSelectAlbumModal] = useState(false);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string>("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const navigate = useNavigate(); // For navigation

  const handleCreateAlbum = async (title: string, description: string) => {
    try {
      const response = await axios.post("/api/create_album", {
        user_id: currentUser?.id,
        title,
        description,
      });
      console.log("Album created:", response.data);
      fetchUserAlbums(); // Refetch albums after creation
    } catch (error) {
      console.error("Error creating album:", error);
      setError("Failed to create album");
    }
  };

  const fetchUserAlbums = async () => {
    try {
      const response = await axios.get(`/api/albums/${userId}`);

      // Check if the response contains an empty array
      if (Array.isArray(response.data) && response.data.length > 0) {
        setAlbums(response.data); // Set albums state if data is available
      } else {
        setAlbums([]); // Set empty array if no albums are found
      }
    } catch (error) {
      // Log the error only if it's not related to empty data
      if (axios.isAxiosError(error) && error.response?.status !== 404) {
        console.error("Error fetching albums:", error);
      }
    }
  };

  const handleDeleteAlbum = async (albumId: string) => {
    try {
      await axios.delete(`/api/album/${albumId}`);
      console.log("Album deleted");
      fetchUserAlbums(); // Refetch albums after deletion
    } catch (error) {
      console.error("Error deleting album:", error);
      setError("Failed to delete album");
    }
  };

  const handleAddPhotoClick = (photoId: string) => {
    setSelectedPhotoId(photoId);

    setShowSelectAlbumModal(true);
  };

  // const handleAlbumSelect = (albumId: string) => {
  //   if (selectedPhotoId) {
  //     handleAddPhotoToAlbum(albumId, selectedPhotoId);
  //   }
  // };

  const fetchAlbumPhotos = async (albumId: string) => {
    try {
      const response = await axios.get(`/api/album/${albumId}/photos`);
      setAlbumPhotosMap((prevMap) => ({
        ...prevMap,
        [albumId]: response.data, // Update only the specific album's photos
      }));
    } catch (error) {
      console.error("Error fetching album photos:", error);
      setError("Failed to fetch album photos");
    }
  };

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

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files[0];
      setFile(file);
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first!");
      return;
    }

    const formData = new FormData();
    formData.append("profilePic", file);
    formData.append("user_id", user?.id?.toString() || "");

    try {
      await axios.post("/api/profilePic/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setError(null);
      setSelectedImage("");
      setIsUpload(false);
      if (userId) {
        fetchUserProfile(parseInt(userId, 10)); // Refetch the updated user data
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setError("Failed to upload file.");
    }
  };

  const fetchUserProfile = async (id: number) => {
    try {
      const response = await axios.get<User>(`/api/user/${id}`);
      setUser(response.data);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data.error || "Failed to fetch user profile");
      } else {
        setError("An unexpected error occurred");
      }
    }
  };

  const fetchPhotos = async () => {
    try {
      const { data } = await axios.get<Photo[]>("/api/photo");
      setPhotos(data);
    } catch (error) {
      console.error("Error fetching photos:", error);
      setError("Failed to fetch photos");
    }
  };

  useEffect(() => {
    refetch();
    if (location.state && location.state.user) {
      setUser(location.state.user);
    } else if (userId) {
      fetchUserProfile(parseInt(userId, 10));
    } else {
      setError("User profile not found");
    }
    fetchPhotos();
    fetchUserAlbums();
  }, [location.state, userId]);

  useEffect(() => {
    if (user?.avatarURL) {
      fetchUserProfile(parseInt(userId!, 10)); // Refetch the updated profile if avatarURL changes
    }
  }, [user?.avatarURL, userId]);

  // useEffect(() => {
  //   fetchAlbumPhotos();
  // }, [albumPhotos]);

  const handleEdit = () => {
    setIsEdit(!isEdit);
  };

  const handleUploadPic = () => {
    setIsUpload(!isUpload);
  };

  const handleIsCreate = () => {
    setCreateAlbum(!isCreateAlbum);
  };
  const handleDelete = async (filename: string) => {
    try {
      await axios.delete(`/api/photo/${filename}`);
      setError(null);

      const updatedPhotos = photos.filter(
        (photo) => photo.path.split("/").pop() !== filename
      );
      setPhotos(updatedPhotos);
    } catch (error) {
      console.error("Error deleting file:", error);
      setError("Failed to delete file.");
    }
  };

  const handleViewPurchasedPhotos = () => {
    if (user) {
      navigate("/purchased-photos", { state: { userId: user.id } });
    }
  };

  const handleExportAlbum = async (albumId: string) => {
    try {
      const album = albums.find((a) => a.album_id.toString() === albumId);
      if (!album) {
        alert("Album not found.");
        return;
      }

      const albumPhotos = albumPhotosMap[albumId];
      if (!albumPhotos || albumPhotos.length === 0) {
        alert("No photos to export in this album.");
        return;
      }

      // สร้าง canvas และกำหนดขนาด
      const canvas = document.createElement("canvas");
      const canvasWidth = 1080; // ความกว้างของ canvas
      const canvasHeight = 1920; // ความสูงของ canvas
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        console.error("Failed to get canvas context.");
        return;
      }

      // กำหนดพื้นหลังเป็นสีเทาอ่อน
      ctx.fillStyle = "#b9b9b9b9"; // สีพื้นหลัง
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // วาดชื่อ album และชื่อ user ที่ด้านบนของ canvas
      ctx.fillStyle = "#000"; // สีข้อความเป็นสีดำ
      ctx.font = "bold 36px 'Press Start 2P', cursive"; // ใช้ฟอนต์พิกเซลสำหรับชื่อ album
      ctx.textAlign = "center";
      ctx.fillText(`${album.title}`, canvasWidth / 2, 50); // วาดชื่อ album

      ctx.font = "28px Arial"; // ขนาดฟอนต์ใหญ่ขึ้นสำหรับชื่อ user
      ctx.fillText(`${user?.username || "Unknown"}`, canvasWidth / 2, 90); // วาดชื่อ user
      ctx.font = "60px Arial";

      ctx.fillText(
        `----------------------------------------------------`,
        canvasWidth / 2,
        150
      );

      // กำหนดขนาดของ container แบบคงที่
      const containerWidth = 500; // ความกว้างของ container
      const containerHeight = 500; // ความสูงของ container
      const padding = 20; // ระยะห่างระหว่าง container

      // กำหนดตำแหน่งที่แน่นอนสำหรับรูปภาพ
      const positions = [
        { x: padding, y: 100 + padding }, // ตำแหน่งของภาพที่ 1
        { x: padding + containerWidth + padding, y: 100 + padding }, // ตำแหน่งของภาพที่ 2
        { x: padding, y: 100 + padding + containerHeight + padding }, // ตำแหน่งของภาพที่ 3
        {
          x: padding + containerWidth + padding,
          y: 100 + padding + containerHeight + padding,
        }, // ตำแหน่งของภาพที่ 4
        { x: padding, y: 100 + 2 * (containerHeight + padding) }, // ตำแหน่งของภาพที่ 5
        {
          x: padding + containerWidth + padding,
          y: 100 + 2 * (containerHeight + padding),
        }, // ตำแหน่งของภาพที่ 6
      ];

      await Promise.all(
        albumPhotos.slice(0, 6).map(async (photo, i) => {
          try {
            // ดึงภาพจาก server
            const response = await fetch(`/api/${photo.path}`);
            const blob = await response.blob();
            const imageBitmap = await createImageBitmap(blob);

            // คำนวณขนาดภาพเพื่อให้พอดีกับ container แบบคงที่
            const scale = Math.min(
              containerWidth / imageBitmap.width,
              containerHeight / imageBitmap.height
            );
            const width = imageBitmap.width * scale;
            const height = imageBitmap.height * scale;

            // คำนวณตำแหน่งของภาพให้แสดงได้พอดี
            const offsetX = (containerWidth - width) / 2;
            const offsetY = (containerHeight - height) / 2;

            // ตำแหน่งของภาพ
            const pos = positions[i];

            // วาดภาพใน container
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

      // ดึงวันที่และเวลาปัจจุบัน
      const now = new Date();
      const date = now.toLocaleDateString(); // วันที่ในรูปแบบท้องถิ่น
      const time = now.toLocaleTimeString(); // เวลาปัจจุบันในรูปแบบท้องถิ่น

      // แสดงวันที่, เวลา, และเวลาที่ใช้ในการสร้าง canvas
      ctx.fillStyle = "#000"; // สีข้อความเป็นสีดำ
      ctx.font = "24px Arial"; // ขนาดฟอนต์ใหญ่ขึ้นสำหรับข้อมูลเวลา
      ctx.textAlign = "center";
      ctx.fillText(`Date: ${date}`, canvasWidth / 2, canvasHeight - 120); // แสดงวันที่
      ctx.fillText(`Time: ${time}`, canvasWidth / 2, canvasHeight - 90); // แสดงเวลา

      ctx.font = "60px Arial";

      ctx.fillText(
        `----------------------------------------------------`,
        canvasWidth / 2,
        canvasHeight - 40
      );

      // สร้าง URL ของภาพที่ได้จาก canvas
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

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center">
        {/* profile */}
        <h2>Profile</h2>
        <div className="mt-3">
          {user?.avatarURL ? (
            <Image
              src={`${user.avatarURL}`}
              alt="Profile Picture"
              roundedCircle
              width={150}
              height={150}
            />
          ) : (
            <Image
              src="https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg"
              alt="Default Avatar"
              roundedCircle
              width={150}
              height={150}
            />
          )}
        </div>
        {error ? (
          <p>{error}</p>
        ) : (
          user && (
            <div className="mt-3 flex flex-col items-center justify-center">
              <h5>Hello, {user.username}</h5>
              <p>Email: {user.email}</p>
              <p>ID: {user.id}</p>
            </div>
          )
        )}
      </div>
      {currentUser?.id == userId && (
        <Button variant="secondary" className="mb-3 flex flex-col items-center justify-center" onClick={handleUploadPic}>
          Upload profile picture
        </Button>
      )}
      {isUpload && (
        <div>
          <Form>
            <Form.Group controlId="formFile" className="mb-3">
              <Form.Label>Select Image</Form.Label>
              <Form.Control
                type="file"
                onChange={handleFileChange}
                data-cy="file-input"
              />
            </Form.Group>
            {selectedImage && (
              <div className="mb-3">
                <h3>Image Preview:</h3>
                <Image
                  src={selectedImage}
                  alt="Selected Image"
                  width="200"
                  thumbnail
                  data-cy="image-preview"
                />
              </div>
            )}
          </Form>
          <Button
            variant="primary"
            onClick={handleUpload}
            data-cy="upload-button"
          >
            Upload
          </Button>
        </div>
      )}

      <h1>My photos</h1>
      {currentUser?.id === user?.id && (
        <Button
          variant="secondary"
          className="mb-3"
          onClick={() => handleEdit()}
        >
          Edit
        </Button>
      )}
      {currentUser?.id == userId && (
        <Button
          variant="primary"
          className="mb-3"
          onClick={handleViewPurchasedPhotos}
        >
          View Purchased Photos
        </Button>
      )}
      <Row>
        {photos
          .filter((photo) => photo.user_id == user?.id?.toString())
          .map((photo) => (
            <Col key={photo.id} xs={12} md={4} lg={3} className="mb-4">
              <div className="position-relative">
                <Image
                  crossOrigin="anonymous"
                  src={`/api/${photo.path}`}
                  onClick={() => handlePhotoClick(photo.id)}
                  onContextMenu={(e) => handlePhotoContextMenu(e, photo.id)}
                  style={{ cursor: "pointer" }}
                  alt={`Image ${photo.id}`}
                  thumbnail
                  className="w-100"
                />
                {isEdit && (
                  <div>
                    <Button
                      variant="danger"
                      className="position-absolute top-0 start-0 m-2"
                      onClick={() => handleDelete(photo.path.split("/").pop()!)}
                    >
                      Delete
                    </Button>
                    <Button
                      variant="primary"
                      className="position-absolute top-0 end-0 m-2"
                      onClick={() => handleAddPhotoClick(photo.id)}
                    >
                      Add to album
                    </Button>
                  </div>
                )}
                Date: {formatDate(photo.created_at)}
                <br />
                Price: {photo.price}
              </div>
            </Col>
          ))}
      </Row>
      <h3>My Albums</h3>
      {currentUser?.id == userId && (
        <Button variant="primary" className="mb-3" onClick={handleIsCreate}>
          Create Album
        </Button>
      )}
      {isCreateAlbum && <CreateAlbumForm onCreateAlbum={handleCreateAlbum} />}

      {albums.map((album) => (
        <div key={album.album_id} className="mb-3">
          <h4>{album.title}</h4>
          <p>{album.description}</p>
          {currentUser?.id == userId && (
            <Button
              variant="danger"
              onClick={() => handleDeleteAlbum(album.album_id.toString())}
            >
              Delete Album
            </Button>
          )}
          <Button
            variant="info"
            onClick={() => fetchAlbumPhotos(album.album_id.toString())}
            className="ms-2"
          >
            View Photos
          </Button>
          {/* เพิ่มปุ่ม Export Album */}
          <Button
            variant="success"
            onClick={() => handleExportAlbum(album.album_id.toString())} // เรียกฟังก์ชันสำหรับ export
            className="ms-2"
          >
            Export Album
          </Button>
          <div className="mt-3">
            {albumPhotosMap[album.album_id]?.map((photo) => {
              return (
                <div key={photo.id} className="m-2">
                  <Image
                    src={`/api/${photo.path}`}
                    thumbnail
                    width={100}
                    height={100}
                    onClick={() => handlePhotoClick(photo.id)}
                    onContextMenu={(e) => handlePhotoContextMenu(e, photo.id)}
                    style={{ cursor: "pointer" }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {showSelectAlbumModal && (
        <SelectAlbumModal
          albums={albums}
          photo_id={selectedPhotoId}
          onClose={() => setShowSelectAlbumModal(false)}
        />
      )}
      {previewImage && (
        <div>
          <h3>Album Preview:</h3>
          <img
            src={previewImage}
            alt="Album Preview"
            style={{ maxWidth: "100%", maxHeight: "500px" }}
          />
          <Button onClick={handleDownload}>Download Preview</Button>
        </div>
      )}
    </Layout>
  );
};

export default Profile;
