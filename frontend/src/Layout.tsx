// Layout.tsx
import React from "react";
import NavBar from "./Navbar";
import { Container } from "react-bootstrap";

import useAuth from "./hook/useAuth";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useAuth();
  return (
    <div>
      <NavBar />
      <Container className="my-4">{children}</Container>
    </div>
  );
};

export default Layout;
