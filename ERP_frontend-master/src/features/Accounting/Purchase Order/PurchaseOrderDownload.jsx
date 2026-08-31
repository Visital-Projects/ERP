// import React, { useEffect, useState } from "react"; 
// import { Button, Modal, Spinner, Table, Dropdown, OverlayTrigger, Tooltip, Accordion, Card } from "react-bootstrap";
// import { toast } from "react-toastify";
// import purchaseService from "../../../services/purchaseService";
// import * as XLSX from "xlsx";
// import jsPDF from "jspdf";

// const PurchaseOrderDownload = ({ poNumber }) => {
//   const [show, setShow] = useState(false);
//   const [poData, setPoData] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const fetchPreview = async () => {
//     try {
//       setLoading(true);
//       const res = await purchaseService.getPurchaseOrderFullDetails(poNumber);
//       if (res?.success) {
//         setPoData(res.data);
//       } else {
//         toast.error("Failed to load PO details for preview");
//       }
//     } catch (err) {
//       console.error("Error fetching PO details:", err);
//       toast.error("Error loading PO details");
//     } finally {
//       setLoading(false);
//     }
//   };

// const handleDownloadPDF = () => {
//   if (!poData) return;
  
//   try {
//     const doc = new jsPDF();
//     let yPosition = 20;
//     const pageWidth = doc.internal.pageSize.width;
//     const margin = 14;
//     const tableWidth = pageWidth - (2 * margin);

//     // Title
//     doc.setFontSize(16);
//     doc.text(`Purchase Order Details - ${poData.po_number}`, pageWidth / 2, yPosition, { align: 'center' });
//     yPosition += 15;

//     // Function to add table with header and data
//     const addTable = (title, headers, data, columnWidths) => {
//       // Check if we need new page
//       if (yPosition > 200) {
//         doc.addPage();
//         yPosition = 20;
//       }

//       // Add title
//       doc.setFontSize(12);
//       doc.text(title, margin, yPosition);
//       yPosition += 8;

//       // Table header
//       doc.setFillColor(200, 200, 200);
//       doc.rect(margin, yPosition, tableWidth, 8, 'F');
//       doc.setTextColor(0, 0, 0);
//       doc.setFontSize(10);
      
//       let xPosition = margin + 2;
//       headers.forEach((header, index) => {
//         doc.text(header, xPosition, yPosition + 6);
//         xPosition += columnWidths[index];
//       });
//       yPosition += 8;

//       // Table rows
//       doc.setFontSize(10);
//       data.forEach((row, rowIndex) => {
//         if (yPosition > 270) {
//           doc.addPage();
//           yPosition = 20;
//           // Add header again on new page
//           doc.setFillColor(200, 200, 200);
//           doc.rect(margin, yPosition, tableWidth, 8, 'F');
//           doc.setTextColor(0, 0, 0);
//           doc.setFontSize(10);
//           xPosition = margin + 2;
//           headers.forEach((header, index) => {
//             doc.text(header, xPosition, yPosition + 6);
//             xPosition += columnWidths[index];
//           });
//           yPosition += 8;
//           doc.setFontSize(7);
//         }

//         // Alternate row colors
//         if (rowIndex % 2 === 0) {
//           doc.setFillColor(245, 245, 245);
//           doc.rect(margin, yPosition, tableWidth, 8, 'F');
//         }

//         xPosition = margin + 2;
//         row.forEach((cell, cellIndex) => {
//           doc.text(cell.toString(), xPosition, yPosition + 6);
//           xPosition += columnWidths[cellIndex];
//         });
//         yPosition += 8;
//       });
//       yPosition += 10;
//     };

//     // Basic Information - As Simple Text (NOT in table)
//     doc.setFontSize(12);
//     doc.text("Basic Information", margin, yPosition);
//     yPosition += 8;
    
