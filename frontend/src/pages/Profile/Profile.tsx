import React, { useEffect, ChangeEvent, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import Layout from "../../Layout";
import axios from "axios";
import { Form, Image, Row, Col } from "react-bootstrap";
import useAuth from "../../hook/useAuth";
import { User, Album } from "../../types/api";
import CreateAlbumForm from "./CreateAlbumForm"; // นำเข้าฟอร์ม
import SelectAlbumModal from "../../components/SelectAlbumModal"; // Import modal component
import "../global.css";
import { Link } from "react-router-dom";
import { SquarePen, ShoppingBag, SquareArrowUpRight, Tag } from "lucide-react";

interface Photo {
  id: string;
  path: string;
  user_id: string;
  price: number;
  title: string;
  description: string;
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
  // const [albumPhotosMap, setAlbumPhotosMap] = useState<Record<string, Photo[]>>(
  //   {}
  // );

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
      handleCloseCreateAlbum();
    } catch (error) {
      console.error("Error creating album:", error);
      setError("Failed to create album");
    }
  };
  const handleCloseCreateAlbum = () => setCreateAlbum(false);
  const handleClosePreview = () => setPreviewImage(null);

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

  // const fetchAlbumPhotos = async (albumId: string) => {
  //   try {
  //     const response = await axios.get(`/api/album/${albumId}/photos`);
  //     setAlbumPhotosMap((prevMap) => ({
  //       ...prevMap,
  //       [albumId]: response.data, // Update only the specific album's photos
  //     }));
  //   } catch (error) {
  //     console.error("Error fetching album photos:", error);
  //     setError("Failed to fetch album photos");
  //   }
  // };

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

  const handleExportAlbum = async () => {};

  const handleDownload = () => {
    if (previewImage) {
      const link = document.createElement("a");
      link.download = "album-preview.png";
      link.href = previewImage;
      link.click();
    }
  };

  const handleCloseUpload = () => setIsUpload(false);
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center">
        {/* profile */}
        <h2>MY PROFILE </h2>
        <div className="w-[600px] h-[450px] bg-white border shadow-md rounded-lg">
          {error ? (
            <p>{error}</p>
          ) : (
            user && (
              <div className="mt-3 flex flex-col items-center justify-center">
                <h5>{user.username}</h5>
                <p>Email: {user.email}</p>
                <p>ID: {user.id}</p>
                <p>COINS: {user.coin} coins</p>
              </div>
            )
          )}
          <div className="mt-3 flex items-center justify-center">
            {user?.avatarURL ? (
              <Image
                src={`${user.avatarURL}`}
                alt="Profile Picture"
                className="w-36 h-36 rounded-full"
                width={150}
                height={150}
              />
            ) : (
              <Image
                src="https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg"
                alt="Default Avatar"
                width={150}
                height={150}
                className="w-36 h-36 rounded-full"
              />
            )}
          </div>
          <div className="flex items-center justify-center gap-3 mt-5">
            {currentUser?.id == userId && (
              <button
                className="w-[170px] h-[35px] bg-[#007bff] rounded-md text-white cursor-pointer hover:bg-blue-500 flex items-center justify-center text-center no-underline hover:no-underline"
                onClick={handleUploadPic}
              >
                Upload profile picture
              </button>
            )}
            <Link
              to="/"
              className="w-[100px] h-[35px] bg-red-600 rounded-md text-white cursor-pointer hover:bg-red-500 flex items-center justify-center text-center no-underline hover:no-underline"
            >
              Back
            </Link>
          </div>
          {isUpload && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-5 rounded-lg shadow-lg relative">
                <h3 className="text-xl mb-3 text-center">Select Image</h3>
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
                      <h3 className="text-xl mb-3 text-center flex justify-start">
                        Image Preview
                      </h3>
                      <div className="flex items-center justify-center">
                        <Image
                          src={selectedImage}
                          alt="Selected Image"
                          width="200"
                          thumbnail
                          data-cy="image-preview"
                        />
                      </div>
                    </div>
                  )}
                </Form>
                <div className="flex items-center justify-center gap-3 mt-2">
                  <button
                    className="w-[100px] h-[35px] bg-[#007bff] rounded-md text-white cursor-pointer hover:bg-blue-500 flex items-center justify-center text-center no-underline hover:no-underline"
                    onClick={handleUpload}
                  >
                    Upload
                  </button>
                  <button
                    className="w-[100px] h-[35px] bg-red-600 rounded-md text-white cursor-pointer hover:bg-red-500 flex items-center justify-center text-center no-underline hover:no-underline"
                    onClick={handleCloseUpload}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col items-center justify-center mt-3">
        <h2>MY PHOTOS</h2>
        <div className="flex items-center justify-center gap-3">
          {currentUser?.id === user?.id && (
            <button
              className="w-[100px] h-[35px] bg-red-600 rounded-md text-white cursor-pointer hover:bg-red-500 flex items-center justify-center text-center no-underline hover:no-underline"
              onClick={() => handleEdit()}
            >
              <SquarePen className="text-white w-10 h-[20px] mr-2" />
              Edit
            </button>
          )}
          {currentUser?.id == userId && (
            <button
              className="w-[230px] h-[35px] bg-[#007bff] rounded-md text-white cursor-pointer hover:bg-blue-500 flex items-center justify-center text-center no-underline hover:no-underline"
              onClick={handleViewPurchasedPhotos}
            >
              <ShoppingBag className="text-white w-10 h-[20px] mr-2" />
              View Purchased Photos
            </button>
          )}
        </div>
        <Row className="">
          {photos
            .filter((photo) => photo.user_id == user?.id?.toString())
            .map((photo) => (
              <Col key={photo.id} xs={12} md={4} lg={3}>
                <div className="flex flex-col w-[300px] h-[400px] bg-white rounded-lg shadow-md border mt-3 p-2">
                  <div className="flex items-center justify-between mt-3">
                    <h3 className="text-[16px] ml-4">Photo{photo.id}</h3>
                    <SquareArrowUpRight className="mr-4" />
                  </div>
                  <h2 className="text-[12px] flex justify-start ml-4">Brand</h2>
                  <div className="flex items-center justify-start gap-2 ml-4">
                    <Tag className="text-[#ff8833]" />
                    <h2 className="text-[16px]">Animal</h2>
                  </div>

                  <div className="position-relative flex flex-col items-center justify-center mt-2">
                    <Image
                      crossOrigin="anonymous"
                      src={`/api/${photo.path}`}
                      onClick={() => handlePhotoClick(photo.id)}
                      onContextMenu={(e) => handlePhotoContextMenu(e, photo.id)}
                      className="cursor-pointer h-[100%] w-[90%] object-cover"
                      alt={`Image ${photo.id}`}
                      // thumbnail
                    />
                    <div className="mr-14 mt-2">
                      Date: {formatDate(photo.created_at)}
                      <br />
                      Price: {photo.price}
                    </div>
                    {isEdit && (
                      <div className="flex items-center justify-center gap-3 mt-2">
                        <button
                          className="w-[80px] h-[35px] bg-red-600 rounded-md text-white cursor-pointer hover:bg-red-500 flex items-center justify-center text-center no-underline hover:no-underline"
                          onClick={() =>
                            handleDelete(photo.path.split("/").pop()!)
                          }
                        >
                          Delete
                        </button>
                        <button
                          className="w-[120px] h-[35px] bg-[#007bff] rounded-md text-white cursor-pointer hover:bg-blue-500 flex items-center justify-center text-center no-underline hover:no-underline"
                          onClick={() => handleAddPhotoClick(photo.id)}
                        >
                          Add to album
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </Col>
            ))}
        </Row>
      </div>
      <div className="flex flex-col items-center justify-center mt-3">
        <h2>MY ALBUMS</h2>
        {currentUser?.id == userId && (
          <button
            className="w-[170px] h-[35px] bg-[#007bff] rounded-md text-white cursor-pointer hover:bg-blue-500 flex items-center justify-center text-center no-underline hover:no-underline"
            onClick={handleIsCreate}
          >
            <SquarePen className="text-white w-10 h-[20px] mr-2" />
            Create Album
          </button>
        )}
        {isCreateAlbum && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-5 rounded-lg shadow-lg relative w-[400px]">
              <div className="flex items-center justify-between">
                <h3 className="text-xl">Create Album</h3>
                <button
                  className="w-[100px] h-[35px] bg-red-600 rounded-md text-white cursor-pointer hover:bg-red-500 flex items-center justify-center text-center no-underline hover:no-underline"
                  onClick={handleCloseCreateAlbum}
                >
                  Cancel
                </button>
              </div>
              <div className="">
                <CreateAlbumForm onCreateAlbum={handleCreateAlbum} />
              </div>
            </div>
          </div>
        )}
        <div className="flex flex-wrap gap-[31px] mt-3">
          {albums.map((album) => (
            <div className="flex flex-col w-[300px] h-[400px] bg-white rounded-lg shadow-md border p-2">
              <div key={album.album_id} className="">
                <h4 className="text-[20px] font-semibold mt-3 ml-4">
                  Album Name: {album.title}
                </h4>
                <p className="ml-4">Description: {album.description}</p>
                <div className="mt-2 flex-wrap flex items-center justify-center w-[280px] h-[200px] bg-gray-200 shadow-lg border rounded-lg">
                  {albumPhotosMap[album.album_id]?.map((photo) => {
                    return (
                      <div
                        key={photo.id}
                        className="m-2 flex items-center justify-center"
                      >
                        <Image
                          src={`/api/${photo.path}`}
                          // thumbnail
                          width={100}
                          height={100}
                          onClick={() => handlePhotoClick(photo.id)}
                          onContextMenu={(e) =>
                            handlePhotoContextMenu(e, photo.id)
                          }
                          style={{ cursor: "pointer" }}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-center gap-4 mt-2">
                  <button
                    className="w-[110px] h-[35px] bg-[#007bff] rounded-md text-white cursor-pointer hover:bg-blue-500 flex items-center justify-center text-center no-underline hover:no-underline"
                    onClick={() => navigate(`/album/${album.album_id}/photos`)} // Navigate to new page
                  >
                    View Albums
                  </button>
                  {currentUser?.id == userId && (
                    <button
                      className="w-[110px] h-[35px] bg-red-600 rounded-md text-white cursor-pointer hover:bg-red-500 flex items-center justify-center text-center no-underline hover:no-underline"
                      onClick={() =>
                        handleDeleteAlbum(album.album_id.toString())
                      }
                    >
                      Delete Album
                    </button>
                  )}
                </div>
                {/* เพิ่มปุ่ม Export Album */}
                <div className="flex items-center justify-center mt-2">
                  <button
                    className="w-[110px] h-[35px] bg-green-600 rounded-md text-white cursor-pointer hover:bg-green-500 flex items-center justify-center text-center no-underline hover:no-underline"
                    onClick={() => handleExportAlbum(album.album_id.toString())}
                  >
                    Export Album
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {showSelectAlbumModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <SelectAlbumModal
              albums={albums}
              photo_id={selectedPhotoId}
              onClose={() => setShowSelectAlbumModal(false)}
            />
          </div>
        )}
        {previewImage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-5 rounded-lg shadow-lg w-[600px] h-[600px]">
              <div className="flex items-center justify-between">
                <h3 className="text-xl mb-2">Album Preview</h3>
                <button
                  className="w-[100px] h-[35px] bg-red-600 rounded-md text-white cursor-pointer hover:bg-red-500 flex items-center justify-center text-center no-underline hover:no-underline"
                  onClick={handleClosePreview}
                >
                  Close
                </button>
              </div>
              <div className="flex items-center justify-center">
                <img
                  src={previewImage}
                  alt="Album Preview"
                  style={{ maxWidth: "100%", maxHeight: "500px" }}
                  className="mt-3"
                />
              </div>
              <div className="flex items-center justify-center">
                <button
                  className="mt-2 w-[150px] h-[35px] bg-[#007bff] rounded-md text-white cursor-pointer hover:bg-blue-500 flex items-center justify-center text-center no-underline hover:no-underline"
                  onClick={handleDownload}
                >
                  Download Preview
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Profile;