import React, { useState} from "react";
import {Link, useLocation } from "react-router-dom";
import Logo from "../LogoPreflight.png";
import "../global.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import axios from "axios";
import useAuth from "../hook/useAuth";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';

const NavBar: React.FC = () => {
  const { user, refetch } = useAuth();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const location = useLocation(); // Get the current URL path

  const handleLogout = async () => {
    try {
      await axios.get("/api/logout"); // Send request to backend to logout
      refetch();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

 return (
  <nav className="navbar fixed-top position-sticky">
    <div className="containerNav">
      <Link to="/" className="navbar-brand">
        <img src={Logo} alt="My Photo App Logo" className="logo" />
      </Link>
      <button className="navbar-toggle" onClick={toggleNav}>
        ☰
      </button>
      <div className={`navbar-collapse ${isNavOpen ? "active" : ""}`}>
        <ul className="nav-links">
          <li className={`${location.pathname === "/home" ? "active" : ""}`}>
            <Link to="/home" className="nav-link">
              Home
            </Link>
          </li>
          <li className={`${location.pathname === "/" ? "active" : ""}`}>
            <Link to="/" className="nav-link">
              Gallery
            </Link>
          </li>
          <li className={`${location.pathname === "/creator" ? "active" : ""}`}>
            <Link to="/creator" className="nav-link">
              Creator
            </Link>
          </li>
          <li
            className={`${location.pathname === "/instructor" ? "active" : ""}`}
          >
            <Link to="/instructor" className="nav-link">
              Instructor
            </Link>
          </li>
        </ul>
        <div className="nav-actions">
          {!user ? (
            <>
              <Link to="/login" className="nav-link start-upload">
              <FontAwesomeIcon icon={faUpload}/>  
              <div className="start-upload-text">Start Upload</div>
              </Link>
              <div className="signup-login">
                <Link to="/register" className="nav-link signup">
                  Sign Up
                </Link>
                <Link to="/login" className="nav-link login ">
                  Log In
                </Link>
              </div>
            </>
          ) : (
            <>
              <Link to="/coin" className="nav-link coin">
                <i className="bi bi-coin"></i> {user.coin}
              </Link>
              <Link to="/cart" className="nav-link cart">
                <i className="bi bi-cart4"></i>
              </Link>
              <Link to={`/profile/${user.id}`} className="nav-link profile">
                Profile
              </Link>
              <Link to="/upload" className="nav-link upload">
                Start Upload
              </Link>
              <Link to="/" onClick={handleLogout} className="nav-link logout">
                Logout
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  </nav>
);
};

export default NavBar;