//     doc.setFontSize(10);
//     doc.text(`PO Number: ${poData.po_number}`, margin, yPosition);
//     yPosition += 6;
//     doc.text(`Vendor: ${poData.purchaseOrder?.vendor_name || 'N/A'}`, margin, yPosition);
//     yPosition += 6;
//     doc.text(`Total Invoice Amount: ${poData.total_invoice_amount || '0'}`, margin, yPosition);
//     yPosition += 6;
//     doc.text(`Profit Margin: ${poData.profit_calculation?.profit_margin || '0%'}`, margin, yPosition);
//     yPosition += 6;
//     doc.text(`Total Received: ${poData.total_received || '0'}`, margin, yPosition);
//     yPosition += 6;
//     doc.text(`Remaining Amount: ${poData.remaining_amount || '0'}`, margin, yPosition);
//     yPosition += 6;
//     doc.text(`Base Amount with GST: ${poData.base_amount_with_gst || '0'}`, margin, yPosition);
//     yPosition += 6;
//     doc.text(`Total Expenses: ${poData.total_expenses || '0'}`, margin, yPosition);
//     yPosition += 6;
//     doc.text(`Total Taxable Expenses: ${poData.total_taxable_expenses || '0'}`, margin, yPosition);
//     yPosition += 6;
//     doc.text(`Total Non-Taxable Expenses: ${poData.total_non_taxable_expenses || '0'}`, margin, yPosition);
//     yPosition += 6;
//     doc.text(`Total Salaries: ${poData.total_salaries || '0'}`, margin, yPosition);
//     yPosition += 15;

//     // Profit Calculation - As Simple Text (NOT in table)
//     if (poData.profit_calculation) {
//       doc.setFontSize(12);
//       doc.text("Profit Calculation", margin, yPosition);
//       yPosition += 8;
      
//       doc.setFontSize(10);
//       doc.text(`Total Income: ${poData.profit_calculation.total_income || '0'}`, margin, yPosition);
//       yPosition += 6;
//       doc.text(`Total Costs: ${poData.profit_calculation.total_costs || '0'}`, margin, yPosition);
//       yPosition += 6;
//       doc.text(`Net Profit: ${poData.profit_calculation.net_profit || '0'}`, margin, yPosition);
//       yPosition += 6;
//       doc.text(`Profit Margin: ${poData.profit_calculation.profit_margin || '0%'}`, margin, yPosition);
//       yPosition += 15;
//     }

//     // Items Table
//     if (poData.purchaseOrder?.items && poData.purchaseOrder.items.length > 0) {
//       const itemsData = poData.purchaseOrder.items.map(item => [
//         item.item_name || 'N/A',
//         item.quantity || '0',
//         item.unit_price || '0',
//         item.unit || 'N/A'
//       ]);
//       addTable(`Items (${poData.purchaseOrder.items.length})`, 
//         ["Item Name", "Quantity", "Unit Price", "Unit"], 
//         itemsData, 
//         [70, 30, 40, 40]
//       );
//     }

//     // Invoices Table
//     if (poData.invoices && poData.invoices.length > 0) {
//       const invoicesData = poData.invoices.map(invoice => [
//         invoice.id.toString(),
//         invoice.payment_amount || '0',
//         invoice.gst_amount || '0',
//         invoice.total_amount || '0',
//         invoice.remaining_amount || '0',
//         invoice.gst_type || 'N/A',
//         invoice.status || 'N/A'
//       ]);
//       addTable(`Invoices (${poData.invoices.length})`, 
//         ["ID", "Payment Amt", "GST Amt", "Total Amt", "Remaining", "GST Type", "Status"], 
//         invoicesData, 
//         [15, 25, 25, 25, 25, 30, 25]
//       );
//     }

//     // Taxable Expenses Table - ALL DATA
//     if (poData.taxable_expenses && poData.taxable_expenses.length > 0) {
//       const taxableData = poData.taxable_expenses.map(expense => [
//         expense.id.toString(),
//         expense.payment_date || 'N/A',
//         expense.description ? (expense.description.length > 40 ? expense.description.substring(0, 40) + '...' : expense.description) : 'No description',
//         expense.subtotal || '0',
//         expense.tax_total || '0',
//         expense.total_amount || '0',
//         expense.payments_status || 'N/A'
//       ]);
//       addTable(`Taxable Expenses (${poData.taxable_expenses.length}) - Total: ${poData.total_taxable_expenses || '0'}`, 
//         ["ID", "Date", "Description", "Subtotal", "Tax", "Total", "Status"], 
//         taxableData, 
//         [15, 25, 60, 25, 20, 25, 20]
//       );
//     }

