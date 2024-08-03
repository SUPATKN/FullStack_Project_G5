import React from "react";
import NavBar from "./Navbar";
import { Container } from "react-bootstrap";
import { AuthProvider } from "./AuthContext";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <div>
        <NavBar />
        <Container className="my-4">{children}</Container>
      </div>
    </AuthProvider>
  );
};

export default Layout;
