import React from "react";
import { Modal, Button } from "react-bootstrap";
import "./ConfirmCheckoutModal.css";

interface ConfirmCheckoutModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  onConfirm: () => void;
}

const ConfirmCheckoutModal: React.FC<ConfirmCheckoutModalProps> = ({
  isOpen,
  onRequestClose,
  onConfirm,
}) => {
  return (
    <Modal
      show={isOpen} // เปลี่ยน isOpen เป็น show
      onHide={onRequestClose} // เปลี่ยน onRequestClose เป็น onHide
      centered // จัดตำแหน่ง Modal ให้อยู่กลางจอ
      dialogClassName="custom-modal" // เพิ่ม class สำหรับการกำหนดสไตล์ของ Modal
      aria-labelledby="contained-modal-title-vcenter"
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Confirm Checkout
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Are you sure you want to proceed with the purchase?</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="success" onClick={onConfirm}>
          Yes
        </Button>
        <Button variant="secondary" onClick={onRequestClose}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmCheckoutModal;
