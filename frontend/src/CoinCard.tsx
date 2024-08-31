import React from "react";
import Logo from "./Logowithbg.png"; // นำเข้ารูปโลโก้

interface CardProps {
  price: number;
  quantity: number;
  onClick: () => void;
}

const CoinCard: React.FC<CardProps> = ({ price, quantity, onClick }) => (
  <div className="card" onClick={onClick}>
    <div className="card-body">
      <div className="card-content">
        <img src={Logo} alt="Logo" className="card-logo" />
        <div className="card-details">
          <p className="card-coin">{quantity} coins</p>
          <h5 className="card-price">฿ {price.toFixed(2)}</h5>
        </div>
      </div>
    </div>
  </div>
);

export default CoinCard;
