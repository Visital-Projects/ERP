// import React, { useState, useEffect } from "react";
// import { Modal, Button, Form, Spinner } from "react-bootstrap";
// import { toast } from "react-toastify";
// import purchaseService from "../../../services/purchaseService";

// const RaiseInvoiceModal = ({ show, onHide, woNumber, onSuccess }) => {
//   const [formData, setFormData] = useState({
//     number: "",
//     cgst: 9,
//     sgst: 9,
//     igst: 0,
//     gst_type: "Exclusive",
//   });

//   const [loading, setLoading] = useState(false);

//   // ✅ Set WO number when modal opens
//   useEffect(() => {
//     if (woNumber) {
//       setFormData((prev) => ({
//         ...prev,
//         number: woNumber.startsWith("WO-") ? woNumber : `WO-${woNumber}`,
//       }));
//     }
//   }, [woNumber, show]);

//   // ✅ Handle input changes
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   // ✅ Raise Invoice Logic (fixed)
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!formData.number) {
//       toast.error("Work Order number is missing!");
//       return;
//     }

//     setLoading(true);
//     try {
//       // Prepare payload exactly as per your required request
//       const payload = {
//         number: formData.number,
//         cgst: Number(formData.cgst),
//         sgst: Number(formData.sgst),
//         igst: Number(formData.igst),
//         gst_type:
//           formData.gst_type.charAt(0).toUpperCase() +
//           formData.gst_type.slice(1).toLowerCase(), // Normalize case
//       };

//       const res = await purchaseService.raiseInvoiceFromPO(payload);

//       if (res?.success) {
//         toast.success(res?.message || "Work Order Invoice Raised successfully");
//         onSuccess?.(); // Refresh parent data
//         onHide();
//       } else {
//         toast.error(res?.message || "Failed to raise invoice");
//       }
//     } catch (err) {
//       console.error("Error raising invoice:", err);
//       toast.error("Error raising invoice");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Modal show={show} onHide={onHide} centered>
//       <Modal.Header closeButton>
//         <Modal.Title>Raise Invoice</Modal.Title>
//       </Modal.Header>

//       <Modal.Body>
//         <Form onSubmit={handleSubmit}>
//           {/* WO Number */}
//           <Form.Group className="mb-3">
//             <Form.Label>Work Order Number</Form.Label>
//             <Form.Control
//               type="text"
//               name="number"
//               value={formData.number}
//               readOnly
//             />
//           </Form.Group>

//           {/* CGST */}
//           <Form.Group className="mb-3">
//             <Form.Label>CGST (%)</Form.Label>
//             <Form.Control
//               type="number"
//               name="cgst"
//               value={formData.cgst}
//               onChange={handleChange}
//             />
//           </Form.Group>

//           {/* SGST */}
//           <Form.Group className="mb-3">
//             <Form.Label>SGST (%)</Form.Label>
//             <Form.Control
//               type="number"
//               name="sgst"
//               value={formData.sgst}
//               onChange={handleChange}
//             />
//           </Form.Group>

//           {/* IGST */}
//           <Form.Group className="mb-3">
//             <Form.Label>IGST (%)</Form.Label>
//             <Form.Control
//               type="number"
//               name="igst"
//               value={formData.igst}
//               onChange={handleChange}
//             />
//           </Form.Group>

//           {/* GST Type */}
//           <Form.Group className="mb-3">
//             <Form.Label>GST Type</Form.Label>
//             <Form.Select
//               name="gst_type"
//               value={formData.gst_type}
//               onChange={handleChange}
//             >
//               <option value="Exclusive">Exclusive</option>
//               <option value="Inclusive">Inclusive</option>
//             </Form.Select>
//           </Form.Group>

//           {/* Buttons */}
//           <div className="text-end">
//             <Button variant="secondary" onClick={onHide} className="me-2">
//               Cancel
//             </Button>
//             <Button type="submit" variant="success" disabled={loading}>
//               {loading ? (
//                 <>
//                   <Spinner animation="border" size="sm" /> Raising...
//                 </>
//               ) : (
//                 "Raise Invoice"
//               )}
//             </Button>
//           </div>
//         </Form>
//       </Modal.Body>
//     </Modal>
//   );
// };

// export default RaiseInvoiceModal;

import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import purchaseService from "../../../services/purchaseService";

const RaiseInvoiceModal = ({ show, onHide, woNumber, onSuccess }) => {
  const [formData, setFormData] = useState({
    number: "",
    cgst: 9,
    sgst: 9,
    igst: 0,
    gst_type: "Exclusive",
  });

  const [loading, setLoading] = useState(false);

  // ✅ Set WO number when modal opens
  useEffect(() => {
    if (woNumber) {
      setFormData((prev) => ({
        ...prev,
        number: woNumber ? woNumber : `${woNumber}`,
      }));
    }
  }, [woNumber, show]);

  // ✅ Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Raise Invoice Logic (fixed)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.number) {
      toast.error("Work Order number is missing!");
      return;
    }

    setLoading(true);
    try {
      // Prepare payload exactly as per your required request
      const payload = {
        number: formData.number,
        cgst: Number(formData.cgst),
        sgst: Number(formData.sgst),
        igst: Number(formData.igst),
        gst_type:
          formData.gst_type.charAt(0).toUpperCase() +
          formData.gst_type.slice(1).toLowerCase(), // Normalize case
      };

      const res = await purchaseService.raiseInvoiceFromPO(payload);

      if (res?.success) {
        toast.success(res?.message || "Work Order Invoice Raised successfully");
        onSuccess?.(); // Refresh parent data
        onHide();
      } else {
        toast.error(res?.message || "Failed to raise invoice");
      }
    } catch (err) {
      console.error("Error raising invoice:", err);
    
      // Check if backend returned duplicate invoice message
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Error raising invoice";
    
      if (
        msg ===
        "Invoice already exists for this number. Duplicate not allowed."
      ) {
        toast.error("Invoice already raised!");
      } else {
        toast.error(msg);
      }
    }
    
  };

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>Raise Invoice</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          {/* WO Number */}
          <Form.Group className="mb-3">
            <Form.Label>Work Order Number</Form.Label>
            <Form.Control
              type="text"
              name="number"
              value={formData.number}
              readOnly
            />
          </Form.Group>

          {/* CGST */}
          <Form.Group className="mb-3">
            <Form.Label>CGST (%)</Form.Label>
            <Form.Control
              type="number"
              name="cgst"
              value={formData.cgst}
              onChange={handleChange}
            />
          </Form.Group>

          {/* SGST */}
          <Form.Group className="mb-3">
            <Form.Label>SGST (%)</Form.Label>
            <Form.Control
              type="number"
              name="sgst"
              value={formData.sgst}
              onChange={handleChange}
            />
          </Form.Group>

          {/* IGST */}
          <Form.Group className="mb-3">
            <Form.Label>IGST (%)</Form.Label>
            <Form.Control
              type="number"
              name="igst"
              value={formData.igst}
              onChange={handleChange}
            />
          </Form.Group>

          {/* GST Type */}
          <Form.Group className="mb-3">
            <Form.Label>GST Type</Form.Label>
            <Form.Select
              name="gst_type"
              value={formData.gst_type}
              onChange={handleChange}
            >
              <option value="Exclusive">Exclusive</option>
              <option value="Inclusive">Inclusive</option>
            </Form.Select>
          </Form.Group>

          {/* Buttons */}
          <div className="text-end">
            <Button variant="secondary" onClick={onHide} className="me-2">
              Cancel
            </Button>
            <Button type="submit" variant="success" disabled={loading}>
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" /> Raising...
                </>
              ) : (
                "Raise Invoice"
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default RaiseInvoiceModal;
