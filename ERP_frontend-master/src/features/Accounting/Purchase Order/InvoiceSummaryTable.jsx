// // src/pages/Purchase/Components/InvoiceSummaryTable.jsx
// import React, { useState } from "react";
// import { Card, Table, Button, OverlayTrigger, Tooltip } from "react-bootstrap";
// import { toast } from "react-toastify";
// import ConfirmDeleteModal from "../../../components/ConfirmDeleteModal"; // ✅ added same modal
// import InvoiceViewModal from "./InvoiceDetailsModal";

// const InvoiceSummaryTable = ({
//   invoices,
//   loadingInvoices,
//   handleInvoiceEdit,
//   handleToggleInvoiceStatus,
//   handleDeleteInvoice,
//   setSelectedInvoice,
// }) => {
//   const [showViewModal, setShowViewModal] = useState(false);
//   const [selectedInvoice, setSelectedInvoiceLocal] = useState(null);
//   // ✅ wrap handleToggleInvoiceStatus with confirmation modal (same as RaisedInvoiceTable)
//   const handleStatusUpdateWithConfirm = (invoice) => {
//     ConfirmDeleteModal({
//       title: "Update Status",
//       message: `Are you sure you want to update the status of invoice?`,
//       iconColor: "#0dcaf0",
//       onConfirm: async () => {
//         try {
//           await handleToggleInvoiceStatus(invoice);
//           // toast.success("Invoice status updated successfully");
//         } catch (error) {
//           toast.error("Failed to update invoice status");
//         }
//       },
//     });
//   };

//   if (loadingInvoices) {
//     return (
//       <div className="text-center py-4">
//         <div className="spinner-border text-primary" role="status"></div>
//         <p className="text-muted mt-2 mb-0">Loading invoices...</p>
//       </div>
//     );
//   }

//   if (!invoices?.length) return null;

//   return (
//     <Card className="p-4 shadow-sm border-0 rounded-4 mt-4">
//       <div className="d-flex align-items-center mb-4">
//         <div className="bg-primary bg-opacity-10 rounded-3 p-2 me-3">
//           <div className="bg-info rounded-2" style={{ width: "20px", height: "20px" }}></div>
//         </div>
//         <h6 className="fw-bold text-dark mb-0">Invoice Summary</h6>
//       </div>

//       <div className="table-responsive rounded-3">
//         <Table hover className="mb-0 text-center">
//           <thead className="bg-light">
//             <tr>
//               <th className="ps-4 py-3 fw-semibold text-muted border-0">
//                 Invoice
//               </th>
//               <th className="py-3 fw-semibold text-muted border-0">
//                 Invoice Date
//               </th>
//               <th className="py-3 fw-semibold text-muted border-0">Amount</th>
//               <th className="py-3 fw-semibold text-muted border-0">GST</th>
//               <th className="py-3 fw-semibold text-muted border-0">
//                 Total Amount
//               </th>
//               <th className="py-3 fw-semibold text-muted border-0">
//                 Remaining
//               </th>
//               <th className="py-3 fw-semibold text-muted border-0">Status</th>
//               <th className="pe-4 py-3 fw-semibold text-muted border-0 text-center">
//                 Actions
//               </th>
//             </tr>
//           </thead>
//           <tbody>
//             {invoices.map((inv) => (
//               <tr key={inv.id} className="border-top">
//                 <td className="ps-4 py-3">
//                   <Button variant="outline-success">
//                     #{String(inv.id).padStart(6, "0")}
//                   </Button>
//                 </td>
//                 <td className="py-3 fw-semibold text-dark">
//                   {new Date(inv.created_at).toLocaleDateString()}
//                 </td>
//                 <td className="py-3 fw-semibold text-dark">
//                   ₹{parseFloat(inv.base_amount || 0).toFixed(2)}
//                 </td>
//                 <td className="py-3 fw-semibold text-dark">
//                   ₹{parseFloat(inv.gst_amount || 0).toFixed(2)}
//                 </td>
//                 <td className="py-3 fw-semibold text-dark">
//                   ₹{parseFloat(inv.total_amount || 0).toFixed(2)}
//                 </td>
//                 <td className="py-3 fw-semibold text-dark">
//                   ₹{parseFloat(inv.remaining_amount || 0).toFixed(2)}
//                 </td>
//                 <td className="py-3">
//                   <span
//                     className={`badge px-3 py-2 border-0 fw-bold ${
//                       inv.status?.toLowerCase() === "paid"
//                         ? "bg-success bg-opacity-10 text-success"
//                         : inv.status?.toLowerCase() === "pending"
//                         ? "bg-warning bg-opacity-10 text-warning"
//                         : "bg-light bg-opacity-10 text-muted"
//                     }`}
//                   >
//                     {inv.status || "N/A"}
//                   </span>
//                 </td>
//                 <td className="pe-4 py-3">
//                   <div className="d-flex justify-content-center gap-2">
//                     <OverlayTrigger
//                       overlay={<Tooltip>View invoice details</Tooltip>}
//                     >
//                       <Button
//                         size="sm"
//                         variant="warning"
//                         className="border-1"
// onClick={() => {
//   setSelectedInvoice(inv); // keep your existing parent prop call
//   setSelectedInvoiceLocal(inv); // local copy for modal
//   setShowViewModal(true);
// }}
//                       >
//                         <i className="bi bi-eye"></i>
//                       </Button>
//                     </OverlayTrigger>

