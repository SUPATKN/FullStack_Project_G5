import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Button, Image } from "react-bootstrap";
import Layout from "./Layout";
import useAuth from "./hook/useAuth";

interface PhotoDetailProps {
  id: number;
  path: string;
  user_id: number;
  price: number;
}


const PhotoDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [photo, setPhoto] = useState<PhotoDetailProps | null>(null);
  const [hasPurchased, setHasPurchased] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const { user: currentUser, refetch } = useAuth();

  // Fetch current user when component mounts
  useEffect(() => {
    refetch();
  }, [currentUser]); // Dependency array is empty, so this only runs once on mount

  // Fetch photo details and purchase status when `id` or `currentUser` changes
  useEffect(() => {
    const fetchPhotoDetails = async () => {
      try {
        const photoResponse = await axios.get<PhotoDetailProps>(
          `/api/photo/${id}`
        );
        setPhoto(photoResponse.data);

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
  }, [id, currentUser]);


  // const fetchUsers = async () => {
  //   try {
  //     const { data } = await axios.get<{ id: string; username: string }[]>(
  //       "/api/allusers"
  //     );
  //     setUsers(data);
  //   } catch (error) {
  //     console.error("Error fetching users:", error);
  //   }
  // };

  // const fetchLikes = async () => {
  //   try {
  //     const { data } = await axios.get<{ photo_id: number; user_id: number }[]>(
  //       "/api/getlikes"
  //     );
  //     setLikes(data);
  //   } catch (error) {
  //     console.error("Error fetching likes:", error);
  //   }
  // };

  // const fetchComments = async () => {
  //   try {
  //     const { data } = await axios.get<Comment[]>("/api/getcomments");
  //     setComments(data);
  //   } catch (error) {
  //     console.error("Error fetching comments:", error);
  //   }
  // };

  // const handleLike = async (photo_id: string, user_id: string) => {
  //   const alreadyLiked = likes.some(
  //     (like) =>
  //       like.photo_id === parseInt(photo_id) &&
  //       like.user_id === parseInt(user_id)
  //   );
  //   if (alreadyLiked) {
  //     try {
  //       await axios.delete("/api/unlikes", { data: { photo_id, user_id } });
  //       await fetchLikes(); // Refresh likes after the unlike action
  //     } catch (error) {
  //       console.error("Error", error);
  //     }
  //   } else {
  //     try {
  //       await axios.post("/api/likes", { photo_id, user_id });
  //       await fetchLikes(); // Refresh likes after the like action
  //     } catch (error) {
  //       console.error("Error", error);
  //     }
  //   }
  // };

  // const handleCommentSubmit = async (photoId: string) => {
  //   const comment = newComments[photoId];
  //   if (!comment) {
  //     // setError("Comment cannot be empty");
  //     return;
  //   }

  //   try {
  //     await axios.post("/api/comments", {
  //       photo_id: photoId,
  //       user_id: me?.id,
  //       content: comment,
  //     });
  //     setNewComments((prev) => ({ ...prev, [photoId]: "" }));
  //     await fetchComments(); // Refresh comments after submitting a new comment
  //   } catch (error) {
  //     console.error("Error submitting comment:", error);
  //   }
  // };

  // const handleCommentChange = (photoId: string, content: string) => {
  //   setNewComments((prev) => ({ ...prev, [photoId]: content }));
  // };

  // useEffect(() => {
  //   refetch();
  //   fetchUsers();
  //   fetchImages();
  //   fetchLikes();
  //   fetchComments();
  // }, [me]);

  // const getUsername = (userId: string) => {
  //   const user = users.find((user) => user.id === userId);
  //   return user ? user.username : "Unknown User";
  // };

  // const getLikeCount = (photoId: string) => {
  //   return likes.filter((like) => like.photo_id === parseInt(photoId)).length;
  // };

  // const handleUsernameClick = (userId: string) => {
  //   const user = users.find((user) => user.id === userId);
  //   if (user) {
  //     navigate(`/profile/${userId}`, { state: { user } });
  //   }
  // };

  // const handleAddToCart = async (photoId: string) => {
  //   if (!me) {
  //     console.error("User is not logged in");
  //     return;
  //   }

  //   try {
  //     const photo = photos.find((photo) => photo.id === photoId);

  //     if (photo && photo.user_id === me.id.toString()) {
  //       alert("You cannot add your own photo to the cart");
  //       return;
  //     }
  //     const response = await axios.post("/api/cart/add", {
  //       user_id: me.id,
  //       photo_id: photoId,
  //     });
  //     alert(response.data.message); // Display success message
  //   } catch (error) {
  //     console.error("Error adding photo to cart:", error);
  //   }
  // };


  const handlePurchase = async () => {
    if (photo && currentUser) {
      try {
        await axios.post(`/api/photo/${photo.id}/buy`, {
          userId: currentUser.id,
        });
        setHasPurchased(true);
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
