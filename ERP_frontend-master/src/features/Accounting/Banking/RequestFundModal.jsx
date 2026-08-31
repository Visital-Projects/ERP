// src/components/RequestFundModal.jsx
import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import branchWalletService from "../../../services/branchwalletService";

const RequestFundModal = ({ show, onClose, branchId, onSuccess }) => {
  const [formData, setFormData] = useState({ amount: "", reason: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (!formData.amount || !formData.reason) {
        toast.error("Please fill all fields");
        return;
      }

      const payload = { ...formData, branch_id: branchId };
      await branchWalletService.requestExtraExpense(payload);

      toast.success("Extra expense request submitted successfully!");
      setFormData({ amount: "", reason: "" });
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Extra expense request failed:", error);
      toast.error(error.message || "Failed to submit request");
    }
  };

  return (
    <Modal show={show} onHide={onClose} backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>Request Extra Expense</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label>Amount <span className="text-danger">*</span></Form.Label>
          <Form.Control
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Reason <span className="text-danger">*</span></Form.Label>
          <Form.Control
            type="text"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="success" onClick={handleSubmit}>Submit</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RequestFundModal;
