// import React, { useRef } from "react";
// import { Button, OverlayTrigger, Table, Tooltip, Badge, Row, Col, Card } from "react-bootstrap";
// import jsPDF from "jspdf";
// import html2canvas from "html2canvas";

// const InvoiceViewFullScreen = ({ show, onHide, invoice, branchName, branchAddress, branchContact }) => {
//   if (!show || !invoice) return null;

//   const workOrder = invoice.workOrder || {};
//   const purchaseOrder = invoice.purchaseOrder || {};
//   const branch = workOrder.assignedBranch || purchaseOrder.branch || {};
//   const services = workOrder.services || [];
//   const lineItems = purchaseOrder.line_items || [];
//   const paymentSummary = invoice.payment_summary || {};
//   const excessSummary = invoice.excess_summary || {};
//   const printRef = useRef();

//   // Determine invoice type
//   const isWorkOrderInvoice = !!workOrder;
//   const isPurchaseOrderInvoice = !!purchaseOrder;
  
//   // Get GST rates
//   const cgstRate = invoice.cgst || "0.00";
//   const sgstRate = invoice.sgst || "0.00";
//   const igstRate = invoice.igst || "0.00";

//   const handleDownloadPDF = async () => {
//     const element = printRef.current;
//     const canvas = await html2canvas(element, { scale: 2 });
//     const imgData = canvas.toDataURL("image/png");
//     const pdf = new jsPDF("p", "mm", "a4");
//     const imgWidth = 210;
//     const pageHeight = 295;
//     const imgHeight = (canvas.height * imgWidth) / canvas.width;
//     let heightLeft = imgHeight;
//     let position = 0;

//     pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
//     heightLeft -= pageHeight;

//     while (heightLeft >= 0) {
//       position = heightLeft - imgHeight;
//       pdf.addPage();
//       pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
//       heightLeft -= pageHeight;
//     }

//     pdf.save(`${invoice.number || "invoice"}.pdf`);
//   };

//   const getPaymentStatusBadge = (balanceStatus) => {
//     switch (balanceStatus) {
//       case 'paid':
//         return <Badge bg="success" className="px-3 py-1 rounded-pill">Paid</Badge>;
//       case 'partially_paid':
//         return <Badge bg="warning" text="dark" className="px-3 py-1 rounded-pill">Partially Paid</Badge>;
//       default:
//         return <Badge bg="danger" className="px-3 py-1 rounded-pill">Unpaid</Badge>;
//     }
//   };

//   const getExcessStatusBadge = (isExcess) => {
//     if (isExcess) {
//       return <Badge bg="warning" text="dark" className="px-3 py-1 rounded-pill ms-2">Over Invoice</Badge>;
//     }
//     return null;
//   };

//   return (
//     <div
//       className="position-fixed top-0 start-0 w-100 h-100 bg-light overflow-auto z-50 p-3"
//       style={{ zIndex: 1055 }}
//     >
//       {/* Header */}
//       <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-white rounded shadow-sm border">
//         <div>
//           <h4 className="fw-bold mb-1 text-dark">
//             {isWorkOrderInvoice ? "Work Order Invoice" : "Purchase Order Invoice"}
//           </h4>
//           <p className="text-muted mb-0">Full Screen View</p>
//         </div>
//         <div className="d-flex gap-2">
//           <OverlayTrigger
//             placement="bottom"
//             overlay={<Tooltip id="tooltip-download">Download this invoice as PDF</Tooltip>}
//           >
//             <Button variant="outline-primary" size="sm" onClick={handleDownloadPDF} className="d-flex align-items-center gap-1">
//               <i className="bi bi-download"></i> PDF
//             </Button>
//           </OverlayTrigger>
//           <OverlayTrigger
//             placement="bottom"
//             overlay={<Tooltip id="tooltip-close">Close full-screen view</Tooltip>}
//           >
//             <Button variant="outline-secondary" size="sm" onClick={onHide} className="d-flex align-items-center gap-1">
//               <i className="bi bi-x-lg"></i> Close
//             </Button>
//           </OverlayTrigger>
//         </div>
//       </div>

//       {/* Content */}
//       <div ref={printRef} className="p-4 bg-white rounded shadow-sm border">
//         {/* Branch Header */}
//         <div className="text-center mb-4">
//           <h2 className="mb-2 fw-bold">{branch.name || branchName || "N/A"}</h2>
//           <div className="d-flex justify-content-center gap-4 text-muted">
//             <span><i className="bi bi-geo-alt me-1"></i> {branch.branch_address || branchAddress || "N/A"}</span>
//             <span><i className="bi bi-telephone me-1"></i> {branch.contact_number || branchContact || "N/A"}</span>
//           </div>
//         </div>

