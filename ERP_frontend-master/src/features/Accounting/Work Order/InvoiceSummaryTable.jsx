// // src/pages/WorkOrder/components/InvoiceSummary.jsx
// import React from "react";
// import { Card, Table, Button, Spinner, OverlayTrigger, Tooltip, Badge } from "react-bootstrap";

// const InvoiceSummary = ({
//   invoices,
//   loadingInvoices,
//   handleViewInvoice,
//   handleEditInvoice,
//   handleUpdateStatus,
//   handleDeleteInvoice,
// }) => {
//   if (loadingInvoices) {
//     return (
//       <div className="text-center py-4">
//         <Spinner animation="border" variant="primary" />
//         <p className="text-muted mt-2 mb-0">Loading invoices...</p>
//       </div>
//     );
//   }

//   if (!invoices || invoices.length === 0) {
//     return null;
//   }

//   return (
//     <Card className="p-4 shadow-sm border-0 rounded-4 mt-4">
//       <div className="d-flex align-items-center mb-4">
//         <div className="bg-primary bg-opacity-10 rounded-3 p-2 me-3">
//           <div className="bg-info rounded-2" style={{ width: "20px", height: "20px" }}></div>
//         </div>
//         <h6 className="fw-bold text-dark mb-0">Invoice Summary</h6>
//       </div>

//       <div className="table-responsive rounded-3">
//         <Table hover className="mb-0">
//           <thead className="bg-light">
//             <tr>
//               <th className="ps-4 py-3 fw-semibold text-muted border-0">Invoice</th>
//               <th className="py-3 fw-semibold text-muted border-0">Issue Date</th>
//               <th className="py-3 fw-semibold text-muted border-0">Amount</th>
//               <th className="py-3 fw-semibold text-muted border-0">GST</th>
//               <th className="py-3 fw-semibold text-muted border-0">Total Amount</th>
//               <th className="py-3 fw-semibold text-muted border-0">Remaining</th>
//               <th className="py-3 fw-semibold text-muted border-0">Status</th>
//               <th className="pe-4 py-3 fw-semibold text-muted border-0 text-center">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {invoices.map((inv) => (
//               <tr key={inv.id} className="border-top">
//                 <td className="ps-4 py-3">
//                   <Button
//                     variant="outline-success"
//                     onClick={() => handleViewInvoice(inv)}
//                   >
//                     #{String(inv.id).padStart(6, "0")}
//                   </Button>
//                 </td>
//                 <td className="py-3 fw-semibold text-dark">
//                   {new Date(inv.created_at).toLocaleDateString()}
//                 </td>
//                 <td className="py-3 fw-semibold text-dark">
//                   ₹{Number(inv.base_amount || 0).toLocaleString("en-IN", {
//                     minimumFractionDigits: 2,
//                     maximumFractionDigits: 2,
//                   })}
//                 </td>
//                 <td className="py-3 fw-semibold text-dark">
//                   ₹{Number(inv.gst_amount || 0).toLocaleString("en-IN", {
//                     minimumFractionDigits: 2,
//                     maximumFractionDigits: 2,
//                   })}
//                 </td>
//                 <td className="py-3 fw-semibold text-dark">
//                   ₹{Number(inv.total_amount || 0).toLocaleString("en-IN", {
//                     minimumFractionDigits: 2,
//                     maximumFractionDigits: 2,
//                   })}
//                 </td>
//                 <td className="py-3 fw-semibold text-dark">
//                   ₹{Number(inv.remaining_amount || 0).toLocaleString("en-IN", {
//                     minimumFractionDigits: 2,
//                     maximumFractionDigits: 2,
//                   })}
//                 </td>
//                 <td className="py-3">
//                   <Badge
//                     className={`px-3 py-2 border-0 fw-bold ${
//                       inv.status === "paid"
//                         ? "bg-success bg-opacity-10 text-success"
//                         : inv.status === "pending"
//                         ? "bg-warning bg-opacity-10 text-warning"
//                         : "bg-light bg-opacity-10 text-muted"
//                     }`}
//                   >
//                     {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
//                   </Badge>
//                 </td>
//                 <td className="pe-4 py-3">
//                   <div className="d-flex justify-content-center gap-2">
//                     <OverlayTrigger overlay={<Tooltip>View invoice details</Tooltip>}>
//                       <Button
//                         size="sm"
//                         variant="warning"
//                         className="border-1"
//                         onClick={() => handleViewInvoice(inv)}
//                       >
//                         <i className="bi bi-eye"></i>
//                       </Button>
//                     </OverlayTrigger>

//                     <OverlayTrigger overlay={<Tooltip>Edit this invoice</Tooltip>}>
//                       <Button
//                         size="sm"
//                         variant="info"
//                         className="border-1"
//                         onClick={() => handleEditInvoice(inv)}
//                       >
//                         <i className="bi bi-pencil"></i>
//                       </Button>
//                     </OverlayTrigger>

