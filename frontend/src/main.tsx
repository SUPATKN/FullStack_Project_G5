import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import App from "./Upload";
import Gallery from "./Gallery";
import Creator from "./Creator";
import Instructor from "./Instructor";
import Login from "./Login";
import Register from "./Register";
import ForgotPassword from "./Forget";
import Profile from "./Profile";
import { AuthProvider } from "./AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";
import Cart from "./Cart";
import Coin from "./Coin";
import PhotoDetail from "./PhotoDetail";
import PurchasedPhotos from "./PurchasedPhotos";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Gallery />} />
          <Route path="/upload" element={<App />} />
          <Route path="/creator" element={<Creator />} />
          <Route path="/instructor" element={<Instructor />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/coin" element={<Coin />} />
          <Route path="/photo/:id" element={<PhotoDetail />} />
          <Route path="/purchased-photos" element={<PurchasedPhotos />} />
        </Routes>
      </Router>
    </AuthProvider>
  </React.StrictMode>
);
