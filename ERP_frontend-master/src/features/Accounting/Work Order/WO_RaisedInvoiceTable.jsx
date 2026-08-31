// // import React, { useEffect, useState } from "react";
// // import {
// //   Card,
// //   Table,
// //   Button,
// //   Spinner,
// //   OverlayTrigger,
// //   Tooltip,
// //   Modal,
// // } from "react-bootstrap";
// // import { toast } from "react-toastify";
// // import purchaseService from "../../../services/purchaseService";
// // import ConfirmDeleteModal from "../../../components/ConfirmDeleteModal";
// // import InvoiceViewFullScreen from "./WO_RaisedInvoiceViewModal";

// // const RaiseInvoiceTable = ({ woNumber, branchName, branchAddress, branchContact, refreshTrigger, }) => {
// //   const [invoices, setInvoices] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [selectedInvoice, setSelectedInvoice] = useState(null);
// //   const [showViewModal, setShowViewModal] = useState(false);

// //   // 🔹 Fetch invoices
// //   const fetchInvoices = async () => {
// //     setLoading(true);
// //     try {
// //       const res = await purchaseService.getAllInvoices();
// //       if (res?.success && Array.isArray(res.data)) {
// //         const filtered = res.data.filter((i) => i.number === woNumber);
// //         setInvoices(filtered);
// //       } else {
// //         setInvoices([]);
// //         toast.error("Failed to fetch invoices");
// //       }
// //     } catch (err) {
// //       console.error(err);
// //       toast.error("Error fetching invoices");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     if (woNumber) fetchInvoices();
// //   }, [woNumber]);
// //   useEffect(() => {
// //     if (woNumber) fetchInvoices();
// //   }, [woNumber, refreshTrigger]);
// //   // 🔹 Delete invoice
// //   const handleDelete = (id) => {
// //     ConfirmDeleteModal({
// //       title: "Delete Invoice",
// //       message: `Are you sure you want to delete invoice #${id}?`,
// //       iconColor: "#dc3545",
// //       onConfirm: async () => {
// //         try {
// //           const res = await purchaseService.deleteInvoice(id);
// //           if (res?.success) {
// //             toast.success(`Invoice #${id} deleted successfully`);
// //             fetchInvoices();
// //           } else toast.error("Failed to delete invoice");
// //         } catch (err) {
// //           console.error(err);
// //           toast.error("Error deleting invoice");
// //         }
// //       },
// //     });
// //   };

// //   // 🔹 View invoice details
// //   const handleView = async (id) => {
// //     try {
// //       const res = await purchaseService.getInvoiceById(id);
// //       setSelectedInvoice(res?.data || res);
// //       setShowViewModal(true);
// //     } catch (error) {
// //       toast.error("Failed to load invoice details");
// //     }
// //   };

// //   // 🔹 Update invoice status (Pending ↔ Paid)
// //   const handleStatusUpdate = (invoice) => {
// //     ConfirmDeleteModal({
// //       title: "Update Invoice Status",
// //       message: `Change status of invoice #${invoice.id}?`,
// //       iconColor: "#0dcaf0",
// //       onConfirm: async () => {
// //         try {
// //           const newStatus = invoice.status === "Pending" ? "Paid" : "Pending";
// //           await purchaseService.updateInvoice(invoice.id, { status: newStatus });
// //           toast.success(`Invoice status updated to ${newStatus}`);
// //           fetchInvoices();
// //         } catch (error) {
// //           console.error(error);
// //           toast.error("Failed to update invoice status");
// //         }
// //       },
// //     });
// //   };

// //   if (loading)
// //     return (
// //       <div className="text-center py-4">
// //         <Spinner animation="border" variant="primary" />
// //         <p className="text-muted mt-2 mb-0">Loading raised invoices...</p>
// //       </div>
// //     );

// //   if (invoices.length === 0)
// //     return (
// //       <div className="text-center py-4 text-muted fst-italic">
// //         No invoices raised yet for <b>{woNumber}</b>
// //       </div>
// //     );

// //   return (
// //     <>
// //       <Card className="p-4 shadow-sm border-0 rounded-4 mt-4">
// //         <div className="d-flex align-items-center mb-4">
// //           <div className="bg-primary bg-opacity-10 rounded-3 p-2 me-3">
// //             <div
// //               className="bg-primary rounded-2"
// //               style={{ width: "20px", height: "20px" }}
// //             ></div>
// //           </div>
// //           <h6 className="fw-bold text-primary mb-0">Raised Invoices</h6>
// //         </div>

