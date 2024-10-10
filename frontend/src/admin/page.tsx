import React, { useState } from "react";
import OrderHistory from "./OrdersHistory/orderhistory";
import Paymentslips from "./PaymentSlips/paymentslips";
import Transactionhistory from "./TransactionsHistory/transactionhistory";
import Users from "./Users/users";
import LoadingWrapper from "../LoadingWrapper";
import NavBar from "../components/Navbar";
import Tag from "./Tag/Tag";
import useAuth from "../hook/useAuth";

export default function Page() {
  useAuth();
  const [selectedComponent, setSelectedComponent] = useState("Paymentslips");
  return (
    <LoadingWrapper>
      <div className="flex flex-col min-h-screen  bg-[#181818] !important">
        <NavBar />
        <main className="bg-[#000000] flex ">
          

            <div className="fixed left-0  bg-[#000000] shadow-md border-black max-w-[250px] w-[100%] min-h-[640px] h-[100%] flex flex-col items-center justify-start font-bold text-black ">
              <button
                data-cy="pay-btn"
                onClick={() => setSelectedComponent("Paymentslips")}
                autoFocus
                className=" focus:bg-orange-500 text-[18px] w-full text-white p-3 text-center font-light letter-spacing-0-7p hover:bg-orange-500 hover:text-white transition-all ease-in-out duration-100 outline-hover"
              >
                Payment Slips
              </button>
              <button
                data-cy="tag-btn"
                onClick={() => setSelectedComponent("Tag")}
                className="focus:bg-orange-500 text-[18px] w-[100%]  text-white  p-3 text-center text-[#ff8833] font-light letter-spacing-0-7px hover:bg-orange-500 hover:text-white transition-all ease-in-out duration-100 outline-hover"
              >
                Tag Management
              </button>
              <button
                data-cy="users-btn"
                onClick={() => setSelectedComponent("Users")}
                className=" focus:bg-orange-500 text-[18px] w-[100%] text-white p-3  text-center text-[#ff8833] font-light letter-spacing-0-7px  hover:bg-orange-500 hover:text-white transition-all ease-in-out duration-100 outline-hover"
              >
                Users
              </button>
              <button
                data-cy="order-btn"
                onClick={() => setSelectedComponent("OrderHistory")}
                className="focus:bg-orange-500 text-[18px] w-[100%] text-white p-3  text-center text-[#ff8833] font-light letter-spacing-0-7px  hover:bg-orange-500 hover:text-white transition-all ease-in-out duration-100 outline-hover"
              >
                Order History
              </button>
              <button
                data-cy="trans-btn"
                onClick={() => setSelectedComponent("Transactionhistory")}
                className=" focus:bg-orange-500 text-[18px] w-[100%] text-white p-3 text-center text-[#ff8833] font-light letter-spacing-0-7px  hover:bg-orange-500 hover:text-white transition-all ease-in-out duration-100 outline-hover"
              >
                Transaction History
              </button>
            </div>
<<<<<<< Updated upstream
            <div className="mt-4 overflow-y-auto overflow-x-hidden h-screen flex items-start justify-center">
=======

            <div className='pl-16 pt-4 ml-16 w-[100%] h-[100%] min-h-640px bg-[#181818] flex items-start justify-center'>
>>>>>>> Stashed changes
              {selectedComponent === "OrderHistory" && <OrderHistory />}
              {selectedComponent === "Paymentslips" && <Paymentslips />}
              {selectedComponent === "Tag" && <Tag />}
              {selectedComponent === "Transactionhistory" && (
                <Transactionhistory />
              )}
              {selectedComponent === "Users" && <Users />}
            </div>

        </main>
<<<<<<< Updated upstream
        <footer className="mt-auto flex justify-center bg-[#000000] border-black p-5 shadow-lg border rounded-md w-full h-[110px]">
          <div className="flex flex-col items-center justify-center">
            <img
              src="/LOGOArtandCommunity.png"
              alt="logo"
              width={60}
              height={60}
              className="z-10"
            />
            <p className="text-center text-xs italic font-bold text-white mt-2">
              © {new Date("2024").getFullYear()} Art and Community. All rights
              reserved. by CPE 65 - GROUP 5
            </p>
          </div>
        </footer>
=======
        
        
>>>>>>> Stashed changes
      </div>
      
    </LoadingWrapper>
<<<<<<< Updated upstream
  );
=======
    
  )
>>>>>>> Stashed changes
}
