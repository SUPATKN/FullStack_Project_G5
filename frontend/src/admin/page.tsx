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
              onClick={() => setSelectedComponent("Paymentslips")}
              autoFocus
              className=" focus:bg-orange-500 text-[18px] w-full text-white p-3 text-center font-light letter-spacing-0-7p hover:bg-orange-500 hover:text-white transition-all ease-in-out duration-100 outline-hover"
            >
              Payment Slips
            </button>
            <button
              onClick={() => setSelectedComponent("Tag")}
              className="focus:bg-orange-500 text-[18px] w-[100%]  text-white  p-3 text-center text-[#ff8833] font-light letter-spacing-0-7px hover:bg-orange-500 hover:text-white transition-all ease-in-out duration-100 outline-hover"
            >
              Tag Management
            </button>
            <button
              onClick={() => setSelectedComponent("Users")}
              className=" focus:bg-orange-500 text-[18px] w-[100%] text-white p-3  text-center text-[#ff8833] font-light letter-spacing-0-7px  hover:bg-orange-500 hover:text-white transition-all ease-in-out duration-100 outline-hover"
            >
              Users
            </button>
            <button
              onClick={() => setSelectedComponent("OrderHistory")}
              className="focus:bg-orange-500 text-[18px] w-[100%] text-white p-3  text-center text-[#ff8833] font-light letter-spacing-0-7px  hover:bg-orange-500 hover:text-white transition-all ease-in-out duration-100 outline-hover"
            >
              Order History
            </button>
            <button
              onClick={() => setSelectedComponent("Transactionhistory")}
              className=" focus:bg-orange-500 text-[18px] w-[100%] text-white p-3 text-center text-[#ff8833] font-light letter-spacing-0-7px  hover:bg-orange-500 hover:text-white transition-all ease-in-out duration-100 outline-hover"
            >
              Transaction History
            </button>
          </div>

          <div className="pl-16 pt-4 ml-16 w-[100%] h-[100%] min-h-640px bg-[#181818] flex items-start justify-center">
            {selectedComponent === "OrderHistory" && <OrderHistory />}
            {selectedComponent === "Paymentslips" && <Paymentslips />}
            {selectedComponent === "Tag" && <Tag />}
            {selectedComponent === "Transactionhistory" && (
              <Transactionhistory />
            )}
            {selectedComponent === "Users" && <Users />}
          </div>
        </main>
      </div>
    </LoadingWrapper>
  );
}
