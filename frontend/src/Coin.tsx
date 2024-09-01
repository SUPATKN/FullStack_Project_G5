import React, { useState } from "react";
import axios from "axios";
import Layout from "./Layout";
import "./global.css";
import Logo from "./Logowithbg.png";
import CoinCard from "./CoinCard"; // Ensure CoinCard is imported correctly

const Coin = () => {
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

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

  const handleCheckout = async () => {
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
      <div className="container my-5">
        <div className="row">
          <div className="col-12 d-flex flex-column align-items-start">
            <div className="square mb-4">
              <img src={Logo} alt="Example" className="img-fluid" />
            </div>
            <h3 className="ms-4 mb-0">SSS COINS</h3>

            <div className="row mt-4">
              <div className="col-md-8">
                <div className="row">
                  {cardsData.map((card, index) => (
                    <div className="col-md-4 mb-4" key={index}>
                      <CoinCard
                        quantity={card.quantity}
                        price={card.price}
                        onClick={() => setSelectedPrice(card.price)}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-md-4">
                <div className="summary p-4 border rounded">
                  <h4 className="mb-4">Selected Price</h4>
                  <div className="price-display mb-3">
                    {selectedPrice !== null ? (
                      <p className="h4 text-success">
                        ฿{selectedPrice.toFixed(2)}
                      </p>
                    ) : (
                      <p className="text-muted">No price selected</p>
                    )}
                  </div>
                  <button
                    className="btn btn-primary w-100"
                    onClick={handleCheckout}
                  >
                    Checkout
                  </button>
                  {qrCodeUrl && (
                    <div className="mt-4 text-center">
                      <h4 className="mb-3">Generated QR Code</h4>
                      <img
                        src={qrCodeUrl}
                        alt="QR Code"
                        className="img-fluid"
                      />
                      <p className="mt-2 text-muted">
                        Amount:฿ {selectedPrice?.toFixed(2)}
                      </p>
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
