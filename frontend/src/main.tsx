import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Upload from "./pages/Upload";
import Home from "./pages/Home";
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
import SlipViewPage from "./pages/SlipViewPage";
import PrivateRoute from "./components/PrivateRoute"; // Adjust the path if needed

axios.defaults.withCredentials = true;
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  
  <React.StrictMode >
    <QueryClientProvider client={queryClient} >
      <Router >
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/" element={<Gallery />} />
          <Route path="/upload" element={<PrivateRoute><Upload /></PrivateRoute>} />
          <Route path="/creator" element={<PrivateRoute><Creator /></PrivateRoute>} />
          <Route path="/instructor" element={<PrivateRoute><Instructor /></PrivateRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/profile/:userId" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
          <Route path="/coin" element={<PrivateRoute><Coin /></PrivateRoute>} />
          <Route path="/photo/:id" element={<PhotoDetail />} />
          <Route path="/purchased-photos" element={<PrivateRoute><PurchasedPhotos /></PrivateRoute>} />
          <Route path="/profileadmin" element={<PrivateRoute adminOnly><ProfileAdmin /></PrivateRoute>} />
          <Route path="/slip/:slipId" element={<PrivateRoute><SlipViewPage /></PrivateRoute>} />
        </Routes>
      </Router>
    </QueryClientProvider>
  </React.StrictMode>
);
