// // src/pages/Accounting/BranchExpenses.jsx
// import React, { useEffect, useState } from "react";
// import {
//   Table,
//   Badge,
//   Button,
//   Row,
//   Col,
//   Card,
//   Form,
//   Modal,
//   Spinner,
// } from "react-bootstrap";
// import expenseService from "../../../services/expensessService";
// import { toast } from "react-toastify";
// import { Plus, Download } from "react-bootstrap-icons";
// import * as XLSX from "xlsx";
// import ConfirmDeleteModal from "../../../components/ConfirmDeleteModal";
// import { useNavigate } from "react-router-dom";

// const BranchExpenses = () => {
//   const navigate = useNavigate();
//   const [expenses, setExpenses] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [entriesPerPage, setEntriesPerPage] = useState(10);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [paymentDate, setPaymentDate] = useState("");
//   const [periodType, setPeriodType] = useState("");
//   const [filterValue, setFilterValue] = useState("");
//   const [showViewModal, setShowViewModal] = useState(false);
//   const [selectedExpense, setSelectedExpense] = useState(null);
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");

//   const months = [
//     { name: "January", value: "01" },
//     { name: "February", value: "02" },
//     { name: "March", value: "03" },
//     { name: "April", value: "04" },
//     { name: "May", value: "05" },
//     { name: "June", value: "06" },
//     { name: "July", value: "07" },
//     { name: "August", value: "08" },
//     { name: "September", value: "09" },
//     { name: "October", value: "10" },
//     { name: "November", value: "11" },
//     { name: "December", value: "12" },
//   ];

//   const years = ["2023", "2024", "2025", "2026"];

//   // Fetch all expenses
//   const fetchExpenses = async () => {
//     try {
//       setLoading(true);
//       const res = await expenseService.getAllExpenses();
//       setExpenses(res?.data || []);
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to fetch expenses");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchExpenses();
//   }, []);

//   // Delete expense
//   const handleDelete = (id) => {
//     ConfirmDeleteModal({
//       title: "Delete Expense",
//       message: "This action cannot be undone. Continue?",
//       iconColor: "#ff0000",
//       onConfirm: async () => {
//         try {
//           await expenseService.deleteExpense(id);
//           fetchExpenses();
//           toast.success("Expense deleted successfully", { icon: false });
//         } catch (err) {
//           console.error(err);
//           toast.error("Failed to delete expense");
//         }
//       },
//     });
//   };

//   // Filtered expenses
//   const filteredExpenses = expenses.filter((expense) => {
//     const matchesSearch = searchTerm
//       ? expense.description
//           ?.toLowerCase()
//           .includes(searchTerm.toLowerCase()) ||
//         expense.id?.toString().includes(searchTerm)
//       : true;
//     const matchesDate = paymentDate ? expense.payment_date === paymentDate : true;
//     const matchesStart = startDate ? expense.payment_date >= startDate : true;
//     const matchesEnd = endDate ? expense.payment_date <= endDate : true;
//     return matchesSearch && matchesDate && matchesStart && matchesEnd;
//   });

//   const indexOfLast = currentPage * entriesPerPage;
//   const indexOfFirst = indexOfLast - entriesPerPage;
//   const currentExpenses = filteredExpenses.slice(indexOfFirst, indexOfLast);
//   const totalPages = Math.ceil(filteredExpenses.length / entriesPerPage) || 1;

//   // Build FY options
//   const fyOptions = years.slice(0, -1).map((y, i) => {
//     const nextYear = years[i + 1];
//     return { value: `${y}-${nextYear}`, label: `Apr ${y} - Mar ${nextYear}` };
//   });

//   // Excel export
//   const handleDownloadExcel = () => {
//     if (expenses.length === 0) {
//       toast.warning("No expenses found.");
//       return;
//     }

