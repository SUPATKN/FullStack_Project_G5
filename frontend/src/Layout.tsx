import React from "react";
import NavBar from "./components/Navbar";
import { Container } from "react-bootstrap";
import useAuth from "./hook/useAuth";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useAuth();
  return (
    <div className="flex flex-col min-h-screen Body">
      <NavBar />
      <Container className="flex-grow my-4">{children}</Container>
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
    </div>
  );
};

export default Layout;