//         {/* Invoice Header Card */}
//         <Card className="border mb-4">
//           <Card.Body className="p-4">
//             <Row className="align-items-start">              
//               <Col md={6}>
//                 {isWorkOrderInvoice && (
//                   <div className="border-start ps-4">
//                     <h6 className="fw-bold mb-2">Work Order Details</h6>
//                     <div className="d-flex flex-column gap-1 small">
//                       <div>
//                         <span className="fw-semibold">W.O. No.:</span>
//                         <span className="ms-2">{workOrder.wo_number}</span>
//                       </div>
//                       <div>
//                         <span className="fw-semibold">W.O. Date:</span>
//                         <span className="ms-2">{new Date(workOrder.issue_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
//                       </div>
//                       <div>
//                         <span className="fw-semibold">Validity:</span>
//                         <span className="ms-2">
//                           {new Date(workOrder.issue_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} -{" "}
//                           {new Date(workOrder.expected_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </Col>
//               <Col md={6}>
//                 <div className="d-flex flex-column gap-2">
//                   <div>
//                     <span className="fw-semibold">Invoice Date:</span>
//                     <span className="ms-2">{new Date(invoice.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
//                   </div>
//                   <div className="d-flex align-items-center gap-2">
//                     <span className="fw-semibold">Status:</span>
//                     {getPaymentStatusBadge(paymentSummary.balance_status)}
//                     {getExcessStatusBadge(excessSummary.is_excess)}
//                   </div>
//                 </div>
//               </Col>
//             </Row>
            
//             {excessSummary.is_excess && (
//               <div className="mt-3 p-3 border rounded bg-light">
//                 <div className="d-flex align-items-center gap-2 mb-1">
//                   <i className="bi bi-exclamation-triangle text-warning"></i>
//                   <span className="fw-bold">Excess Amount Detected</span>
//                 </div>
//                 <div className="d-flex gap-4">
//                   <span><b>Excess:</b> ₹{Number(excessSummary.excess_amount || 0).toLocaleString()}</span>
//                   {/* <span><b>Percentage:</b> {excessSummary.excess_percentage}%</span> */}
//                 </div>
//               </div>
//             )}
//           </Card.Body>
//         </Card>

//         {/* Invoice Type Header */}
//         <div className="text-center mb-4">
//           <div className="border-top border-bottom py-3">
//             <h4 className="fw-bold mb-0">
//               {isWorkOrderInvoice ? "WORK ORDER INVOICE" : "PURCHASE ORDER INVOICE"}
//             </h4>
//           </div>
//         </div>

//         {/* Items Table */}
//         <div className="mb-4">
//           <div className="table-responsive">
//             <Table bordered className="align-middle">
//               <thead className="table-light">
//                 <tr>
//                   <th className="text-center" style={{ width: '5%' }}>#</th>
//                   {isWorkOrderInvoice ? (
//                     <>
//                       <th style={{ width: '15%' }}>Service Code</th>
//                       <th>Service Name</th>
//                       <th className="text-center" style={{ width: '10%' }}>Unit</th>
//                       <th className="text-center" style={{ width: '10%' }}>Qty</th>
//                       <th className="text-end" style={{ width: '15%' }}>Rate (INR)</th>
//                       <th className="text-end" style={{ width: '15%' }}>Amount (INR)</th>
//                     </>
//                   ) : (
//                     <>
//                       <th>Item Name</th>
//                       <th className="text-center" style={{ width: '10%' }}>Unit</th>
//                       <th className="text-center" style={{ width: '10%' }}>Quantity</th>
//                       <th className="text-end" style={{ width: '15%' }}>Unit Price (INR)</th>
//                       <th className="text-end" style={{ width: '15%' }}>Line Total (INR)</th>
//                     </>
//                   )}
//                 </tr>
//               </thead>

