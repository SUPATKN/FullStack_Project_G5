import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Button, Spinner, Alert, Image, Modal } from "react-bootstrap";
import Layout from "./Layout";

interface User {
  name: string;
  id: number;
  username: string;
  email: string;
}

interface Photo {
  id: number;
  path: string;
  price: number;
  user_id: number;
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

interface UserStats {
  likes: number;
  comments: number;
}

interface Ordershistory {
  history_id: number;
  user_id: number;
  price: number;
  coins: number;
  status: string;
  create_at: string;
}

const Admin = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [slips, setSlips] = useState<Slip[]>([]);
  const [orderHistory, setOrderHistory] = useState<Ordershistory[]>([]);
  const [userStats, setUserStats] = useState<Record<number, UserStats>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [selectedSlip, setSelectedSlip] = useState<Slip | null>(null);
  const [showPhotoModal, setShowPhotoModal] = useState<boolean>(false);
  const [showSlipModal, setShowSlipModal] = useState<boolean>(false);
  const [showOrderHistoryModal, setShowOrderHistoryModal] =
    useState<boolean>(false);
  const [selectedUserName, setSelectedUserName] = useState<string | null>(null);

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
      const [photosResponse, likesResponse, commentsResponse] =
        await Promise.all([
          axios.get<Photo[]>("/api/photo"),
          axios.get<Record<number, number>>("/api/getcountlikes"),
          axios.get<Record<number, number>>("/api/getcountcomments"),
        ]);

      setPhotos(photosResponse.data);

      const userIds = Array.from(
        new Set(photosResponse.data.map((photo) => photo.user_id))
      );

      const stats = userIds.map((userId) => ({
        likes: likesResponse.data[userId] || 0,
        comments: commentsResponse.data[userId] || 0,
      }));

      setUserStats(
        userIds.reduce((acc, userId, index) => {
          acc[userId] = stats[index];
          return acc;
        }, {} as Record<number, UserStats>)
      );
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
    } catch (error) {
      console.error("Error fetching order history:", error);
      setError("Failed to fetch order history.");
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchData();
    fetchSlips();
  }, []);

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

  const handleClosePhotoModal = () => setShowPhotoModal(false);
  const handleCloseSlipModal = () => setShowSlipModal(false);

  return (
    <Layout>
      <h2>Admin Dashboard</h2>
      {loading ? (
        <Spinner animation="border" />
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <div>
          <h4 className="mt-4">Payment Slips</h4>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Slip ID</th>
                <th>User ID</th>
                <th>Amount</th>
                <th>Coins</th>
                <th>Status</th>
                <th>Slip Image</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {slips.map((slip) => (
                <tr key={slip.slip_id}>
                  <td>{slip.slip_id}</td>
                  <td>{slip.user_id}</td>
                  <td>{slip.amount}</td>
                  <td>{slip.coins}</td>
                  <td>{slip.status}</td>
                  <td>
                    <Image
                      crossOrigin="anonymous"
                      src={`/api/slip/${slip.slip_path}`} // Updated path to match public directory
                      alt={`Slip ${slip.slip_id}`}
                      thumbnail
                      width={100}
                      height={100}
                      onClick={() => handleShowSlip(slip)}
                      style={{ cursor: "pointer" }}
                    />
                  </td>
                  <td>
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
          </Table>

          <h4>Users</h4>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Likes</th>
                <th>Comments</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{userStats[user.id]?.likes || 0}</td>
                  <td>{userStats[user.id]?.comments || 0}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          <h4 className="mt-4">User Photos</h4>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Photo ID</th>
                <th>Photo</th>
                <th>Price</th>
                <th>User ID</th>
              </tr>
            </thead>
            <tbody>
              {photos.map((photo) => (
                <tr key={photo.id}>
                  <td>{photo.id}</td>
                  <td>
                    <Image
                      crossOrigin="anonymous"
                      src={`/api/${photo.path}`}
                      alt={`Image ${photo.id}`}
                      thumbnail
                      width={100}
                      height={100}
                      onClick={() => handleShowPhoto(photo)}
                      style={{ cursor: "pointer" }}
                    />
                  </td>
                  <td>{photo.price}</td>
                  <td>{photo.id}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          <h4 className="mt-4">User Stats</h4>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>User ID</th>
                <th>Likes</th>
                <th>Comments</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(userStats).map(([userId, stats]) => (
                <tr key={userId}>
                  <td>{userId}</td>
                  <td>{stats.likes}</td>
                  <td>{stats.comments}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Orders History */}
          <h4 className="mt-4">Orders History</h4>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Actions</th> {/* New column for actions */}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>

                  <td>
                    <Button
                      variant="info"
                      onClick={() =>
                        handleShowOrderHistory(user.id, user.username)
                      }
                    >
                      View Orders
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Order History Modal */}
          {selectedUserName && (
            <Modal
              show={showOrderHistoryModal}
              onHide={() => setShowOrderHistoryModal(false)}
            >
              <Modal.Header closeButton>
                <Modal.Title>
                  Order History for User {selectedUserName}
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>History Order ID</th>
                      <th>Price</th>
                      <th>Coins</th>
                      <th>Status</th>
                      <th>Created At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderHistory.map((order_history) => (
                      <tr key={order_history.history_id}>
                        <td>{order_history.history_id}</td>
                        <td>{order_history.price}</td>
                        <td>{order_history.coins}</td>
                        <td>{order_history.status}</td>
                        <td>
                          {new Date(order_history.create_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={() => setShowOrderHistoryModal(false)}
                >
                  Close
                </Button>
              </Modal.Footer>
            </Modal>
          )}

          {selectedPhoto && (
            <Modal show={showPhotoModal} onHide={handleClosePhotoModal}>
              <Modal.Header closeButton>
                <Modal.Title>Photo {selectedPhoto.id}</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Image
                  crossOrigin="anonymous"
                  src={`/api/${selectedPhoto.path}`}
                  alt={`Image ${selectedPhoto.id}`}
                  fluid
                />
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleClosePhotoModal}>
                  Close
                </Button>
              </Modal.Footer>
            </Modal>
          )}

          {selectedSlip && (
            <Modal show={showSlipModal} onHide={handleCloseSlipModal}>
              <Modal.Header closeButton>
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
              <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseSlipModal}>
                  Close
                </Button>
              </Modal.Footer>
            </Modal>
          )}
        </div>
      )}
    </Layout>
  );
};

export default Admin;
