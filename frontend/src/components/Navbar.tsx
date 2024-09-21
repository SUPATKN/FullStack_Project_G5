import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Logo from "../LOGOArtandCommunity.png";
import "../global.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import axios from "axios";
import useAuth from "../hook/useAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/free-solid-svg-icons";

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
          <button className="navbar-toggle" onClick={toggleNav}>
            ☰
          </button>
        </Link>

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
            <li
              className={`${location.pathname === "/creator" ? "active" : ""}`}
            >
              <Link to="/creator" className="nav-link">
                Creator
              </Link>
            </li>

            <li
              className={`${
                location.pathname === "/instructor" ? "active" : ""
              }`}
            >
              <Link to="/instructor" className="nav-link">
                Instructor
              </Link>
            </li>
          </ul>
        </div>
        <div className="nav-actions">
          {!user ? (
            <>
              <Link
                to="/login"
                className={`nav-link start-upload ${
                  location.pathname === "" ? "active" : ""
                }`}
              >
                <FontAwesomeIcon icon={faUpload} />
                <div
                  className={`nav-link start-upload ${
                    location.pathname === "" ? "active" : ""
                  }`}
                >
                  Start&nbsp;Upload
                </div>
              </Link>
              <div className="signup-login">
                <Link
                  to="/register"
                  className={`nav-link signup  ${
                    location.pathname === "/register" ? "active" : ""
                  }`}
                >
                  Sign&nbsp;Up
                </Link>
                <Link
                  to="/login"
                  className={`nav-link login  ${
                    location.pathname === "/login" ? "active" : ""
                  }`}
                >
                  Log&nbsp;In
                </Link>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/upload"
                className={`nav-link start-upload ${
                  location.pathname === "/upload" ? "active" : ""
                }`}
              >
                <FontAwesomeIcon icon={faUpload} />
                <div
                  className={`nav-link start-upload ${
                    location.pathname === "/upload" ? "active" : ""
                  }`}
                >
                  Start&nbsp;Upload
                </div>
              </Link>

              <div className="nav-actions pro">
                <Link
                  to="/coin"
                  className={`nav-link coin ${
                    location.pathname === "/coin" ? "active" : ""
                  }`}
                >
                  <i className="bi bi-coin"></i> {user.coin}
                </Link>

                <Link
                  to="/cart"
                  className={`nav-link cart ${
                    location.pathname === "/cart" ? "active" : ""
                  }`}
                >
                  <i className="bi bi-cart3"></i>
                </Link>

                <Link
                  to={`/profile/${user.id}`}
                  className={`nav-link profile ${
                    location.pathname === "/profile" ? "active" : ""
                  }`}
                >
                  Profile
                </Link>
              </div>

              <Link to="/" onClick={handleLogout} className="nav-link logout">
                Logout
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
