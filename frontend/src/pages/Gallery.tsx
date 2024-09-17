import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Image, Row, Col  } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

import Layout from "../Layout";
import useAuth from "../hook/useAuth";
import { Heart, MessageCircleMore } from "lucide-react";

// interface UserProfile {
//   id: number;
//   username: string;
//   email: string;
//   avatarURL?: string;
// }

interface Comment {
  id: number;
  photo_id: string;
  content: string;
  user_id: string;
  created_at: string;
}

const Gallery = () => {
  const [photos, setPhotos] = useState<
    {
      id: string;
      path: string;
      user_id: string;
      price: number;
      title: string;
    }[]
  >([]);
  const [users, setUsers] = useState<
    { id: string; username: string; avatarURL?: string }[]
  >([]);
  const { user: me, refetch } = useAuth();
  const [cartItems, setCartItems] = useState<
    { id: string; path: string; user_id: string; price: number }[]
  >([]);
  const [commentMap, setCommentMap] = useState<{ [key: string]: Comment[] }>(
    {}
  );
  const [error, setError] = useState<string | null>(null);
  const [hoveredPhotoId, setHoveredPhotoId] = useState<string | null>(null);
  const [likes, setLikes] = useState<{ photo_id: number; user_id: number }[]>(
    []
  );

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
      const { data } = await axios.get<
        {
          id: string;
          path: string;
          user_id: string;
          price: number;
          title: string;
        }[]
      >("/api/photo");
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
        const { data } = await axios.get<
          { id: string; path: string; user_id: string; price: number }[]
        >(`/api/cart/${me.id}`);
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
      console.error("User is not logged in");
      return;
    }
  
    const photo = photos.find((photo) => photo.id === photoId);
  
    if (!photo) {
      return;
    }
  
    const alreadyInCart = cartItems.some((item) => item.id === photoId);
  
    if (alreadyInCart) {
      alert("This item is already in your cart.");
      return;
    }
  
    if (photo.user_id === me.id.toString()) {
      alert("You cannot add your own photo to the cart.");
      return;
    }
  
    try {
      const response = await axios.post("/api/cart/add", {
        user_id: me.id,
        photo_id: photoId,
      });
  
      alert(response.data.message); // Display success message
      fetchCartItems(); // Refresh cart items after successful addition
    } catch (error) {
      console.error("Error adding photo to cart:", error);
    }
  };

  const getLikeCount = (photoId: string) => {
    return likes.filter((like) => like.photo_id === parseInt(photoId)).length;
  };

  const getCommentCount = (photoId: string) => {
    return commentMap[photoId]?.length || 0;
  };

  // const getUsername = (userId: string) => {
  //   const user = users.find((user) => user.id === userId);
  //   return user ? user.username : "Unknown User";
  // };

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

  return (
    <Layout>
      <h3 className="mb-4 text-center text-[#ff8833] font-semibold">GALLERY</h3>
      {error && <p className="text-danger text-center">{error}</p>}
      <Row>
        {photos.map((photo) => (
          <Col key={photo.id} xs={12} md={4} lg={3} className="mb-4">
            <div
              className="relative flex flex-col w-[300px] h-full bg-white bg-opacity-10 rounded-lg shadow-md border border-black mt-3 p-2"
              onMouseEnter={() => setHoveredPhotoId(photo.id)}
              onMouseLeave={() => setHoveredPhotoId(null)}
            >
              <div className="relative flex flex-col items-center justify-center mt-3">
                <Image
                  crossOrigin="anonymous"
                  src={`/api/${photo.path}`}
                  alt={`Image ${photo.id}`}
                  className="w-[250px] h-[200px] rounded-md cursor-pointer"
                  onClick={() => handlePhotoClick(photo.id)}
                  onContextMenu={(e) => handlePhotoContextMenu(e, photo.id)}
                />
                {hoveredPhotoId === photo.id && (
                  <div className="absolute w-[250px] object-cover h-full bg-black bg-opacity-50 flex flex-col items-center justify-start text-white p-4 pointer-events-none">
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
                    <div className="flex gap-4 mt-5">
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
                <>
                <div className="flex items-center justify-center mt-3">
                  <button
                    className="w-full h-[35px] bg-[#ff8833] rounded-md text-white cursor-pointer hover:bg-orange-500 flex items-center justify-center text-center no-underline hover:no-underline"
                    onClick={() => handleAddToCart(photo.id)}
                  >
                    Add to Cart
                  </button>
                </div>
                </>
              )}
            </div>
          </Col>
        ))}
      </Row>
    </Layout>
  );
};

export default Gallery;
