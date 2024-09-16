import { useState, useEffect } from "react";
import axios from "axios";
import { Button, Spinner, Alert, Image, Modal } from "react-bootstrap";
import Layout from "../Layout";
import { useNavigate } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import { Hexagon } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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

interface Slip {
  slip_id: number;
  user_id: number;
  order_id: number;
  amount: number;
  coins: number;
  status: string;
  slip_path: string;
  admin_note: string | null;
}

interface Ordershistory {
  history_id: number;
  user_id: number;
  price: number;
  coins: number;
  status: string;
  create_at: string;
}

interface Transactions {
  user_id: number;
  amount: number;
  transaction_type: string;
  description: string;
  created_at: string;
}

interface Comment {
  id: number;
  photo_id: number;
  user_id: number;
  content: string;
  created_at: string;
}

const Admin = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [slips, setSlips] = useState<Slip[]>([]);
  const [orderHistory, setOrderHistory] = useState<Ordershistory[]>([]);
  const [Transactions, setTransactions] = useState<Transactions[]>([]);
  // const [userStats, setUserStats] = useState<Record<number, UserStats>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [selectedSlip, setSelectedSlip] = useState<Slip | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState<boolean>(false);
  const [showSlipModal, setShowSlipModal] = useState<boolean>(false);
  const [showOrderHistoryModal, setShowOrderHistoryModal] =useState<boolean>(false);
  const [showTransactionsModal, setShowTransactionsModal] =
    useState<boolean>(false);
  const [selectedUserName, setSelectedUserName] = useState<string | null>(null);
  const [likes, setLikes] = useState<{ photo_id: number; user_id: number }[]>(
    []
  );
  const [comments, setComments] = useState<Comment[]>([]);

  const navigate = useNavigate();

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

  const fetchUsers = async () => {
    try {
      const response = await axios.get<User[]>("/api/allusers");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to fetch users.");
    }
  };

  const fetchData = async () => {
    try {
      const [photosResponse] = await Promise.all([
        axios.get<Photo[]>("/api/photo"),
      ]);

      setPhotos(photosResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSlips = async () => {
    try {
      const response = await axios.get<Slip[]>("/api/slips/get");
      setSlips(response.data);
    } catch (error) {
      console.error("Error fetching slips:", error);
      setError("Failed to fetch slips.");
    }
  };

  const fetchOrderHistory = async (user_id: number) => {
    try {
      const response = await axios.get<Ordershistory[]>("/api/orders/history", {
        params: { user_id },
      });
      setOrderHistory(response.data);
      setShowOrderHistoryModal(true);
      console.log("user_id", user_id);
    } catch (error) {
      console.error("Error fetching order history:", error);
      setError("Failed to fetch order history.");
    }
  };

  const fetchTransactions = async (user_id: number) => {
    try {
      const response = await axios.get<Transactions[]>("/api/transactions", {
        params: { user_id },
      });
      console.log("Fetching transactions for user_id:", user_id);

      setTransactions(response.data);
      setShowTransactionsModal(true);
    } catch (error) {
      console.error("Error fetching transactions history:", error);
      setError("Failed to fetch transactions history.");
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

  const getLikeCount = (photoId: string) => {
    return likes.filter((like) => like.photo_id === parseInt(photoId)).length;
  };

  const getCommentCount = (photoId: string) => {
    return comments.filter((comment) => comment.photo_id === parseInt(photoId))
      .length;
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

  const handleShowPhoto = (photo: Photo) => {
    setSelectedPhoto(photo);
    setShowPhotoModal(true);
  };

  const handleShowSlip = (slip: Slip) => {
    setSelectedSlip(slip);
    setShowSlipModal(true);
  };

  const handleApproveSlip = async (slip_id: number) => {
    try {
      await axios.post(`/api/slips/approve/${slip_id}`);
      await fetchSlips(); // Re-fetch slips after operation
    } catch (error) {
      console.error("Error approving slip:", error);
      setError("Failed to approve slip.");
    }
  };

  const handleRejectSlip = async (slip_id: number) => {
    try {
      await axios.post(`/api/slips/reject/${slip_id}`);
      await fetchSlips(); // Re-fetch slips after operation
    } catch (error) {
      console.error("Error rejecting slip:", error);
      setError("Failed to reject slip.");
    }
  };

  const handleShowOrderHistory = (user_id: number, username: string) => {
    setSelectedUserName(username);
    fetchOrderHistory(user_id);
  };
  const handleShowTransactions = (user_id: number, username: string) => {
    setSelectedUserName(username);
    fetchTransactions(user_id);
  };

  const handleClosePhotoModal = () => setShowPhotoModal(false);
  const handleCloseSlipModal = () => setShowSlipModal(false);

  const handleUsernameClick = (userId: string) => {
    const user = users.find((user) => user.id);
    if (user) {
      navigate(`/profile/${userId}`, { state: { user } });
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchData();
    fetchSlips();
    fetchLikes();
    fetchComments();
  }, []);

  // Get unique user IDs
  const userIds = Array.from(new Set(photos.map((photo) => photo.user_id)));

  // Prepare data with aggregated likes and comments for each user
  const userStats = userIds.map((userId) => ({
    userId,
    totalLikes: getTotalLikesForUser(userId),
    totalComments: getTotalCommentsForUser(userId),
  }));

  // Function to calculate the maximum value from the datasets
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

    // useEffect(() => {
    //   if (showTransactionsModal) {
    //     document.body.classList.add("overflow-hidden");
    //   } else {
    //     document.body.classList.remove("overflow-hidden");
    //   }
  
    //   return () => {
    //     document.body.classList.remove("overflow-hidden");
    //   };
    // }, [showTransactionsModal]);

  return (
    <Layout>
      <h2 className="flex items-center justify-center text-[24px] text-black">ADMIN DASHBOARD</h2>
      {loading ? (
        <Spinner animation="border" />
        
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (

        <div>
          <h4 className="mt-4 flex items-center text-black text-2xl">
            <Hexagon className="text-black w-10 h-10 mr-2"/>
            Payment Slips
          </h4>
          <div className="overflow-hidden rounded-lg border shadow-md bg-white">
            <table className="table-auto mx-auto w-[1296px] h-full border-collapse">
              <thead>
                <tr className="text-center">
                  <th className="border px-2 py-3 text-[16px] font-bold text-black w-[186px]  whitespace-nowrap rounded-tl-lg">
                    Slip ID
                  </th>
                  <th className="border px-2 py-3 text-[16px] font-bold text-black w-[180px] whitespace-nowrap ">
                    User ID
                  </th>
                  <th className="border px-2 py-3 text-[16px] font-bold text-black w-[185px] whitespace-nowrap ">
                    Amount
                  </th>
                  <th className="border px-2 py-3 text-[16px] font-bold text-black w-[185px] whitespace-nowrap ">
                    Coins
                  </th>
                  <th className="border px-2 py-3 text-[16px] font-bold text-black w-[185px] whitespace-nowrap ">
                    Status
                  </th>
                  <th className="border px-2 py-3 text-[16px] font-bold text-black w-[190px] whitespace-nowrap ">
                    Slip Image
                  </th>
                  <th className="border px-2 py-3 text-[16px] font-bold text-black w-[185px] whitespace-nowrap rounded-tr-lg">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {slips.map((slip) => (
                  <tr key={slip.slip_id} className="text-center">
                    <td className="border px-2 py-3 text-[16px] font-medium text-black w-[186px]  whitespace-nowrap rounded-tl-lg">
                      {slip.slip_id}
                    </td>
                    <td className="border px-2 py-3 text-[16px] font-medium text-black w-[186px]  whitespace-nowrap">
                      {slip.user_id}
                    </td>
                    <td className="border px-2 py-3 text-[16px] font-medium text-black w-[186px]  whitespace-nowrap">
                      {slip.amount}
                    </td>
                    <td className="border px-2 py-3 text-[16px] font-medium text-black w-[186px]  whitespace-nowrap">
                      {slip.coins}
                    </td>
                    <td className="border px-2 py-3 text-[16px] font-medium text-black w-[186px]  whitespace-nowrap">
                      {slip.status}
                    </td>
                    <td className="border px-2 py-3 text-[16px] font-medium text-black w-[186px]  whitespace-nowrap">
                      <Image
                          crossOrigin="anonymous"
                          src={`/api/slip/${slip.slip_path}`}
                          alt={`Slip ${slip.slip_id}`}
                          thumbnail
                          width={100}
                          height={100}
                          onClick={() => handleShowSlip(slip)}
                          className="cursor-pointer"
                        />
                    </td>
                    <td className="border px-2 py-3 text-[16px] font-medium text-black w-[186px]  whitespace-nowrap rounded-tr-lg">
                      <Button
                          variant="success"
                          className="custom-margin"
                          onClick={() => handleApproveSlip(slip.slip_id)}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="danger"
                          className="custom-margin"
                          onClick={() => handleRejectSlip(slip.slip_id)}
                        >
                          Reject
                        </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h4 className="mt-4 flex items-center text-black text-2xl">
            <Hexagon className="text-black w-10 h-10 mr-2"/>
            Users
          </h4>
          <div className="overflow-hidden rounded-lg border shadow-md bg-white">
            <table className="table-auto mx-auto w-[1296px] h-full border-collapse">
              <thead>
                <tr className="text-center">
                  <th className="border px-2 py-3 text-[16px] font-bold text-black w-[324px]  whitespace-nowrap rounded-tl-[8px]">
                    ID
                  </th>
                  <th className="border px-2 py-3 text-[16px] font-bold text-black w-[324px] whitespace-nowrap ">
                    Username
                  </th>
                  <th className="border px-2 py-3 text-[16px] font-bold text-black w-[324px] whitespace-nowrap ">
                    Email
                  </th>
                  <th className="border px-2 py-3 text-[16px] font-bold text-black w-[324px] whitespace-nowrap rounded-tr-lg">
                    Profile
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="text-center">
                    <td className="border px-2 py-3 text-[16px] font-medium text-black w-[324px]  whitespace-nowrap rounded-tl-lg">
                      {user.id}
                    </td>
                    <td className="border px-2 py-3 text-[16px] font-medium text-black w-[324px]  whitespace-nowrap">
                      {user.username}
                    </td>
                    <td className="border px-2 py-3 text-[16px] font-medium text-black w-[324px]  whitespace-nowrap">
                      {user.email}
                    </td>
                    <td className="border px-2 py-3 text-[16px] font-medium text-black w-[324px]  whitespace-nowrap rounded-tr-lg">
                      <button
                        className="bg-[#ff8833] text-white w-[100px] h-[30px] rounded-md"
                        onClick={() => handleUsernameClick(user.id.toString())}
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <h4 className="mt-4 flex items-center text-black text-2xl">
            <Hexagon className="text-black w-10 h-10 mr-2"/>
            User Photos
          </h4>
          <div className="overflow-hidden rounded-lg border shadow-md bg-white">
            <table className="table-auto mx-auto w-[1296px] h-full border-collapse">
              <thead>
                <tr className="text-center">
                  <th className="border px-2 py-3 text-[16px] font-bold text-black w-[324px]  whitespace-nowrap rounded-tl-[8px]">
                    Photo ID
                  </th>
                  <th className="border px-2 py-3 text-[16px] font-bold text-black w-[324px] whitespace-nowrap ">
                    User ID
                  </th>
                  <th className="border px-2 py-3 text-[16px] font-bold text-black w-[324px] whitespace-nowrap ">
                    Photo
                  </th>
                  <th className="border px-2 py-3 text-[16px] font-bold text-black w-[324px] whitespace-nowrap rounded-tr-lg">
                    Price
                  </th>
                </tr>
              </thead>
              <tbody>
                {photos.map((photo) => (
                  <tr key={photo.id} className="text-center">
                    <td className="border px-2 py-3 text-[16px] font-medium text-black w-[324px]  whitespace-nowrap rounded-tl-lg">
                      {photo.id}
                    </td>
                    <td className="border px-2 py-3 text-[16px] font-medium text-black w-[324px]  whitespace-nowrap">
                      {photo.user_id}
                    </td>
                    <td className="border px-2 py-3 text-[16px] font-medium text-black w-[324px]  whitespace-nowrap flex items-center justify-center">
                      <Image
                          crossOrigin="anonymous"
                          src={`/api/${photo.path}`}
                          alt={`Image ${photo.id}`}
                          thumbnail
                          width={100}
                          height={100}
                          onClick={() => handleShowPhoto(photo)}
                          className="cursor-pointer"
                        />
                    </td>
                    <td className="border px-2 py-3 text-[16px] font-medium text-black w-[324px]  whitespace-nowrap rounded-tr-lg">
                      {photo.price}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      
          {/* <h4 className="mt-4">User Stats</h4>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>User ID</th>
                <th>Total Likes</th>
                <th>Total Comments</th>
              </tr>
            </thead>
            <tbody>
              {userStats.map((stat) => (
                <tr key={stat.userId}>
                  <td>{stat.userId}</td>
                  <td>{stat.totalLikes}</td>
                  <td>{stat.totalComments}</td>
                </tr>
              ))}
            </tbody>
          </Table> */}
          <h4 className="mt-4 flex items-center text-black text-2xl">
            <Hexagon className="text-black w-10 h-10 mr-2"/>
            User Stats Bar Graph
          </h4>
          <div className="w-[80%] mx-auto">
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

          {/* Orders History */}
          <h4 className="mt-4 flex items-center text-black text-2xl">
            <Hexagon className="text-black w-10 h-10 mr-2"/>
            Orders History
          </h4>
          <div className="overflow-hidden rounded-lg border shadow-md bg-white">
            <table className="table-auto mx-auto w-[1296px] border-collapse">
              <thead>
                <tr className="text-center">
                  <th className="border px-2 py-3 text-[16px] font-bold text-black w-[324px]  whitespace-nowrap rounded-tl-[8px]">
                    ID
                  </th>
                  <th className="border px-2 py-3 text-[16px] font-bold text-black w-[324px] whitespace-nowrap ">
                    Username
                  </th>
                  <th className="border px-2 py-3 text-[16px] font-bold text-black w-[324px] whitespace-nowrap ">
                    Email
                  </th>
                  <th className="border px-2 py-3 text-[16px] font-bold text-black w-[324px] whitespace-nowrap rounded-tr-lg">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="text-center">
                    <td className="border px-2 py-3 text-[16px] font-medium text-black w-[324px]  whitespace-nowrap rounded-tl-lg">
                      {user.id}
                    </td>
                    <td className="border px-2 py-3 text-[16px] font-medium text-black w-[324px]  whitespace-nowrap">
                      {user.username}
                    </td>
                    <td className="border px-2 py-3 text-[16px] font-medium text-black w-[324px]  whitespace-nowrap">
                      {user.email}
                    </td>
                    <td className="border px-2 py-3 text-[16px] font-medium text-black w-[324px]  whitespace-nowrap rounded-tr-lg">
                      <button
                          className="bg-[#ff8833] text-white w-[100px] h-[30px] rounded-md"
                          onClick={() =>handleShowOrderHistory(user.id, user.username)}
                        >
                          View Orders
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Transactions History */}
          <h4 className="mt-4 flex items-center text-black text-2xl">
            <Hexagon className="text-black w-10 h-10 mr-2"/>
            Transactions History
          </h4>
          <div className="overflow-hidden rounded-lg border shadow-md bg-white">
            <table className="table-auto mx-auto w-[1296px] border-collapse">
              <thead>
                <tr className="text-center">
                  <th className="border px-2 py-3 text-[16px] font-bold text-black w-[324px]  whitespace-nowrap rounded-tl-[8px]">
                    ID
                  </th>
                  <th className="border px-2 py-3 text-[16px] font-bold text-black w-[324px] whitespace-nowrap ">
                    Username
                  </th>
                  <th className="border px-2 py-3 text-[16px] font-bold text-black w-[324px] whitespace-nowrap ">
                    Email
                  </th>
                  <th className="border px-2 py-3 text-[16px] font-bold text-black w-[324px] whitespace-nowrap rounded-tr-lg">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="text-center">
                    <td className="border px-2 py-3 text-[16px] font-medium text-black w-[324px]  whitespace-nowrap rounded-tl-lg">
                      {user.id}
                    </td>
                    <td className="border px-2 py-3 text-[16px] font-medium text-black w-[324px]  whitespace-nowrap">
                      {user.username}
                    </td>
                    <td className="border px-2 py-3 text-[16px] font-medium text-black w-[324px]  whitespace-nowrap">
                      {user.email}
                    </td>
                    <td className="border px-2 py-3 text-[16px] font-medium text-black w-[324px]  whitespace-nowrap rounded-tr-lg">
                      <button
                          className="bg-[#ff8833] text-white w-[200px] h-[30px] rounded-md"
                          onClick={() =>handleShowTransactions(user.id, user.username)}
                        >
                          View Transactions
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Order Transactions Modal */}
          {showTransactionsModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ">
            <div className="bg-white p-5 h-[600px] w-[700px] rounded-md shadow-md border">
              <div className="flex items-center justify-between">
                <h2 className="text-black text-[24px] font-medium ml-5">
                  Transactions History for{" "}
                  <span style={{ color: "green" }}>{selectedUserName}</span>
                </h2>
                <button
                  onClick={() => setShowTransactionsModal(false)}
                  className="p-2 bg-red-700 text-white rounded-md"
                >
                  Close
                </button>
              </div>
              <div className="overflow-hidden rounded-lg border shadow-md bg-white mt-4">
                <table className="table-auto mx-auto w-[600px] border-collapse">
                  <thead>
                    <tr className="text-center">
                      <th className="border px-2 py-3 text-[16px] font-bold text-black w-[120px]  whitespace-nowrap rounded-tl-[8px]">
                        USER ID
                      </th>
                      <th className="border px-2 py-3 text-[16px] font-bold text-black w-[120px]  whitespace-nowrap">
                        Price
                      </th>
                      <th className="border px-2 py-3 text-[16px] font-bold text-black w-[120px]  whitespace-nowrap">
                        Type
                      </th>
                      <th className="border px-2 py-3 text-[16px] font-bold text-black w-[120px]  whitespace-nowrap">
                        Descriptions
                      </th>
                      <th className="border px-2 py-3 text-[16px] font-bold text-black w-[120px]  whitespace-nowrap rounded-tr-[8px]">
                        Created At
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Transactions.map((trans) => (
                      <tr key={trans.user_id} className="text-center">
                        <td className="border px-2 py-3 text-[16px] font-medium text-black w-[120px]  whitespace-nowrap rounded-tl-lg">
                          {trans.user_id}
                        </td>
                        <td className="border px-2 py-3 text-[16px] font-medium text-black w-[120px]  whitespace-nowrap">
                          {trans.amount}
                        </td>
                        <td className="border px-2 py-3 text-[16px] font-medium text-black w-[120px]  whitespace-nowrap">
                          {trans.transaction_type}
                        </td>
                        <td className="border px-2 py-3 text-[16px] font-medium text-black w-[120px]  whitespace-nowrap">
                          {trans.description}
                        </td>
                        <td className="border px-2 py-3 text-[16px] font-medium text-black w-[120px]  whitespace-nowrap rounded-tr-lg">
                          {new Date(trans.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          )}




          {/* Order History Modal */}
          {showOrderHistoryModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-5 h-[600px] w-[700px] rounded-md shadow-md border">
                <div className="flex items-center justify-between">
                  <h2 className="text-black text-[24px] font-medium ml-5">
                    Order History for{" "}
                    <span style={{ color: "green" }}>{selectedUserName}</span>
                  </h2>
                  <button
                    onClick={() => setShowOrderHistoryModal(false)}
                    className="p-2 bg-red-700 text-white rounded-md"
                  >
                    Close
                  </button>
                </div>
                <div className="overflow-hidden rounded-lg border shadow-md bg-white mt-4">
                  <table className="table-auto mx-auto w-[600px] border-collapse">
                    <thead>
                      <tr className="text-center">
                        <th className="border px-2 py-3 text-[16px] font-bold text-black w-[120px] whitespace-nowrap rounded-tl-[8px]">
                          History Order ID
                        </th>
                        <th className="border px-2 py-3 text-[16px] font-bold text-black w-[120px] whitespace-nowrap">
                          Price
                        </th>
                        <th className="border px-2 py-3 text-[16px] font-bold text-black w-[120px] whitespace-nowrap">
                          Coins
                        </th>
                        <th className="border px-2 py-3 text-[16px] font-bold text-black w-[120px] whitespace-nowrap">
                          Status
                        </th>
                        <th className="border px-2 py-3 text-[16px] font-bold text-black w-[120px] whitespace-nowrap rounded-tr-[8px]">
                          Created At
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderHistory.map((order) => (
                        <tr key={order.history_id} className="text-center">
                          <td className="border px-2 py-3 text-[16px] font-medium text-black w-[120px] whitespace-nowrap rounded-tl-lg">
                            {order.history_id}
                          </td>
                          <td className="border px-2 py-3 text-[16px] font-medium text-black w-[120px] whitespace-nowrap">
                            {order.price}
                          </td>
                          <td className="border px-2 py-3 text-[16px] font-medium text-black w-[120px] whitespace-nowrap">
                            {order.coins}
                          </td>
                          <td className="border px-2 py-3 text-[16px] font-medium text-black w-[120px] whitespace-nowrap">
                            {order.status}
                          </td>
                          <td className="border px-2 py-3 text-[16px] font-medium text-black w-[120px] whitespace-nowrap rounded-tr-lg">
                            {new Date(order.create_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}


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

          {selectedSlip && (
            <Modal show={showSlipModal} onHide={handleCloseSlipModal}>
              <Modal.Header closeButton onClick={handleCloseSlipModal}>
                <Modal.Title>Slip {selectedSlip.slip_id}</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Image
                  crossOrigin="anonymous"
                  src={`/api/slip/${selectedSlip.slip_path}`} // Updated path to match public directory
                  alt={`Slip ${selectedSlip.slip_id}`}
                  fluid
                />
              </Modal.Body>
              {/* <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseSlipModal}>
                  Close
                </Button>
              </Modal.Footer> */}
            </Modal>
          )}
        </div>
      )}
    </Layout>
  );
};

export default Admin;