//     // Non-Taxable Expenses Table - ALL DATA
//     if (poData.non_taxable_expenses && poData.non_taxable_expenses.length > 0) {
//       const nonTaxableData = poData.non_taxable_expenses.map(expense => [
//         expense.id.toString(),
//         expense.payment_date || 'N/A',
//         expense.description ? (expense.description.length > 40 ? expense.description.substring(0, 40) + '...' : expense.description) : 'No description',
//         expense.subtotal || '0',
//         expense.tax_total || '0',
//         expense.total_amount || '0',
//         expense.payments_status || 'N/A'
//       ]);
//       addTable(`Non-Taxable Expenses (${poData.non_taxable_expenses.length}) - Total: ${poData.total_non_taxable_expenses || '0'}`, 
//         ["ID", "Date", "Description", "Subtotal", "Tax", "Total", "Status"], 
//         nonTaxableData, 
//         [15, 25, 60, 25, 20, 25, 20]
//       );
//     }

//     // Employee Payslips Table - ALL DATA
//     if (poData.payslips && poData.payslips.length > 0) {
//       const payslipsData = poData.payslips.map(payslip => [
//         payslip.employee_id.toString(),
//         payslip.employee_name || 'N/A',
//         payslip.department || 'N/A',
//         payslip.designation || 'N/A',
//         payslip.basic_salary.toString(),
//         payslip.net_payble || '0',
//         // payslip.status || 'N/A'
//       ]);
//       addTable(`Employee Payslips (${poData.payslips.length}) - Total Salary: ${poData.total_salaries || '0'}`, 
//         ["Emp ID", "Name", "Department", "Designation", "Basic Salary", "Net Pay"], 
//         payslipsData, 
//         [20, 40, 35, 35, 25, 25, 20]
//       );
//     }

//     doc.save(`${poData.po_number}_complete_details.pdf`);
//   } catch (error) {
//     console.error("Error generating PDF:", error);
//     toast.error("Error generating PDF file");
//   }
// };

//   const handleDownloadExcel = () => {
//     if (!poData) return;
//     try {
//       const workbook = XLSX.utils.book_new();
//       const summaryData = [
//         {
//           "PO Number": poData.po_number,
//           "Vendor": poData.purchaseOrder?.vendor_name || 'N/A',
//           "Total Invoice Amount": poData.total_invoice_amount || '0',
//           "Profit Margin": poData.profit_calculation?.profit_margin || '0%',
//           "Total Received": poData.total_received || '0',
//           "Remaining Amount": poData.remaining_amount || '0',
//           "Base Amount with GST": poData.base_amount_with_gst || '0',
//           "Total Expenses": poData.total_expenses || '0',
//           "Total Taxable Expenses": poData.total_taxable_expenses || '0',
//           "Total Non-Taxable Expenses": poData.total_non_taxable_expenses || '0',
//           "Total Salaries": poData.total_salaries || '0'
//         }
//       ];
//       if (poData.profit_calculation) {
//         summaryData[0]["Total Income"] = poData.profit_calculation.total_income || '0';
//         summaryData[0]["Total Costs"] = poData.profit_calculation.total_costs || '0';
//         summaryData[0]["Net Profit"] = poData.profit_calculation.net_profit || '0';
//       }
//       const infoSheet = XLSX.utils.json_to_sheet(summaryData);
//       XLSX.utils.book_append_sheet(workbook, infoSheet, "Summary");
//       const itemsData = poData.purchaseOrder?.items || [];
//       if (itemsData.length > 0) XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(itemsData), "Items");
//       const invoicesData = poData.invoices || [];
//       if (invoicesData.length > 0) XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(invoicesData), "Invoices");
//       const taxableExpensesData = poData.taxable_expenses || [];
//       if (taxableExpensesData.length > 0) XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(taxableExpensesData), "Taxable Expenses");
//       const nonTaxableExpensesData = poData.non_taxable_expenses || [];
//       if (nonTaxableExpensesData.length > 0) XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(nonTaxableExpensesData), "Non-Taxable Expenses");
//       const payslipsData = poData.payslips || [];
//       if (payslipsData.length > 0) XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(payslipsData), "Employee Payslips");
//       XLSX.writeFile(workbook, `${poData.po_number}_full_details.xlsx`);
//     } catch (error) {
//       console.error("Error generating Excel:", error);
//       toast.error("Error generating Excel file");
//     }
//   };