// //         <div className="table-responsive rounded-3">
// //           <Table hover className="mb-0 text-center align-middle">
// //             <thead className="bg-light">
// //               <tr>
// //                 <th className="ps-4 py-3 fw-semibold text-muted border-0">#</th>
// //                 <th className="py-3 fw-semibold text-muted border-0">
// //                   Invoice ID
// //                 </th>
// //                 <th className="py-3 fw-semibold text-muted border-0">
// //                   Base Amount
// //                 </th>
// //                 <th className="py-3 fw-semibold text-muted border-0">
// //                   GST Amount
// //                 </th>
// //                 <th className="py-3 fw-semibold text-muted border-0">
// //                   Total Amount
// //                 </th>
// //                 <th className="py-3 fw-semibold text-muted border-0">GST Type</th>
// //                 <th className="py-3 fw-semibold text-muted border-0">Status</th>
// //                 <th className="pe-4 py-3 fw-semibold text-muted border-0 text-center">
// //                   Actions
// //                 </th>
// //               </tr>
// //             </thead>
// //             <tbody>
// //               {invoices.map((inv, idx) => (
// //                 <tr key={inv.id} className="border-top">
// //                   <td className="ps-4 py-3">{idx + 1}</td>
// //                   <td className="py-3">
// //                     <Button variant="outline-success" size="sm">
// //                       #{inv.id}
// //                     </Button>
// //                   </td>
// //                   <td className="py-3 fw-bold text-dark">
// //                     ₹
// //                     {Number(inv.base_amount).toLocaleString("en-IN", {
// //                       minimumFractionDigits: 2,
// //                       maximumFractionDigits: 2,
// //                     })}
// //                   </td>
// //                   <td className="py-3 fw-bold text-dark">
// //                     ₹
// //                     {Number(inv.gst_amount).toLocaleString("en-IN", {
// //                       minimumFractionDigits: 2,
// //                       maximumFractionDigits: 2,
// //                     })}
// //                   </td>
// //                   <td className="py-3 fw-bold text-dark">
// //                     ₹
// //                     {Number(inv.total_amount).toLocaleString("en-IN", {
// //                       minimumFractionDigits: 2,
// //                       maximumFractionDigits: 2,
// //                     })}
// //                   </td>
// //                   <td className="py-3 fw-bold text-dark">{inv.gst_type}</td>
// //                   <td className="py-3">
// //                     <span
// //                       className={`badge px-3 py-2 border-0 fw-bold ${
// //                         inv.status?.toLowerCase() === "paid"
// //                           ? "bg-success bg-opacity-10 text-success"
// //                           : "bg-warning bg-opacity-10 text-warning"
// //                       }`}
// //                     >
// //                       {inv.status}
// //                     </span>
// //                   </td>
// //                   <td className="pe-4 py-3">
// //                     <div className="d-flex justify-content-center gap-2">
// //                       {/* View */}
// //                       <OverlayTrigger overlay={<Tooltip>View</Tooltip>}>
// //                         <Button
// //                           size="sm"
// //                           variant="warning"
// //                           className="border-1 text-white"
// //                           onClick={() => handleView(inv.id)}
// //                         >
// //                           <i className="bi bi-eye"></i>
// //                         </Button>
// //                       </OverlayTrigger>

// //                       {/* Update Status */}
// //                       <OverlayTrigger
// //                         overlay={
// //                           <Tooltip>
// //                             {inv.status === "Paid"
// //                               ? "Mark as Pending"
// //                               : "Mark as Paid"}
// //                           </Tooltip>
// //                         }
// //                       >
// //                         <Button
// //                           size="sm"
// //                           variant={
// //                             inv.status === "Paid" ? "success" : "warning"
// //                           }
// //                           className="border-1"
// //                           onClick={() => handleStatusUpdate(inv)}
// //                         >
// //                           {inv.status === "Pending" ? (
// //                             <i className="bi bi-hourglass-top"></i>
// //                           ) : (
// //                             <i className="bi bi-hourglass-bottom"></i>
// //                           )}
// //                         </Button>
// //                       </OverlayTrigger>