//                     <OverlayTrigger overlay={<Tooltip>Edit Invoice</Tooltip>}>
//                       <Button
//                         size="sm"
//                         variant="info"
//                         className="border-1"
//                         onClick={() => handleInvoiceEdit(inv)}
//                       >
//                         <i className="bi bi-pencil"></i>
//                       </Button>
//                     </OverlayTrigger>

//                     {/* ✅ Confirmation added here */}
//                     <OverlayTrigger
//                       overlay={
//                         <Tooltip>
//                           {inv.status?.toLowerCase() === "paid"
//                             ? "Mark invoice as Pending"
//                             : "Mark invoice as Paid"}
//                         </Tooltip>
//                       }
//                     >
//                       <Button
//                         size="sm"
//                         variant={
//                           inv.status?.toLowerCase() === "paid"
//                             ? "success"
//                             : "warning"
//                         }
//                         className="border-1"
//                         onClick={() => handleStatusUpdateWithConfirm(inv)}
//                       >
//                         {inv.status?.toLowerCase() === "paid" ? (
//                           <i className="bi bi-hourglass-bottom"></i>
//                         ) : (
//                           <i className="bi bi-hourglass-top"></i>
//                         )}
//                       </Button>
//                     </OverlayTrigger>

//                     <OverlayTrigger
//                       overlay={<Tooltip>Delete this invoice</Tooltip>}
//                     >
//                       <Button
//                         size="sm"
//                         variant="danger"
//                         className="border-1"
//                         onClick={() => handleDeleteInvoice(inv.id)}
//                       >
//                         <i className="bi bi-trash"></i>
//                       </Button>
//                     </OverlayTrigger>
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </Table>
//       </div>
// <InvoiceViewModal
//   show={showViewModal}
//   onHide={() => setShowViewModal(false)}
//   invoice={selectedInvoice}
// />
//     </Card>
//   );
// };

// export default InvoiceSummaryTable;






