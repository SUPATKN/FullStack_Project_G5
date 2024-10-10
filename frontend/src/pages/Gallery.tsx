import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Image, Row, Col, Dropdown } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Layout from "../Layout";
import useAuth from "../hook/useAuth";
import { Heart, MessageCircleMore } from "lucide-react";

// Define types for Photo and Comment
interface Photo {
  id: string;
  path: string;
  user_id: string;
  price: number;
  title: string;
  created_at: string; // Ensure to include the created_at field
}

interface Comment {
  id: number;
  photo_id: string;
  content: string;
  user_id: string;
  created_at: string;
}

interface Tag {
  tags_id: number;
  name: string;
}

const Gallery = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [users, setUsers] = useState<
    { id: string; username: string; avatarURL?: string }[]
  >([]);
  const { user: me, refetch } = useAuth();
  const [cartItems, setCartItems] = useState<Photo[]>([]);
  const [commentMap, setCommentMap] = useState<{ [key: string]: Comment[] }>(
    {}
  );
  const [error, setError] = useState<string | null>(null);
  const [hoveredPhotoId, setHoveredPhotoId] = useState<string | null>(null);
  const [likes, setLikes] = useState<{ photo_id: number; user_id: number }[]>(
    []
  );
  const [sortCriteria, setSortCriteria] = useState<"time" | "price">("time"); // State for sorting criteria
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc"); // State for sort order

  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTag, setSelectedTag] = useState<number | null>(null);

  const navigate = useNavigate();

  const handlePhotoClick = (photoId: string) => {
    navigate(`/photo/${photoId}`);
  };

  const handlePhotoContextMenu = (
    e: React.MouseEvent<HTMLImageElement, MouseEvent>,
    photoId: string
  ) => {
    e.preventDefault();
    console.log(`Right-clicked on photo with ID: ${photoId}`);
  };

  const fetchImages = async () => {
    try {
      const { data } = await axios.get<Photo[]>("/api/photo");
      setPhotos(data);
    } catch (error) {
      setError("Error fetching images");
      console.error("Error fetching images:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get<
        { id: string; username: string; avatarURL?: string }[]
      >("/api/allusers");
      setUsers(data);
    } catch (error) {
      setError("Error fetching users");
      console.error("Error fetching users:", error);
    }
  };

  const fetchComments = async () => {
    try {
      const { data } = await axios.get<Comment[]>("/api/getcomments");
      const map = data.reduce((acc, comment) => {
        if (!acc[comment.photo_id]) {
          acc[comment.photo_id] = [];
        }
        acc[comment.photo_id].push(comment);
        return acc;
      }, {} as { [key: string]: Comment[] });
      setCommentMap(map);
    } catch (error) {
      console.error("Error fetching comments:", error);
      setError("Error fetching comments");
    }
  };

  const fetchLikes = async () => {
    try {
      const { data } = await axios.get<{ photo_id: number; user_id: number }[]>(
        "/api/getlikes"
      );
      setLikes(data);
    } catch (error) {
      console.error("Error fetching likes:", error);
    }
  };

  useEffect(() => {
    refetch();
    fetchUsers();
    fetchImages();
    fetchLikes();
    fetchComments();
  }, [me]);

  const fetchCartItems = async () => {
    if (me) {
      try {
        const { data } = await axios.get<Photo[]>(`/api/cart/${me.id}`);
        setCartItems(data);
      } catch (error) {
        console.error("Error fetching cart items:", error);
      }
    }
  };

  useEffect(() => {
    if (me) {
      fetchCartItems();
    }
  }, [me]);

  const handleAddToCart = async (photoId: string) => {
    if (!me) {
      // console.error("User is not logged in");
      toast.error("You need to log in to add items to your cart.");
      return;
    }

    const photo = photos.find((photo) => photo.id === photoId);

    if (!photo) {
      toast.error("Photo not found.");
      return;
    }

    const alreadyInCart = cartItems.some((item) => item.id === photoId);

    if (alreadyInCart) {
      // alert("This item is already in your cart.");
      toast.warning("This item is already in your cart.");
      return;
    }

    if (photo.user_id === me.id.toString()) {
      // alert("You cannot add your own photo to the cart.");
      toast.warning("You cannot add your own photo to the cart.");
      return;
    }

    try {
      const response = await axios.post("/api/cart/add", {
        user_id: me.id,
        photo_id: photoId,
      });
      // ตรวจสอบว่ามีข้อความใน response หรือไม่
      // if (response.data.message) {
      //   toast.success(response.data.message);
      // } else {
      //   toast.success("Item added to cart successfully."); // กรณีไม่มีข้อความ
      // }

      toast.success("Item added to cart successfully.");

      // toast.success(response.data.message);
      fetchCartItems(); // Refresh cart items after successful addition
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        // เช็คว่า error เป็น AxiosError
        if (
          error.response &&
          error.response.data &&
          error.response.data.error
        ) {
          toast.error(error.response.data.error);
        } else {
          toast.error("An unexpected error occurred while adding to the cart.");
        }
      } else {
        // จัดการข้อผิดพลาดอื่นๆ ที่ไม่ใช่ AxiosError
        toast.error("An unexpected error occurred.");
      }
      console.error("Error adding photo to cart:", error);
    }
  };

  const getLikeCount = (photoId: string) => {
    return likes.filter((like) => like.photo_id === parseInt(photoId)).length;
  };

  const getCommentCount = (photoId: string) => {
    return commentMap[photoId]?.length || 0;
  };

  const handleUsernameClick = (userId: string) => {
    const user = users.find((user) => user.id === userId);
    if (user) {
      navigate(`/profile/${userId}`, { state: { user } });
    }
  };

  const getPhotoOwner = (userId: string) => {
    const user = users.find((user) => user.id === userId);
    return user || null;
  };

  const sortPhotos = (photos: Photo[]) => {
    const sortedPhotos = [...photos];

    // Sort by time or price
    if (sortCriteria === "time") {
      sortedPhotos.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } else if (sortCriteria === "price") {
      sortedPhotos.sort((a, b) => a.price - b.price);
    }

    // Sort by order (ascending or descending)
    if (sortOrder === "desc") {
      sortedPhotos.reverse();
    }

    return sortedPhotos;
  };
  const handleSortChange = (criteria: "time" | "price") => {
    setSortCriteria(criteria);
  };

  const handleOrderChange = (order: "asc" | "desc") => {
    setSortOrder(order);
  };

  const fetchTags = async () => {
    try {
      const { data } = await axios.get<Tag[]>("/api/tag");
      setTags(data);
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  const fetchPhotosByTag = async (tagId: number) => {
    try {
      const { data } = await axios.get<Photo[]>(`/api/photo/tag/${tagId}`);
      setPhotos(data); // Update photos with filtered ones by tag
    } catch (error) {
      console.error("Error fetching photos by tag:", error);
    }
  };

  const handleTagSelect = async (tagId: number) => {
    if (selectedTag === tagId) {
      // Deselect tag
      setSelectedTag(null);
      await fetchImages(); // Fetch all images
    } else {
      // Select tag
      await fetchPhotosByTag(tagId);
      setSelectedTag(tagId);
    }
  };

  // Handle tag click
  // const handleTagSelect = (tagId: number) => {
  //   setSelectedTag(tagId);
  //   console.log("TagId", tagId);
  //   fetchPhotosByTag(tagId); // Fetch photos by the selected tag
  // };

  // const handleTagSelect = async (tagId: number) => {
  //   try {
  //     const { data } = await axios.get<Photo[]>(`/api/photo/tag/${tagId}`);
  //     setPhotos(data);
  //     setSelectedTag(tagId);
  //     console.log("setPhotos(data)", setPhotos);
  //     console.log("setSelectedTag", setTags);
  //   } catch (error) {
  //     console.error("Error fetching photos by tag:", error);
  //     setError("Error fetching photos by tag");
  //   }
  // };

  useEffect(() => {
    refetch();
    fetchTags();
    fetchImages();
  }, [me]);

  return (
    <Layout>
      <h3 className="mt-3 mb-3 text-center text-[#ff8833] font-light letter-spacing-0-7px">
        GALLERY
      </h3>
      {error && <p className="text-danger text-center">{error}</p>}

      {/* Display Tags as Buttons */}
      <div className="tag-container mb-4 d-flex flex-wrap justify-content-center">
        {/* Map through the existing tags */}
        {tags.map((tag) => (
          <button
            key={tag.tags_id}
            className={`m-2 ${
              selectedTag === tag.tags_id ? "TagOnClick" : " TagOffClick "
            }`} // Existing logic for individual tags
            onClick={() => handleTagSelect(tag.tags_id)}
          >
            {tag.name}
          </button>
        ))}
      </div>

      {/* Filter Dropdowns */}
      <div className="mb-4 Filter-container">
        <Dropdown>
          <Dropdown.Toggle
            className={`Filter ${sortCriteria ? "FilterButton" : ""}`}
            id="dropdown-basic"
          >
            Sort by:{" "}
            {sortCriteria
              ? sortCriteria === "time"
                ? "Time"
                : "Price"
              : "Select an option"}
          </Dropdown.Toggle>

          <Dropdown.Menu className="Filter-menu">
            <Dropdown.Item
              className="menu"
              onClick={() => handleSortChange("time")}
            >
              {sortCriteria === "time" && <span>&#10003;</span>} Sort by Time
            </Dropdown.Item>
            <Dropdown.Item
              className="menu"
              onClick={() => handleSortChange("price")}
            >
              {sortCriteria === "price" && <span>&#10003;</span>} Sort by Price
            </Dropdown.Item>
            <Dropdown.Divider />
            {sortCriteria === "time" && (
              <>
                <Dropdown.Item
                  className="menu"
                  onClick={() => handleOrderChange("desc")}
                >
                  {sortOrder === "desc" && <span>&#10003;</span>} Latest First
                </Dropdown.Item>
                <Dropdown.Item
                  className="menu"
                  onClick={() => handleOrderChange("asc")}
                >
                  {sortOrder === "asc" && <span>&#10003;</span>} Oldest First
                </Dropdown.Item>
              </>
            )}
            {sortCriteria === "price" && (
              <>
                <Dropdown.Item
                  className="menu"
                  onClick={() => handleOrderChange("asc")}
                >
                  {sortOrder === "asc" && <span>&#10003;</span>} Cheapest First
                </Dropdown.Item>
                <Dropdown.Item
                  className="menu"
                  onClick={() => handleOrderChange("desc")}
                >
                  {sortOrder === "desc" && <span>&#10003;</span>} Most Expensive
                  First
                </Dropdown.Item>
              </>
            )}
          </Dropdown.Menu>
        </Dropdown>
      </div>

      <Row>
        {(selectedTag ? sortPhotos(photos) : sortPhotos(photos)).map(
          (photo) => (
            <Col key={photo.id} xs={12} md={6} lg={3} className="mb-4">
              <div
                className="relative flex flex-col w-[fit-content] h-[fit-content] bg-white bg-opacity-10 rounded-lg shadow-md border border-black mt-3 p-2 shadow-sm h-100"
                onMouseEnter={() => setHoveredPhotoId(photo.id)}
                onMouseLeave={() => setHoveredPhotoId(null)}
              >
                <div className="relative flex flex-col items-center justify-center h-100">
                  <Image
                    crossOrigin="anonymous"
                    src={`/api/${photo.path}`}
                    alt={`Image ${photo.id}`}
                    className="rounded-md cursor-pointer "
                    onClick={() => handlePhotoClick(photo.id)}
                    onContextMenu={(e) => handlePhotoContextMenu(e, photo.id)}
                  />
                  {hoveredPhotoId === photo.id && (
                    <div className=" absolute w-full object-cover h-full bg-black bg-opacity-50 flex flex-col items-center justify-start text-white p-4 pointer-events-none">
                      <h3 className="text-[20px] text-[#ff8833]">
                        {photo.title}
                      </h3>
                      {getPhotoOwner(photo.user_id) && (
                        <h5 className="flex items-center">
                          {getPhotoOwner(photo.user_id)?.avatarURL ? (
                            <Image
                              src={getPhotoOwner(photo.user_id)?.avatarURL}
                              alt="Profile Picture"
                              className="w-8 h-8 rounded-full"
                              width={32}
                              height={32}
                            />
                          ) : (
                            <span className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-700">
                              U
                            </span>
                          )}
                          <span
                            className="ml-2 cursor-pointer"
                            onClick={() => handleUsernameClick(photo.user_id)}
                          >
                            {getPhotoOwner(photo.user_id)?.username ||
                              "Unknown User"}
                          </span>
                        </h5>
                      )}
                      <div className="flex gap-4 mt-2">
                        <div className="flex items-center">
                          <Heart className="mr-2" />
                          {getLikeCount(photo.id)}
                        </div>
                        <div className="flex items-center">
                          <MessageCircleMore className="mr-2" />
                          {getCommentCount(photo.id)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                {me && (
                  <div className="flex items-center justify-center mt-3">
                    <button
                      className="w-full h-[35px] bg-[#ff8833] rounded-md text-white cursor-pointer hover:bg-orange-500 flex items-center justify-center text-center no-underline hover:no-underline"
                      onClick={() => handleAddToCart(photo.id)}
                    >
                      Add to Cart
                    </button>
                  </div>
                )}
              </div>
            </Col>
          )
        )}
        <ToastContainer />
      </Row>
    </Layout>
  );
};

export default Gallery;