// //                       {/* Delete */}
// //                       <OverlayTrigger overlay={<Tooltip>Delete</Tooltip>}>
// //                         <Button
// //                           size="sm"
// //                           variant="danger"
// //                           className="border-1"
// //                           onClick={() => handleDelete(inv.id)}
// //                         >
// //                           <i className="bi bi-trash"></i>
// //                         </Button>
// //                       </OverlayTrigger>
// //                     </div>
// //                   </td>
// //                 </tr>
// //               ))}
// //             </tbody>
// //           </Table>
// //         </div>
// //       </Card>
// //       <InvoiceViewFullScreen
// //         show={showViewModal}
// //         onHide={() => setShowViewModal(false)}
// //         invoice={selectedInvoice}
// //         branchName={branchName}
// //         branchAddress={branchAddress}
// //         branchContact={branchContact}
// //       />
// //     </>
// //   );
// // };

// // export default RaiseInvoiceTable;

// import React, { useEffect, useState } from "react";
// import {
//   Card,
//   Table,
//   Button,
//   Spinner,
//   OverlayTrigger,
//   Tooltip,
//   Modal,
// } from "react-bootstrap";
// import { toast } from "react-toastify";
// import purchaseService from "../../../services/purchaseService";
// import ConfirmDeleteModal from "../../../components/ConfirmDeleteModal";
// import InvoiceViewFullScreen from "./WO_RaisedInvoiceViewModal";

// const RaiseInvoiceTable = ({
//   woNumber,
//   branchName,
//   branchAddress,
//   branchContact,
//   refreshTrigger,
// }) => {
//   const [invoices, setInvoices] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedInvoice, setSelectedInvoice] = useState(null);
//   const [showViewModal, setShowViewModal] = useState(false);

//   // 🔹 Fetch invoices
//   const fetchInvoices = async () => {
//     setLoading(true);
//     try {
//       const res = await purchaseService.getAllInvoices();
//       if (res?.success && Array.isArray(res.data)) {
//         const filtered = res.data.filter((i) => i.number === woNumber);
//         setInvoices(filtered);
//       } else {
//         setInvoices([]);
//         toast.error("Failed to fetch invoices");
//       }
//     } catch (err) {
//       console.error(err);
//       toast.error("Error fetching invoices");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (woNumber) fetchInvoices();
//   }, [woNumber]);
//   useEffect(() => {
//     if (woNumber) fetchInvoices();
//   }, [woNumber, refreshTrigger]);
//   // 🔹 Delete invoice
//   const handleDelete = (id) => {
//     ConfirmDeleteModal({
//       title: "Delete Invoice",
//       message: `Are you sure you want to delete invoice?`,
//       iconColor: "#dc3545",
//       onConfirm: async () => {
//         try {
//           const res = await purchaseService.deleteInvoice(id);
//           if (res?.success) {
//             toast.success(`Invoice deleted successfully`);
//             fetchInvoices();
//           } else toast.error("Failed to delete invoice");
//         } catch (err) {
//           console.error(err);
//           toast.error("Error deleting invoice");
//         }
//       },
//     });
//   };

//   // 🔹 View invoice details
//   const handleView = async (id) => {
//     try {
//       const res = await purchaseService.getInvoiceById(id);
//       setSelectedInvoice(res?.data || res);
//       setShowViewModal(true);
//     } catch (error) {
//       toast.error("Failed to load invoice details");
//     }
//   };

//   // 🔹 Update invoice status (Pending ↔ Paid)
//   const handleStatusUpdate = (invoice) => {
//     ConfirmDeleteModal({
//       title: "Update Invoice Status",
//       message: `Change status of invoice?`,
//       iconColor: "#0dcaf0",
//       onConfirm: async () => {
//         try {
//           const newStatus = invoice.status === "Pending" ? "Paid" : "Pending";
//           await purchaseService.updateInvoice(invoice.id, {
//             status: newStatus,
//           });
//           toast.success(`Invoice status updated to ${newStatus}`);
//           fetchInvoices();
//         } catch (error) {
//           console.error(error);
//           toast.error("Failed to update invoice status");
//         }
//       },
//     });
//   };

//   if (loading)
//     return (
//       <div className="text-center py-4">
//         <Spinner animation="border" variant="primary" />
//         <p className="text-muted mt-2 mb-0">Loading raised invoices...</p>
//       </div>
//     );