//   const handleShow = async () => {
//     setShow(true);
//     if (!poData) await fetchPreview();
//   };

//   return (
//     <>
//       <OverlayTrigger placement="top" overlay={<Tooltip>Preview & Download</Tooltip>}>
//         <Dropdown>
//           <Dropdown.Toggle size="sm" variant="success" className="px-3 py-2">
//             <i className="bi bi-download"></i>
//           </Dropdown.Toggle>
//           <Dropdown.Menu>
//             <Dropdown.Item onClick={handleShow}>
//               <i className="bi bi-eye me-1"></i>Preview & Download
//             </Dropdown.Item>
//           </Dropdown.Menu>
//         </Dropdown>
//       </OverlayTrigger>
      
//       <Modal show={show} onHide={() => setShow(false)} size="xl" centered scrollable>
//         <Modal.Header closeButton>
//           <Modal.Title>Preview — Purchase Order {poData?.po_number}</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {loading ? (
//             <div className="text-center py-5">
//               <Spinner animation="border" />
//               <p className="mt-2 text-muted">Loading details...</p>
//             </div>
//           ) : poData ? (
//             <Accordion defaultActiveKey="0">
//               <Accordion.Item eventKey="0">
//                 <Accordion.Header>Basic Information</Accordion.Header>
//                 <Accordion.Body>
//                   <div className="row">
//                     <div className="col-md-6">
//                       <p><strong>Vendor:</strong> {poData.purchaseOrder?.vendor_name || 'N/A'}</p>
//                       <p><strong>Total Invoice Amount:</strong> {poData.total_invoice_amount || '0'}</p>
//                       <p><strong>Base Amount with GST:</strong> {poData.base_amount_with_gst || '0'}</p>
//                       <p><strong>Total Received:</strong> {poData.total_received || '0'}</p>
//                       <p><strong>Remaining Amount:</strong> {poData.remaining_amount || '0'}</p>
//                     </div>
//                     <div className="col-md-6">
//                       <p><strong>Total Expenses:</strong> {poData.total_expenses || '0'}</p>
//                       <p><strong>Total Taxable Expenses:</strong> {poData.total_taxable_expenses || '0'}</p>
//                       <p><strong>Total Non-Taxable Expenses:</strong> {poData.total_non_taxable_expenses || '0'}</p>
//                       <p><strong>Total Salaries:</strong> {poData.total_salaries || '0'}</p>
//                     </div>
//                   </div>
                  
//                   {poData.profit_calculation && (
//                     <Card className="mt-3">
//                       <Card.Header>
//                         <strong>Profit Calculation</strong>
//                       </Card.Header>
//                       <Card.Body>
//                         <p><strong>Total Income:</strong> {poData.profit_calculation.total_income || '0'}</p>
//                         <p><strong>Total Costs:</strong> {poData.profit_calculation.total_costs || '0'}</p>
//                         <p><strong>Net Profit:</strong> {poData.profit_calculation.net_profit || '0'}</p>
//                         <p><strong>Profit Margin:</strong> {poData.profit_calculation.profit_margin || '0%'}</p>
//                       </Card.Body>
//                     </Card>
//                   )}
//                 </Accordion.Body>
//               </Accordion.Item>