// src/pages/Purchase/Components/InvoiceSummaryTable.jsx
import React, { useState } from "react";
import { Card, Table, Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { toast } from "react-toastify";
import ConfirmDeleteModal from "../../../components/ConfirmDeleteModal"; // ✅ added same modal
import InvoiceViewModal from "./InvoiceDetailsModal";

const InvoiceSummaryTable = ({
  invoices,
  loadingInvoices,
  handleInvoiceEdit,
  handleToggleInvoiceStatus,
  handleDeleteInvoice,
  setSelectedInvoice,
}) => {
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedInvoice, setSelectedInvoiceLocal] = useState(null);
  // ✅ wrap handleToggleInvoiceStatus with confirmation modal (same as RaisedInvoiceTable)
  const handleStatusUpdateWithConfirm = (invoice) => {
    ConfirmDeleteModal({
      title: "Update Status",
      message: `Are you sure you want to update the status of invoice?`,
      iconColor: "#0dcaf0",
      onConfirm: async () => {
        try {
          await handleToggleInvoiceStatus(invoice);
          // toast.success("Invoice status updated successfully");
        } catch (error) {
          toast.error("Failed to update invoice status");
        }
      },
    });
  };

  if (loadingInvoices) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="text-muted mt-2 mb-0">Loading invoices...</p>
      </div>
    );
  }

  if (!invoices?.length) return null;

  return (
    <Card className="p-4 shadow-sm border-0 rounded-4 mt-4">
      <div className="d-flex align-items-center mb-4">
        <div className="bg-primary bg-opacity-10 rounded-3 p-2 me-3">
          <div className="bg-info rounded-2" style={{ width: "20px", height: "20px" }}></div>
        </div>
        <h6 className="fw-bold text-dark mb-0">Invoice Summary</h6>
      </div>

      <div className="table-responsive rounded-3">
        <Table hover className="mb-0 text-center">
          <thead className="bg-light">
            <tr>
              <th className="ps-4 py-3 fw-semibold text-muted border-0">
                Invoice
              </th>
              <th className="py-3 fw-semibold text-muted border-0">
                Invoice Date
              </th>
              <th className="py-3 fw-semibold text-muted border-0">Amount</th>
              <th className="py-3 fw-semibold text-muted border-0">GST</th>
              <th className="py-3 fw-semibold text-muted border-0">
                Total Amount
              </th>
              <th className="py-3 fw-semibold text-muted border-0">
                Remaining
              </th>
              <th className="py-3 fw-semibold text-muted border-0">Status</th>
              <th className="pe-4 py-3 fw-semibold text-muted border-0 text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-top">
                <td className="ps-4 py-3">
                  <Button variant="outline-success">
                    #{String(inv.id).padStart(6, "0")}
                  </Button>
                </td>
                <td className="py-3 fw-semibold text-dark">
                  {new Date(inv.created_at).toLocaleDateString()}
                </td>
               <td className="py-3 fw-semibold text-dark">
  ₹{Number(inv.base_amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}
</td>

<td className="py-3 fw-semibold text-dark">
  ₹{Number(inv.gst_amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}
</td>

<td className="py-3 fw-semibold text-dark">
  ₹{Number(inv.total_amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}
</td>

<td className="py-3 fw-semibold text-dark">
  ₹{Number(inv.remaining_amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}
</td>

                <td className="py-3">
                  <span
                    className={`badge px-3 py-2 border-0 fw-bold ${
                      inv.status?.toLowerCase() === "paid"
                        ? "bg-success bg-opacity-10 text-success"
                        : inv.status?.toLowerCase() === "pending"
                        ? "bg-warning bg-opacity-10 text-warning"
                        : "bg-light bg-opacity-10 text-muted"
                    }`}
                  >
                    {inv.status || "N/A"}
                  </span>
                </td>
                <td className="pe-4 py-3">
                  <div className="d-flex justify-content-center gap-2">
                    <OverlayTrigger
                      overlay={<Tooltip>View invoice details</Tooltip>}
                    >
                      <Button
                        size="sm"
                        variant="warning"
                        className="border-1"
onClick={() => {
  setSelectedInvoice(inv); // keep your existing parent prop call
  setSelectedInvoiceLocal(inv); // local copy for modal
  setShowViewModal(true);
}}
                      >
                        <i className="bi bi-eye"></i>
                      </Button>
                    </OverlayTrigger>

                    <OverlayTrigger overlay={<Tooltip>Edit Invoice</Tooltip>}>
                      <Button
                        size="sm"
                        variant="info"
                        className="border-1"
                        onClick={() => handleInvoiceEdit(inv)}
                      >
                        <i className="bi bi-pencil"></i>
                      </Button>
                    </OverlayTrigger>

                    {/* ✅ Confirmation added here */}
                    <OverlayTrigger
                      overlay={
                        <Tooltip>
                          {inv.status?.toLowerCase() === "paid"
                            ? "Mark invoice as Pending"
                            : "Mark invoice as Paid"}
                        </Tooltip>
                      }
                    >
                      <Button
                        size="sm"
                        variant={
                          inv.status?.toLowerCase() === "paid"
                            ? "success"
                            : "warning"
                        }
                        className="border-1"
                        onClick={() => handleStatusUpdateWithConfirm(inv)}
                      >
                        {inv.status?.toLowerCase() === "paid" ? (
                          <i className="bi bi-hourglass-bottom"></i>
                        ) : (
                          <i className="bi bi-hourglass-top"></i>
                        )}
                      </Button>
                    </OverlayTrigger>

                    <OverlayTrigger
                      overlay={<Tooltip>Delete this invoice</Tooltip>}
                    >
                      <Button
                        size="sm"
                        variant="danger"
                        className="border-1"
                        onClick={() => handleDeleteInvoice(inv.id)}
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                    </OverlayTrigger>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
<InvoiceViewModal
  show={showViewModal}
  onHide={() => setShowViewModal(false)}
  invoice={selectedInvoice}
/>
    </Card>
  );
};

export default InvoiceSummaryTable;
