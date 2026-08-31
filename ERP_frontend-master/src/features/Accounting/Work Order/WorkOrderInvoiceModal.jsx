// import React, { useEffect } from "react";
// import { Modal, Form, Button, OverlayTrigger, Tooltip } from "react-bootstrap";

// const InvoiceModal = ({
//   show,
//   onHide,
//   invoiceData,
//   handleInvoiceChange,
//   handleSaveInvoice,
//   creatingInvoice,
//   isEditingInvoice,
//   workOrder,
// }) => {

//   // ✅ Default GST type to "exclusive" only when creating
//   useEffect(() => {
//     if (!isEditingInvoice && !invoiceData.gst_type) {
//       handleInvoiceChange({
//         target: { name: "gst_type", value: "exclusive" },
//       });
//     }
//   }, [isEditingInvoice, invoiceData.gst_type]);

//   const paymentAmount = parseFloat(invoiceData.payment_amount) || 0;
//   const cgst = parseFloat(invoiceData.cgst) || 0;
//   const sgst = parseFloat(invoiceData.sgst) || 0;
//   const igst = parseFloat(invoiceData.igst) || 0;
//   const gstType = invoiceData.gst_type || "exclusive";

//   let baseAmount = 0, totalTax = 0, totalAmount = 0;

//   if (gstType === "exclusive") {
//     baseAmount = paymentAmount; 
//     totalTax = (baseAmount * (cgst + sgst + igst)) / 100;
//     totalAmount = baseAmount + totalTax;
//   } else {
//     totalAmount = paymentAmount; 
//     baseAmount = totalAmount / (1 + (cgst + sgst + igst) / 100);
//     totalTax = totalAmount - baseAmount;
//   }
//   return (
//     <Modal show={show} onHide={onHide} size="lg">
//       <Modal.Header closeButton>
//         <Modal.Title>
//           {isEditingInvoice
//             ? `Edit Invoice for ${workOrder?.wo_number}`
//             : `Create Invoice for ${workOrder?.wo_number}`}
//         </Modal.Title>
//       </Modal.Header>

//       <Modal.Body>
//         <Form>
//           <Form.Group className="mb-3">
//             <Form.Label>Payment Amount</Form.Label>
//             <Form.Control
//               type="number"
//               name="payment_amount"
//               value={invoiceData.payment_amount}
//               onChange={handleInvoiceChange}
//             />
//           </Form.Group>

//           <Form.Group className="mb-3">
//             <Form.Label>CGST (%)</Form.Label>
//             <Form.Control
//               type="number"
//               name="cgst"
//               value={invoiceData.cgst}
//               onChange={handleInvoiceChange}
//             />
//           </Form.Group>

//           <Form.Group className="mb-3">
//             <Form.Label>SGST (%)</Form.Label>
//             <Form.Control
//               type="number"
//               name="sgst"
//               value={invoiceData.sgst}
//               onChange={handleInvoiceChange}
//             />
//           </Form.Group>

//           <Form.Group className="mb-3">
//             <Form.Label>IGST (%)</Form.Label>
//             <Form.Control
//               type="number"
//               name="igst"
//               value={invoiceData.igst}
//               onChange={handleInvoiceChange}
//             />
//           </Form.Group>

//           <Form.Group className="mb-3">
//             <Form.Label>GST Type</Form.Label>
//             <Form.Select
//               name="gst_type"
//               value={invoiceData.gst_type || "exclusive"}
//               onChange={handleInvoiceChange}
//             >
//               <option value="exclusive">Exclusive</option>
//               <option value="inclusive">Inclusive</option>
//             </Form.Select>
//           </Form.Group>

//           <hr />

// <div className="d-flex flex-column align-items-end justify-content-end">
//   <p className="mb-2"><strong>Amount:</strong> ₹{baseAmount.toFixed(2)}</p>
//   <p className="mb-2"><strong>Total Tax:</strong> ₹{totalTax.toFixed(2)}</p>
//   <p className="mb-2"><strong>Total Amount:</strong> ₹{totalAmount.toFixed(2)}</p>
//   {/* <p className="mb-2"><strong>Remaining Amount:</strong> ₹{remainingAmount.toFixed(2)}</p> */}
// </div>
//         </Form>
//       </Modal.Body>

//       <Modal.Footer>
//         <OverlayTrigger overlay={<Tooltip>Cancel invoice creation</Tooltip>}>
//           <Button variant="secondary" onClick={onHide}>
//             Cancel
//           </Button>
//         </OverlayTrigger>

//         <OverlayTrigger
//           overlay={
//             <Tooltip>
//               {isEditingInvoice
//                 ? "Update existing invoice"
//                 : "Create a new invoice"}
//             </Tooltip>
//           }
//         >
//           <Button
//             variant="success"
//             onClick={handleSaveInvoice}
//             disabled={creatingInvoice}
//           >
//             {creatingInvoice
//               ? isEditingInvoice
//                 ? "Updating..."
//                 : "Creating..."
//               : isEditingInvoice
//               ? "Update Invoice"
//               : "Create Invoice"}
//           </Button>
//         </OverlayTrigger>
//       </Modal.Footer>
//     </Modal>
//   );
// };

