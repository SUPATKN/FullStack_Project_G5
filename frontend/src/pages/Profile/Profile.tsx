import React, { useEffect, ChangeEvent, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import Layout from "../../Layout";
import axios from "axios";
import { Form, Image, Row, Col } from "react-bootstrap";
import useAuth from "../../hook/useAuth";
import { User, Album } from "../../types/api";
import CreateAlbumForm from "./CreateAlbumForm"; // นำเข้าฟอร์ม
import SelectAlbumModal from "../../components/SelectAlbumModal"; // Import modal component
// import "../global.css";
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

interface Tag {
  tags_id: number;
  name: string;
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
  const { id } = useParams<{ id: string }>();
  const [tags, setTags] = useState<Record<number, string[]>>({});

  const [albums, setAlbums] = useState<Album[]>([]);
  // const [albumPhotosMap, setAlbumPhotosMap] = useState<Record<string, Photo[]>>(
  //   {}
  // );

  const [showSelectAlbumModal, setShowSelectAlbumModal] = useState(false);
  const [selectedPhotoId, setSelectedPhotoId] = useState<string>("");
  // const [previewImage, setPreviewImage] = useState<string | null>(null);

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
  // const handleClosePreview = () => setPreviewImage(null);

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

  useEffect(() => {
    photos.forEach((photo) => {
      fetchTags(parseInt(photo.id));
    });
  }, [photos]);

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

  const handleViewWithdrawMoney = () => {
    if (user) {
      navigate("/withdraw-money", { state: { userId: user.id } });
    }
  };

  // const handleDownload = () => {
  //   if (previewImage) {
  //     const link = document.createElement("a");
  //     link.download = "album-preview.png";
  //     link.href = previewImage;
  //     link.click();
  //   }
  // };

  const fetchTags = async (photoId: number) => {
    try {
      const { data } = await axios.get<{ name: string }[]>(
        `/api/photo/${photoId}/tags`
      );
      const tagNames = data.map((tag) => tag.name);
      setTags((prevTags) => ({
        ...prevTags,
        [photoId]: tagNames,
      }));
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  const handleCloseUpload = () => setIsUpload(false);
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center">
        {/* profile */}
        <h3 className="mt-3 mb-4 text-center text-[#ff8833] font-light letter-spacing-0-7px">
          {" "}
          MY PROFILE{" "}
        </h3>

        <div className="p-5 w-[fit-content] h-[fit-content] bg-white border shadow-md rounded-lg">
          <div className="mt-2 flex items-center justify-center">
            {user?.avatarURL ? (
              <Image
                src={`${user.avatarURL}`}
                className="profile-pic w-36 h-36 rounded-full "
              />
            ) : (
              <Image
                src="https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg"
                alt="Default Avatar"
                className="profile-pic w-36 h-36 rounded-full"
              />
            )}
          </div>
          {error ? (
            <p>{error}</p>
          ) : (
            user && (
              <div className="mt-3 flex flex-col items-center justify-center">
                <h5 className="font-semibold letter-spacing-0-7px">
                  {user.username}
                </h5>
                <p className="font-normal text-gray-700 letter-spacing-0-7px">
                  Email : {user.email}
                </p>
                <p className="font-normal text-gray-700 letter-spacing-0-7px">
                  Coins : {user.coin} coins
                </p>
              </div>
            )
          )}

          <div className="flex items-center justify-center gap-3 mt-2">
            {currentUser?.id == userId && (
              <button
                data-cy="upload-btn"
                className="font-normal p-2 px-4 w-[fit-content] h-[fit-content] bg-[#ff8833] rounded-md text-white cursor-pointer hover:bg-[#ff6600] flex items-center justify-center text-center no-underline hover:no-underline"
                onClick={handleUploadPic}
              >
                Upload profile picture
              </button>
            )}
            <Link
              to="/"
              className="gap-[6px] font-normal p-2 px-4 w-[fit-content] h-[fit-content] bg-red-600 rounded-md text-white cursor-pointer hover:bg-red-500 flex items-center justify-center text-center no-underline hover:no-underline"
            >
              Back
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                class="size-4"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
                />
              </svg>
            </Link>
          </div>
          {isUpload && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg shadow-lg relative">
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
                    data-cy="ok-btn"
                    className="font-normal letter-spacing-0-7px p-2 px-4 w-[fit-content] h-[fit-content] bg-[#ff8833] rounded-md text-white cursor-pointer hover:bg-[#ff6600] flex items-center justify-center text-center no-underline hover:no-underline"
                    onClick={handleUpload}
                  >
                    Upload
                  </button>
                  <button
                    data-cy="cancel-btn"
                    className="font-normal letter-spacing-0-7px p-2 px-4 w-[fit-content] h-[fit-content] bg-red-600 rounded-md text-white cursor-pointer hover:bg-red-500 flex items-center justify-center text-center no-underline hover:no-underline"
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
        <h3 className="mt-3 mb-4 text-center text-[#ff8833] font-light letter-spacing-0-7px">
          MY PHOTOS
        </h3>
        <div className="flex items-center justify-center gap-3">
          {currentUser?.id === user?.id && (
            <button
              data-cy="edit-btn"
              className="p-2 px-3 w-[fit-content] h-[fit-content] bg-red-600 rounded-md text-white cursor-pointer hover:bg-red-500 flex items-center justify-center text-center no-underline hover:no-underline"
              onClick={() => handleEdit()}
            >
              <SquarePen className="text-white  h-[20px] mr-1" />
              Edit
            </button>
          )}
          {currentUser?.id == userId && (
            <button
              data-cy="viewpur-btn"
              className=" p-2 px-3 w-[fit-content] h-[fit-content] bg-[#64c55b] rounded-md text-white cursor-pointer hover:bg-[#54ab4c] flex items-center justify-center text-center no-underline hover:no-underline"
              onClick={handleViewPurchasedPhotos}
            >
              <ShoppingBag className="text-white h-[20px] mr-2" />
              View Purchased Photos
            </button>
          )}
          <button
            data-cy="viewpur-btn"
            className=" p-2 px-3 w-[fit-content] h-[fit-content] bg-[#0096FF] rounded-md text-white cursor-pointer hover:bg-[#6495ED] flex items-center justify-center text-center no-underline hover:no-underline"
            onClick={handleViewWithdrawMoney}
          >
            <ShoppingBag className="text-white h-[20px] mr-2" />
            Withdraw money
          </button>
        </div>
        <Row className="flex flex-wrap justify-center gap-1 mt-4">
          {photos
            .filter((photo) => photo.user_id == user?.id?.toString())
            .map((photo) => (
              <Col key={photo.id} xs={12} md={4} lg={3}>
                <div className="flex flex-col w-[full] h-[fit-content] bg-[#ffffff] rounded-lg shadow-md p-3 mb-4 mt-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[18px]">{photo.title}</h3>
                  </div>
                  <div className="flex items-center align-center gap-2 Tag">
                    <Tag className="text-[#ff8833] w-4 h-4" />
                    {tags[photo.id] && tags[photo.id].length > 0 ? (
                      tags[photo.id].map((tag, index) => (
                        <p
                          key={index}
                          className="text-[14px] justify-center align-center Tag"
                        >
                          {tag} |
                        </p>
                      ))
                    ) : (
                      <h2 className="text-[14px] text-gray-500 justify-center align-center Tag">
                        No tags
                      </h2>
                    )}
                  </div>
                  <div className="position-relative flex flex-col justify-center mt-2 ">
                    <Image
                      crossOrigin="anonymous"
                      src={`/api/${photo.path}`}
                      onClick={() => handlePhotoClick(photo.id)}
                      onContextMenu={(e) => handlePhotoContextMenu(e, photo.id)}
                      className="cursor-pointer w-[100%] object-cover rounded-lg"
                      alt={`Image ${photo.id}`}
                    />
                    <div className="align-start mt-3 text-sm ">
                      <p>Date: {formatDate(photo.created_at)}</p>
                      <p className="text-[#ff8833] font-medium text-[16px]">
                        Price: {photo.price}
                      </p>
                    </div>
                    {isEdit && (
                      <div className="flex items-center justify-center gap-3">
                        <button
                          data-cy="delete-btn"
                          className="gap-1 p-2 px-3 w-[fit-content] h-[fit-content] bg-red-600 rounded-md text-white cursor-pointer hover:bg-red-500 flex items-center justify-center text-center no-underline hover:no-underline"
                          onClick={() =>
                            handleDelete(photo.path.split("/").pop()!)
                          }
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor"
                            className="size-5"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                            />
                          </svg>
                          Delete
                        </button>
                        <button
                          data-cy="add-btn"
                          className="gap-1 p-2 px-3 w-[fit-content] h-[fit-content] bg-[#007bff] rounded-md text-white cursor-pointer hover:bg-blue-700 flex items-center justify-center text-center no-underline hover:no-underline"
                          onClick={() => handleAddPhotoClick(photo.id)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="size-5"
                          >
                            <path
                              fill-rule="evenodd"
                              d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z"
                              clip-rule="evenodd"
                            />
                          </svg>
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
        <h3 className=" mb-4 text-center text-[#ff8833] font-light letter-spacing-0-7px">
          MY ALBUMS
        </h3>
        {currentUser?.id == userId && (
          <button
            data-cy="create-btn"
            className=" p-2 px-3 w-[fit-content] h-[fit-content] bg-[#ff8833] rounded-md text-white cursor-pointer hover:bg-[#ff6600] flex items-center justify-center text-center no-underline hover:no-underline"
            onClick={handleIsCreate}
          >
            <SquarePen className="text-white h-[20px] mr-1" />
            Create Album
          </button>
        )}
        {isCreateAlbum && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg shadow-lg relative w-[400px]">
              <div className="flex items-center justify-between">
                <h3 className="text-xl mb-3">Create Album ✦ </h3>
                <button
                  className="p-2 px-3 w-[fit-content] h-[fit-content] bg-red-600 rounded-md text-white cursor-pointer hover:bg-red-500 flex items-center justify-center text-center no-underline hover:no-underline"
                  onClick={handleCloseCreateAlbum}
                >
                  ✕
                </button>
              </div>
              <div className="">
                <CreateAlbumForm onCreateAlbum={handleCreateAlbum} />
              </div>
            </div>
          </div>
        )}
        <div className="album flex items-center justify-center flex-wrap gap-[28px] mt-4">
          {albums.map((album) => (
            <div className="flex flex-col w-[full] h-auto bg-white rounded-lg shadow-md border p-3">
              <div key={album.album_id} className="">
                <h4 className="text-[18px] font-medium ">
                  Album Name : {album.title}
                </h4>
                <p className="text-[14px] text-gray-700">
                  Description : {album.description}
                </p>
                <div className="mt-2 flex-wrap flex items-center justify-center w-[280px] h-auto bg-gray-200 shadow-lg border rounded-lg">
                  {/* {albumPhotosMap[album.album_id]?.map((photo) => {
                    return (
                      <div
                        key={photo.id}
                        className="m-2 flex items-center justify-center"
                      >
                        <Image
                          src={`/api/${photo.path}`}
                          width={100}
                          height={100}
                          style={{
                            objectFit: "cover", // เพื่อให้ภาพขยายเต็มกล่องโดยไม่ผิดสัดส่วน
                            maxWidth: "100%", // ควบคุมไม่ให้ขยายเกินขนาดกล่อง
                            maxHeight: "100px", // ควบคุมความสูงของภาพ
                            cursor: "pointer",
                          }}
                          onClick={() => handlePhotoClick(photo.id)}
                          onContextMenu={(e) =>
                            handlePhotoContextMenu(e, photo.id)
                          }
                        />
                      </div>
                    );
                  })} */}
                </div>
                <div className=" flex items-center justify-center gap-3 mt-3">
                  <button
                    data-cy="viewalbum-btn"
                    className="gap-2 p-2 px-3 w-[fit-content] h-[fit-content] bg-[#ff8833] rounded-md text-white cursor-pointer hover:bg-[#ff6600] flex items-center justify-center text-center no-underline hover:no-underline"
                    onClick={() => navigate(`/album/${album.album_id}/photos`)} // Navigate to new page
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.75"
                      stroke="currentColor"
                      class="size-5"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
                    </svg>
                    View Albums
                  </button>
                  {currentUser?.id == userId && (
                    <button
                      data-cy="delete-btn"
                      className="gap-2 p-2 px-3 w-[fit-content] h-[fit-content] bg-red-600 rounded-md text-white cursor-pointer hover:bg-red-500 flex items-center justify-center text-center no-underline hover:no-underline"
                      onClick={() =>
                        handleDeleteAlbum(album.album_id.toString())
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.75"
                        stroke="currentColor"
                        class="size-5"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m6 4.125 2.25 2.25m0 0 2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
                        />
                      </svg>
                      Delete
                    </button>
                  )}
                </div>
                {showSelectAlbumModal && (
                  <SelectAlbumModal
                    albums={albums}
                    photo_id={selectedPhotoId}
                    onClose={() => setShowSelectAlbumModal(false)}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
