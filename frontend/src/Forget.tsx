import React from "react";
import { Container, Form, Button, InputGroup } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import Layout from "./Layout";
import "./global.css";

const ForgotPassword = () => {
  return (
    <Layout>
      <Container className="d-flex justify-content-center align-items-center min-vh-10">
        <div className="forgot-password-container p-4 shadow-lg">
          <h2 className="text-center mb-4">Forgot Password</h2>
          <Form>
            <Form.Group controlId="formBasicEmail" className="mb-3">
              <Form.Label>Email address</Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <FontAwesomeIcon icon={faEnvelope} />
                </InputGroup.Text>
                <Form.Control type="email" placeholder="Enter email" required />
              </InputGroup>
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">
              Send Reset Link
            </Button>
          </Form>
        </div>
      </Container>
    </Layout>
  );
};

export default ForgotPassword;
