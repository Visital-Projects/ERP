// import React, { useEffect, useState } from "react";
// import { Modal, Button, Form } from "react-bootstrap";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "bootstrap-icons/font/bootstrap-icons.css";

// import {
//   getComplaints,
//   createComplaint,
//   updateComplaint,
//   deleteComplaint,
//   getEmployees,
// } from "../../../services/hrmService";
// import { confirmAlert } from "react-confirm-alert";
// import "react-confirm-alert/src/react-confirm-alert.css";

// import { useNavigate, useLocation } from "react-router-dom"; // ✅ Added
// import BreadCrumb from "../../../components/BreadCrumb";

// const ComplaintList = () => {
//   const [complaints, setComplaints] = useState([]);
//   const [employees, setEmployees] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [editId, setEditId] = useState(null);

//   const navigate = useNavigate(); // ✅ Added
//   const location = useLocation(); // ✅ Added
//   const [formData, setFormData] = useState({
//     complaint_from: "",
//     complaint_against: "",
//     title: "",
//     complaint_date: "",
//     description: "",
//   });

//   const [isClosingModal, setIsClosingModal] = useState(false); // ✅ animation state

//   const [searchTerm, setSearchTerm] = useState("");
//   const [entriesPerPage, setEntriesPerPage] = useState(5);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [isClosing, setIsClosing] = useState(false);
//   const [isClosingView, setIsClosingView] = useState(false);

//   useEffect(() => {
//     loadComplaints();
//     loadEmployees();
//   }, []);

//   const loadComplaints = async () => {
//     const data = await getComplaints();
//     setComplaints(Array.isArray(data) ? data : []);
//   };

//   const loadEmployees = async () => {
//     const data = await getEmployees();
//     setEmployees(Array.isArray(data) ? data : []);
//   };

//   const handleShow = () => {
//     setFormData({
//       complaint_from: "",
//       complaint_against: "",
//       title: "",
//       complaint_date: "",
//       description: "",
//     });
//     setEditId(null);
//     setShowModal(true);
//   };