//               <tbody>
//                 {isWorkOrderInvoice
//                   ? services.map((s, idx) => (
//                       <tr key={idx}>
//                         <td className="text-center fw-semibold">{idx + 1}</td>
//                         <td>
//                           <div className="fw-semibold">{s.service_code}</div>
//                         </td>
//                         <td>{s.description}</td>
//                         <td className="text-center">{s.unit}</td>
//                         <td className="text-center">{Number(s.quantity).toLocaleString()}</td>
//                         <td className="text-end">₹{Number(s.rate).toLocaleString()}</td>
//                         <td className="text-end fw-semibold">₹{Number(s.amount).toLocaleString()}</td>
//                       </tr>
//                     ))
//                   : lineItems.map((item, idx) => (
//                       <tr key={idx}>
//                         <td className="text-center fw-semibold">{idx + 1}</td>
//                         <td>
//                           <div className="fw-semibold">{item.item_name}</div>
//                           {item.description && <div className="text-muted small">{item.description}</div>}
//                         </td>
//                         <td className="text-center">{item.unit_id}</td>
//                         <td className="text-center">{Number(item.quantity).toLocaleString()}</td>
//                         <td className="text-end">₹{Number(item.unit_price).toLocaleString()}</td>
//                         <td className="text-end fw-semibold">₹{Number(item.line_total).toLocaleString()}</td>
//                       </tr>
//                     ))}
//               </tbody>

//               <tfoot className="border-top-2">
//                 <tr>
//                   <td colSpan={isWorkOrderInvoice ? 5 : 4} className="text-end fw-semibold py-3">
//                     Base Amount (INR)
//                   </td>
//                   <td className="text-end fw-semibold py-3">
//                     ₹{Number(invoice.base_amount || 0).toLocaleString("en-IN")}
//                   </td>
//                 </tr>
                
//                 <tr>
//                   <td colSpan={isWorkOrderInvoice ? 5 : 4} className="text-end fw-semibold py-3">
//                     GST Amount (INR)
//                   </td>
//                   <td className="text-end fw-semibold py-3">
//                     ₹{Number(invoice.gst_amount || 0).toLocaleString("en-IN")}
//                   </td>
//                 </tr>

//                 <tr className="border-top">
//                   <td colSpan={isWorkOrderInvoice ? 5 : 4} className="text-end fw-bold py-3 fs-5">
//                     Total Invoice Amount (INR)
//                   </td>
//                   <td className="text-end fw-bold py-3 fs-5 border-top">
//                     ₹{Number(invoice.total_amount || 0).toLocaleString("en-IN")}
//                   </td>
//                 </tr>
//               </tfoot>
//             </Table>
//           </div>
//         </div>

//         {/* GST Breakdown */}
//         <Card className="border mb-4">
//           <Card.Body className="p-3">
//             <h6 className="fw-bold mb-3">GST Breakdown</h6>
//             <Row>
//               {cgstRate !== "0.00" && (
//                 <Col md={4} className="text-center">
//                   <div className="p-2 border rounded">
//                     <div className="fw-semibold">CGST</div>
//                     <div className="text-muted small">{cgstRate}%</div>
//                     <div className="fw-bold">₹{Number((invoice.base_amount * cgstRate / 100) || 0).toLocaleString()}</div>
//                   </div>
//                 </Col>
//               )}
//               {sgstRate !== "0.00" && (
//                 <Col md={4} className="text-center">
//                   <div className="p-2 border rounded">
//                     <div className="fw-semibold">SGST</div>
//                     <div className="text-muted small">{sgstRate}%</div>
//                     <div className="fw-bold">₹{Number((invoice.base_amount * sgstRate / 100) || 0).toLocaleString()}</div>
//                   </div>
//                 </Col>
//               )}
//               {igstRate !== "0.00" && (
//                 <Col md={4} className="text-center">
//                   <div className="p-2 border rounded">
//                     <div className="fw-semibold">IGST</div>
//                     <div className="text-muted small">{igstRate}%</div>
//                     <div className="fw-bold">₹{Number((invoice.base_amount * igstRate / 100) || 0).toLocaleString()}</div>
//                   </div>
//                 </Col>
//               )}
//             </Row>
//           </Card.Body>
//         </Card>

