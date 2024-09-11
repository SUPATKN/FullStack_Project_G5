import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../hook/useAuth"; // Adjust the path if needed

interface PrivateRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean; // Add an optional prop to specify if the route is admin-only
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, adminOnly = false }) => {
  const { user} = useAuth();
  const location = useLocation();

  if (user === undefined) {
    // Show a loading spinner or something while authentication status is being determined
    return <div>Loading...</div>;
  }

  if (!user) {
    // Redirect to login page if not logged in
    return <Navigate to="/login" state={{ from: location }} />;
  }

  if (adminOnly && !user.isAdmin) {
    // Redirect to a forbidden or home page if user is not an admin
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