//               {/* Items */}
//               <Accordion.Item eventKey="1">
//                 <Accordion.Header>Items ({poData.purchaseOrder?.items?.length || 0})</Accordion.Header>
//                 <Accordion.Body>
//                   <Table striped bordered hover responsive size="sm">
//                     <thead>
//                       <tr>
//                         <th>Item Name</th>
//                         <th>Quantity</th>
//                         <th>Unit Price</th>
//                         <th>Unit</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {poData.purchaseOrder?.items && poData.purchaseOrder.items.length > 0 ? (
//                         poData.purchaseOrder.items.map((item) => (
//                           <tr key={item.id}>
//                             <td>{item.item_name}</td>
//                             <td>{item.quantity}</td>
//                             <td>{item.unit_price}</td>
//                             <td>{item.unit}</td>
//                           </tr>
//                         ))
//                       ) : (
//                         <tr>
//                           <td colSpan="4" className="text-center text-muted">No items found</td>
//                         </tr>
//                       )}
//                     </tbody>
//                   </Table>
//                 </Accordion.Body>
//               </Accordion.Item>

//               {/* Invoices */}
//               <Accordion.Item eventKey="2">
//                 <Accordion.Header>Invoices ({poData.invoices?.length || 0})</Accordion.Header>
//                 <Accordion.Body>
//                   <Table striped bordered hover responsive size="sm">
//                     <thead>
//                       <tr>
//                         <th>ID</th>
//                         <th>Payment Amount</th>
//                         <th>GST Amount</th>
//                         <th>Total Amount</th>
//                         <th>Remaining Amount</th>
//                         <th>GST Type</th>
//                         <th>Status</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {poData.invoices && poData.invoices.length > 0 ? (
//                         poData.invoices.map((invoice) => (
//                           <tr key={invoice.id}>
//                             <td>{invoice.id}</td>
//                             <td>{invoice.payment_amount}</td>
//                             <td>{invoice.gst_amount}</td>
//                             <td>{invoice.total_amount}</td>
//                             <td>{invoice.remaining_amount}</td>
//                             <td>{invoice.gst_type}</td>
//                             <td>{invoice.status}</td>
//                           </tr>
//                         ))
//                       ) : (
//                         <tr>
//                           <td colSpan="7" className="text-center text-muted">No invoices found</td>
//                         </tr>
//                       )}
//                     </tbody>
//                   </Table>
//                 </Accordion.Body>
//               </Accordion.Item>

//               {/* Taxable Expenses */}
//               <Accordion.Item eventKey="3">
//                 <Accordion.Header>Taxable Expenses ({poData.taxable_expenses?.length || 0}) - Total: {poData.total_taxable_expenses || '0'}</Accordion.Header>
//                 <Accordion.Body>
//                   <Table striped bordered hover responsive size="sm">
//                     <thead>
//                       <tr>
//                         <th>ID</th>
//                         <th>Date</th>
//                         <th>Description</th>
//                         <th>Subtotal</th>
//                         <th>Tax</th>
//                         <th>Total</th>
//                         <th>Status</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {poData.taxable_expenses && poData.taxable_expenses.length > 0 ? (
//                         poData.taxable_expenses.map((expense) => (
//                           <tr key={expense.id}>
//                             <td>{expense.id}</td>
//                             <td>{expense.payment_date}</td>
//                             <td>{expense.description || 'No description'}</td>
//                             <td>{expense.subtotal}</td>
//                             <td>{expense.tax_total}</td>
//                             <td>{expense.total_amount}</td>
//                             <td>{expense.payments_status}</td>
//                           </tr>
//                         ))
//                       ) : (
//                         <tr>
//                           <td colSpan="7" className="text-center text-muted">No taxable expenses found</td>
//                         </tr>
//                       )}
//                     </tbody>
//                   </Table>
//                 </Accordion.Body>
//               </Accordion.Item>

