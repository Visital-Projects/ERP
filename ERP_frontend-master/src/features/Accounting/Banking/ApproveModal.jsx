// src/components/ApproveModal.jsx
import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  OverlayTrigger,
  Tooltip,
  Spinner,
} from "react-bootstrap";
import { toast } from "react-toastify";
import branchWalletService from "../../../services/branchwalletService";
import '../ExpenseCreate.css'

const ApproveModal = ({ show, onClose, request, onSuccess }) => {
  const [transactionId, setTransactionId] = useState("");
  const [isPartial, setIsPartial] = useState(false);
  const [paidAmount, setPaidAmount] = useState("");
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (request) {
      setTransactionId("");
      setIsPartial(false);
      setPaidAmount("");
    }
  }, [request]);

  const handleApprove = async () => {
    if (!transactionId.trim() || (isPartial && !paidAmount.trim())) {
      setErrorMessage("Please fill all required fields");
      return;
    }

    try {
      setErrorMessage("");
      setProcessing(true);

      const amount = Number(request.amount);
      const paid = isPartial ? Number(paidAmount || 0) : amount;
      const remaining = amount - paid;

      const payload = {
        transaction_id: transactionId,
        status: "paid",
        paidAmount: paid,
        remainingAmount: remaining,
      };

      const res = await branchWalletService.processFundRequest(
        request.id,
        payload
      );
      toast.success(res?.message || "Request processed successfully");
      onClose();
      onSuccess?.();
    } catch (error) {
      toast.error(error?.message || "Failed to approve request");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    try {
      setProcessing(true);
      const res = await branchWalletService.processFundRequest(request.id, {
        status: "rejected",
      });
      toast.info(res?.message || "Request rejected");
      onClose();
      onSuccess?.();
    } catch (error) {
      toast.error(error?.message || "Failed to reject request");
    } finally {
      setProcessing(false);
    }
  };

  if (!request) return null;

  return (
    <Modal show={show} onHide={onClose} centered backdrop="static" keyboard={false}>
      {processing && (
        <div
          className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{ background: "rgba(255,255,255,0.6)", zIndex: 1051 }}
        >
          <Spinner animation="border" variant="primary" />
        </div>
      )}
      <Modal.Header closeButton>
        <Modal.Title>Process Fund Request</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {errorMessage && (
          <div
            className="p-2 mb-3 rounded"
            style={{
              backgroundColor: "#ffe6eb",
              color: "#b30000",
              border: "1px solid #ffb3b3",
              textAlign: "center",
            }}
          >
            {errorMessage}
          </div>
        )}
<Form.Group className="mb-3">
  <Form.Label>
    <strong>Payment Type</strong>
  </Form.Label>

  <div className="d-flex gap-4">
    <Form.Check
      inline
      label="Full Payment"
      name="paymentType"
      type="radio"
      id="fullPayment"
      value="full"
      defaultChecked
      onChange={() => setIsPartial(false)}
      className="green-radio"
    />

    <Form.Check
      inline
      label="Partial Payment"
      name="paymentType"
      type="radio"
      id="partialPayment"
      value="partial"
      onChange={() => setIsPartial(true)}
      className="green-radio"
    />
  </div>
</Form.Group>


        <p>
          <strong>Branch:</strong> {request.Branch?.name}
        </p>
        <p>
          <strong>Amount:</strong> ₹{Number(request.amount).toLocaleString()}
        </p>
        <p>
          <strong>Reason:</strong> {request.reason}
        </p>

        {isPartial && (
          <Form.Group className="mt-3">
            <Form.Label>
              Paid Amount <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter paid amount"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              disabled={processing}
            />
          </Form.Group>
        )}

        <Form.Group className="mt-3">
          <Form.Label>
            Transaction ID / UPI <span className="text-danger">*</span>
          </Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter transaction ID"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            disabled={processing}
          />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip id="tooltip-cancel">Cancel</Tooltip>}
        >
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </OverlayTrigger>

        <OverlayTrigger
          placement="top"
          overlay={<Tooltip id="tooltip-reject">Reject Fund Request</Tooltip>}
        >
          <Button variant="danger" onClick={handleReject} disabled={processing}>
            {processing ? "Rejecting..." : "Reject"}
          </Button>
        </OverlayTrigger>

        <OverlayTrigger
          placement="top"
          overlay={<Tooltip id="tooltip-approve">Approve Fund Request</Tooltip>}
        >
          <Button
            variant="success"
            onClick={handleApprove}
            disabled={processing}
          >
            {processing ? "Approving..." : "Approve"}
          </Button>
        </OverlayTrigger>
      </Modal.Footer>
    </Modal>
  );
};

export default ApproveModal;
