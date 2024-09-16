import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button, Image, Form } from "react-bootstrap";
import Layout from "../Layout";
import useAuth from "../hook/useAuth";
import {
  SquareArrowUpRight,
  Tag,
  Heart,
  MessageCircleMore,
  CircleX,
} from "lucide-react";
import LoadingWrapper from "../LoadingWrapper";

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

  const [showCommentForm, setShowCommentForm] = useState(false);
  const handleClose = () => {
    setShowCommentForm(false);
  };

  return (
    <LoadingWrapper>
      <Layout>
        <div className="flex items-center flex-col justify-center text-ccenter">
          <h3 className="text-center text-[#ff8833] font-semibold">PHOTO DETAIL</h3>
          <div className="flex items-center justify-center flex-col text-white  bg-black bg-opacity-15 rounded-lg shadow-lg border w-[600px] h-full mt-2">
            {loading ? (
              <p>Loading...</p>
            ) : photo ? (
              <div className="text-center mb-3">
                <div className="flex items-center justify-between mt-3 text-center">
                  <h3 className="text-[24px] text-center"> {photo.title} </h3>
                  <SquareArrowUpRight className="mr-4 w-8 h-8 text-center text-gray-300" />
                </div>
                <p className="flex justify-start">
                  Description: {photo.description}
                </p>
                <div className="flex items-center justify-start gap-2">
                  <Tag className="text-[#ff8833]" />
                  <h2 className="text-[16px]">Animal</h2>
                </div>
                <div className="flex items-center justify-center mt-2">
                  <Image
                    crossOrigin="anonymous"
                    src={`/api/${photo.path}`}
                    alt={`Image ${photo.id}`}
                    className="w-[550px] h-[350px] rounded-lg"
                    onContextMenu={handleImageContextMenu}
                  />
                </div>
                <h4 className="mt-3 text-[16px] flex justify-start">
                  Price: {photo.price > 0 ? `$${photo.price}` : "Free Download"}
                </h4>
                <div className="flex items-center justify-start">
                  <Heart className="text-[20px]" />
                  <h2 className="text-[20px] ml-4 mt-2">
                    {getLikeCount(photo.id.toString())}
                  </h2>
                </div>
                <MessageCircleMore />
                <div className="mt-3">
                  {(commentMap[photo.id.toString()] || []).map((comment) => (
                    <div
                      key={comment.id}
                      className="flex justify-between items-center text-center"
                    >
                      <p className="text-[16px]">
                        {" "}
                        {getUsername(comment.user_id)} : {comment.content}
                      </p>
                      {currentUser?.id === comment.user_id && (
                        <button
                          className="w-[70px] mb-2 h-[30px] bg-red-600 rounded-md text-white cursor-pointer hover:bg-red-500 flex items-center justify-center text-center no-underline hover:no-underline"
                          onClick={() =>
                            handleDeleteComment(photo.id.toString(), comment.id)
                          }
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-2">
                  {currentUser ? (
                    <button
                      className="w-[110px] h-[35px] bg-[#ff8833] rounded-md text-white cursor-pointer hover:bg-orange-500 flex items-center justify-center text-center no-underline hover:no-underline"
                      onClick={() =>
                        handleLike(
                          photo.id.toString(),
                          currentUser.id.toString()
                        )
                      }
                    >
                      <Heart className="text-[16px] mr-2" />
                      {likes.some(
                        (like) =>
                          like.photo_id === parseInt(photo.id.toString()) &&
                          like.user_id === parseInt(currentUser.id.toString())
                      )
                        ? "Unlike"
                        : "Like"}
                    </button>
                  ) : (
                    <button
                      className="w-[110px] h-[35px] bg-[#ff8833] rounded-md text-white cursor-pointer hover:bg-orange-500 flex items-center justify-center text-center no-underline hover:no-underline"
                      onClick={() =>
                        alert("You need to be logged in to like a photo.")
                      }
                    >
                      Like
                    </button>
                  )}
                  <p
                    className="mt-2"
                    onClick={() =>
                      handleUsernameClick(photo.user_id.toString())
                    }
                  />
                  {currentUser ? (
                    <>
                      <button
                        className="w-[115px] h-[35px] bg-[#ff8833] rounded-md text-white cursor-pointer hover:bg-orange-500 flex items-center justify-center text-center no-underline hover:no-underline"
                        onClick={() => setShowCommentForm(!showCommentForm)}
                      >
                        <MessageCircleMore className="mr-2" />
                        Comment
                      </button>

                      {showCommentForm && (
                        <>
                          <div
                            className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-10"
                            onClick={() => setShowCommentForm(false)}
                          />
                          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-md shadow-lg z-20 w-[90%] max-w-md">
                            <div className="flex items-center justify-between">
                              <h2 className="text-black">Comment</h2>
                              <button
                                className="mb-2 text-black  flex items-center justify-center text-center no-underline hover:no-underline"
                                onClick={handleClose}
                              >
                                <CircleX/>
                              </button>
                            </div>
                            <Form
                              onSubmit={(e) => {
                                e.preventDefault();
                                handleCommentSubmit(photo.id.toString());
                                setShowCommentForm(false);
                              }}
                            >
                              <Form.Group className="mb-3">
                                <Form.Control
                                  className="w-[100px] h-[35px] rounded-md"
                                  type="text"
                                  placeholder="Write a comment..."
                                  value={newComments[photo.id.toString()] || ""}
                                  onChange={(e) =>
                                    handleCommentChange(
                                      photo.id.toString(),
                                      e.target.value
                                    )
                                  }
                                />
                              </Form.Group>
                              <div className="flex items-center justify-center">
                                <button
                                  className="w-[110px] h-[35px] bg-[#ff8833] rounded-md text-white cursor-pointer hover:bg-orange-500 flex items-center justify-center text-center no-underline hover:no-underline"
                                  type="submit"
                                >
                                  Submit
                                </button>
                              </div>
                            </Form>
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <p className="text-danger">Log in to leave a comment.</p>
                  )}

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
                    <div className="flex items-center justify-center ml-2">
                      <button
                        className="w-[110px] h-[35px] bg-[#ff8833] rounded-md text-white cursor-pointer hover:bg-orange-500 flex items-center justify-center text-center no-underline hover:no-underline"
                        onClick={() =>
                          window.open(`/api/${photo.path}`, "_blank")
                        }
                      >
                        Download
                      </button>
                    </div>
                  )}
                </div>

                {/* <p className="mt-2">
                  {photo.price > 0 ? `Price: $${photo.price}` : "Free Download"}
                </p> */}
              </div>
            ) : (
              <p>Photo not found</p>
            )}
          </div>
          <div className="mt-4 text-center flex items-center justify-center w-[600px] h-[50px] bg-[#ff8833] hover:bg-orange-500 text-white shadow-md border rounded-lg cursor-pointer">
            <h2 className="text-[18px] text-center mt-2">
              PAYMENT NOW PRICE : {photo?.price} BATH
            </h2>
          </div>
        </div>
      </Layout>
    </LoadingWrapper>
  );
};

export default PhotoDetail;
