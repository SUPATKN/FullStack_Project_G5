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
        <h3 className="mt-3 mb-3 text-center text-[#ff8833] font-light letter-spacing-0-7px">
          TOP UP
        </h3>
        <p className="instructor-p">
          You can exchange coins to buy pictures on our website
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
                      <p className="text-s">฿{selectedPrice.toFixed(2)}</p>
                    ) : (
                      <p className="text-muted">No price selected</p>
                    )}
                  </div>

                  <button
                    className=" btn-s w-100 mb-2"
                    onClick={handleGenerateQR}
                    disabled={qrCodeUrl !== null}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
  <path fillRule="evenodd" d="M3 4.875C3 3.839 3.84 3 4.875 3h4.5c1.036 0 1.875.84 1.875 1.875v4.5c0 1.036-.84 1.875-1.875 1.875h-4.5A1.875 1.875 0 0 1 3 9.375v-4.5ZM4.875 4.5a.375.375 0 0 0-.375.375v4.5c0 .207.168.375.375.375h4.5a.375.375 0 0 0 .375-.375v-4.5a.375.375 0 0 0-.375-.375h-4.5Zm7.875.375c0-1.036.84-1.875 1.875-1.875h4.5C20.16 3 21 3.84 21 4.875v4.5c0 1.036-.84 1.875-1.875 1.875h-4.5a1.875 1.875 0 0 1-1.875-1.875v-4.5Zm1.875-.375a.375.375 0 0 0-.375.375v4.5c0 .207.168.375.375.375h4.5a.375.375 0 0 0 .375-.375v-4.5a.375.375 0 0 0-.375-.375h-4.5ZM6 6.75A.75.75 0 0 1 6.75 6h.75a.75.75 0 0 1 .75.75v.75a.75.75 0 0 1-.75.75h-.75A.75.75 0 0 1 6 7.5v-.75Zm9.75 0A.75.75 0 0 1 16.5 6h.75a.75.75 0 0 1 .75.75v.75a.75.75 0 0 1-.75.75h-.75a.75.75 0 0 1-.75-.75v-.75ZM3 14.625c0-1.036.84-1.875 1.875-1.875h4.5c1.036 0 1.875.84 1.875 1.875v4.5c0 1.035-.84 1.875-1.875 1.875h-4.5A1.875 1.875 0 0 1 3 19.125v-4.5Zm1.875-.375a.375.375 0 0 0-.375.375v4.5c0 .207.168.375.375.375h4.5a.375.375 0 0 0 .375-.375v-4.5a.375.375 0 0 0-.375-.375h-4.5Zm7.875-.75a.75.75 0 0 1 .75-.75h.75a.75.75 0 0 1 .75.75v.75a.75.75 0 0 1-.75.75h-.75a.75.75 0 0 1-.75-.75v-.75Zm6 0a.75.75 0 0 1 .75-.75h.75a.75.75 0 0 1 .75.75v.75a.75.75 0 0 1-.75.75h-.75a.75.75 0 0 1-.75-.75v-.75ZM6 16.5a.75.75 0 0 1 .75-.75h.75a.75.75 0 0 1 .75.75v.75a.75.75 0 0 1-.75.75h-.75a.75.75 0 0 1-.75-.75v-.75Zm9.75 0a.75.75 0 0 1 .75-.75h.75a.75.75 0 0 1 .75.75v.75a.75.75 0 0 1-.75.75h-.75a.75.75 0 0 1-.75-.75v-.75Zm-3 3a.75.75 0 0 1 .75-.75h.75a.75.75 0 0 1 .75.75v.75a.75.75 0 0 1-.75.75h-.75a.75.75 0 0 1-.75-.75v-.75Zm6 0a.75.75 0 0 1 .75-.75h.75a.75.75 0 0 1 .75.75v.75a.75.75 0 0 1-.75.75h-.75a.75.75 0 0 1-.75-.75v-.75Z" clipRule="evenodd" />
</svg>

                    Generate QR Code
                  </button>

                  {qrCodeUrl && (
                    <div className="mt-2 boxQR">
                      {/* <h4 className="mb-2 font-normal">Generated QR Code</h4> */}
                      <img
                        src={
                          "https://secure1.zimple.cloud/images/thai_qr_payment.png"
                        }
                        alt=""
                        className="h-20"
                      />
                      <img src={qrCodeUrl} alt="QR Code" className="h-25" />
                      <span className="flex justify-center text-[#4fbeae]">
                        สแกน QR เพื่อโอนเงินเข้าบัญชี
                      </span>
                      <span className="flex justify-center mr-auto ml-auto">
                        ชื่อ: นาย สิปปกร คำมีสว่าง
                      </span>
                      {/* <hr className="custom-hr m-2" /> */}
                      <p className="mt-2 text-muted amount">
                        Amount:{" "}
                        <div className="amount-num">
                          ฿ {selectedPrice?.toFixed(2)}
                        </div>
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