//     const filtered = expenses.filter((exp) => {
//       const expDate = new Date(exp.payment_date);
//       const expIso = expDate.toISOString().split("T")[0];
//       switch (periodType) {
//         case "daily":
//           return expIso === filterValue;
//         case "monthly":
//           const m = (expDate.getMonth() + 1).toString().padStart(2, "0");
//           return m === filterValue;
//         case "fy":
//           if (!filterValue) return true;
//           const [startYear, endYear] = filterValue.split("-").map(Number);
//           const fyStart = new Date(startYear, 3, 1);
//           const fyEnd = new Date(endYear, 2, 31);
//           return expDate >= fyStart && expDate <= fyEnd;
//         default:
//           return true;
//       }
//     });

//     if (filtered.length === 0) {
//       toast.warning("No expenses match selected filters.");
//       return;
//     }

//     // Group by month
//     const grouped = {};
//     filtered.forEach((exp) => {
//       if (!exp.payment_date) return;
//       const d = new Date(exp.payment_date);
//       const m = months[d.getMonth()].name;
//       if (!grouped[m]) grouped[m] = [];
//       grouped[m].push(exp);
//     });

//     const sheetData = [];
//     const merges = [];

//     sheetData.push([`Branch Expense Report – All Branches`]);
//     merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } });
//     sheetData.push([]);

//     let rowIndex = 2;
//     Object.keys(grouped).forEach((month) => {
//       sheetData.push([month]);
//       merges.push({ s: { r: rowIndex, c: 0 }, e: { r: rowIndex, c: 6 } });
//       rowIndex++;

//       sheetData.push([
//         "ID",
//         "Branch ID",
//         "Payment Date",
//         "Subtotal",
//         "Tax Total",
//         "Total Amount",
//         "Status",
//       ]);
//       rowIndex++;

//       grouped[month].forEach((exp) => {
//         sheetData.push([
//           exp.id,
//           exp.branch_id,
//           exp.payment_date,
//           exp.subtotal,
//           exp.tax_total,
//           exp.total_amount,
//           exp.status,
//         ]);
//         rowIndex++;
//       });

//       sheetData.push([]);
//       rowIndex++;
//     });

//     const ws = XLSX.utils.aoa_to_sheet(sheetData);
//     ws["!merges"] = merges;
//     ws["!cols"] = [
//       { wch: 10 },
//       { wch: 12 },
//       { wch: 15 },
//       { wch: 15 },
//       { wch: 12 },
//       { wch: 15 },
//       { wch: 12 },
//     ];

//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Expense Report");
//     XLSX.writeFile(wb, `All_Branch_Expense_Report.xlsx`);
//   };

//   if (loading)
//     return (
//       <div className="text-center py-5">
//         <Spinner animation="border" />
//       </div>
//     );

//   return (
//     <div className="container-fluid py-3 my-4">
//       <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
//         <h4>All Branch Expenses</h4>
//         <Button
//           size="sm"
//           className="rounded-1"
//           variant="success"
//           onClick={() => navigate("/accounting/expensess/create")}
//         >
//           <Plus />
//         </Button>
//       </div>

// {/* Filter + Search + Download */}
//       <Card className="p-3 mb-3">
//         <Row className="align-items-end justify-content-end flex-wrap g-2">
//           {/* Search by text */}
//           <Col md={2}>
//             <Form.Group>
//               <Form.Label>Search</Form.Label>
//               <Form.Control
//                 type="text"
//                 placeholder="Search by ID or Description"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </Form.Group>
//           </Col>

//           {/* Period type */}
//           <Col md={2}>
//             <Form.Group>
//               <Form.Label>Select Period</Form.Label>
//               <Form.Select
//                 value={periodType}
//                 onChange={(e) => {
//                   setPeriodType(e.target.value);
//                   setFilterValue("");
//                 }}
//               >
//                 <option value="">All</option>
//                 <option value="daily">Daily</option>
//                 <option value="monthly">Monthly</option>
//                 <option value="fy">Financial Year</option>
//               </Form.Select>
//             </Form.Group>
//           </Col>