// export default InvoiceModal;







import React, { useEffect, useState } from "react";
import { Modal, Form, Button, OverlayTrigger, Tooltip, Row, Col } from "react-bootstrap";

const InvoiceModal = ({
  show,
  onHide,
  invoiceData,
  handleInvoiceChange,
  handleSaveInvoice,
  creatingInvoice,
  isEditingInvoice,
  workOrder,
}) => {
  const [errors, setErrors] = useState({});

  // ✅ Default GST type to "exclusive" only when creating
  useEffect(() => {
    if (!isEditingInvoice && !invoiceData.gst_type) {
      handleInvoiceChange({
        target: { name: "gst_type", value: "exclusive" },
      });
    }
  }, [isEditingInvoice, invoiceData.gst_type]);

  const paymentAmount = parseFloat(invoiceData.payment_amount) || 0;
  const cgst = parseFloat(invoiceData.cgst) || 0;
  const sgst = parseFloat(invoiceData.sgst) || 0;
  const igst = parseFloat(invoiceData.igst) || 0;
  const gstType = invoiceData.gst_type || "exclusive";

  let baseAmount = 0,
    totalTax = 0,
    totalAmount = 0;

  if (gstType === "exclusive") {
    baseAmount = paymentAmount;
    totalTax = (baseAmount * (cgst + sgst + igst)) / 100;
    totalAmount = baseAmount + totalTax;
  } else {
    totalAmount = paymentAmount;
    baseAmount = totalAmount / (1 + (cgst + sgst + igst) / 100);
    totalTax = totalAmount - baseAmount;
  }

  // ✅ Validate required fields before save
  const handleValidateAndSave = () => {
    const newErrors = {};
    if (!invoiceData.payment_amount) newErrors.payment_amount = "Payment amount is required";
    if (!invoiceData.gst_type) newErrors.gst_type = "GST type is required";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      handleSaveInvoice();
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>
          {isEditingInvoice
            ? `Edit Invoice for ${workOrder?.wo_number}`
            : `Create Invoice for ${workOrder?.wo_number}`}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Payment Amount <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="number"
                  name="payment_amount"
                  value={invoiceData.payment_amount}
                  onChange={handleInvoiceChange}
                  isInvalid={!!errors.payment_amount}
                  style={errors.payment_amount ? { borderColor: "red" } : {}}
                />
                {errors.payment_amount && (
                  <div className="text-danger small mt-1">{errors.payment_amount}</div>
                )}
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  GST Type <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  name="gst_type"
                  value={invoiceData.gst_type || "exclusive"}
                  onChange={handleInvoiceChange}
                  isInvalid={!!errors.gst_type}
                  style={errors.gst_type ? { borderColor: "red" } : {}}
                >
                  <option value="">Select GST Type</option>
                  <option value="exclusive">Exclusive</option>
                  <option value="inclusive">Inclusive</option>
                </Form.Select>
                {errors.gst_type && (
                  <div className="text-danger small mt-1">{errors.gst_type}</div>
                )}
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>CGST (%)</Form.Label>
                <Form.Control
                  type="number"
                  name="cgst"
                  value={invoiceData.cgst}
                  onChange={handleInvoiceChange}
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>SGST (%)</Form.Label>
                <Form.Control
                  type="number"
                  name="sgst"
                  value={invoiceData.sgst}
                  onChange={handleInvoiceChange}
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>IGST (%)</Form.Label>
                <Form.Control
                  type="number"
                  name="igst"
                  value={invoiceData.igst}
                  onChange={handleInvoiceChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <hr />

          <div className="d-flex flex-column align-items-end justify-content-end">
            <p className="mb-2">
              <strong>Amount:</strong> ₹{baseAmount.toFixed(2)}
            </p>
            <p className="mb-2">
              <strong>Total Tax:</strong> ₹{totalTax.toFixed(2)}
            </p>
            <p className="mb-2">
              <strong>Total Amount:</strong> ₹{totalAmount.toFixed(2)}
            </p>
          </div>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <OverlayTrigger overlay={<Tooltip>Cancel invoice creation</Tooltip>}>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
        </OverlayTrigger>

        <OverlayTrigger
          overlay={
            <Tooltip>
              {isEditingInvoice
                ? "Update existing invoice"
                : "Create a new invoice"}
            </Tooltip>
          }
        >
          <Button
            variant="success"
            onClick={handleValidateAndSave}
            disabled={creatingInvoice}
          >
            {creatingInvoice
              ? isEditingInvoice
                ? "Updating..."
                : "Creating..."
              : isEditingInvoice
              ? "Update Invoice"
              : "Create Invoice"}
          </Button>
        </OverlayTrigger>
      </Modal.Footer>
    </Modal>
  );
};

export default InvoiceModal;