//   if (invoices.length === 0)
//     return (
//       <div className="text-center py-4 text-muted fst-italic">
//         No invoices raised yet for <b>{woNumber}</b>
//       </div>
//     );

//   return (
//     <>
//       <Card className="p-4 shadow-sm border-0 rounded-4 mt-4">
//         <div className="d-flex align-items-center mb-4">
//           <div className="bg-primary bg-opacity-10 rounded-3 p-2 me-3">
//             <div
//               className="bg-primary rounded-2"
//               style={{ width: "20px", height: "20px" }}
//             ></div>
//           </div>
//           <h6 className="fw-bold text-primary mb-0">Raised Invoices</h6>
//         </div>

//         <div className="table-responsive rounded-3">
//           <Table hover className="mb-0 text-center align-middle">
//             <thead className="bg-light">
//               <tr>
//                 <th className="ps-4 py-3 fw-semibold text-muted border-0">#</th>
//                 <th className="py-3 fw-semibold text-muted border-0">
//                   Invoice ID
//                 </th>
//                 <th className="py-3 fw-semibold text-muted border-0">
//                   Base Amount
//                 </th>
//                 <th className="py-3 fw-semibold text-muted border-0">
//                   GST Amount
//                 </th>
//                 <th className="py-3 fw-semibold text-muted border-0">
//                   Total Amount
//                 </th>
//                 <th className="py-3 fw-semibold text-muted border-0">
//                   GST Type
//                 </th>
//                 {/* <th className="py-3 fw-semibold text-muted border-0">Status</th> */}
//                 <th className="pe-4 py-3 fw-semibold text-muted border-0 text-center">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody>
//               {invoices.map((inv, idx) => (
//                 <tr key={inv.id} className="border-top">
//                   <td className="ps-4 py-3">{idx + 1}</td>
//                   <td className="py-3">
//                     <Button variant="outline-success" size="sm">
//                       #{inv.id}
//                     </Button>
//                   </td>
//                   <td className="py-3 fw-bold text-dark">
//                     ₹
//                     {Number(inv.base_amount).toLocaleString("en-IN", {
//                       minimumFractionDigits: 2,
//                       maximumFractionDigits: 2,
//                     })}
//                   </td>
//                   <td className="py-3 fw-bold text-dark">
//                     ₹
//                     {Number(inv.gst_amount).toLocaleString("en-IN", {
//                       minimumFractionDigits: 2,
//                       maximumFractionDigits: 2,
//                     })}
//                   </td>
//                   <td className="py-3 fw-bold text-dark">
//                     ₹
//                     {Number(inv.total_amount).toLocaleString("en-IN", {
//                       minimumFractionDigits: 2,
//                       maximumFractionDigits: 2,
//                     })}
//                   </td>
//                   <td className="py-3 fw-bold text-dark">{inv.gst_type}</td>
//                   {/* <td className="py-3">
//                     <span
//                       className={`badge px-3 py-2 border-0 fw-bold ${
//                         inv.status?.toLowerCase() === "paid"
//                           ? "bg-success bg-opacity-10 text-success"
//                           : "bg-warning bg-opacity-10 text-warning"
//                       }`}
//                     >
//                       {inv.status}
//                     </span>
//                   </td> */}
//                   <td className="pe-4 py-3">
//                     <div className="d-flex justify-content-center gap-2">
//                       {/* View */}
//                       <OverlayTrigger overlay={<Tooltip>View</Tooltip>}>
//                         <Button
//                           size="sm"
//                           variant="warning"
//                           className="border-1 text-white"
//                           onClick={() => handleView(inv.id)}
//                         >
//                           <i className="bi bi-eye"></i>
//                         </Button>
//                       </OverlayTrigger>

//                       {/* Update Status */}
//                       {/* <OverlayTrigger
//                         overlay={
//                           <Tooltip>
//                             {inv.status === "Paid"
//                               ? "Mark as Pending"
//                               : "Mark as Paid"}
//                           </Tooltip>
//                         }
//                       >
//                         <Button
//                           size="sm"
//                           variant={
//                             inv.status === "Paid" ? "success" : "warning"
//                           }
//                           className="border-1"
//                           onClick={() => handleStatusUpdate(inv)}
//                         >
//                           {inv.status === "Pending" ? (
//                             <i className="bi bi-hourglass-top"></i>
//                           ) : (
//                             <i className="bi bi-hourglass-bottom"></i>
//                           )}
//                         </Button>
//                       </OverlayTrigger> */}