//           {/* Period value */}
//           {periodType && (
//             <Col md={2}>
//               <Form.Group>
//                 <Form.Label>
//                   {periodType === "daily" && "Select Date"}
//                   {periodType === "monthly" && "Select Month"}
//                   {periodType === "fy" && "Select Financial Year"}
//                 </Form.Label>
//                 {periodType === "daily" && (
//                   <Form.Control
//                     type="date"
//                     value={filterValue}
//                     onChange={(e) => setFilterValue(e.target.value)}
//                   />
//                 )}
//                 {periodType === "monthly" && (
//                   <Form.Select
//                     value={filterValue}
//                     onChange={(e) => setFilterValue(e.target.value)}
//                   >
//                     <option value="">Select Month</option>
//                     {months.map((m) => (
//                       <option key={m.value} value={m.value}>
//                         {m.name}
//                       </option>
//                     ))}
//                   </Form.Select>
//                 )}
//                 {periodType === "fy" && (
//                   <Form.Select
//                     value={filterValue}
//                     onChange={(e) => setFilterValue(e.target.value)}
//                   >
//                     <option value="">Select Financial Year</option>
//                     {fyOptions.map((fy) => (
//                       <option key={fy.value} value={fy.value}>
//                         {fy.label}
//                       </option>
//                     ))}
//                   </Form.Select>
//                 )}
//               </Form.Group>
//             </Col>
//           )}

//           {/* Start Date */}
//           <Col md={2}>
//             <Form.Group>
//               <Form.Label>Start Date</Form.Label>
//               <Form.Control
//                 type="date"
//                 value={startDate}
//                 onChange={(e) => setStartDate(e.target.value)}
//               />
//             </Form.Group>
//           </Col>

//           {/* End Date */}
//           <Col md={2}>
//             <Form.Group>
//               <Form.Label>End Date</Form.Label>
//               <Form.Control
//                 type="date"
//                 value={endDate}
//                 onChange={(e) => setEndDate(e.target.value)}
//               />
//             </Form.Group>
//           </Col>

//           {/* Reset Filters */}
//           <Col md={1}>
//             <Button
//               variant="danger"
//               onClick={() => {
//                 setSearchTerm("");
//                 setPeriodType("");
//                 setFilterValue("");
//                 setStartDate("");
//                 setEndDate("");
//               }}
//             >
//               <i className="bi bi-arrow-clockwise"></i>
//             </Button>
//           </Col>

//           {/* Excel Download */}
//           <Col md={1}>
//             <Button
//               className="w-100"
//               variant="success"
//               onClick={handleDownloadExcel}
//               title="Download Excel"
//             >
//               <Download />
//             </Button>
//           </Col>
//         </Row>
//       </Card>
//       {/* Expenses Table */}
//       <Card className="p-4 shadow-sm">
//         <div className="table-responsive">
//           <Table hover className="text-center">
//             <thead className="table-light">
//               <tr>
//                 <th>#</th>
//                 {/* <th>Branch ID</th> */}
//                 <th>Payment Date</th>
//                 <th>Subtotal</th>
//                 <th>Tax Total</th>
//                 <th>Total Amount</th>
//                 <th>Status</th>
//                 <th>Description</th>
//                 <th>Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {currentExpenses.length > 0 ? (
//                 currentExpenses.map((exp, idx) => (
//                   <tr key={exp.id}>
//                     <td>{idx + 1}</td>
//                     {/* <td>{exp.branch_id}</td> */}
//                     <td>{new Date(exp.payment_date).toLocaleDateString()}</td>
//                     <td>{exp.subtotal}</td>
//                     <td>{exp.tax_total}</td>
//                     <td>{exp.total_amount}</td>
//                     <td>
//                       <Badge
//                         bg={exp.payments_status?.toLowerCase() === "paid" ? "success" : "warning"}
//                       >
//                         {exp.payments_status}
//                       </Badge>
//                     </td>
//                     <td>{exp.description}</td>
//                     <td>
//                       <Button
//                         variant="warning"
//                         size="sm"
//                         className="me-2"
//                         onClick={() => {
//                           setSelectedExpense(exp);
//                           setShowViewModal(true);
//                         }}
//                       >
//                         <i className="bi bi-eye text-white"></i>
//                       </Button>
//                       {/* Document Download Button */}
//                       {exp.document && (
//                         <Button
//                           variant="success"
//                           size="sm"
//                           className="me-2"
//                           onClick={async () => {
//                             try {
//                               const getFileUrl = (path) => {
//                                 if (!path) return null;
//                                 if (path.startsWith("http")) return path;
//                                 return `https://erpcopy.vnvision.in/${path.replace(/^\/+/, "")}`;
//                               };

