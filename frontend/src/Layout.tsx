import React from "react";
import NavBar from "./components/Navbar";
import { Container } from "react-bootstrap";
import useAuth from "./hook/useAuth";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useAuth();
  return (
    <div className="flex flex-col min-h-screen Body">
      <NavBar />
      <Container className="flex-grow my-2">{children}</Container>

      <footer className=" justify-center bg-[#000000]">
          <p className="font-light">
            © {new Date("2024").getFullYear()} Art and Community. All rights reserved. by CPE 65 - GROUP 5
          </p>
      </footer>
    </div>
  );
};

export default Layout;
