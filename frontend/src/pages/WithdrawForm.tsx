// Withdraw.tsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../Layout";
import "../global.css";
import CoinCard from "./CoinCardMoney"; // Component to display coin details
import useAuth from "../hook/useAuth";

const Withdraw = () => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [selectedCoins, setSelectedCoins] = useState<number | null>(null);

  const [slipFile, setSlipFile] = useState<File | null>(null);
  const { user, refetch } = useAuth();

  const cardsData = [
    { coin: 100, amount: 9.99 },
    { coin: 250, amount: 19.99 },
    { coin: 500, amount: 29.99 },
    { coin: 1000, amount: 49.99 },
    { coin: 2500, amount: 99.99 },
    { coin: 5000, amount: 149.99 },
    { coin: 10000, amount: 199.99 },
    { coin: 20000, amount: 249.99 },
    { coin: 50000, amount: 299.99 },
  ];

  useEffect(() => {
    refetch();
  }, [refetch]); // Add refetch to dependency array

  const handleUploadSlip = async () => {
    if (!slipFile) {
      alert("Please upload your payment slip.");
      return;
    }

    const formData = new FormData();
    formData.append("amount", selectedAmount?.toString() || "");
    formData.append("coins", selectedCoins?.toString() || "");
    formData.append("slip", slipFile);
    formData.append("user_id", user?.id.toString() || "");

    // Debug log for formData before submission
    console.log("FormData before sending:", selectedAmount, slipFile, user?.id);

    try {
      const response = await axios.post("/api/withdrawals/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        alert("Withdrawal request submitted successfully!");
        setSelectedAmount(null);
        setSlipFile(null);
      } else {
        alert("Failed to submit withdrawal request.");
      }
    } catch (error) {
      console.error("Error submitting withdrawal request:", error);
      alert("An error occurred while submitting the withdrawal request.");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSlipFile(event.target.files[0]);
    }
  };

  const handleAmountSelect = (amount: number, coin: number) => {
    if (!user) {
      alert("User is not logged in.");
      return;
    }

    setSelectedAmount(amount);
    setSelectedCoins(coin);
    console.log("Amount:", amount);
    console.log("Coins:", coin);
  };

  return (
    <Layout>
      <div className="container text-center">
        <h3 className="mt-3 mb-3 text-center text-[#ff8833] font-light letter-spacing-0-7px">
          WITHDRAW
        </h3>
        <p className="instructor-p">You can withdraw funds from your account</p>
        <div className="row">
          <div className="col-12 d-flex flex-column align-items-start">
            <div className="row mt-3">
              <div className="col-md-8">
                <div className="row">
                  {cardsData.map((card, index) => (
                    <div className="col-12 col-md-4 mb-4" key={index}>
                      <CoinCard
                        quantity={card.coin}
                        price={card.amount}
                        onClick={() =>
                          handleAmountSelect(card.amount, card.coin)
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="col-md-4">
                <div className="summary p-4 border rounded">
                  <h4 className="mb-2 s">Selected Amount</h4>
                  <div className="mb-3">
                    {selectedAmount !== null ? (
                      <p className="text-s">฿{selectedAmount}</p>
                    ) : (
                      <p className="text-muted">No amount selected</p>
                    )}
                  </div>

                  <h4 className="mb-4 s">Upload Payment Slip</h4>
                  <div className="mb-3">
                    <input
                      type="file"
                      className="form-control w-100"
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                  </div>
                  <button className="btn-s w-100" onClick={handleUploadSlip}>
                    Submit Withdrawal Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Withdraw;
