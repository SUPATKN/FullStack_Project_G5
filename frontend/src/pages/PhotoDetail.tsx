import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button, Image, Form } from "react-bootstrap";
import Layout from "../Layout";
import useAuth from "../hook/useAuth";

interface PhotoDetailProps {
  id: number;
  path: string;
  user_id: number;
  price: number;
  title: string;
  description: string;
}

interface Comment {
  id: number;
  photo_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

const PhotoDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [photo, setPhoto] = useState<PhotoDetailProps | null>(null);
  const [hasPurchased, setHasPurchased] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const { user: currentUser, refetch } = useAuth();
  const [newComments, setNewComments] = useState<{ [key: string]: string }>({});
  const [users, setUsers] = useState<{ id: string; username: string }[]>([]);
  const [likes, setLikes] = useState<{ photo_id: number; user_id: number }[]>(
    []
  );
  const [userMap, setUserMap] = useState<{ [key: string]: string }>({});
  const [commentMap, setCommentMap] = useState<{ [key: string]: Comment[] }>(
    {}
  );

  const navigate = useNavigate();

  useEffect(() => {
    refetch();
  }, [currentUser, refetch]);

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

    if (id) {
      fetchPhotoDetails();
    }
  }, [id, currentUser]);

  const fetchUsers = async () => {
    try {
      const { data } = await axios.get<{ id: string; username: string }[]>(
        "/api/allusers"
      );
      const map = data.reduce((acc, user) => {
        acc[user.id] = user.username;
        return acc;
      }, {} as { [key: string]: string });
      setUserMap(map);
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
    }
  };

  const handleLike = async (photo_id: string, user_id: string) => {
    if (!currentUser) {
      alert("You need to be logged in to like a photo.");
      return;
    }

    const alreadyLiked = likes.some(
      (like) =>
        like.photo_id === parseInt(photo_id) &&
        like.user_id === parseInt(user_id)
    );
    try {
      if (alreadyLiked) {
        await axios.delete("/api/unlikes", { data: { photo_id, user_id } });
      } else {
        await axios.post("/api/likes", { photo_id, user_id });
      }
      await fetchLikes();
    } catch (error) {
      console.error("Error handling like/unlike:", error);
    }
  };

  const handleCommentSubmit = async (photoId: string) => {
    if (!currentUser) {
      alert("You need to be logged in to comment.");
      return;
    }

    const comment = newComments[photoId];
    if (!comment) return;

    try {
      await axios.post("/api/comments", {
        photo_id: photoId,
        user_id: currentUser?.id,
        content: comment,
      });
      setNewComments((prev) => ({ ...prev, [photoId]: "" }));
      await fetchComments();
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  };
  const handleDeleteComment = async (photoId: string, commentId: number) => {
    if (!currentUser) {
      alert("You need to be logged in to delete a comment.");
      return;
    }

    try {
      await axios.delete("/api/deletecomment", {
        data: {
          photo_id: photoId,
          user_id: currentUser.id,
          comment_id: commentId,
        },
      });
      await fetchComments(); // Refresh comments after deletion
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleCommentChange = (photoId: string, content: string) => {
    setNewComments((prev) => ({ ...prev, [photoId]: content }));
  };

  useEffect(() => {
    fetchUsers();
    fetchLikes();
    fetchComments();
  }, [currentUser]);

  const getUsername = (userId: string) => {
    return userMap[userId] || "Unknown User";
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

  const handlePurchase = async () => {
    if (!currentUser) {
      alert("You need to be logged in to purchase a photo.");
      return;
    }

    if (photo) {
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
          <h3>Title: {photo.title}</h3>
          <h6>Description: {photo.description}</h6>
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
          {currentUser ? (
            <Button
              variant="primary"
              onClick={() =>
                handleLike(photo.id.toString(), currentUser.id.toString())
              }
            >
              {likes.some(
                (like) =>
                  like.photo_id === parseInt(photo.id.toString()) &&
                  like.user_id === parseInt(currentUser.id.toString())
              )
                ? "Unlike"
                : "Like"}
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={() => alert("You need to be logged in to like a photo.")}
            >
              Like
            </Button>
          )}
          <h4>Likes count: {getLikeCount(photo.id.toString())}</h4>
          <p
            className="mt-2"
            onClick={() => handleUsernameClick(photo.user_id.toString())}
          >
            User: {getUsername(photo.user_id.toString())}
          </p>
          {currentUser ? (
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                handleCommentSubmit(photo.id.toString());
              }}
            >
              <Form.Group className="mb-3">
                <Form.Label>Comment</Form.Label>
                <Form.Control
                  className="box custom-comment-box"
                  type="text"
                  placeholder="Write a comment..."
                  value={newComments[photo.id.toString()] || ""}
                  onChange={(e) =>
                    handleCommentChange(photo.id.toString(), e.target.value)
                  }
                />
              </Form.Group>
              <Button variant="primary" type="submit">
                Submit
              </Button>
            </Form>
          ) : (
            <p className="text-danger">Log in to leave a comment.</p>
          )}
          <div className="mt-3">
            <h5>Comments:</h5>
            {(commentMap[photo.id.toString()] || []).map((comment) => (
              <div
                key={comment.id}
                className="d-flex justify-content-between align-items-center"
              >
                <p>
                  <strong>{getUsername(comment.user_id)}</strong>:{" "}
                  {comment.content}
                </p>
                {currentUser?.id === comment.user_id && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() =>
                      handleDeleteComment(photo.id.toString(), comment.id)
                    }
                  >
                    Delete
                  </Button>
                )}
              </div>
            ))}
          </div>

          <p className="mt-2">
            {photo.price > 0 ? `Price: $${photo.price}` : "Free Download"}
          </p>
          {photo.price > 0 && !hasPurchased ? (
            currentUser ? (
              <Button variant="primary" onClick={handlePurchase}>
                Buy for ${photo.price}
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={() =>
                  alert("You need to be logged in to purchase a photo.")
                }
              >
                Buy for ${photo.price}
                <div className="centered-links">
                  <a href="/login">Login</a> or
                  <a href="/register">Register</a>
                </div>
              </Button>
            )
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
