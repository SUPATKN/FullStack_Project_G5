import React from "react";
import "../global.css";

interface CardProps {
  price: number;
  quantity: number;
  onClick: () => void;
}

const CoinCardMoney: React.FC<CardProps> = ({ price, quantity, onClick }) => (
  <div className="card" onClick={onClick}>
    <div className="card-body">
      <div className="card-content">
        {/* SVG แทนที่โลโก้ */}
        <svg
          height="50px"
          width="50px"
          fill="#ff8833"
          version="1.1"
          id="Capa_1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 220 220"
        >
          <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
          <g
            id="SVGRepo_tracerCarrier"
            stroke-linecap="round"
            stroke-linejoin="round"
          ></g>
          <g id="SVGRepo_iconCarrier">
            {" "}
            <g>
              {" "}
              <path d="M110,0C49.346,0,0,49.346,0,110s49.346,110,110,110s110-49.346,110-110S170.654,0,110,0z M110,210 c-55.14,0-100-44.86-100-100S54.86,10,110,10s100,44.86,100,100S165.14,210,110,210z"></path>{" "}
              <path d="M110,19.5c-49.902,0-90.5,40.598-90.5,90.5s40.598,90.5,90.5,90.5s90.5-40.598,90.5-90.5S159.902,19.5,110,19.5z M110,197.5c-48.248,0-87.5-39.252-87.5-87.5S61.752,22.5,110,22.5s87.5,39.252,87.5,87.5S158.248,197.5,110,197.5z"></path>{" "}
              <path d="M147.623,86.373c0-15.321-11.914-27.902-26.962-28.989v12.06c8.419,1.046,14.962,8.232,14.962,16.929 s-6.542,15.883-14.962,16.929v12.29c8.419,1.046,14.962,8.232,14.962,16.929s-6.542,15.883-14.962,16.929v12.06 c15.048-1.087,26.962-13.668,26.962-28.989c0-9.391-4.475-17.755-11.404-23.074C143.148,104.128,147.623,95.764,147.623,86.373z"></path>{" "}
              <polygon points="104.661,149.595 95.699,149.595 95.699,115.447 104.661,115.447 104.661,103.447 95.699,103.447 95.699,69.299 104.661,69.299 104.661,57.299 83.699,57.299 83.699,161.595 104.661,161.595 "></polygon>{" "}
              <rect x="107.661" y="50.564" width="10" height="118.871"></rect>{" "}
            </g>{" "}
          </g>
        </svg>
        <div className="card-details">
          <p className="card-coin">{quantity} coins</p>
          <h5 className="card-price">฿ {price.toFixed(2)}</h5>
        </div>
      </div>
    </div>
  </div>
);

export default CoinCardMoney;