//   const handleEdit = (complaint) => {
//     setFormData({
//       complaint_from: complaint.complaint_from,
//       complaint_against: complaint.complaint_against,
//       title: complaint.title,
//       complaint_date: complaint.complaint_date,
//       description: complaint.description,
//     });
//     setEditId(complaint.id);
//     setShowModal(true);
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async () => {
//     try {
//       if (editId) {
//         await updateComplaint(editId, formData);
//       } else {
//         await createComplaint(formData);
//       }
//       setShowModal(false);
//       loadComplaints();
//     } catch (error) {
//       alert("Error saving complaint.");
//     }
//   };

//   // const handleDelete = async (id) => {
//   //   if (window.confirm("Are you sure you want to delete this complaint?")) {
//   //     try {
//   //       await deleteComplaint(id);
//   //       loadComplaints();
//   //     } catch (error) {
//   //       alert("Error deleting complaint.");
//   //     }
//   //   }
//   // };

//   // Get employee name by employee_id

//   const handleDelete = (id) => {
//     confirmAlert({
//       customUI: ({ onClose }) => (
//         <div className="custom-confirm-modal bg-white p-4 rounded shadow text-center">
//           <div style={{ fontSize: "50px", color: "#ff9900" }}>❗</div>
//           <h4 className="fw-bold mt-2">Are you sure?</h4>
//           <p>This action cannot be undone. Do you want to continue?</p>
//           <div className="d-flex justify-content-center mt-3">
//             <button className="btn btn-danger me-2 px-4" onClick={onClose}>
//               No
//             </button>
//             <button
//               className="btn btn-success px-4"
//               onClick={async () => {
//                 try {
//                   await deleteComplaint(id); // ✅ delete complaint
//                   await loadComplaints(); // ✅ refresh complaints
//                 } catch (error) {
//                   alert("Error deleting complaint."); // ✅ error handling
//                 }
//                 onClose();
//               }}
//             >
//               Yes
//             </button>
//           </div>
//         </div>
//       ),
//     });
//   };

//   // ✅ Modal close with animation
//   const closeModal = () => {
//     setIsClosingModal(true);
//     setTimeout(() => {
//       setShowModal(false);
//       setIsClosingModal(false);
//     }, 400);
//   };

//   const getEmployeeName = (empId) => {
//     const emp = employees.find(
//       (e) => e.employee_id.toString() === empId.toString()
//     );
//     return emp ? emp.name : "N/A";
//   };

//   // Filter + Pagination
//   const filteredComplaints = complaints.filter(
//     (c) =>
//       getEmployeeName(c.complaint_from)
//         .toLowerCase()
//         .includes(searchTerm.toLowerCase()) ||
//       getEmployeeName(c.complaint_against)
//         .toLowerCase()
//         .includes(searchTerm.toLowerCase()) ||
//       (c.title || "").toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   const indexOfLastItem = currentPage * entriesPerPage;
//   const indexOfFirstItem = indexOfLastItem - entriesPerPage;
//   const currentItems = filteredComplaints.slice(
//     indexOfFirstItem,
//     indexOfLastItem
//   );
//   const pageNumbers = Array.from(
//     { length: Math.ceil(filteredComplaints.length / entriesPerPage) },
//     (_, i) => i + 1
//   );

//   return (
//     <div className="container mt-4">
//       {/* ✅ Modal Animation Styles */}
//       <style>{`
//         @keyframes slideInUp {
//           from { transform: translateY(100%); opacity: 0; }
//           to { transform: translateY(0); opacity: 1; }
//         }
//         @keyframes slideOutUp {
//           from { transform: translateY(0); opacity: 1; }
//           to { transform: translateY(-100%); opacity: 0; }
//         }
//         .custom-slide-modal.open .modal-dialog {
//           animation: slideInUp 0.7s ease forwards;
//         }
//         .custom-slide-modal.closing .modal-dialog {
//           animation: slideOutUp 0.7s ease forwards;
//         }
//       `}</style>

//       <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
//         <div className="d-flex align-items-center gap-3 flex-wrap">
//           <div>
//             <h4 className="fw-bold mb-0">Manage Complaints</h4>
//             <BreadCrumb pathname={location.pathname} onNavigate={navigate} />
//           </div>
//         </div>
//         <Button onClick={handleShow} className="btn btn-success">
//           <i className="bi bi-plus-lg"></i>
//         </Button>
//       </div>

//       <div className="card p-3 shadow-sm rounded-4">
//         {/* Controls */}
//         <div className="d-flex justify-content-between align-items-center mb-3">
//           <div className="d-flex align-items-center">
//             <select
//               className="form-select form-select-sm"
//               style={{ width: "80px" }}
//               value={entriesPerPage}
//               onChange={(e) => {
//                 setEntriesPerPage(Number(e.target.value));
//                 setCurrentPage(1);
//               }}
//             >
//               {[5, 10, 25, 50, 100].map((n) => (
//                 <option key={n} value={n}>
//                   {n}
//                 </option>
//               ))}
//             </select>
//             <span className="ms-2">entries per page</span>
//           </div>
//           <input
//             type="text"
//             className="form-control form-control-sm"
//             placeholder="Search..."
//             style={{ maxWidth: "250px" }}
//             value={searchTerm}
//             onChange={(e) => {
//               setSearchTerm(e.target.value);
//               setCurrentPage(1);
//             }}
//           />
//         </div>

//         {/* Table */}
//         <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
//           <table className="table table-borderless align-middle text-nowrap mb-0 table-striped">
//             <thead className="bg-light">
//               <tr>
//                 <th>From</th>
//                 <th>Against</th>
//                 <th>Title</th>
//                 <th>Date</th>
//                 <th>Description</th>
//                 <th className="text-center">Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {currentItems.length > 0 ? (
//                 currentItems.map((item) => (
//                   <tr key={item.id}>
//                     <td>{getEmployeeName(item.complaint_from)}</td>
//                     <td>{getEmployeeName(item.complaint_against)}</td>
//                     <td>{item.title}</td>
//                     <td>
//                       {new Date(item.complaint_date).toLocaleDateString()}
//                     </td>
//                     <td>{item.description}</td>
//                     <td className="text-center">
//                       <button
//                         className="btn btn-sm btn-info me-1"
//                         onClick={() => handleEdit(item)}
//                       >
//                         <i className="bi bi-pencil-fill text-white"></i>
//                       </button>
//                       <button
//                         className="btn btn-sm btn-danger"
//                         onClick={() => handleDelete(item.id)}
//                       >
//                         <i className="bi bi-trash-fill text-white"></i>
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="6" className="text-center text-muted">
//                     No complaints found.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//         <div className="d-flex justify-content-between align-items-center mt-3">
//           <div className="small text-muted">
//             Showing {indexOfFirstItem + 1} to{" "}
//             {Math.min(indexOfLastItem, filteredComplaints.length)} of{" "}
//             {filteredComplaints.length} entries
//           </div>
//           <nav>
//             <ul className="pagination pagination-sm mb-0" style={{ margin: 0 }}>
//               {/* Previous */}
//               <li
//                 className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
//               >
//                 <button
//                   className="page-link"
//                   style={{
//                     cursor: currentPage === 1 ? "not-allowed" : "pointer",
//                   }}
//                   onClick={() =>
//                     setCurrentPage(currentPage > 1 ? currentPage - 1 : 1)
//                   }
//                 >
//                   &laquo;
//                 </button>
//               </li>

//               {/* Page numbers */}
//               {pageNumbers.map((num) => (
//                 <li
//                   key={num}
//                   className={`page-item ${currentPage === num ? "active" : ""}`}
//                 >
//                   <button
//                     className="page-link"
//                     onClick={() => setCurrentPage(num)}
//                   >
//                     {num}
//                   </button>
//                 </li>
//               ))}

//               {/* Next */}
//               <li
//                 className={`page-item ${
//                   currentPage === pageNumbers.length || pageNumbers.length === 0
//                     ? "disabled"
//                     : ""
//                 }`}
//               >
//                 <button
//                   className="page-link"
//                   style={{
//                     cursor:
//                       currentPage === pageNumbers.length ||
//                       pageNumbers.length === 0
//                         ? "not-allowed"
//                         : "pointer",
//                   }}
//                   onClick={() =>
//                     setCurrentPage(
//                       currentPage < pageNumbers.length
//                         ? currentPage + 1
//                         : pageNumbers.length
//                     )
//                   }
//                 >
//                   &raquo;
//                 </button>
//               </li>
//             </ul>
//           </nav>
//         </div>
//       </div>

//       {/* Modal */}
//       <Modal
//         show={showModal}
//         onHide={closeModal}
//         centered
//         className={`custom-slide-modal ${isClosingModal ? "closing" : "open"}`}
//         style={{ overflowY: "auto", scrollbarWidth: "none" }}
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>
//             {editId ? "Edit Complaint" : "Create Complaint"}
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form>
//             <Form.Group>
//               <Form.Label>Complaint From</Form.Label>
//               <Form.Select
//                 name="complaint_from"
//                 value={formData.complaint_from}
//                 onChange={handleChange}
//               >
//                 <option value="">Select Employee</option>
//                 {employees.map((emp) => (
//                   <option key={emp.id} value={emp.employee_id}>
//                     {emp.name}
//                   </option>
//                 ))}
//               </Form.Select>
//             </Form.Group>
//             <Form.Group className="mt-2">
//               <Form.Label>Complaint Against</Form.Label>
//               <Form.Select
//                 name="complaint_against"
//                 value={formData.complaint_against}
//                 onChange={handleChange}
//               >
//                 <option value="">Select Employee</option>
//                 {employees.map((emp) => (
//                   <option key={emp.id} value={emp.employee_id}>
//                     {emp.name}
//                   </option>
//                 ))}
//               </Form.Select>
//             </Form.Group>
//             <Form.Group className="mt-2">
//               <Form.Label>Title</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="title"
//                 value={formData.title}
//                 onChange={handleChange}
//               />
//             </Form.Group>
//             <Form.Group className="mt-2">
//               <Form.Label>Complaint Date</Form.Label>
//               <Form.Control
//                 type="date"
//                 name="complaint_date"
//                 value={formData.complaint_date}
//                 onChange={handleChange}
//               />
//             </Form.Group>
//             <Form.Group className="mt-2">
//               <Form.Label>Description</Form.Label>
//               <Form.Control
//                 as="textarea"
//                 name="description"
//                 rows={3}
//                 value={formData.description}
//                 onChange={handleChange}
//               />
//             </Form.Group>
//           </Form>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={closeModal}>
//             Cancel
//           </Button>
//           <Button variant="success" onClick={handleSubmit}>
//             {editId ? "Update" : "Create"}
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// };

// export default ComplaintList;

import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { toast } from "react-toastify";

import {
  getComplaints,
  createComplaint,
  updateComplaint,
  deleteComplaint,
  getEmployees,
} from "../../../services/hrmService";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

import { useNavigate, useLocation } from "react-router-dom";
import BreadCrumb from "../../../components/BreadCrumb";

const ComplaintList = () => {
  const [complaints, setComplaints] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const [filteredEmployees, setFilteredEmployees] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    complaint_from: "",
    complaint_against: "",
    title: "",
    complaint_date: "",
    description: "",
  });

  const [isClosingModal, setIsClosingModal] = useState(false); // ? animation state

  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isClosing, setIsClosing] = useState(false);
  const [isClosingView, setIsClosingView] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      loadComplaints();
      loadEmployees();
    } catch (error) {
      console.log("An error occured");
    } finally {
      // setLoading(false);
    }
  }, []);

  const loadComplaints = async () => {
    const data = await getComplaints();
    setComplaints(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  // const loadEmployees = async () => {
  //   const data = await getEmployees();
  //   setEmployees(Array.isArray(data) ? data : []);
  //   setFilteredEmployees(Array.isArray(data) ? data : []);
  //   setLoading(false);
  // };

  const loadEmployees = async () => {
    try {
      const data = await getEmployees();

      // ✅ Filter only active employees
      const activeEmployees = Array.isArray(data)
        ? data.filter((emp) => emp.is_active === true)
        : [];

      console.log("Total employees:", data?.length || 0);
      console.log("Active employees:", activeEmployees.length);

      setEmployees(activeEmployees);
      setFilteredEmployees(activeEmployees);
    } catch (error) {
      console.error("Failed to load employees:", error);
      setEmployees([]);
      setFilteredEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleShow = () => {
    setFormData({
      complaint_from: "",
      complaint_against: "",
      title: "",
      complaint_date: "",
      description: "",
    });
    setEditId(null);
    setShowModal(true);
  };

  const handleEdit = (complaint) => {
    setFormData({
      complaint_from: complaint.complaint_from,
      complaint_against: complaint.complaint_against,
      title: complaint.title,
      complaint_date: complaint.complaint_date,
      description: complaint.description,
    });
    setEditId(complaint.id);
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (editId) {
        await updateComplaint(editId, formData);
        toast.success("Complain successfully updated.", {
          icon: false,
        });
      } else {
        await createComplaint(formData);
        toast.success("Complain successfully create.", {
          icon: false,
        });
      }
      setShowModal(false);
      loadComplaints();
    } catch (error) {
      alert("Error saving complaint.");
    }
  };

  const handleDelete = (id) => {
    confirmAlert({
      customUI: ({ onClose }) => (
        <div className="custom-confirm-modal bg-white p-4 rounded shadow text-center">
          <div style={{ fontSize: "50px", color: "#ff9900" }}>❗</div>
          <h4 className="fw-bold mt-2">Are you sure?</h4>
          <p>This action cannot be undone. Do you want to continue?</p>
          <div className="d-flex justify-content-center mt-3">
            <button className="btn btn-danger me-2 px-4" onClick={onClose}>
              No
            </button>
            <button
              className="btn btn-success px-4"
              onClick={async () => {
                try {
                  await deleteComplaint(id); // ? delete complaint
                  await loadComplaints(); // ? refresh complaints
                  toast.success("Complain deleted successfully.", {
                    icon: false,
                  });
                } catch (error) {
                  alert("Error deleting complaint."); // ? error handling
                }
                onClose();
              }}
            >
              Yes
            </button>
          </div>
        </div>
      ),
    });
  };

  // ? Modal close with animation
  const closeModal = () => {
    setIsClosingModal(true);
    setTimeout(() => {
      setShowModal(false);
      setIsClosingModal(false);
    }, 400);
  };

  const getEmployeeName = (empId) => {
    const emp = employees.find(
      (e) => e.employee_id.toString() === empId.toString()
    );
    // return emp ? emp.name : "N/A";
    return emp ? `${emp.name} (EMP-ID: ${emp.employee_id})` : "N/A";
  };

  // Filter + Pagination
  const filteredComplaints = complaints.filter(
    (c) =>
      getEmployeeName(c.complaint_from)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      getEmployeeName(c.complaint_against)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (c.title || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * entriesPerPage;
  const indexOfFirstItem = indexOfLastItem - entriesPerPage;
  const currentItems = filteredComplaints.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const pageNumbers = Array.from(
    { length: Math.ceil(filteredComplaints.length / entriesPerPage) },
    (_, i) => i + 1
  );

  useEffect(() => {
    if (formData.complaint_from == "") {
      console.log("lol");
      return;
    }

    function getFilteredEmployes(id) {
      let data = employees;
      let filteredArray = [];
      let i = 0;
      for (i; i < data?.length - 1; i++) {
        if (id != data[i].employee_id) {
          filteredArray.push(data[i]);
        }
      }
      setFilteredEmployees(filteredArray);
    }
    getFilteredEmployes(formData.complaint_from);
  }, [formData.complaint_from]);

  return (
    <div className="container mt-4">
      <style>{`
        @keyframes slideInUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideOutUp {
          from { transform: translateY(0); opacity: 1; }
          to { transform: translateY(-100%); opacity: 0; }
        }
        .custom-slide-modal.open .modal-dialog {
          animation: slideInUp 0.7s ease forwards;
        }
        .custom-slide-modal.closing .modal-dialog {
          animation: slideOutUp 0.7s ease forwards;
        }
      `}</style>

      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <div>
            <h4 className="fw-bold ">Manage Complaints</h4>
            <div className="pb-1">
              <BreadCrumb pathname={location.pathname} onNavigate={navigate} />
            </div>
          </div>
        </div>
        <OverlayTrigger placement="top" overlay={<Tooltip>Create</Tooltip>}>
          <Button onClick={handleShow} className="btn btn-success">
            <i className="bi bi-plus-lg"></i>
          </Button>
        </OverlayTrigger>
      </div>

      <div className="card p-3 shadow-sm rounded-4">
        {/* Controls */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center">
            <select
              className="form-select me-2"
              style={{ width: "80px", height: "40px" }}
              value={entriesPerPage}
              onChange={(e) => {
                setEntriesPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              {[10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <input
            type="text"
            className="form-control form-control-sm mb-0"
            placeholder="Search..."
            style={{ maxWidth: "200px" }}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center p-4">
            <Spinner animation="border" role="status" variant="success">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              className="table table-bordered table-hover table-striped text-center align-middle mb-0"
              style={{ tableLayout: "fixed", width: "100%" }}
            >
              <thead className="bg-light">
                <tr>
                  <th>From</th>
                  <th>Against</th>
                  <th>Title</th>
                  <th>Date</th>
                  <th>Description</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((item) => (
                    <tr key={item.id}>
                      <td>{getEmployeeName(item.complaint_from)}</td>
                      <td>{getEmployeeName(item.complaint_against)}</td>
                      <td>{item.title}</td>
                      <td>
                        {new Date(item.complaint_date).toLocaleDateString()}
                      </td>
                      <td
                        style={{
                          width: "250px",
                          whiteSpace: "normal",
                          wordWrap: "break-word",
                          overflowWrap: "break-word",
                        }}
                      >
                        {item.description}
                      </td>
                      <td className="text-center">
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip>Edit</Tooltip>}
                        >
                          <button
                            className="btn btn-sm btn-info me-1"
                            onClick={() => handleEdit(item)}
                          >
                            <i className="bi bi-pencil-fill text-white"></i>
                          </button>
                        </OverlayTrigger>
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip>Delete</Tooltip>}
                        >
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDelete(item.id)}
                          >
                            <i className="bi bi-trash-fill text-white"></i>
                          </button>
                        </OverlayTrigger>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-muted">
                      No complaints found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {/* Footer */}
        <div className="d-flex justify-content-between align-items-center mt-3">
          <div className="small text-muted">
            Showing {indexOfFirstItem + 1} to{" "}
            {Math.min(indexOfLastItem, filteredComplaints.length)} of{" "}
            {filteredComplaints.length} entries
          </div>
          <nav>
            <ul className="pagination pagination-sm mb-0" style={{ margin: 0 }}>
              {/* Previous */}
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  style={{
                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  }}
                  onClick={() =>
                    setCurrentPage(currentPage > 1 ? currentPage - 1 : 1)
                  }
                >
                  «
                </button>
              </li>

              {/* Page numbers */}
              {pageNumbers.map((num) => (
                <li
                  key={num}
                  className={`page-item ${currentPage === num ? "active" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(num)}
                  >
                    {num}
                  </button>
                </li>
              ))}

              {/* Next */}
              <li
                className={`page-item ${
                  currentPage === pageNumbers.length || pageNumbers.length === 0
                    ? "disabled"
                    : ""
                }`}
              >
                <button
                  className="page-link"
                  style={{
                    cursor:
                      currentPage === pageNumbers.length ||
                      pageNumbers.length === 0
                        ? "not-allowed"
                        : "pointer",
                  }}
                  onClick={() =>
                    setCurrentPage(
                      currentPage < pageNumbers.length
                        ? currentPage + 1
                        : pageNumbers.length
                    )
                  }
                >
                  »
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Modal */}
      <Modal
        show={showModal}
        onHide={closeModal}
        centered
        className={`custom-slide-modal ${isClosingModal ? "closing" : "open"}`}
        style={{ overflowY: "auto", scrollbarWidth: "none" }}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editId ? "Edit Complaint" : "Create Complaint"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>
                Complaint From <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                name="complaint_from"
                value={formData.complaint_from}
                onChange={handleChange}
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.employee_id}>
                    {emp.name} (Emp-id:{emp.employee_id})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mt-2">
              <Form.Label>
                Complaint Against <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                name="complaint_against"
                value={formData.complaint_against}
                onChange={handleChange}
              >
                <option value="">Select Employee</option>
                {filteredEmployees.map((emp) => (
                  <option key={emp.id} value={emp.employee_id}>
                    {emp.name} (Emp-id:{emp.employee_id})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mt-2">
              <Form.Label>
                Title <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mt-2">
              <Form.Label>
                Complaint Date <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="date"
                name="complaint_date"
                value={formData.complaint_date}
                max="9999-12-31"
                jkm
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mt-2">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleSubmit}>
            {editId ? "Update" : "Create"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ComplaintList;