//               {/* Non-Taxable Expenses */}
//               <Accordion.Item eventKey="4">
//                 <Accordion.Header>Non-Taxable Expenses ({poData.non_taxable_expenses?.length || 0}) - Total: {poData.total_non_taxable_expenses || '0'}</Accordion.Header>
//                 <Accordion.Body>
//                   <Table striped bordered hover responsive size="sm">
//                     <thead>
//                       <tr>
//                         <th>ID</th>
//                         <th>Date</th>
//                         <th>Description</th>
//                         <th>Subtotal</th>
//                         <th>Tax</th>
//                         <th>Total</th>
//                         <th>Status</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {poData.non_taxable_expenses && poData.non_taxable_expenses.length > 0 ? (
//                         poData.non_taxable_expenses.map((expense) => (
//                           <tr key={expense.id}>
//                             <td>{expense.id}</td>
//                             <td>{expense.payment_date}</td>
//                             <td>{expense.description || 'No description'}</td>
//                             <td>{expense.subtotal}</td>
//                             <td>{expense.tax_total}</td>
//                             <td>{expense.total_amount}</td>
//                             <td>{expense.payments_status}</td>
//                           </tr>
//                         ))
//                       ) : (
//                         <tr>
//                           <td colSpan="7" className="text-center text-muted">No non-taxable expenses found</td>
//                         </tr>
//                       )}
//                     </tbody>
//                   </Table>
//                 </Accordion.Body>
//               </Accordion.Item>

//               {/* Employee Payslips */}
//               <Accordion.Item eventKey="5">
//                 <Accordion.Header>Employee Payslips ({poData.payslips?.length || 0}) - Total Salary: {poData.total_salaries || '0'}</Accordion.Header>
//                 <Accordion.Body>
//                   <Table striped bordered hover responsive size="sm">
//                     <thead>
//                       <tr>
//                         <th>Employee ID</th>
//                         <th>Name</th>
//                         <th>Department</th>
//                         <th>Designation</th>
//                         <th>Basic Salary</th>
//                         <th>Net Payable</th>
//                         <th>Status</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {poData.payslips && poData.payslips.length > 0 ? (
//                         poData.payslips.map((payslip) => (
//                           <tr key={payslip.employee_id}>
//                             <td>{payslip.employee_id}</td>
//                             <td>{payslip.employee_name}</td>
//                             <td>{payslip.department}</td>
//                             <td>{payslip.designation || 'N/A'}</td>
//                             <td>{payslip.basic_salary}</td>
//                             <td>{payslip.net_payble}</td>
//                             <td>{payslip.status}</td>
//                           </tr>
//                         ))
//                       ) : (
//                         <tr>
//                           <td colSpan="7" className="text-center text-muted">No payslips found</td>
//                         </tr>
//                       )}
//                     </tbody>
//                   </Table>
//                 </Accordion.Body>
//               </Accordion.Item>
//             </Accordion>
//           ) : (
//             <p className="text-muted">No preview data available</p>
//           )}
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="success" onClick={handleDownloadPDF}>
//             Download as PDF
//           </Button>
//           <Button variant="primary" onClick={handleDownloadExcel}>
//             Download as Excel
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </>
//   );
// };

// export default PurchaseOrderDownload;









import React, { useState } from "react";
import { Button, Modal, Spinner, Table, Dropdown, OverlayTrigger, Tooltip, Accordion, Card } from "react-bootstrap";
import { toast } from "react-toastify";
import purchaseService from "../../../services/purchaseService";
import { handleDownloadPDF, handleDownloadExcel } from "./DownloadHandlers";
import { FileEarmarkArrowDown, Eye } from "react-bootstrap-icons";

