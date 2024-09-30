// Auth.tsx
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import Layout from "../../Layout";
import "./Auth.css";

const Auth: React.FC = () => {
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    if (location.pathname === "/register") {
      setIsLogin(false);
    } else {
      setIsLogin(true);
    }
  }, [location.pathname]);
  //
  return (
    <Layout>
      <div className="mt-4 mb-3 header-login">
        <h2 className="text-center text-[#ff8833] ">
          {isLogin ? "LOG IN" : "SIGN UP"}
        </h2>
        <h2 className="text-center text-[#ffffff] ">TO THE</h2>
        <h2 className="display-flex text-center text-[#ff8833] ">
          ART AND COMMUNITY
        </h2>
      </div>

      <div className="auth-body">
        <div className={`auth-container ${!isLogin ? "right-panel-active" : ""}`}>
          <div className="auth-form-container auth-sign-in-container">
            {isLogin ? <Login /> : null}
          </div>
          <div className="auth-form-container auth-sign-up-container">
            {!isLogin ? <Register /> : null}
          </div>
          <div className="auth-overlay-container">
            <div className="auth-overlay">
              <div className="auth-overlay-panel auth-overlay-left">
                <h1>Welcome Back!</h1>
                <p>
                  To keep connected with us please login with your personal info
                </p>
                <button
                  className="auth-button ghost"
                  onClick={() => setIsLogin(true)}
                >
                  Sign In
                </button>
              </div>
              <div className="auth-overlay-panel auth-overlay-right">
                <h1>Hello, Friend!</h1>
                <p>Enter your personal details and start your journey with us</p>
                <button
                  className="auth-button ghost"
                  onClick={() => setIsLogin(false)}
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Auth;