//         {/* Payment Summary */}
//         <Row className="mb-4">
//           <Col md={6}>
//             <Card className="border h-100">
//               <Card.Body>
//                 <h6 className="fw-bold mb-3 border-bottom pb-2">Payment Summary</h6>
//                 <div className="d-flex flex-column gap-2">
//                   <div className="d-flex justify-content-between">
//                     <span>Total Amount Received</span>
//                     <span className="fw-semibold">₹{Number(paymentSummary.total_received || 0).toLocaleString()}</span>
//                   </div>
//                   <div className="d-flex justify-content-between">
//                     <span>Total Paid Base Amount</span>
//                     <span className="fw-semibold">₹{Number(paymentSummary.total_paid_base_amount || 0).toLocaleString()}</span>
//                   </div>
//                   <div className="d-flex justify-content-between">
//                     <span>Remaining Amount</span>
//                     <span className="fw-semibold">₹{Number(paymentSummary.remaining_amount || 0).toLocaleString()}</span>
//                   </div>
//                   <div className="d-flex justify-content-between">
//                     <span>Total Payments</span>
//                     <span>{paymentSummary.payment_count || 0}</span>
//                   </div>
//                 </div>
//               </Card.Body>
//             </Card>
//           </Col>
          
//           <Col md={6}>
//             <Card className="border h-100">
//               <Card.Body>
//                 <h6 className="fw-bold mb-3 border-bottom pb-2">Payment Status</h6>
//                 <div className="d-flex flex-column gap-3">
//                   <div>
//                     <div className="d-flex justify-content-between align-items-center mb-1">
//                       <span>Status</span>
//                       {getPaymentStatusBadge(paymentSummary.balance_status)}
//                     </div>
//                     <div className="text-muted small">
//                       {paymentSummary.balance_status === 'paid' ? 'Invoice fully paid' :
//                        paymentSummary.balance_status === 'partially_paid' ? 'Invoice partially paid' :
//                        'Invoice pending payment'}
//                     </div>
//                   </div>
//                   <div className="d-flex justify-content-between">
//                     <div>
//                       <div className="fw-semibold">{paymentSummary.paid_count || 0}</div>
//                       <div className="text-muted small">Paid</div>
//                     </div>
//                     <div>
//                       <div className="fw-semibold">{paymentSummary.pending_count || 0}</div>
//                       <div className="text-muted small">Pending</div>
//                     </div>
//                   </div>
//                 </div>
//               </Card.Body>
//             </Card>
//           </Col>
//         </Row>

//         {/* Payment History */}
//         {paymentSummary.payments && paymentSummary.payments.length > 0 && (
//           <Card className="border mb-4">
//             <Card.Body>
//               <h6 className="fw-bold mb-3 border-bottom pb-2">Payment History</h6>
//               <div className="table-responsive">
//                 <Table borderless className="mb-0">
//                   <thead className="border-bottom">
//                     <tr>
//                       <th className="fw-semibold">Payment Date</th>
//                       <th className="fw-semibold">Base Amount</th>
//                       <th className="fw-semibold">GST Amount</th>
//                       <th className="fw-semibold">Total Amount</th>
//                       <th className="fw-semibold">Status</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {paymentSummary.payments.map((payment, idx) => (
//                       <tr key={idx} className={idx !== paymentSummary.payments.length - 1 ? 'border-bottom' : ''}>
//                         <td className="py-2">{new Date(payment.payment_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
//                         <td className="py-2">₹{Number(payment.base_amount || 0).toLocaleString()}</td>
//                         <td className="py-2">₹{Number(payment.gst_amount || 0).toLocaleString()}</td>
//                         <td className="py-2 fw-semibold">₹{Number(payment.amount || 0).toLocaleString()}</td>
//                         <td className="py-2">
//                           <Badge bg={payment.status === 'paid' ? 'success' : payment.status === 'pending' ? 'warning' : 'danger'} 
//                                  className="px-2 py-1 rounded-pill">
//                             {payment.status || 'N/A'}
//                           </Badge>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </Table>
//               </div>
//             </Card.Body>
//           </Card>
//         )}