const PurchaseOrderDownload = ({ poNumber }) => {
  const [show, setShow] = useState(false);
  const [poData, setPoData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchPreview = async () => {
    try {
      setLoading(true);
      const res = await purchaseService.getPurchaseOrderFullDetails(poNumber);
      if (res?.success) {
        setPoData(res.data);
      } else {
        toast.error("Failed to load PO details for preview");
      }
    } catch (err) {
      console.error("Error fetching PO details:", err);
      toast.error("Error loading PO details");
    } finally {
      setLoading(false);
    }
  };

  const handleShow = async () => {
    setShow(true);
    if (!poData) await fetchPreview();
  };

  const handlePDFDownload = () => {
    handleDownloadPDF(poData);
  };

  const handleExcelDownload = () => {
    handleDownloadExcel(poData);
  };

  return (
    <>
      <OverlayTrigger placement="top" overlay={<Tooltip>Preview & Download</Tooltip>}>
        <Dropdown>
          <Dropdown.Toggle variant="light" size="sm" className="border">
           <FileEarmarkArrowDown size={18} />
          </Dropdown.Toggle>          
          <Dropdown.Menu>
            <Dropdown.Item onClick={handleShow}>
              <Eye size={15} className="me-2" />
              Preview Summary
            </Dropdown.Item>
            <Dropdown.Item
              onClick={async () => {
                if (!poData) await fetchPreview();
                handleDownloadPDF(poData);
              }}
            >
              <i className="bi bi-filetype-pdf me-2 text-danger"></i> Download as PDF
            </Dropdown.Item>

            <Dropdown.Item
              onClick={async () => {
                if (!poData) await fetchPreview();
                handleDownloadExcel(poData);
              }}
            >
              <i className="bi bi-file-earmark-excel me-2 text-success"></i> Download as Excel
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </OverlayTrigger>
      
      <Modal show={show} onHide={() => setShow(false)} size="xl" centered scrollable backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Preview — Purchase Order {poData?.po_number}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
              <p className="mt-2 text-muted">Loading details...</p>
            </div>
          ) : poData ? (
            <Accordion defaultActiveKey="0">
              <Accordion.Item eventKey="0">
                <Accordion.Header>Basic Information</Accordion.Header>
                <Accordion.Body>
                  <div className="row">
                    <div className="col-md-6">
                      <p><strong>Vendor:</strong> {poData.purchaseOrder?.vendor_name || 'N/A'}</p>
                      <p><strong>Total Invoice Amount:</strong> {poData.total_invoice_amount || '0'}</p>
                      <p><strong>Base Amount with GST:</strong> {poData.base_amount_with_gst || '0'}</p>
                      <p><strong>Total Received:</strong> {poData.total_received || '0'}</p>
                      <p><strong>Remaining Amount:</strong> {poData.remaining_amount || '0'}</p>
                    </div>
                    <div className="col-md-6">
                      <p><strong>Total Expenses:</strong> {poData.total_expenses || '0'}</p>
                      <p><strong>Total Taxable Expenses:</strong> {poData.total_taxable_expenses || '0'}</p>
                      <p><strong>Total Non-Taxable Expenses:</strong> {poData.total_non_taxable_expenses || '0'}</p>
                      <p><strong>Total Salaries:</strong> {poData.total_salaries || '0'}</p>
                    </div>
                  </div>
                  
                  {poData.profit_calculation && (
                    <Card className="mt-3">
                      <Card.Header>
                        <strong>Profit Calculation</strong>
                      </Card.Header>
                      <Card.Body>
                        <p><strong>Total Income:</strong> {poData.profit_calculation.total_income || '0'}</p>
                        <p><strong>Total Costs:</strong> {poData.profit_calculation.total_costs || '0'}</p>
                        <p><strong>Net Profit:</strong> {poData.profit_calculation.net_profit || '0'}</p>
                        <p><strong>Profit Margin:</strong> {poData.profit_calculation.profit_margin || '0%'}</p>
                      </Card.Body>
                    </Card>
                  )}
                </Accordion.Body>
              </Accordion.Item>

              {/* Items */}
              <Accordion.Item eventKey="1">
                <Accordion.Header>Items ({poData.purchaseOrder?.items?.length || 0})</Accordion.Header>
                <Accordion.Body>
                  <Table striped bordered hover responsive size="sm">
                    <thead>
                      <tr>
                        <th>Item Name</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Unit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {poData.purchaseOrder?.items && poData.purchaseOrder.items.length > 0 ? (
                        poData.purchaseOrder.items.map((item) => (
                          <tr key={item.id}>
                            <td>{item.item_name}</td>
                            <td>{item.quantity}</td>
                            <td>{item.unit_price}</td>
                            <td>{item.unit}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="text-center text-muted">No items found</td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Accordion.Body>
              </Accordion.Item>

              {/* Invoices */}
              <Accordion.Item eventKey="2">
                <Accordion.Header>Invoices ({poData.invoices?.length || 0})</Accordion.Header>
                <Accordion.Body>
                  <Table striped bordered hover responsive size="sm">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Payment Amount</th>
                        <th>GST Amount</th>
                        <th>Total Amount</th>
                        <th>Remaining Amount</th>
                        <th>GST Type</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {poData.invoices && poData.invoices.length > 0 ? (
                        poData.invoices.map((invoice) => (
                          <tr key={invoice.id}>
                            <td>{invoice.id}</td>
                            <td>{invoice.payment_amount}</td>
                            <td>{invoice.gst_amount}</td>
                            <td>{invoice.total_amount}</td>
                            <td>{invoice.remaining_amount}</td>
                            <td>{invoice.gst_type}</td>
                            <td>{invoice.status}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="text-center text-muted">No invoices found</td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Accordion.Body>
              </Accordion.Item>

              {/* Taxable Expenses */}
              <Accordion.Item eventKey="3">
                <Accordion.Header>Taxable Expenses ({poData.taxable_expenses?.length || 0}) - Total: {poData.total_taxable_expenses || '0'}</Accordion.Header>
                <Accordion.Body>
                  <Table striped bordered hover responsive size="sm">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Subtotal</th>
                        <th>Tax</th>
                        <th>Total</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {poData.taxable_expenses && poData.taxable_expenses.length > 0 ? (
                        poData.taxable_expenses.map((expense) => (
                          <tr key={expense.id}>
                            <td>{expense.id}</td>
                            <td>{expense.payment_date}</td>
                            <td>{expense.description || 'No description'}</td>
                            <td>{expense.subtotal}</td>
                            <td>{expense.tax_total}</td>
                            <td>{expense.total_amount}</td>
                            <td>{expense.payments_status}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="text-center text-muted">No taxable expenses found</td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Accordion.Body>
              </Accordion.Item>

              {/* Non-Taxable Expenses */}
              <Accordion.Item eventKey="4">
                <Accordion.Header>Non-Taxable Expenses ({poData.non_taxable_expenses?.length || 0}) - Total: {poData.total_non_taxable_expenses || '0'}</Accordion.Header>
                <Accordion.Body>
                  <Table striped bordered hover responsive size="sm">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Subtotal</th>
                        <th>Tax</th>
                        <th>Total</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {poData.non_taxable_expenses && poData.non_taxable_expenses.length > 0 ? (
                        poData.non_taxable_expenses.map((expense) => (
                          <tr key={expense.id}>
                            <td>{expense.id}</td>
                            <td>{expense.payment_date}</td>
                            <td>{expense.description || 'No description'}</td>
                            <td>{expense.subtotal}</td>
                            <td>{expense.tax_total}</td>
                            <td>{expense.total_amount}</td>
                            <td>{expense.payments_status}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="text-center text-muted">No non-taxable expenses found</td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Accordion.Body>
              </Accordion.Item>

              {/* Employee Payslips */}
              <Accordion.Item eventKey="5">
                <Accordion.Header>Employee Payslips ({poData.payslips?.length || 0}) - Total Salary: {poData.total_salaries || '0'}</Accordion.Header>
                <Accordion.Body>
                  <Table striped bordered hover responsive size="sm">
                    <thead>
                      <tr>
                        <th>Employee ID</th>
                        <th>Name</th>
                        <th>Department</th>
                        <th>Designation</th>
                        <th>Basic Salary</th>
                        <th>Net Payable</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {poData.payslips && poData.payslips.length > 0 ? (
                        poData.payslips.map((payslip) => (
                          <tr key={payslip.employee_id}>
                            <td>{payslip.employee_id}</td>
                            <td>{payslip.employee_name}</td>
                            <td>{payslip.department}</td>
                            <td>{payslip.designation || 'N/A'}</td>
                            <td>{payslip.basic_salary}</td>
                            <td>{payslip.net_payble}</td>
                            <td>{payslip.status}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="text-center text-muted">No payslips found</td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          ) : (
            <p className="text-muted">No preview data available</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={handlePDFDownload}>
            Download as PDF
          </Button>
          <Button variant="primary" onClick={handleExcelDownload}>
            Download as Excel
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PurchaseOrderDownload;