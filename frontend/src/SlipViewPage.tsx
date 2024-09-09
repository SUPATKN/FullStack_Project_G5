import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { Image, Spinner, Alert } from "react-bootstrap";
import Layout from "./Layout";

interface Slip {
  id: number;
  user_id: number;
  amount: number;
  coins: number;
  status: string;
  path: string;
}

const SlipViewPage = () => {
  const { slipId } = useParams<{ slipId: string }>();
  const [slip, setSlip] = useState<Slip | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSlip = async () => {
      try {
        const response = await axios.get<Slip>(`/api/slips/get`);
        setSlip(response.data);
      } catch (error) {
        console.error("Error fetching slip:", error);
        setError("Failed to fetch slip.");
      } finally {
        setLoading(false);
      }
    };

    fetchSlip();
  }, [slipId]);

  return (
    <Layout>
      <h3 className="mb-4 text-center">Slip Details</h3>
      {loading ? (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : slip ? (
        <div className="text-center">
          <h4>Slip ID: {slip.id}</h4>
          <Image
            src={slip.path}
            alt={`Slip ${slip.id}`}
            thumbnail
            className="w-50"
          />
          <p>Slip ID: {slip.id}</p>
          <p>User ID: {slip.user_id}</p>
          <p>Amount: {slip.amount}</p>
          <p>Coins: {slip.coins}</p>
          <p>Status: {slip.status}</p>
        </div>
      ) : (
        <p>Slip not found</p>
      )}
    </Layout>
  );
};

export default SlipViewPage;
