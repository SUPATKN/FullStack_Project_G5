import { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Spinner, Alert } from "react-bootstrap";
import Layout from "./Layout";

interface User {
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

interface UserStats {
  likes: number;
  comments: number;
}

const Admin = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [userStats, setUserStats] = useState<Record<number, UserStats>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    fetchUsers();
    fetchData();
  }, []);

  return (
    <Layout>
      <h3 className="mb-4 text-center">Admin Dashboard</h3>
      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      ) : (
        <>
          {error && <Alert variant="danger">{error}</Alert>}

          <h4>Users</h4>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    <Button variant="info" href={`/profile/${user.id}`}>
                      View Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <h4 className="mt-4">User Photos</h4>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Path</th>
                <th>Price</th>
                <th>User ID</th>
              </tr>
            </thead>
            <tbody>
              {photos.map((photo) => (
                <tr key={photo.id}>
                  <td>{photo.id}</td>
                  <td>{photo.path}</td>
                  <td>${photo.price.toFixed(2)}</td>
                  <td>{photo.user_id}</td>
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
        </>
      )}
    </Layout>
  );
};

export default Admin;
