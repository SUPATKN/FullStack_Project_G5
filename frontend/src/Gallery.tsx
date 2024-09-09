import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Image, Row, Col, Form, Button } from "react-bootstrap";

import Layout from "./Layout";
import useAuth from "./hook/useAuth";
// import { format } from "date-fns";

interface UserProfile {
  id: number;
  username: string;
  email: string;
}

interface Comment {
  id: number;
  photo_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

const Gallery = () => {
  const [photos, setPhotos] = useState<
    { id: string; path: string; user_id: string; price: number }[]
  >([]);
  const [users, setUsers] = useState<{ id: string; username: string }[]>([]);
  const [likes, setLikes] = useState<{ photo_id: number; user_id: number }[]>(
    []
  );
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComments, setNewComments] = useState<{ [key: string]: string }>({});
  const { user: me, refetch } = useAuth();
  // const [error, setError] = useState<string | null>(null);
  // const [success, setSuccess] = useState<string | null>(null);

  const navigate = useNavigate();

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

  const fetchImages = async () => {
    try {
      const { data } = await axios.get<
        { id: string; path: string; user_id: string; price: number }[]
      >("/api/photo");
      setPhotos(data);
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get<{ id: string; username: string }[]>(
        "/api/allusers"
      );
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
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

  const fetchComments = async () => {
    try {
      const { data } = await axios.get<Comment[]>("/api/getcomments");
      setComments(data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleLike = async (photo_id: string, user_id: string) => {
    const alreadyLiked = likes.some(
      (like) =>
        like.photo_id === parseInt(photo_id) &&
        like.user_id === parseInt(user_id)
    );
    if (alreadyLiked) {
      try {
        await axios.delete("/api/unlikes", { data: { photo_id, user_id } });
        await fetchLikes(); // Refresh likes after the unlike action
      } catch (error) {
        console.error("Error", error);
      }
    } else {
      try {
        await axios.post("/api/likes", { photo_id, user_id });
        await fetchLikes(); // Refresh likes after the like action
      } catch (error) {
        console.error("Error", error);
      }
    }
  };

  const handleCommentSubmit = async (photoId: string) => {
    const comment = newComments[photoId];
    if (!comment) {
      // setError("Comment cannot be empty");
      return;
    }

    try {
      await axios.post("/api/comments", {
        photo_id: photoId,
        user_id: me?.id,
        content: comment,
      });
      setNewComments((prev) => ({ ...prev, [photoId]: "" }));
      await fetchComments(); // Refresh comments after submitting a new comment
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  };

  const handleCommentChange = (photoId: string, content: string) => {
    setNewComments((prev) => ({ ...prev, [photoId]: content }));
  };

  useEffect(() => {
    refetch();
    fetchUsers();
    fetchImages();
    fetchLikes();
    fetchComments();
  }, [me]);

  const getUsername = (userId: string) => {
    const user = users.find((user) => user.id === userId);
    return user ? user.username : "Unknown User";
  };

  const getLikeCount = (photoId: string) => {
    return likes.filter((like) => like.photo_id === parseInt(photoId)).length;
  };

  const handleUsernameClick = (userId: string) => {
    const user = users.find((user) => user.id === userId);
    if (user) {
      navigate(`/profile/${userId}`, { state: { user } });
    }
  };

  const handleAddToCart = async (photoId: string) => {
    if (!me) {
      console.error("User is not logged in");
      return;
    }

    try {
      const photo = photos.find((photo) => photo.id === photoId);

      if (photo && photo.user_id === me.id.toString()) {
        alert("You cannot add your own photo to the cart");
        return;
      }
      const response = await axios.post("/api/cart/add", {
        user_id: me.id,
        photo_id: photoId,
      });
      alert(response.data.message); // Display success message
    } catch (error) {
      console.error("Error adding photo to cart:", error);
    }
  };

  return (
    <Layout>
      <h3 className="mb-4 text-center">GALLERY</h3>
      <hr />
      <Row>
        {photos.map((photo) => (
          <Col key={photo.id} xs={12} md={4} lg={3} className="mb-4">
            <Image
              crossOrigin="anonymous"
              src={`/api/${photo.path}`}
              alt={`Image ${photo.id}`}
              thumbnail
              className="w-100"
              onClick={() => handlePhotoClick(photo.id)}
              onContextMenu={(e) => handlePhotoContextMenu(e, photo.id)}
              style={{ cursor: "pointer" }}
            />
            {me && (
              <button onClick={() => handleLike(photo.id, me.id.toString())}>
                {likes.some(
                  (like) =>
                    like.photo_id === parseInt(photo.id) &&
                    like.user_id === parseInt(me.id)
                )
                  ? "Unlike"
                  : "Like"}
              </button>
            )}
            <h4>Likes count: {getLikeCount(photo.id)}</h4>
            <p
              className="mt-2"
              onClick={() => handleUsernameClick(photo.user_id)}
            >
              User: {getUsername(photo.user_id)}
            </p>
            <p className="mt-2">
              {photo.price > 0 ? `Price: $${photo.price}` : "Free Download"}
            </p>
            {me && (
              <>
                <Button
                  variant="success"
                  className="mt-2"
                  onClick={() => handleAddToCart(photo.id)}
                >
                  Add to Cart
                </Button>

                <Form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleCommentSubmit(photo.id);
                  }}
                >
                  <Form.Group className="mb-3">
                    <Form.Label>Comment</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Write a comment..."
                      value={newComments[photo.id] || ""}
                      onChange={(e) =>
                        handleCommentChange(photo.id, e.target.value)
                      }
                    />
                  </Form.Group>
                  <Button variant="primary" type="submit">
                    Submit
                  </Button>
                </Form>
              </>
            )}
            <div className="mt-3">
              <h5>Comments:</h5>
              {comments
                .filter((comment) => comment.photo_id === photo.id)
                .map((comment) => (
                  <div key={comment.id}>
                    <p>
                      <strong>{getUsername(comment.user_id)}</strong>:{" "}
                      {comment.content}
                    </p>
                    {/* <small>
                    {format(new Date(comment.created_at), "PPPppp")}
                  </small> */}
                  </div>
                ))}
            </div>
          </Col>
        ))}
      </Row>
    </Layout>
  );
};

export default Gallery;