//                       {/* Delete */}
//                       <OverlayTrigger overlay={<Tooltip>Delete</Tooltip>}>
//                         <Button
//                           size="sm"
//                           variant="danger"
//                           className="border-1"
//                           onClick={() => handleDelete(inv.id)}
//                         >
//                           <i className="bi bi-trash"></i>
//                         </Button>
//                       </OverlayTrigger>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </Table>
//         </div>
//       </Card>
//       <InvoiceViewFullScreen
//         show={showViewModal}
//         onHide={() => setShowViewModal(false)}
//         invoice={selectedInvoice}
//         branchName={branchName}
//         branchAddress={branchAddress}
//         branchContact={branchContact}
//       />
//     </>
//   );
// };

// export default RaiseInvoiceTable;





import React, { useEffect, useState } from "react";
import {
  Card,
  Table,
  Button,
  Spinner,
  OverlayTrigger,
  Tooltip,
  Modal,
} from "react-bootstrap";
import { toast } from "react-toastify";
import purchaseService from "../../../services/purchaseService";
import ConfirmDeleteModal from "../../../components/ConfirmDeleteModal";
import InvoiceViewFullScreen from "./WO_RaisedInvoiceViewModal";

const RaiseInvoiceTable = ({
  woNumber,
  branchName,
  branchAddress,
  branchContact,
  refreshTrigger,
}) => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  // 🔹 Fetch invoices
  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await purchaseService.getAllInvoices();
      if (res?.success && Array.isArray(res.data)) {
        const filtered = res.data.filter((i) => i.number === woNumber);
        setInvoices(filtered);
      } else {
        setInvoices([]);
        toast.error("Failed to fetch invoices");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error fetching invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (woNumber) fetchInvoices();
  }, [woNumber, refreshTrigger]);

  // 🔹 Delete invoice
  const handleDelete = (id) => {
    ConfirmDeleteModal({
      title: "Delete Invoice",
      message: `Are you sure you want to delete invoice?`,
      iconColor: "#dc3545",
      onConfirm: async () => {
        try {
          const res = await purchaseService.deleteInvoice(id);
          if (res?.success) {
            toast.success(`Invoice deleted successfully`);
            fetchInvoices();
          } else toast.error("Failed to delete invoice");
        } catch (err) {
          console.error(err);
          toast.error("Error deleting invoice");
        }
      },
    });
  };