//         {/* Terms & Conditions */}
//         <Card className="border">
//           <Card.Body>
//             <h6 className="fw-bold mb-3 border-bottom pb-2">Commercial Terms and Conditions</h6>
//             <div className="ms-3">
//               <ol className="mb-0">
//                 <li className="mb-2">All other terms & conditions will remain the same as per RFQ / negotiation at TSM.</li>
//                 <li className="mb-2">
//                   Material to be delivered at: TATA STEEL MINING LIMITED, Kalinganagar Industrial Growth Centre, 
//                   PO - Jakhapura, Dist - Jajpur, PIN - 755026.
//                 </li>
//                 <li className="mb-2">Invoice to be raised at TATA STEEL MINING LIMITED.</li>
//                 <li className="mb-2">Validity: As per work order.</li>
//                 {paymentSummary.balance_status === 'partially_paid' && (
//                   <li className="mb-2 fw-semibold">
//                     <i className="bi bi-info-circle me-1"></i>
//                     This invoice is partially paid. Remaining amount: ₹{Number(paymentSummary.remaining_amount || 0).toLocaleString()}
//                   </li>
//                 )}
//                 {paymentSummary.balance_status === 'paid' && (
//                   <li className="mb-2 fw-semibold text-success">
//                     <i className="bi bi-check-circle me-1"></i>
//                     This invoice has been fully paid.
//                   </li>
//                 )}
//                 {excessSummary.is_excess && (
//                   <li className="mb-2 fw-semibold">
//                     <i className="bi bi-exclamation-triangle me-1"></i>
//                     This invoice has exceeded the original work order amount by ₹{Number(excessSummary.excess_amount || 0).toLocaleString()} ({excessSummary.excess_percentage}%).
//                   </li>
//                 )}
//               </ol>
//             </div>
//           </Card.Body>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default InvoiceViewFullScreen;



