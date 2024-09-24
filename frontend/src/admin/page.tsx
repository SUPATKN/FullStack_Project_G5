import React,{ useState } from 'react'
import OrderHistory from './OrdersHistory/orderhistory';
import Paymentslips from './PaymentSlips/paymentslips';
import Transactionhistory from './TransactionsHistory/transactionhistory';
import Users from './Users/users';
import LoadingWrapper from '../LoadingWrapper';
import NavBar from '../components/Navbar';
import Tag from './Tag/Tag';
import useAuth from '../hook/useAuth';


export default function Page() {
  useAuth();
  const [selectedComponent, setSelectedComponent] = useState("Paymentslips");
  return (
    <LoadingWrapper>
      <div className="flex flex-col min-h-screen Body bg-[#181818]">
        <NavBar />
        <main className="bg-[#181818] w-full h-full">
          <div className="w-full hidden max-h-screen sm:block space-y-[100px] lg:grid grid-cols-[1fr_9fr]">
            <div className="p-4 bg-[#292828] shadow-md border-black w-full h-full flex flex-col items-center justify-start font-bold text-black gap-5">
              <button
                onClick={() => setSelectedComponent("Paymentslips")}
                className="text-[18px] w-[200px] text-white  mt-2 h-[47px] hover:bg-orange-500 hover:text-white rounded-[30px] transition-all ease-in-out duration-100 outline-hover"
              >
                Payment Slips
              </button>
              <button
                onClick={() => setSelectedComponent("Tag")}
                className="text-[18px] w-[200px] text-white  mt-2 h-[47px] hover:bg-orange-500 hover:text-white rounded-[30px] transition-all ease-in-out duration-100 outline-hover"
              >
                Tag Management
              </button>
              <button
                onClick={() => setSelectedComponent("Users")}
                className="text-[18px] w-[200px] text-white h-[47px] hover:bg-orange-500 hover:text-white rounded-[30px] transition-all ease-in-out duration-100  outline-hover"
              >
                Users
              </button>
              <button
                onClick={() => setSelectedComponent("OrderHistory")}
                className="text-[18px] w-[200px] text-white h-[47px] hover:bg-orange-500 hover:text-white rounded-[30px] transition-all ease-in-out duration-100  outline-hover"
              >
                Order History
              </button>
              <button
                onClick={() => setSelectedComponent("Transactionhistory")}
                className="text-[18px] w-[200px] text-white h-[47px] hover:bg-orange-500 hover:text-white rounded-[30px] transition-all ease-in-out duration-100  outline-hover"
              >
                Transaction History
              </button>
            </div>
            <div className='mt-4 overflow-y-auto overflow-x-hidden h-screen flex items-start justify-center'>
              {selectedComponent === "OrderHistory" && <OrderHistory />}
              {selectedComponent === "Paymentslips" && <Paymentslips />}
              {selectedComponent === "Tag" && <Tag />}
              {selectedComponent === "Transactionhistory" && <Transactionhistory />}
              {selectedComponent === "Users" && <Users />}
            </div>
          </div>
        </main>
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
              © {new Date("2024").getFullYear()} Art and Community. All rights reserved. by CPE 65 - GROUP 5
            </p>
          </div>
        </footer>
      </div>
    </LoadingWrapper>
  )
}
