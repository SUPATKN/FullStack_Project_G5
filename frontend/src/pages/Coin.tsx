import React, { useState, useEffect } from "react";
import axios from "axios";
import Layout from "../Layout";
import "../global.css";
import Logo from "../AnC Coin.png";
import CoinCard from "./CoinCard";
import useAuth from "../hook/useAuth";

const Coin = () => {
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [selectedQuantity, setSelecteQuantity] = useState<number | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const { user, refetch } = useAuth();

  const cardsData = [
    { price: 9.99, quantity: 100 },
    { price: 19.99, quantity: 250 },
    { price: 29.99, quantity: 500 },
    { price: 49.99, quantity: 1000 },
    { price: 99.99, quantity: 2500 },
    { price: 149.99, quantity: 5000 },
    { price: 199.99, quantity: 10000 },
    { price: 249.99, quantity: 20000 },
    { price: 299.99, quantity: 50000 },
  ];

  useEffect(() => {
    refetch();
  }, []);

  const handleUploadSlip = async () => {
    if (!slipFile) {
      alert("Please upload your payment slip.");
      return;
    }

    const formData = new FormData();
    formData.append("amount", selectedPrice?.toString() || "");
    formData.append("coins", selectedQuantity?.toString() || "");
    formData.append("slip", slipFile); // The key should be "slip" to match Multer config
    formData.append("user_id", user?.id.toString() || "");

    try {
      const response = await axios.post("/api/uploadSlip", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        alert("Slip uploaded successfully!");
      } else {
        alert("Failed to upload slip.");
      }
    } catch (error) {
      console.error("Error uploading slip:", error);
      alert("An error occurred while uploading the slip.");
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSlipFile(event.target.files[0]);
    }
  };

  const handlePriceSelect = (price: number, quantity: number) => {
    if (!user) {
      alert("User is not logged in.");
      return;
    }

    // Just set the selected price, do not send it to the server yet
    setSelectedPrice(price);
    setSelecteQuantity(quantity);
  };

  const handleGenerateQR = async () => {
    if (selectedPrice === null) {
      alert("Please select a price.");
      return;
    }

    try {
      const response = await axios.post("/api/generateQR", {
        amount: selectedPrice,
      });

      if (response.data.RespCode === 200) {
        setQrCodeUrl(response.data.Result);

        // Now send the selected price and quantity after QR code is generated
        if (user) {
          const user_id = user.id;
          const selectedCard = cardsData.find(
            (card) => card.price === selectedPrice
          );

          if (selectedCard) {
            axios
              .post("/api/selectPriceAndQuantity", {
                price: selectedPrice,
                quantity: selectedCard.quantity,
                user_id,
              })
              .then((response) => {
                if (response.data.success) {
                  console.log("Price and quantity selected successfully");
                } else {
                  console.error("Failed to select price and quantity");
                }
              })
              .catch((error) => {
                console.error("Error selecting price and quantity:", error);
              });
          }
        }
      } else {
        alert("Failed to generate QR Code.");
      }
    } catch (error) {
      console.error("Error generating QR Code:", error);
      alert("An error occurred while generating the QR Code.");
    }
  };

  return (
    <Layout>
      
      <div className="container text-center">
      <h3 className="mb-4 text-center text-[#ff8833] font-light letter-spacing-0-7px">TOP UP</h3>
      <p className="instructor-p">
      You can exchange coins to buy pictures on our website.
                </p>
        <div className="row">
          <div className="col-12 d-flex flex-column align-items-start">
            <div className="row mt-3">
              <div className="col-md-8">
                <div className="row">
                  {cardsData.map((card, index) => (
                    <div className="col-12 col-md-4 mb-4" key={index}>
                      <CoinCard
                        quantity={card.quantity}
                        price={card.price}
                        onClick={() =>
                          handlePriceSelect(card.price, card.quantity)
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="col-md-4">
                <div className="summary p-4 border rounded">
                  <h4 className="mb-2 s">Selected Price</h4>
                  <div className="mb-3">
                    {selectedPrice !== null ? (
                      <p className="text-s">
                        ฿{selectedPrice.toFixed(2)}
                      </p>
                    ) : (
                      <p className="text-muted">No price selected</p>
                    )}
                  </div>

                  <button
                    className=" btn-s w-100 mb-2"
                    onClick={handleGenerateQR}
                    disabled={qrCodeUrl !== null}
                  >
                    Generate QR Code
                  </button>

                  {qrCodeUrl && (
                    <div className="mt-2 boxQR">
                      <h4 className="mb-2 font-normal">Generated QR Code</h4>
                      <img
                        src={qrCodeUrl}
                        alt="QR Code"
                        className="img-fluid QR"
                      />
                      <p className="mt-2 text-muted amount">
                        Amount: <div className="amount-num" >฿ {selectedPrice?.toFixed(2)}</div>
                      </p>

                      <h4 className="mb-4 s">Upload Payment Slip</h4>
                      <div className="mb-3">
                        <input
                          type="file"
                          className="form-control w-100"
                          onChange={handleFileChange}
                          accept="image/*"
                        />
                      </div>
                      <button
                        className="btn-s w-100"
                        onClick={handleUploadSlip}
                      >
                        Upload Slip
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Coin;
