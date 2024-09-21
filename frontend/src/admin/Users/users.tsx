import { useState, useEffect } from 'react';
import { Hexagon } from 'lucide-react';
import { Image, Modal } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';
import { useNavigate } from "react-router-dom";
import axios from 'axios';

interface User {
  name: string;
  id: number;
  username: string;
  email: string;
}
interface Photo {
  title: string;
  id: number;
  path: string;
  price: number;
  description: string;
  user_id: number;
  created_at: string;
}

interface Comment {
  id: number;
  photo_id: number;
  user_id: number;
  content: string;
  created_at: string;
}


export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState<boolean>(false);
  const [likes, setLikes] = useState<{ photo_id: number; user_id: number }[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  // const [loading, setLoading] = useState<boolean>(true);

  const navigate = useNavigate();

  const handleUsernameClick = (userId: string) => {
    const user = users.find((user) => user.id);
    if (user) {
      navigate(`/profile/${userId}`, { state: { user } });
    }
  };

  const handleClosePhotoModal = () => setShowPhotoModal(false);

  const handleShowPhoto = (photo: Photo) => {
    setSelectedPhoto(photo);
    setShowPhotoModal(true);
  };

  const getBarGraphData = () => {
    const labels = userStats.map((stat) => `User ${stat.userId}`);
    const likesData = userStats.map((stat) => stat.totalLikes);
    const commentsData = userStats.map((stat) => stat.totalComments);

    return {
      labels,
      datasets: [
        {
          label: "Total Likes",
          data: likesData,
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
          barPercentage: 0.4, // Adjust bar width
        },
        {
          label: "Total Comments",
          data: commentsData,
          backgroundColor: "rgba(153, 102, 255, 0.2)",
          borderColor: "rgba(153, 102, 255, 1)",
          borderWidth: 1,
          barPercentage: 0.4, // Adjust bar width
        },
      ],
    };
  };

  const userIds = Array.from(new Set(photos.map((photo) => photo.user_id)));

  const getLikeCount = (photoId: string) => {
    return likes.filter((like) => like.photo_id === parseInt(photoId)).length;
  };

  const getCommentCount = (photoId: string) => {
    return comments.filter((comment) => comment.photo_id === parseInt(photoId)).length;
  };

  const getTotalLikesForUser = (userId: number) => {
    const userPhotos = photos.filter((photo) => photo.user_id === userId);
    return userPhotos.reduce(
      (total, photo) => total + getLikeCount(photo.id.toString()),
      0
    );
  };

  const getTotalCommentsForUser = (userId: number) => {
    const userPhotos = photos.filter((photo) => photo.user_id === userId);
    return userPhotos.reduce(
      (total, photo) => total + getCommentCount(photo.id.toString()),
      0
    );
  };

  const userStats = userIds.map((userId) => ({
    userId,
    totalLikes: getTotalLikesForUser(userId),
    totalComments: getTotalCommentsForUser(userId),
  }));

  
  const calculateMaxValue = (datasets: number[][], buffer: number) => {
    const allValues = datasets.flat();
    const maxValue = Math.max(...allValues);
    return maxValue + buffer;
  };
  
  const maxYValue = calculateMaxValue(
    [
      userStats.map((stat) => stat.totalLikes),
      userStats.map((stat) => stat.totalComments),
    ],
    4
  );
  const fetchUsers = async () => {
    try {
      const response = await axios.get<User[]>("/api/allusers");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchAllPhoto = async () => {
    try {
      const [photosResponse] = await Promise.all([
        axios.get<Photo[]>("/api/photo"),
      ]);

      setPhotos(photosResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      // setLoading(false);
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


  useEffect(() => {
    fetchUsers();
    fetchAllPhoto();
    fetchLikes();
    fetchComments();
  }, []);
  return (
    <div>
            <h4 className="flex items-center text-white text-2xl">
              <Hexagon className="text-white w-10 h-10 mr-2" />
              Users
            </h4>
            <div className="overflow-hidden rounded-lg border shadow-md bg-white bg-opacity-10 border-black">
              <table className="table-auto mx-auto w-[1100px] h-full border-collapse border-black">
                <thead>
                  <tr className="text-center border-black">
                    <th className="border-[#ff8833] border-2 px-2 py-3 text-[16px] font-bold text-[#ff8833] whitespace-nowrap rounded-tl-[8px]">
                      ID
                    </th>
                    <th className="border-[#ff8833] border-2 px-2 py-3 text-[16px] font-bold text-[#ff8833] whitespace-nowrap ">
                      Username
                    </th>
                    <th className="border-[#ff8833] border-2 px-2 py-3 text-[16px] font-bold text-[#ff8833] whitespace-nowrap ">
                      Email
                    </th>
                    <th className="border-[#ff8833] border-2 px-2 py-3 text-[16px] font-bold text-[#ff8833] whitespace-nowrap rounded-tr-lg">
                      Profile
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="text-center">
                      <td className="border-black px-2 py-3 text-[16px] font-medium text-white  whitespace-nowrap rounded-tl-lg">
                        {user.id}
                      </td>
                      <td className="border-black px-2 py-3 text-[16px] font-medium text-white  whitespace-nowrap">
                        {user.username}
                      </td>
                      <td className="border-black px-2 py-3 text-[16px] font-medium text-white  whitespace-nowrap">
                        {user.email}
                      </td>
                      <td className="border-black px-2 py-3 text-[16px] font-medium text-white  whitespace-nowrap rounded-tr-lg">
                        <button
                          className="bg-[#ff8833] text-white w-[100px] h-[30px] rounded-md"
                          onClick={() =>
                            handleUsernameClick(user.id.toString())
                          }
                        >
                          View Profile
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h4 className="mt-4 flex items-center text-white text-2xl">
              <Hexagon className="text-white w-10 h-10 mr-2" />
              User Photos
            </h4>
            <div className="overflow-hidden rounded-lg border shadow-md bg-white bg-opacity-10 border-black">
              <table className="table-auto mx-auto w-[1100px] h-full border-collapse border-black">
                <thead>
                  <tr className="text-center">
                    <th className="border-[#ff8833] border-2 px-2 py-3 text-[16px] font-bold text-[#ff8833]  whitespace-nowrap rounded-tl-[8px]">
                      Photo ID
                    </th>
                    <th className="border-[#ff8833] border-2 px-2 py-3 text-[16px] font-bold text-[#ff8833] whitespace-nowrap ">
                      User ID
                    </th>
                    <th className="border-[#ff8833] border-2 px-2 py-3 text-[16px] font-bold text-[#ff8833] whitespace-nowrap ">
                      Photo
                    </th>
                    <th className="border-[#ff8833] border-2 px-2 py-3 text-[16px] font-bold text-[#ff8833] whitespace-nowrap rounded-tr-lg">
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {photos.map((photo) => (
                    <tr key={photo.id} className="text-center">
                      <td className="border-black px-2 py-3 text-[16px] font-medium text-white  whitespace-nowrap rounded-tl-lg">
                        {photo.id}
                      </td>
                      <td className="border-black px-2 py-3 text-[16px] font-medium text-white  whitespace-nowrap">
                        {photo.user_id}
                      </td>
                      <td className="border-black px-2 py-3 text-[16px] font-medium text-white h-full  whitespace-nowrap flex items-center justify-center">
                        <Image
                          crossOrigin="anonymous"
                          src={`/api/${photo.path}`}
                          alt={`Image ${photo.id}`}
                          // thumbnail
                          width={100}
                          height={100}
                          onClick={() => handleShowPhoto(photo)}
                          className="cursor-pointer"
                        />
                      </td>
                      <td className="border-black px-2 py-3 text-[16px] font-medium text-white  whitespace-nowrap rounded-tr-lg">
                        {photo.price}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h4 className="mt-4 flex items-center text-white text-2xl">
              <Hexagon className="text-white w-10 h-10 mr-2" />
              User Stats Bar Graph
            </h4>
            <div className="w-[70%] mx-auto">
              <Bar
                data={getBarGraphData()}
                options={{
                  responsive: true,
                  indexAxis: "x",
                  plugins: {
                    legend: {
                      position: "top",
                    },
                    tooltip: {
                      callbacks: {
                        label: function (context) {
                          let label = context.dataset.label || "";
                          if (label) {
                            label += ": ";
                          }
                          if (context.parsed.y !== null) {
                            label += context.parsed.y;
                          }
                          return label;
                        },
                      },
                    },
                  },
                  scales: {
                    x: {
                      stacked: false,
                    },
                    y: {
                      stacked: false,
                      min: 0, // Minimum value on y-axis
                      max: maxYValue, // Maximum value on y-axis, extended by buffer
                    },
                  },
                }}
              />
            </div>
            {selectedPhoto && (
              <Modal show={showPhotoModal} onHide={handleClosePhotoModal}>
                <Modal.Header closeButton onClick={handleClosePhotoModal}>
                  <Modal.Title className="frontsize-15px">
                    <span style={{ fontSize: "18px" }}>Title: </span>
                    <span style={{ color: "green", fontSize: "18px" }}>
                      {selectedPhoto.title}
                    </span>
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Image
                    crossOrigin="anonymous"
                    src={`/api/${selectedPhoto.path}`}
                    alt={`Image ${selectedPhoto.id}`}
                    fluid
                  />
                  <div style={{ textAlign: "center", marginTop: "15px" }}>
                    <div style={{ fontSize: "15px", fontWeight: "bold" }}>
                      Descriptions
                    </div>
                    <div
                      style={{
                        color: "grey",
                        fontSize: "15px",
                        marginTop: "5px",
                      }}
                    >
                      {selectedPhoto.description}
                    </div>
                  </div>
                </Modal.Body>
                {/* <Modal.Footer>
                  <Button variant="secondary" onClick={handleClosePhotoModal}>
                    Close
                  </Button>
                </Modal.Footer> */}
              </Modal>
            )}

    </div>
  );
}
