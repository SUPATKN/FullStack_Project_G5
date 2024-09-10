import React from "react";
import { Link } from "react-router-dom";
import { Navbar, Nav, Container } from "react-bootstrap";
import Logo from "./LogoPreflight.png";
import "./global.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import axios from "axios";
import useAuth from "./hook/useAuth";

const NavBar: React.FC = () => {
  const { user, refetch } = useAuth();

  const handleLogout = async () => {
    try {
      await axios.get("/api/logout"); // ส่ง request ไปที่ backend เพื่อ logout
      refetch();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };
  return (
    <Navbar
      bg="grey"
      expand="lg"
      style={{ backgroundColor: "#37517e" }}
      data-cy="navbar"
    >
      <Container>
        <Navbar.Brand as={Link} to="/">
          <img src={Logo} alt="My Photo App Logo" style={{ height: "40px" }} />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link
              as={Link}
              to="/"
              className="text-light"
              data-cy="gallery-link"
            >
              Gallery
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/creator"
              className="text-light"
              data-cy="creator-link"
            >
              Creator
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/instructor"
              className="text-light"
              data-cy="instructor-link"
            >
              Instructor
            </Nav.Link>
          </Nav>
          <Nav className="ms-auto">
            {!user ? (
              <>
                <Nav.Link
                  as={Link}
                  to="/login"
                  className="text-light mt-2"
                  data-cy="login-link"
                >
                  Login
                </Nav.Link>
                <div className="d-flex flex-column flex-lg-row">
                  <Nav.Link
                    as={Link}
                    to="/register"
                    className="text-light"
                    data-cy="register-link"
                    style={{
                      fontSize: "15px",
                      backgroundColor: "#37517e",
                      borderRadius: "25px",
                      color: "#ffffff",
                      boxShadow:
                        "0 6px 12px 0 rgba(0,0,0,0.2), 0 6px 15px 0 rgba(0,0,0,0.19)",
                      padding: "5px 10px",
                      margin: "10px 0 5px 5px",
                      width: "max-content",
                      textAlign: "center",
                    }}
                  >
                    Register
                  </Nav.Link>
                  <Nav.Item>
                    <Nav.Link
                      as={Link}
                      to="/login"
                      style={{
                        fontSize: "15px",
                        backgroundColor: "#ffffff",
                        borderRadius: "25px",
                        color: "#37517e",
                        boxShadow:
                          "0 6px 12px 0 rgba(0,0,0,0.2), 0 6px 15px 0 rgba(0,0,0,0.19)",
                        padding: "5px 10px",
                        margin: "10px 0 5px 5px",
                        width: "max-content",
                        textAlign: "center",
                      }}
                      data-cy="start-upload-button"
                    >
                      Start Upload
                    </Nav.Link>
                  </Nav.Item>
                </div>
              </>
            ) : (
              <Nav.Item className="navlink d-flex">
                <Nav.Item>
                  <Nav.Link
                    as={Link}
                    to="/coin"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      color: "#ffffff",
                      textDecoration: "none",
                      textAlign: "center",
                      padding: "5px 10px",
                      margin: "10px 0 5px 5px",
                      width: "max-content",
                    }}
                    data-cy="coin"
                  >
                    <i
                      className="bi bi-coin"
                      style={{ marginRight: "5px", color: "#ffffff" }}
                    ></i>{" "}
                    {user.coin}
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    as={Link}
                    to="/cart"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      color: "#ffffff",
                      textDecoration: "none",
                      textAlign: "center",
                      padding: "5px 10px",
                      margin: "10px 0 5px 5px",
                      width: "max-content",
                    }}
                    data-cy="cart"
                  >
                    <i
                      className="bi bi-cart4"
                      style={{ marginRight: "5px", color: "#ffffff" }}
                    ></i>
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    as={Link}
                    to="/upload"
                    style={{
                      fontSize: "15px",
                      backgroundColor: "#ffffff",
                      borderRadius: "25px",
                      color: "#37517e",
                      boxShadow:
                        "0 6px 12px 0 rgba(0,0,0,0.2), 0 6px 15px 0 rgba(0,0,0,0.19)",
                      padding: "5px 10px",
                      margin: "10px 0 5px 5px",
                      width: "max-content",
                      textAlign: "center",
                    }}
                    data-cy="start-upload-button"
                  >
                    Start Upload
                  </Nav.Link>
                </Nav.Item>
                <Nav.Link
                  as={Link}
                  to={`/profile/${user?.id}`}
                  style={{
                    fontSize: "15px",
                    backgroundColor: "#ffffff",
                    borderRadius: "25px",
                    color: "#37517e",
                    boxShadow:
                      "0 6px 12px 0 rgba(0,0,0,0.2), 0 6px 15px 0 rgba(0,0,0,0.19)",
                    padding: "5px 10px",
                    margin: "10px 0 5px 5px",
                    width: "max-content",
                    textAlign: "center",
                  }}
                  data-cy="me"
                >
                  Profile
                </Nav.Link>
                <Nav.Link
                  as={Link}
                  to="/"
                  onClick={handleLogout}
                  style={{
                    fontSize: "15px",
                    backgroundColor: "#ff0000",
                    borderRadius: "25px",
                    color: "#ffffff",
                    boxShadow:
                      "0 6px 12px 0 rgba(0,0,0,0.2), 0 6px 15px 0 rgba(0,0,0,0.19)",
                    padding: "5px 10px",
                    margin: "10px 0 5px 5px",
                    width: "max-content",
                    textAlign: "center",
                  }}
                  data-cy="logout-link"
                >
                  Logout
                </Nav.Link>
              </Nav.Item>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