const handleView = async (id) => {
  try {
    // 1️⃣ Get single invoice
    const res = await purchaseService.getInvoiceById(id);
    const invoiceById = res?.data || res;

    // 2️⃣ Get all invoices (already has payment summary)
    const allRes = await purchaseService.getAllInvoices();
    const allInvoices = allRes?.data || [];

    // 3️⃣ Match by invoice NUMBER
    const matchedInvoice = allInvoices.find(
      (inv) => inv.number === invoiceById.number
    );

    // 4️⃣ Merge payment + excess summary
    const mergedInvoice = {
      ...invoiceById,
      payment_summary: matchedInvoice?.payment_summary || null,
      excess_summary: matchedInvoice?.excess_summary || null,
    };

    setSelectedInvoice(mergedInvoice);
    setShowViewModal(true);
  } catch (error) {
    console.error(error);
    toast.error("Failed to load invoice details");
  }
};


  // 🔹 Update invoice status (Pending ↔ Paid)
  const handleStatusUpdate = (invoice) => {
    ConfirmDeleteModal({
      title: "Update Invoice Status",
      message: `Change status of invoice?`,
      iconColor: "#0dcaf0",
      onConfirm: async () => {
        try {
          const newStatus = invoice.status === "Pending" ? "Paid" : "Pending";
          await purchaseService.updateInvoice(invoice.id, {
            status: newStatus,
          });
          toast.success(`Invoice status updated to ${newStatus}`);
          fetchInvoices();
        } catch (error) {
          console.error(error);
          toast.error("Failed to update invoice status");
        }
      },
    });
  };

  // Helper function to get payment status
  const getPaymentStatus = (invoice) => {
    if (!invoice.payment_summary) return "Unpaid";
    
    const { balance_status } = invoice.payment_summary;
    if (balance_status === "paid") return "Paid";
    if (balance_status === "partially_paid") return "Partially Paid";
    return "Unpaid";
  };

  // Helper function to get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-success bg-opacity-10 text-success";
      case "partially paid":
        return "bg-info bg-opacity-10 text-info";
      default:
        return "bg-warning bg-opacity-10 text-warning";
    }
  };

  if (loading)
    return (
      <div className="text-center py-4">
        <Spinner animation="border" variant="primary" />
        <p className="text-muted mt-2 mb-0">Loading raised invoices...</p>
      </div>
    );

  if (invoices.length === 0)
    return (
      <div className="text-center py-4 text-muted fst-italic">
        No invoices raised yet for <b>{woNumber}</b>
      </div>
    );

  return (
    <>
      <Card className="p-4 shadow-sm border-0 rounded-4 mt-4">
        <div className="d-flex align-items-center mb-4">
          <div className="bg-primary bg-opacity-10 rounded-3 p-2 me-3">
            <div
              className="bg-primary rounded-2"
              style={{ width: "20px", height: "20px" }}
            ></div>
          </div>
          <h6 className="fw-bold text-primary mb-0">Raised Invoices</h6>
        </div>

        <div className="table-responsive rounded-3">
          <Table hover className="mb-0 text-center align-middle">
            <thead className="bg-light">
              <tr>
                <th className="ps-4 py-3 fw-semibold text-muted border-0">#</th>
                <th className="py-3 fw-semibold text-muted border-0">
                  Invoice No.
                </th>
                <th className="py-3 fw-semibold text-muted border-0">
                  Invoice ID
                </th>
                <th className="py-3 fw-semibold text-muted border-0">
                  Base Amount
                </th>
                <th className="py-3 fw-semibold text-muted border-0">
                  GST Amount
                </th>
                <th className="py-3 fw-semibold text-muted border-0">
                  Total Amount
                </th>
                <th className="py-3 fw-semibold text-muted border-0">
                  GST Type
                </th>
                <th className="py-3 fw-semibold text-muted border-0">Payment Status</th>
                <th className="pe-4 py-3 fw-semibold text-muted border-0 text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv, idx) => {
                const paymentStatus = getPaymentStatus(inv);
                return (
                  <tr key={inv.id} className="border-top">
                    <td className="ps-4 py-3">{idx + 1}</td>
                    <td className="py-3 fw-bold text-dark">
                      {inv.number}
                    </td>
                    <td className="py-3">
                      <Button variant="outline-success" size="sm">
                        #{inv.id}
                      </Button>
                    </td>
                    <td className="py-3 fw-bold text-dark">
                      ₹
                      {Number(inv.base_amount || 0).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="py-3 fw-bold text-dark">
                      ₹
                      {Number(inv.gst_amount || 0).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="py-3 fw-bold text-dark">
                      ₹
                      {Number(inv.total_amount || 0).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="py-3 fw-bold text-dark">{inv.gst_type || "Exclusive"}</td>
                    <td className="py-3">
                      <span
                        className={`badge px-3 py-2 border-0 fw-bold ${getStatusBadgeColor(paymentStatus)}`}
                      >
                        {paymentStatus}
                      </span>
                    </td>
                    <td className="pe-4 py-3">
                      <div className="d-flex justify-content-center gap-2">
                        {/* View */}
                        <OverlayTrigger overlay={<Tooltip>View</Tooltip>}>
                          <Button
                            size="sm"
                            variant="warning"
                            className="border-1 text-white"
                            onClick={() => handleView(inv.id)}
                          >
                            <i className="bi bi-eye"></i>
                          </Button>
                        </OverlayTrigger>

                        {/* Delete */}
                        <OverlayTrigger overlay={<Tooltip>Delete</Tooltip>}>
                          <Button
                            size="sm"
                            variant="danger"
                            className="border-1"
                            onClick={() => handleDelete(inv.id)}
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </OverlayTrigger>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      </Card>
      <InvoiceViewFullScreen
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        invoice={selectedInvoice}
        branchName={branchName}
        branchAddress={branchAddress}
        branchContact={branchContact}
      />
    </>
  );
};

export default RaiseInvoiceTable;