//                               const fileUrl = getFileUrl(exp.document);
//                               if (!fileUrl) throw new Error("Invalid document path");

//                               const response = await fetch(fileUrl);
//                               if (!response.ok) throw new Error("Failed to fetch document");

//                               const blob = await response.blob();
//                               const url = window.URL.createObjectURL(blob);
//                               const link = document.createElement("a");
//                               link.href = url;
//                               link.download = exp.document.split("/").pop();
//                               document.body.appendChild(link);
//                               link.click();
//                               link.remove();
//                               window.URL.revokeObjectURL(url);
//                             } catch (err) {
//                               console.error(err);
//                               toast.error("Failed to download document");
//                             }
//                           }}
//                           title="Download Document"
//                         >
//                           <i className="bi bi-file-earmark-arrow-down text-white"></i>
//                         </Button>
//                       )}
//                       <Button
//                         variant="info"
//                         size="sm"
//                         className="me-2"
//                         onClick={() =>
//                           navigate(`/accounting/expenses/edit/${exp.id}`)
//                         }
//                       >
//                         <i className="bi bi-pencil text-white"></i>
//                       </Button>

//                       {/* Delete Expense */}
//                       <Button
//                         variant="danger"
//                         size="sm"
//                         onClick={() => handleDelete(exp.id)}
//                       >
//                         <i className="bi bi-trash text-white"></i>
//                       </Button>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan={9} className="text-center">
//                     No expenses found
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </Table>
//         </div>

//         {/* Pagination */}
//         <div className="d-flex justify-content-between align-items-center mt-3">
//           <Form.Select
//             style={{ width: "100px" }}
//             value={entriesPerPage}
//             onChange={(e) => {
//               setEntriesPerPage(parseInt(e.target.value));
//               setCurrentPage(1);
//             }}
//           >
//             <option value={5}>5</option>
//             <option value={10}>10</option>
//             <option value={25}>25</option>
//           </Form.Select>
//           <div>
//             <Button
//               onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
//               disabled={currentPage === 1}
//               className="me-2"
//             >
//               &lt;
//             </Button>
//             <span>
//               {currentPage} / {totalPages}
//             </span>
//             <Button
//               onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
//               disabled={currentPage === totalPages}
//               className="ms-2"
//             >
//               &gt;
//             </Button>
//           </div>
//         </div>
//       </Card>

//       {/* View Modal */}
//       <Modal
//         show={showViewModal}
//         onHide={() => setShowViewModal(false)}
//         size="lg"
//         centered
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>Expense Details</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {selectedExpense ? (
//             <div>
//               <p>
//                 <strong>Expense ID:</strong> {selectedExpense.id}
//               </p>
//               <p>
//                 <strong>Branch ID:</strong> {selectedExpense.branch_id}
//               </p>
//               <p>
//                 <strong>Payment Date:</strong>{" "}
//                 {new Date(selectedExpense.payment_date).toLocaleDateString()}
//               </p>
//               <p>
//                 <strong>Subtotal:</strong> {selectedExpense.subtotal}
//               </p>
//               <p>
//                 <strong>Tax Total:</strong> {selectedExpense.tax_total}
//               </p>
//               <p>
//                 <strong>Total Amount:</strong> {selectedExpense.total_amount}
//               </p>
//               <p>
//                 <strong>Status:</strong> {selectedExpense.status}
//               </p>
//               <p>
//                 <strong>Description:</strong> {selectedExpense.description}
//               </p>
//             </div>
//           ) : (
//             <p>Loading...</p>
//           )}
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowViewModal(false)}>
//             Close
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// };

// export default BranchExpenses;