import React, { useRef } from "react";
import { Button, OverlayTrigger, Table, Tooltip, Badge, Row, Col, Card } from "react-bootstrap";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const InvoiceViewFullScreen = ({ show, onHide, invoice, branchName, branchAddress, branchContact }) => {
  if (!show || !invoice) return null;

  const workOrder = invoice.workOrder || {};
  const purchaseOrder = invoice.purchaseOrder || {};
  const branch = workOrder.assignedBranch || purchaseOrder.branch || {};
  const services = workOrder.services || [];
  const lineItems = purchaseOrder.line_items || [];
  const paymentSummary = invoice.payment_summary || {};
  const excessSummary = invoice.excess_summary || {};
  const printRef = useRef();

  // Determine invoice type
  const isWorkOrderInvoice = !!workOrder;
  const isPurchaseOrderInvoice = !!purchaseOrder;
  
  // Get GST rates
  const cgstRate = invoice.cgst || "0.00";
  const sgstRate = invoice.sgst || "0.00";
  const igstRate = invoice.igst || "0.00";

  const handleDownloadPDF = async () => {
    const element = printRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${invoice.number || "invoice"}.pdf`);
  };

  const getPaymentStatusBadge = (balanceStatus) => {
    switch (balanceStatus) {
      case 'paid':
        return <Badge bg="success" className="px-3 py-1 rounded-pill">Paid</Badge>;
      case 'partially_paid':
        return <Badge bg="warning" text="dark" className="px-3 py-1 rounded-pill">Partially Paid</Badge>;
      default:
        return <Badge bg="danger" className="px-3 py-1 rounded-pill">Unpaid</Badge>;
    }
  };

  const getExcessStatusBadge = (isExcess) => {
    if (isExcess) {
      return <Badge bg="warning" text="dark" className="px-3 py-1 rounded-pill ms-2">Over Invoice</Badge>;
    }
    return null;
  };
  const totalGstPaid =
    paymentSummary?.payments?.reduce(
      (sum, p) => sum + Number(p.gst_amount || 0),
      0
    ) || 0;
  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 bg-light overflow-auto z-50 p-3"
      style={{ zIndex: 1055 }}
    >
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-white rounded shadow-sm border">
        <div>
          <h4 className="fw-bold mb-1 text-dark">
            {isWorkOrderInvoice ? "Work Order Invoice" : "Purchase Order Invoice"}
          </h4>
          <p className="text-muted mb-0">Full Screen View</p>
        </div>
        <div className="d-flex gap-2">
          <OverlayTrigger
            placement="bottom"
            overlay={<Tooltip id="tooltip-download">Download this invoice as PDF</Tooltip>}
          >
            <Button variant="outline-primary" size="sm" onClick={handleDownloadPDF} className="d-flex align-items-center gap-1">
              <i className="bi bi-download"></i> PDF
            </Button>
          </OverlayTrigger>
          <OverlayTrigger
            placement="bottom"
            overlay={<Tooltip id="tooltip-close">Close full-screen view</Tooltip>}
          >
            <Button variant="outline-secondary" size="sm" onClick={onHide} className="d-flex align-items-center gap-1">
              <i className="bi bi-x-lg"></i> Close
            </Button>
          </OverlayTrigger>
        </div>
      </div>

      {/* Content */}
      <div ref={printRef} className="p-4 bg-white rounded shadow-sm border">
        {/* Branch Header */}
        <div className="text-center mb-4">
          <h2 className="mb-2 fw-bold">{branch.name || branchName || "N/A"}</h2>
          <div className="d-flex justify-content-center gap-4 text-muted">
            <span><i className="bi bi-geo-alt me-1"></i> {branch.branch_address || branchAddress || "N/A"}</span>
            <span><i className="bi bi-telephone me-1"></i> {branch.contact_number || branchContact || "N/A"}</span>
          </div>
        </div>

        {/* Invoice Header Card */}
        <Card className="border mb-4">
          <Card.Body className="p-4">
            <Row className="align-items-start">              
              <Col md={6}>
                {isWorkOrderInvoice && (
                  <div className="border-start ps-4">
                    <h6 className="fw-bold mb-2">Work Order Details</h6>
                    <div className="d-flex flex-column gap-1 small">
                      <div>
                        <span className="fw-semibold">W.O. No.:</span>
                        <span className="ms-2">{workOrder.wo_number}</span>
                      </div>
                      <div>
                        <span className="fw-semibold">W.O. Date:</span>
                        <span className="ms-2">{new Date(workOrder.issue_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>
                      <div>
                        <span className="fw-semibold">Validity:</span>
                        <span className="ms-2">
                          {new Date(workOrder.issue_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} -{" "}
                          {new Date(workOrder.expected_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </Col>
              <Col md={6}>
                <div className="d-flex flex-column gap-2">
                  <div>
                    <span className="fw-semibold">Invoice Date:</span>
                    <span className="ms-2">{new Date(invoice.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-semibold">Status:</span>
                    {getPaymentStatusBadge(paymentSummary.balance_status)}
                    {getExcessStatusBadge(excessSummary.is_excess)}
                  </div>
                </div>
              </Col>
            </Row>
            
            {excessSummary.is_excess && (
              <div className="mt-3 p-3 border rounded bg-light">
                <div className="d-flex align-items-center gap-2 mb-1">
                  <i className="bi bi-exclamation-triangle text-warning"></i>
                  <span className="fw-bold">Excess Amount Detected</span>
                </div>
                <div className="d-flex gap-4">
                  <span><b>Excess:</b> ₹{Number(excessSummary.excess_amount || 0).toLocaleString("en-IN")}</span>
                  {/* <span><b>Percentage:</b> {excessSummary.excess_percentage}%</span> */}
                </div>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Invoice Type Header */}
        <div className="text-center mb-4">
          <div className="border-top border-bottom py-3">
            <h4 className="fw-bold mb-0">
              {isWorkOrderInvoice ? "WORK ORDER INVOICE" : "PURCHASE ORDER INVOICE"}
            </h4>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-4">
          <div className="table-responsive">
            <Table bordered className="align-middle">
              <thead className="table-light">
                <tr>
                  <th className="text-center" style={{ width: '5%' }}>#</th>
                  {isWorkOrderInvoice ? (
                    <>
                      <th style={{ width: '15%' }}>Service Code</th>
                      <th>Service Name</th>
                      <th className="text-center" style={{ width: '10%' }}>Unit</th>
                      <th className="text-center" style={{ width: '10%' }}>Qty</th>
                      <th className="text-end" style={{ width: '15%' }}>Rate (INR)</th>
                      <th className="text-end" style={{ width: '15%' }}>Amount (INR)</th>
                    </>
                  ) : (
                    <>
                      <th>Item Name</th>
                      <th className="text-center" style={{ width: '10%' }}>Unit</th>
                      <th className="text-center" style={{ width: '10%' }}>Quantity</th>
                      <th className="text-end" style={{ width: '15%' }}>Unit Price (INR)</th>
                      <th className="text-end" style={{ width: '15%' }}>Line Total (INR)</th>
                    </>
                  )}
                </tr>
              </thead>

              <tbody>
                {isWorkOrderInvoice
                  ? services.map((s, idx) => (
                      <tr key={idx}>
                        <td className="text-center fw-semibold">{idx + 1}</td>
                        <td>
                          <div className="fw-semibold">{s.service_code}</div>
                        </td>
                        <td>{s.description}</td>
                        <td className="text-center">{s.unit}</td>
                        <td className="text-center">{Number(s.quantity).toLocaleString()}</td>
                        <td className="text-end">₹{Number(s.rate).toLocaleString("en-IN")}</td>
                        <td className="text-end fw-semibold">₹{Number(s.amount).toLocaleString("en-IN")}</td>
                      </tr>
                    ))
                  : lineItems.map((item, idx) => (
                      <tr key={idx}>
                        <td className="text-center fw-semibold">{idx + 1}</td>
                        <td>
                          <div className="fw-semibold">{item.item_name}</div>
                          {item.description && <div className="text-muted small">{item.description}</div>}
                        </td>
                        <td className="text-center">{item.unit_id}</td>
                        <td className="text-center">{Number(item.quantity).toLocaleString()}</td>
                        <td className="text-end">₹{Number(item.unit_price).toLocaleString()}</td>
                        <td className="text-end fw-semibold">₹{Number(item.line_total).toLocaleString()}</td>
                      </tr>
                    ))}
              </tbody>

              <tfoot className="border-top-2">
                <tr>
                  <td colSpan={isWorkOrderInvoice ? 5 : 4} className="text-end fw-semibold py-3">
                    Base Amount (INR)
                  </td>
                  <td className="text-end fw-semibold py-3">
                    ₹{Number(invoice.base_amount || 0).toLocaleString("en-IN")}
                  </td>
                </tr>
                
                <tr>
                  <td colSpan={isWorkOrderInvoice ? 5 : 4} className="text-end fw-semibold py-3">
                    GST Amount (INR)
                  </td>
                  <td className="text-end fw-semibold py-3">
                    ₹{Number(invoice.gst_amount || 0).toLocaleString("en-IN")}
                  </td>
                </tr>

                <tr className="border-top">
                  <td colSpan={isWorkOrderInvoice ? 5 : 4} className="text-end fw-bold py-3 fs-5">
                    Total Invoice Amount (INR)
                  </td>
                  <td className="text-end fw-bold py-3 fs-5 border-top">
                    ₹{Number(invoice.total_amount || 0).toLocaleString("en-IN")}
                  </td>
                </tr>
              </tfoot>
            </Table>
          </div>
        </div>

        {/* GST Breakdown */}
        <Card className="border mb-4">
          <Card.Body className="p-3">
            <h6 className="fw-bold mb-3">GST Breakdown</h6>
            <Row>
              {cgstRate !== "0.00" && (
                <Col md={4} className="text-center">
                  <div className="p-2 border rounded">
                    <div className="fw-semibold">CGST</div>
                    <div className="text-muted small">{cgstRate}%</div>
                    <div className="fw-bold">₹{Number((invoice.base_amount * cgstRate / 100) || 0).toLocaleString("en-IN")}</div>
                  </div>
                </Col>
              )}
              {sgstRate !== "0.00" && (
                <Col md={4} className="text-center">
                  <div className="p-2 border rounded">
                    <div className="fw-semibold">SGST</div>
                    <div className="text-muted small">{sgstRate}%</div>
                    <div className="fw-bold">₹{Number((invoice.base_amount * sgstRate / 100) || 0).toLocaleString("en-IN")}</div>
                  </div>
                </Col>
              )}
              {igstRate !== "0.00" && (
                <Col md={4} className="text-center">
                  <div className="p-2 border rounded">
                    <div className="fw-semibold">IGST</div>
                    <div className="text-muted small">{igstRate}%</div>
                    <div className="fw-bold">₹{Number((invoice.base_amount * igstRate / 100) || 0).toLocaleString()}</div>
                  </div>
                </Col>
              )}
            </Row>
          </Card.Body>
        </Card>

        {/* Payment Summary */}
        <Row className="mb-4">
          <Col md={6}>
            <Card className="border h-100">
              <Card.Body>
                <h6 className="fw-bold mb-3 border-bottom pb-2">Payment Summary</h6>
                <div className="d-flex flex-column gap-2">
                <div className="d-flex justify-content-between">
                    <span>Total Paid Base Amount</span>
                    <span className="fw-semibold">₹{Number(paymentSummary.total_paid_base_amount || 0).toLocaleString("en-IN")}</span>
                  </div>
                   <div className="d-flex justify-content-between">
                      <span>Total GST Amount</span>
                      <span className="fw-semibold">
                        ₹{Number(totalGstPaid).toLocaleString("en-IN")}
                      </span>
                    </div>
                  <div className="d-flex justify-content-between">
                    <span>Total Amount Received</span>
                    <span className="fw-semibold">₹{Number(paymentSummary.total_received || 0).toLocaleString("en-IN")}</span>
                  </div>
                  {excessSummary?.is_excess && (
                    <div className="d-flex justify-content-between text-warning">
                      <span>Total Excess Amount</span>
                      <span className="fw-semibold">
                        ₹{Number(excessSummary.excess_total_amount || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}
                  <div className="d-flex justify-content-between">
                    <span>Remaining Amount</span>
                    <span className="fw-semibold">₹{Number(paymentSummary.remaining_amount || 0).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Total Payments</span>
                    <span>{paymentSummary.payment_count || 0}</span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={6}>
            <Card className="border h-100">
              <Card.Body>
                <h6 className="fw-bold mb-3 border-bottom pb-2">Payment Status</h6>
                <div className="d-flex flex-column gap-3">
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span>Status</span>
                      {getPaymentStatusBadge(paymentSummary.balance_status)}
                    </div>
                    <div className="text-muted small">
                      {paymentSummary.balance_status === 'paid' ? 'Invoice fully paid' :
                       paymentSummary.balance_status === 'partially_paid' ? 'Invoice partially paid' :
                       'Invoice pending payment'}
                    </div>
                  </div>
                  <div className="d-flex justify-content-between">
                    <div>
                      <div className="fw-semibold">{paymentSummary.paid_count || 0}</div>
                      <div className="text-muted small">Paid</div>
                    </div>
                    <div>
                      <div className="fw-semibold">{paymentSummary.pending_count || 0}</div>
                      <div className="text-muted small">Pending</div>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Payment History */}
        {paymentSummary.payments && paymentSummary.payments.length > 0 && (
          <Card className="border mb-4">
            <Card.Body>
              <h6 className="fw-bold mb-3 border-bottom pb-2">Payment History</h6>
              <div className="table-responsive">
                <Table borderless className="mb-0">
                  <thead className="border-bottom">
                    <tr>
                      <th className="fw-semibold">Payment Date</th>
                      <th className="fw-semibold">Base Amount</th>
                      <th className="fw-semibold">GST Amount</th>
                      <th className="fw-semibold">Total Amount</th>
                      <th className="fw-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentSummary.payments.map((payment, idx) => (
                      <tr key={idx} className={idx !== paymentSummary.payments.length - 1 ? 'border-bottom' : ''}>
                        <td className="py-2">{new Date(payment.payment_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                        <td className="py-2">₹{Number(payment.base_amount || 0).toLocaleString("en-IN")}</td>
                        <td className="py-2">₹{Number(payment.gst_amount || 0).toLocaleString("en-IN")}</td>
                        <td className="py-2 fw-semibold">₹{Number(payment.amount || 0).toLocaleString("en-IN")}</td>
                        <td className="py-2">
                          <Badge bg={payment.status === 'paid' ? 'success' : payment.status === 'pending' ? 'warning' : 'danger'} 
                                 className="px-2 py-1 rounded-pill">
                            {payment.status || 'N/A'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        )}

        {/* Terms & Conditions */}
        <Card className="border">
          <Card.Body>
            <h6 className="fw-bold mb-3 border-bottom pb-2">Commercial Terms and Conditions</h6>
            <div className="ms-3">
              <ol className="mb-0">
                <li className="mb-2">All other terms & conditions will remain the same as per RFQ / negotiation at TSM.</li>
                <li className="mb-2">
                  Material to be delivered at: TATA STEEL MINING LIMITED, Kalinganagar Industrial Growth Centre, 
                  PO - Jakhapura, Dist - Jajpur, PIN - 755026.
                </li>
                <li className="mb-2">Invoice to be raised at TATA STEEL MINING LIMITED.</li>
                <li className="mb-2">Validity: As per work order.</li>
                {paymentSummary.balance_status === 'partially_paid' && (
                  <li className="mb-2 fw-semibold">
                    <i className="bi bi-info-circle me-1"></i>
                    This invoice is partially paid. Remaining amount: ₹{Number(paymentSummary.remaining_amount || 0).toLocaleString()}
                  </li>
                )}
                {paymentSummary.balance_status === 'paid' && (
                  <li className="mb-2 fw-semibold text-success">
                    <i className="bi bi-check-circle me-1"></i>
                    This invoice has been fully paid.
                  </li>
                )}
                {excessSummary.is_excess && (
                  <li className="mb-2 fw-semibold">
                    <i className="bi bi-exclamation-triangle me-1"></i>
                    This invoice has exceeded the original work order amount by ₹{Number(excessSummary.excess_amount || 0).toLocaleString("en-IN")} ({excessSummary.excess_percentage}%).
                  </li>
                )}
              </ol>
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default InvoiceViewFullScreen;