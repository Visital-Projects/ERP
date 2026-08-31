// // src/components/PreviewExpenseModal.jsx
// import React from "react";
// import { Modal, Button, Table } from "react-bootstrap";
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";

// const PreviewExpenseModal = ({
//   show,
//   onHide,
//   previewData = [],
//   branchName = "",
//   handleDownloadExcel,
//   handleDownloadPDF
// }) => {
// //   const handleDownloadPDF = () => {
// //     const doc = new jsPDF();

// //     doc.setFontSize(14);
// //     doc.text(`Expense Report – ${branchName}`, 14, 20);

// //     const tableColumn = ["Date", "Description", "Subtotal", "Tax Total", "Total Amount"];
// //     const tableRows = [];

// //     previewData.forEach((row) => {
// //       if (row.type === "month") {
// //         tableRows.push([row.label, "", "", "", ""]);
// //       } else {
// //         tableRows.push([row.date, row.description, row.subtotal, row.tax_total, row.total_amount]);
// //       }
// //     });

// // autoTable(doc, {
// //   head: [tableColumn],
// //   body: tableRows,
// //   startY: 30,
// //   styles: { halign: "center" },
// //   headStyles: { fillColor: [22, 160, 133] },
// //   alternateRowStyles: { fillColor: [240, 240, 240] },
// // });

// //     doc.save(`Expense_Report_${branchName}.pdf`);
// //     onHide();
// //   };

//   return (
//     <Modal show={show} onHide={onHide} size="lg" centered scrollable>
//       <Modal.Header closeButton>
//         <Modal.Title>Preview Expense Report – {branchName}</Modal.Title>
//       </Modal.Header>
//       <Modal.Body className="table-responsive">
//         <Table hover striped className="text-center">
//           <thead className="table-light">
//             <tr>
//               <th>Date</th>
//               <th>Description</th>
//               <th>Subtotal</th>
//               <th>Tax Total</th>
//               <th>Total Amount</th>
//             </tr>
//           </thead>
//           <tbody>
//             {previewData.map((row, idx) =>
//               row.type === "month" ? (
//                 <tr key={idx} className="table-secondary fw-bold">
//                   <td colSpan={5}>{row.label}</td>
//                 </tr>
//               ) : (
//                 <tr key={idx}>
//                   <td>{row.date}</td>
//                   <td>{row.description}</td>
//                   <td>{row.subtotal}</td>
//                   <td>{row.tax_total}</td>
//                   <td>{row.total_amount}</td>
//                 </tr>
//               )
//             )}
//           </tbody>
//         </Table>
//       </Modal.Body>
//       <Modal.Footer>
//         <Button variant="secondary" onClick={onHide}>
//           Close
//         </Button>
//         <Button variant="success" onClick={handleDownloadExcel}>
//           Download Excel
//         </Button>
//         <Button variant="primary" onClick={handleDownloadPDF}>
//           Download PDF
//         </Button>
//       </Modal.Footer>
//     </Modal>
//   );
// };

// export default PreviewExpenseModal;




import React from "react";
import { Modal, Button, Table } from "react-bootstrap";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const PreviewExpenseModal = ({
  show,
  onHide,
  previewData = [],
  branchName = "",
  handleDownloadExcel,
  handleDownloadPDF
}) => {
  const wrapStyle = {
    maxWidth: "200px", // adjust width as needed
    whiteSpace: "normal",
    wordBreak: "break-word"
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered scrollable backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>Preview Expense Report – {branchName}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="table-responsive">
        <Table hover striped className="text-center">
          <thead className="table-light">
            <tr>
              <th>Date</th>
              <th style={wrapStyle}>Description</th>
              <th>Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {previewData.map((row, idx) =>
              row.type === "month" ? (
                <tr key={idx} className="table-secondary fw-bold">
                  <td colSpan={3}>{row.label}</td>
                </tr>
              ) : (
                <tr key={idx}>
                  <td>{row.date}</td>
                  <td style={wrapStyle}>{row.description}</td>
                  <td>{row.total_amount}</td>
                </tr>
              )
            )}
          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="success" onClick={handleDownloadExcel}>
          Download Excel
        </Button>
        <Button variant="primary" onClick={handleDownloadPDF}>
          Download PDF
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PreviewExpenseModal;
