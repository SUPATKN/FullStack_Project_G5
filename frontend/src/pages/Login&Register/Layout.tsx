// src/pages/Login&Register/Layout.tsx
import React from "react";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="container">
      <div className="form-container">{children}</div>
    </div>
  );
};

export default Layout;
