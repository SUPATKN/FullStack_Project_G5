import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import App from "./pages/Upload";
import Gallery from "./pages/Gallery";
import Creator from "./pages/Creator";
import Instructor from "./pages/Instructor";
import Login from "./pages/Login&Register/Login";
import Register from "./pages/Login&Register/Register";
import ForgotPassword from "./Forget";
import Profile from "./pages/Profile/Profile";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import Cart from "./pages/Cart";
import Coin from "./pages/Coin";
import PhotoDetail from "./pages/PhotoDetail";
import PurchasedPhotos from "./pages/PurchasedPhotos";
import ProfileAdmin from "./pages/ProfileAdmin";
axios.defaults.withCredentials = true;
const queryClient = new QueryClient();
import SlipViewPage from "./pages/SlipViewPage";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
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
          <Route path="/profileadmin" element={<ProfileAdmin />} />
          <Route path="/slip/:slipId" element={<SlipViewPage />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  </React.StrictMode>
);