//                     <OverlayTrigger
//                       overlay={
//                         <Tooltip>
//                           {inv.status === "paid"
//                             ? "Mark invoice as Pending"
//                             : "Mark invoice as Paid"
//                           }
//                         </Tooltip>
//                       }
//                     >
//                       <Button
//                         size="sm"
//                         variant={inv.status === "paid" ? "success" : "warning"}
//                         className="border-1"
//                         onClick={() =>
//                           handleUpdateStatus(
//                             inv.id,
//                             inv.status === "paid" ? "pending" : "paid"
//                           )
//                         }
//                       >
//                         {inv.status === "paid" ? (
//                           <i className="bi bi-hourglass-bottom"></i>
//                         ) : (
//                           <i className="bi bi-hourglass-top"></i>
//                         )}
//                       </Button>
//                     </OverlayTrigger>

//                     <OverlayTrigger overlay={<Tooltip>Delete this invoice</Tooltip>}>
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
//     </Card>
//   );
// };

// export default InvoiceSummary;

// src/pages/WorkOrder/components/InvoiceSummary.jsx
import React from "react";
import {
  Card,
  Table,
  Button,
  Spinner,
  OverlayTrigger,
  Tooltip,
  Badge,
} from "react-bootstrap";
import ConfirmDeleteModal from "../../../components/ConfirmDeleteModal";

const InvoiceSummary = ({
  invoices,
  loadingInvoices,
  handleViewInvoice,
  handleEditInvoice,
  handleUpdateStatus,
  handleDeleteInvoice,
}) => {
  if (loadingInvoices) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" variant="primary" />
        <p className="text-muted mt-2 mb-0">Loading invoices...</p>
      </div>
    );
  }

  if (!invoices || invoices.length === 0) {
    return null;
  }

  return (
    <Card className="p-4 shadow-sm border-0 rounded-4 mt-4">
      <div className="d-flex align-items-center mb-4">
        <div className="bg-primary bg-opacity-10 rounded-3 p-2 me-3">
          <div
            className="bg-info rounded-2"
            style={{ width: "20px", height: "20px" }}
          ></div>
        </div>
        <h6 className="fw-bold text-dark mb-0">Invoice Summary</h6>
      </div>

      <div className="table-responsive rounded-3">
        <Table hover className="mb-0">
          <thead className="bg-light">
            <tr>
              <th className="ps-4 py-3 fw-semibold text-muted border-0">
                Invoice
              </th>
              <th className="py-3 fw-semibold text-muted border-0">
                Issue Date
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
                  <Button
                    variant="outline-success"
                    onClick={() => handleViewInvoice(inv)}
                  >
                    #{String(inv.id).padStart(6, "0")}
                  </Button>
                </td>
                <td className="py-3 fw-semibold text-dark">
                  {new Date(inv.created_at).toLocaleDateString()}
                </td>
                <td className="py-3 fw-semibold text-dark">
                  ₹
                  {Number(inv.base_amount || 0).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td className="py-3 fw-semibold text-dark">
                  ₹
                  {Number(inv.gst_amount || 0).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td className="py-3 fw-semibold text-dark">
                  ₹
                  {Number(inv.total_amount || 0).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td className="py-3 fw-semibold text-dark">
                  ₹
                  {Number(inv.remaining_amount || 0).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
                <td className="py-3">
                  <Badge
                    className={`px-3 py-2 border-0 fw-bold ${
                      inv.status === "paid"
                        ? "bg-success bg-opacity-10 text-success"
                        : inv.status === "pending"
                        ? "bg-warning bg-opacity-10 text-warning"
                        : "bg-light bg-opacity-10 text-muted"
                    }`}
                  >
                    {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                  </Badge>
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
                        onClick={() => handleViewInvoice(inv)}
                      >
                        <i className="bi bi-eye"></i>
                      </Button>
                    </OverlayTrigger>

                    <OverlayTrigger
                      overlay={<Tooltip>Edit this invoice</Tooltip>}
                    >
                      <Button
                        size="sm"
                        variant="info"
                        className="border-1"
                        onClick={() => handleEditInvoice(inv)}
                      >
                        <i className="bi bi-pencil"></i>
                      </Button>
                    </OverlayTrigger>

                    <OverlayTrigger
                      overlay={
                        <Tooltip>
                          {inv.status === "paid"
                            ? "Mark invoice as Pending"
                            : "Mark invoice as Paid"}
                        </Tooltip>
                      }
                    >
                      <Button
                        size="sm"
                        variant={inv.status === "paid" ? "success" : "warning"}
                        className="border-1"
                        onClick={() =>
                          ConfirmDeleteModal({
                            title: "Confirm Status Update",
                            message: `Are you sure you want to mark this invoice as ${
                              inv.status === "paid" ? "Pending" : "Paid"
                            }?`,
                            iconColor:
                              inv.status === "paid" ? "#ffc107" : "#198754",
                            onConfirm: async () =>
                              handleUpdateStatus(
                                inv.id,
                                inv.status === "paid" ? "pending" : "paid"
                              ),
                          })
                        }
                      >
                        {inv.status === "paid" ? (
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
    </Card>
  );
};

export default InvoiceSummary;
