import { useEffect, useState } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";
import { Button, Image, Form } from "react-bootstrap";

import Layout from "../Layout";
import useAuth from "../hook/useAuth";
import {
  SquareArrowUpRight,
  Tag,
  Heart,
  MessageCircleMore,
} from "lucide-react";
import LoadingWrapper from "../LoadingWrapper";
import { on } from "events";

interface PhotoDetailProps {
  id: number;
  path: string;
  user_id: number;
  price: number;
  title: string;
  max_sales: number;
  description: string;
}

interface Comment {
  comment_id: number;
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
  const [tags, setTags] = useState<string[]>([]);

  const navigate = useNavigate();
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    refetch();
    setIsClicked(false);
  }, [currentUser, refetch]);

  const handleClickLike = () => {
    if (currentUser && photo) {
      setIsClicked(!isClicked);
      handleLike(photo.id.toString(), currentUser.id.toString());
    } else {
      // Handle the case where currentUser is undefined (e.g., show a message)
      console.warn(
        "User is not currently logged in. Like functionality unavailable."
      );
    }
  };

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

  const fetchTags = async () => {
    try {
      const { data } = await axios.get<{ name: string }[]>(
        `/api/photo/${id}/tags`
      );
      const tagNames = data.map((tag) => tag.name);
      setTags(tagNames);
    } catch (error) {
      console.error("Error fetching tags:", error);
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
    console.log("commentId", commentId);
    console.log("phototId", photoId);

    try {
      await axios.delete("/api/deletecomment", {
        data: {
          photo_id: photoId,
          user_id: currentUser.id,
          comment_id: commentId,
        },
      });
      await fetchComments();
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleCommentChange = (photoId: string, content: string) => {
    setNewComments((prev) => ({ ...prev, [photoId]: content }));
  };

  useEffect(() => {
    fetchTags();
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
    console.log("hasPurchased: ", hasPurchased);
    console.log("photo: ", photo);

    if (photo) {
      try {
        await axios.post(`/api/photo/${photo.id}/buy`, {
          userId: currentUser.id,
        });
        setHasPurchased(true);
        console.log("Updated hasPurchased:", true);

        const updatedPhotoResponse = await axios.get<PhotoDetailProps>(
          `/api/photo/${photo.id}`
        );
        setPhoto(updatedPhotoResponse.data);
        console.log("Updated photo:", updatedPhotoResponse.data);
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
        <div className="flex items-center flex-col justify-center text-center ">
          <h3 className="mt-3 mb-4 text-center text-[#ff8833] font-light letter-spacing-0-7px">
            PHOTO DETAIL
          </h3>
          <div className=" p-3 px-4 flex items-center justify-center flex-col bg-white rounded-lg shadow-lg border w-[fit-content] h-[fit-content]">
            {loading ? (
              <p>Loading...</p>
            ) : photo ? (
              <div className="text-center">
                <div className="flex items-center justify-between mt-3 text-center">
                  <h3 className="text-[28px] text-center font-normal flex justify-center items-center ">
                    {photo.title}
                  </h3>
                  <Link
                    className="closepage-link w-[fit-content] h-[fit-content] bg-red-600 rounded-md text-white cursor-pointer hover:bg-red-500 flex items-center justify-center text-center no-underline hover:no-underline"
                    to="/"
                  >
                    ✕
                  </Link>
                </div>
                <hr></hr>
                <p className="flex justify-start">
                  Description: {photo.description}
                </p>

                <div className="flex items-center justify-start gap-2 mb-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    class="size-6 text-[#ff8833]"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M5.25 2.25a3 3 0 0 0-3 3v4.318a3 3 0 0 0 .879 2.121l9.58 9.581c.92.92 2.39 1.186 3.548.428a18.849 18.849 0 0 0 5.441-5.44c.758-1.16.492-2.629-.428-3.548l-9.58-9.581a3 3 0 0 0-2.122-.879H5.25ZM6.375 7.5a1.125 1.125 0 1 0 0-2.25 1.125 1.125 0 0 0 0 2.25Z"
                      clip-rule="evenodd"
                    />
                  </svg>

                  {tags.length > 0 ? (
                    tags.map((tag, index) => (
                      <h2 key={index} className=" mb-0 text-[16px] ">
                        {tag} |
                      </h2>
                    ))
                  ) : (
                    <h2 className="text-[16px]">No tags</h2>
                  )}
                </div>
                <div className="relative flex items-center justify-center mt-2">
                  {/* ภาพหลัก */}
                  <Image
                    crossOrigin="anonymous"
                    src={`/api/${photo.path}`}
                    alt={`Image ${photo.id}`}
                    className="w-[550px] h-full rounded-lg relative"
                    onContextMenu={
                      photo.price > 0 && !hasPurchased
                        ? handleImageContextMenu
                        : undefined
                    }
                  />

                  {/* แสดงลายน้ำเฉพาะในกรณีที่รูปไม่ฟรีและยังไม่ได้ซื้อ */}
                  {photo.price > 0 && !hasPurchased && (
                    <div
                      className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-transparent pointer-events-none"
                      style={{ zIndex: 1 }}
                    >
                      {/* ลายน้ำ */}
                      <div
                        className="absolute inset-0 bg-repeat opacity-50"
                        style={{
                          backgroundImage: `repeating-linear-gradient( 
                            45deg,
                            rgba(255, 255, 255, 0.1) 0px,
                            rgba(255, 255, 255, 0.4) 25px,
                            transparent 25px,
                            transparent 50px
                          )`,
                        }}
                      >
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                          <p
                            className="text-grey text-xl font-bold opacity-90 transform rotate-45 mb-2"
                            style={{ zIndex: 2 }}
                          >
                            Art and Community
                          </p>
                          <p
                            className="text-grey text-md font-medium opacity-80 transform rotate-45 mb-2"
                            style={{ zIndex: 2 }}
                          >
                            Do not share or distribute
                          </p>
                          <p
                            className="text-grey text-sm font-normal opacity-90 transform rotate-45"
                            style={{ zIndex: 2 }}
                          >
                            © {new Date().getFullYear()} Art and Community
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <h4 className="text-[#ff8833] mt-3 text-[16px] flex justify-start font-medium letter-spacing-0-7px gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    class="size-6"
                  >
                    <path d="M10.464 8.746c.227-.18.497-.311.786-.394v2.795a2.252 2.252 0 0 1-.786-.393c-.394-.313-.546-.681-.546-1.004 0-.323.152-.691.546-1.004ZM12.75 15.662v-2.824c.347.085.664.228.921.421.427.32.579.686.579.991 0 .305-.152.671-.579.991a2.534 2.534 0 0 1-.921.42Z" />
                    <path
                      fill-rule="evenodd"
                      d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v.816a3.836 3.836 0 0 0-1.72.756c-.712.566-1.112 1.35-1.112 2.178 0 .829.4 1.612 1.113 2.178.502.4 1.102.647 1.719.756v2.978a2.536 2.536 0 0 1-.921-.421l-.879-.66a.75.75 0 0 0-.9 1.2l.879.66c.533.4 1.169.645 1.821.75V18a.75.75 0 0 0 1.5 0v-.81a4.124 4.124 0 0 0 1.821-.749c.745-.559 1.179-1.344 1.179-2.191 0-.847-.434-1.632-1.179-2.191a4.122 4.122 0 0 0-1.821-.75V8.354c.29.082.559.213.786.393l.415.33a.75.75 0 0 0 .933-1.175l-.415-.33a3.836 3.836 0 0 0-1.719-.755V6Z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  Price :{" "}
                  {photo.price > 0 ? `$${photo.price}` : "Free Download"}
                </h4>
                <h4 className="mb-5 mt-3 text-[16px] flex justify-start font-normal letter-spacing-0-7px gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    class="size-5"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M9.75 6.75h-3a3 3 0 0 0-3 3v7.5a3 3 0 0 0 3 3h7.5a3 3 0 0 0 3-3v-7.5a3 3 0 0 0-3-3h-3V1.5a.75.75 0 0 0-1.5 0v5.25Zm0 0h1.5v5.69l1.72-1.72a.75.75 0 1 1 1.06 1.06l-3 3a.75.75 0 0 1-1.06 0l-3-3a.75.75 0 1 1 1.06-1.06l1.72 1.72V6.75Z"
                      clip-rule="evenodd"
                    />
                    <path d="M7.151 21.75a2.999 2.999 0 0 0 2.599 1.5h7.5a3 3 0 0 0 3-3v-7.5c0-1.11-.603-2.08-1.5-2.599v7.099a4.5 4.5 0 0 1-4.5 4.5H7.151Z" />
                  </svg>
                  Limit Download :{" "}
                  {photo.max_sales === null
                    ? "Unlimited"
                    : photo.max_sales === 0
                    ? "Unable to download anymore"
                    : `${photo.max_sales}`}
                </h4>

                <div className="flex items-center justify-start gap-[10px]">
                  {currentUser ? (
                    <button
                      data-cy="like-btn"
                      className="btnLike gap-[6px] w-[fit-content] h-[fit-content]  rounded-md text-back cursor-pointer hover:text-gray-500 flex items-center justify-center text-center no-underline hover:no-underline focus:to-teal-950"
                      onClick={() =>
                        handleLike(
                          photo.id.toString(),
                          currentUser.id.toString()
                        )
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        className={`size-7 HeartLike ${
                          isClicked ? "filled" : ""
                        }`}
                        fill="none"
                        onClick={handleClickLike}
                      >
                        <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
                      </svg>

                      {getLikeCount(photo.id.toString())}
                      {likes.some(
                        (like) =>
                          like.photo_id === parseInt(photo.id.toString()) &&
                          like.user_id === parseInt(currentUser.id.toString())
                      )
                        ? ""
                        : ""}
                    </button>
                  ) : (
                    <button
                      className="gap-2 w-[fit-content] h-[fit-content]  rounded-md text-back cursor-pointer hover:text-gray-500 flex items-center justify-center text-center no-underline hover:no-underline focus:to-teal-950"
                      onClick={() =>
                        alert("You need to be logged in to like a photo.")
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="size-6"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                        />
                      </svg>
                      <p className="text-[18px] align-middle mb-0">
                        {getLikeCount(photo.id.toString())}
                      </p>
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
                        data-cy="com-btn"
                        className="btnComment w-[fit-content] h-[fit-content] rounded-md text-back cursor-pointer flex items-center justify-center text-center no-underline hover:no-underline"
                        onClick={() => setShowCommentForm(!showCommentForm)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="1.5"
                          stroke="currentColor"
                          class="size-7"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
                          />
                        </svg>
                      </button>

                      {showCommentForm && (
                        <>
                          <div
                            className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-10"
                            onClick={() => setShowCommentForm(false)}
                          />
                          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-md shadow-lg z-20 w-[90%] max-w-md">
                            <div className="flex items-center justify-between mb-4">
                              <h2 className="text-[26px] font-normal leading-tight mb-0 flex align-center gap-3">
                                Comment{" "}
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke-width="1.4"
                                  stroke="currentColor"
                                  class="size-7 mt-[3px]"
                                >
                                  <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                                  />
                                </svg>
                              </h2>
                              <button
                                className="closepage-link w-[fit-content] h-[fit-content] bg-red-600 rounded-md text-white cursor-pointer hover:bg-red-500 flex items-center justify-center text-center no-underline hover:no-underline"
                                onClick={handleClose}
                              >
                                ✕
                              </button>
                            </div>
                            <Form
                              onSubmit={(e) => {
                                e.preventDefault();
                                handleCommentSubmit(photo.id.toString());
                                setShowCommentForm(false);
                              }}
                            >
                              <Form.Group className="mb-4">
                                <Form.Control
                                  data-cy="file-input"
                                  className="w-[fit-content] h-[fit-content] rounded-md"
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
                                  data-cy="sub-btn"
                                  className="gap-2 p-2 px-3 w-[fit-content] h-[fit-content] bg-[#ff8833] rounded-md text-white cursor-pointer hover:bg-[#ff7722] flex items-center justify-center text-center no-underline hover:no-underline"
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
                    <p className="text-danger mb-0 flex items-center gap-1 border-2 border-red-600 rounded-md p-2">
                      {" "}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="size-6"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                        />
                      </svg>
                      Log in to comment and like.
                    </p>
                  )}

                  {/* {photo.price > 0 && !hasPurchased ? (
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
                        className="w-[110px] h-[35px] bg-[#007bff] rounded-md text-white cursor-pointer hover:bg-blue-500 flex items-center justify-center text-center no-underline hover:no-underline"
                        onClick={() =>
                          window.open(`/api/${photo.path}`, "_blank")
                        }
                    
                       
                        Download
                      </button>
                    </div>
                  )} */}

                  {photo.max_sales === 0 && !hasPurchased ? (
                    <div className="w-[270px] h-[35px] bg-[#ffc302] rounded-md text-white cursor-pointer hover:bg-sky-500 flex items-center justify-center text-center no-underline hover:no-underline">
                      <span>This picture has been bought in full.</span>
                    </div>
                  ) : photo.max_sales !== 0 &&
                    photo.price > 0 &&
                    !hasPurchased ? (
                    currentUser ? (
                      <Button
                        className="btnDownload flex items-center flex-row gap-1"
                        onClick={handlePurchase}
                      >
                        Buy for {photo.price}{" "}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          class="size-5"
                        >
                          <path d="M10.464 8.746c.227-.18.497-.311.786-.394v2.795a2.252 2.252 0 0 1-.786-.393c-.394-.313-.546-.681-.546-1.004 0-.323.152-.691.546-1.004ZM12.75 15.662v-2.824c.347.085.664.228.921.421.427.32.579.686.579.991 0 .305-.152.671-.579.991a2.534 2.534 0 0 1-.921.42Z" />
                          <path
                            fill-rule="evenodd"
                            d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v.816a3.836 3.836 0 0 0-1.72.756c-.712.566-1.112 1.35-1.112 2.178 0 .829.4 1.612 1.113 2.178.502.4 1.102.647 1.719.756v2.978a2.536 2.536 0 0 1-.921-.421l-.879-.66a.75.75 0 0 0-.9 1.2l.879.66c.533.4 1.169.645 1.821.75V18a.75.75 0 0 0 1.5 0v-.81a4.124 4.124 0 0 0 1.821-.749c.745-.559 1.179-1.344 1.179-2.191 0-.847-.434-1.632-1.179-2.191a4.122 4.122 0 0 0-1.821-.75V8.354c.29.082.559.213.786.393l.415.33a.75.75 0 0 0 .933-1.175l-.415-.33a3.836 3.836 0 0 0-1.719-.755V6Z"
                            clip-rule="evenodd"
                          />
                        </svg>
                      </Button>
                    ) : (
                      <Button
                        className="disnone"
                        onClick={() => alert("")}
                      ></Button>
                    )
                  ) : (photo.max_sales === 0 && hasPurchased) ||
                    photo.price === 0 ? (
                    currentUser ? (
                      <div className="flex items-center justify-center ml-2 float-right">
                        <button
                          className="text-[16px] gap-2 w-[fit-content] h-[fit-content] rounded-md cursor-pointer btnDownload flex items-center justify-center text-center no-underline hover:no-underline"
                          onClick={() =>
                            window.open(`/api/${photo.path}`, "_blank")
                          }
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor"
                            class="size-6"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                            />
                          </svg>{" "}
                          Download
                        </button>
                      </div>
                    ) : null
                  ) : null}
                </div>
                <div className="flex flex-col justify-start items-start w-full border-1 rounded-[8px] border-gray-300 mt-4 p-3">
                  <p className="">
                    Comments ({commentMap[photo.id.toString()]?.length || 0})
                  </p>
                  <div className="mt-2 w-full flex flex-col justify-start items-start">
                    {(commentMap[photo.id.toString()] || []).map((comment) => (
                      <div
                        key={comment.comment_id}
                        className="w-full flex justify-between items-start text-center gap-3 bg-gray-100 p-3 rounded-md mt-2 mb-0"
                      >
                        <p className="text-[14px] letter-spacing mb-0 flex flex-wrap">
                          {" "}
                          {getUsername(comment.user_id)} :{" "}
                          {comment.content.slice(0, 50)}
                        </p>
                        {currentUser?.id === comment.user_id && (
                          <button
                            data-cy="delete-btn"
                            className=" text-red-600 cursor-pointer hover:scale-110 flex items-center justify-center text-center no-underline hover:no-underline"
                            onClick={() =>
                              handleDeleteComment(
                                photo.id.toString(),
                                comment.comment_id
                              )
                            }
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              class="size-6"
                            >
                              <path d="M3.375 3C2.339 3 1.5 3.84 1.5 4.875v.75c0 1.036.84 1.875 1.875 1.875h17.25c1.035 0 1.875-.84 1.875-1.875v-.75C22.5 3.839 21.66 3 20.625 3H3.375Z" />
                              <path
                                fill-rule="evenodd"
                                d="m3.087 9 .54 9.176A3 3 0 0 0 6.62 21h10.757a3 3 0 0 0 2.995-2.824L20.913 9H3.087Zm6.133 2.845a.75.75 0 0 1 1.06 0l1.72 1.72 1.72-1.72a.75.75 0 1 1 1.06 1.06l-1.72 1.72 1.72 1.72a.75.75 0 1 1-1.06 1.06L12 15.685l-1.72 1.72a.75.75 0 1 1-1.06-1.06l1.72-1.72-1.72-1.72a.75.75 0 0 1 0-1.06Z"
                                clip-rule="evenodd"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <p className="mt-2">
                  {/* {photo.price > 0 ? `Price: $${photo.price}` : "Free Download"} */}
                </p>
              </div>
            ) : (
              <p>Photo not found</p>
            )}
          </div>

          {/* <div className="mt-4 text-center flex items-center justify-center w-[600px] h-[50px] bg-[#ff8833] text-white shadow-md border rounded-lg cursor-pointer">
            <h2 className="text-[18px] text-center mt-2">
              PAYMENT NOW PRICE : {photo?.price} BATH
            </h2>
          </div> */}
        </div>
      </Layout>
    </LoadingWrapper>
  );
};

export default PhotoDetail;
