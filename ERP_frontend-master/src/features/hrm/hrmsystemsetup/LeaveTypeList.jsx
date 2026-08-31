// import React, { useState, useEffect } from "react";
// import { Modal, Button, Form } from "react-bootstrap";
// import leaveTypeService from "../../../services/leavetypeService";
// import { FaEdit, FaTrash } from "react-icons/fa";
// import { confirmAlert } from "react-confirm-alert";
// import "react-confirm-alert/src/react-confirm-alert.css";

// const LeaveTypeList = () => {
//   const [leaveTypes, setLeaveTypes] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [newLeaveType, setNewLeaveType] = useState({ title: "", days: "" });
//   const [editId, setEditId] = useState(null);
//   const [search, setSearch] = useState("");
//   const [entriesPerPage, setEntriesPerPage] = useState(10);
//   const [currentPage, setCurrentPage] = useState(1);

//   const [isClosing, setIsClosing] = useState(false); // ✅ for animation

//   useEffect(() => {
//     fetchLeaveTypes();
//   }, []);

//   // const fetchLeaveTypes = async () => {
//   //   try {
//   //     const res = await leaveTypeService.getAll();
//   //     setLeaveTypes(res.data || res);
//   //   } catch (error) {
//   //     console.error("Failed to fetch leave types:", error);
//   //   }
//   // };

//   const fetchLeaveTypes = async () => {
//     try {
//       const res = await leaveTypeService.getAll();
//       let data = res.data || res;
//       data = data.sort((a, b) => b.id - a.id); // newest first
//       setLeaveTypes(data);
//     } catch (error) {
//       console.error("Failed to fetch leave types:", error);
//     }
//   };

//   const handleSave = async () => {
//     try {
//       if (editId) {
//         await leaveTypeService.update(editId, newLeaveType);
//       } else {
//         await leaveTypeService.create({ ...newLeaveType, created_by: 1 });
//       }
//       setNewLeaveType({ title: "", days: "" });
//       setEditId(null);
//       handleCloseModal();
//       fetchLeaveTypes();
//     } catch (error) {
//       console.error("Error saving leave type:", error);
//     }
//   };

//   const handleEdit = (leaveType) => {
//     setEditId(leaveType.id);
//     setNewLeaveType({ title: leaveType.title, days: leaveType.days });
//     setShowModal(true);
//   };

//   // const handleDelete = async (id) => {
//   //   if (window.confirm("Are you sure you want to delete this leave type?")) {
//   //     await leaveTypeService.remove(id);
//   //     fetchLeaveTypes();
//   //   }
//   // };

//   const handleDelete = (id) => {
//     confirmAlert({
//       customUI: ({ onClose }) => (
//         <div className="custom-confirm-modal bg-white p-4 rounded shadow text-center">
//           <div style={{ fontSize: "50px", color: "#ff9900" }}>❗</div>
//           <h4 className="fw-bold mt-2">Are you sure?</h4>
//           <p>This action can not be undone. Do you want to continue?</p>
//           <div className="d-flex justify-content-center mt-3">
//             <Button variant="danger" className="me-2 px-4" onClick={onClose}>
//               No
//             </Button>
//             <Button
//               variant="success"
//               className="px-4"
//               onClick={async () => {
//                 await leaveTypeService.remove(id);
//                 fetchLeaveTypes();
//                 onClose();
//               }}
//             >
//               Yes
//             </Button>
//           </div>
//         </div>
//       ),
//     });
//   };

//   const handleCloseModal = () => {
//     setIsClosing(true);
//     setTimeout(() => {
//       setShowModal(false);
//       setIsClosing(false);
//     }, 400); // match animation duration
//   };

//   const filteredLeaveTypes = leaveTypes.filter((lt) =>
//     lt.title?.toLowerCase().includes(search.toLowerCase())
//   );

//   const startIndex = (currentPage - 1) * entriesPerPage;
//   const currentLeaveTypes = filteredLeaveTypes.slice(
//     startIndex,
//     startIndex + entriesPerPage
//   );
//   const pageCount = Math.ceil(filteredLeaveTypes.length / entriesPerPage);

//   return (
//     <div className="bg-white p-3 rounded shadow-sm">
//       <style>{`
//           @keyframes slideInUp {
//             from { transform: translateY(100%); opacity: 0; }
//             to { transform: translateY(0); opacity: 1; }
//           }
//           @keyframes slideOutUp {
//             from { transform: translateY(0); opacity: 1; }
//             to { transform: translateY(-100%); opacity: 0; }
//           }
//           .custom-slide-modal.open .modal-dialog {
//             animation: slideInUp 0.7s ease forwards;
//           }
//           .custom-slide-modal.closing .modal-dialog {
//             animation: slideOutUp 0.7s ease forwards;
//           }
//         `}</style>
//       <div className="d-flex justify-content-between align-items-center mb-3">
//         <h5 className="fw-bold">Manage Leave Types</h5>
//         <Button variant="success" onClick={() => setShowModal(true)}>
//           +
//         </Button>
//       </div>

//       <div className="d-flex justify-content-between align-items-center mb-3">
//         <div className="d-flex align-items-center">
//           <select
//             className="form-select me-2"
//             value={entriesPerPage}
//             onChange={(e) => {
//               setEntriesPerPage(Number(e.target.value));
//               setCurrentPage(1);
//             }}
//             style={{ width: "100px" }}
//           >
//             <option value="10">10</option>
//             <option value="25">25</option>
//             <option value="50">50</option>
//           </select>
//           <span>entries per page</span>
//         </div>
//         <Form.Control
//           type="text"
//           placeholder="Search by title"
//           className="form-control-sm"
//           value={search}
//           onChange={(e) => {
//             setSearch(e.target.value);
//             setCurrentPage(1);
//           }}
//           style={{ maxWidth: "250px" }}
//         />
//       </div>

//       <div className="table-responsive">
//         <table className="table table-bordered table-hover table-striped">
//           <thead className="table-light">
//             <tr>
//               <th>Title</th>
//               <th>Days</th>
//               <th style={{ width: "120px" }}>Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {currentLeaveTypes.length > 0 ? (
//               currentLeaveTypes.map((lt) => (
//                 <tr key={lt.id}>
//                   <td>{lt.title}</td>
//                   <td>{lt.days}</td>
//                   <td>
//                     <Button
//                       variant="info"
//                       size="sm"
//                       className="me-2"
//                       onClick={() => handleEdit(lt)}
//                     >
//                       <FaEdit />
//                     </Button>
//                     <Button
//                       variant="danger"
//                       size="sm"
//                       onClick={() => handleDelete(lt.id)}
//                     >
//                       <FaTrash />
//                     </Button>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="3" className="text-center">
//                   No leave types found.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Pagination */}
//       {/* <div className="d-flex justify-content-between align-items-center mt-3">
//         <span>
//           Showing {filteredLeaveTypes.length === 0 ? 0 : startIndex + 1} to{" "}
//           {Math.min(startIndex + entriesPerPage, filteredLeaveTypes.length)} of{" "}
//           {filteredLeaveTypes.length} entries
//         </span>
//         <nav>
//           <ul className="pagination pagination-sm mb-0">
//             {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
//               <li
//                 key={page}
//                 className={`page-item ${currentPage === page ? "active" : ""}`}
//               >
//                 <button
//                   className="page-link"
//                   onClick={() => setCurrentPage(page)}
//                 >
//                   {page}
//                 </button>
//               </li>
//             ))}
//           </ul>
//         </nav>
//       </div> */}
//       {/* Pagination */}
//       <div className="d-flex justify-content-between align-items-center">
//         <div className="small text-muted">
//           Showing {filteredLeaveTypes.length === 0 ? 0 : startIndex + 1} to{" "}
//           {Math.min(startIndex + entriesPerPage, filteredLeaveTypes.length)} of{" "}
//           {filteredLeaveTypes.length} entries
//         </div>
//         <div>
//           <ul className="pagination pagination-sm mb-0">
//             <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
//               <button
//                 className="page-link"
//                 onClick={() => setCurrentPage((p) => p - 1)}
//               >
//                 «
//               </button>
//             </li>
//             {Array.from({ length: pageCount }, (_, i) => (
//               <li
//                 key={i + 1}
//                 className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
//               >
//                 <button
//                   className="page-link"
//                   onClick={() => setCurrentPage(i + 1)}
//                 >
//                   {i + 1}
//                 </button>
//               </li>
//             ))}
//             <li
//               className={`page-item ${
//                 currentPage === pageCount ? "disabled" : ""
//               }`}
//             >
//               <button
//                 className="page-link"
//                 onClick={() => setCurrentPage((p) => p + 1)}
//               >
//                 »
//               </button>
//             </li>
//           </ul>
//         </div>
//       </div>

//       {/* Modal */}
//       {/* <Modal show={showModal} onHide={() => setShowModal(false)} centered>
//         <Modal.Header closeButton>
//           <Modal.Title>
//             {editId ? "Edit Leave Type" : "Create Leave Type"}
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form.Group className="mb-3">
//             <Form.Label>Title</Form.Label>
//             <Form.Control
//               type="text"
//               value={newLeaveType.title}
//               onChange={(e) =>
//                 setNewLeaveType({ ...newLeaveType, title: e.target.value })
//               }
//               placeholder="Enter leave title"
//             />
//           </Form.Group>
//           <Form.Group>
//             <Form.Label>Days</Form.Label>
//             <Form.Control
//               type="number"
//               value={newLeaveType.days}
//               onChange={(e) =>
//                 setNewLeaveType({ ...newLeaveType, days: e.target.value })
//               }
//               placeholder="Enter number of days"
//             />
//           </Form.Group>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowModal(false)}>
//             Cancel
//           </Button>
//           <Button variant="success" onClick={handleSave}>
//             {editId ? "Update" : "Create"}
//           </Button>
//         </Modal.Footer>
//       </Modal> */}
//       <Modal
//         show={showModal}
//         onHide={handleCloseModal}
//         centered
//         className={`custom-slide-modal ${isClosing ? "closing" : "open"}`}
//         style={{ overflowY: "auto", scrollbarWidth: "none" }}
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>
//             {editId ? "Edit Leave Type" : "Create Leave Type"}
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form.Group className="mb-3">
//             <Form.Label>Title</Form.Label>
//             <Form.Control
//               type="text"
//               value={newLeaveType.title}
//               onChange={(e) =>
//                 setNewLeaveType({ ...newLeaveType, title: e.target.value })
//               }
//               placeholder="Enter leave title"
//             />
//           </Form.Group>
//           <Form.Group>
//             <Form.Label>Days</Form.Label>
//             <Form.Control
//               type="number"
//               value={newLeaveType.days}
//               onChange={(e) =>
//                 setNewLeaveType({ ...newLeaveType, days: e.target.value })
//               }
//               placeholder="Enter number of days"
//             />
//           </Form.Group>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={handleCloseModal}>
//             Cancel
//           </Button>
//           <Button variant="success" onClick={handleSave}>
//             {editId ? "Update" : "Create"}
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// };

// export default LeaveTypeList;



























// import React, { useState, useEffect } from "react";
// import { Modal, Button, Form } from "react-bootstrap";
// import leaveTypeService from "../../../services/leavetypeService";
// import { FaEdit, FaTrash } from "react-icons/fa";
// import { confirmAlert } from "react-confirm-alert";
// import "react-confirm-alert/src/react-confirm-alert.css";
// import { OverlayTrigger, Tooltip } from "react-bootstrap";
// import { toast } from "react-toastify";

// const LeaveTypeList = () => {
//   const [leaveTypes, setLeaveTypes] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [newLeaveType, setNewLeaveType] = useState({ title: "", days: "" });
//   const [editId, setEditId] = useState(null);
//   const [search, setSearch] = useState("");
//   const [entriesPerPage, setEntriesPerPage] = useState(10);
//   const [currentPage, setCurrentPage] = useState(1);

//   const [isClosing, setIsClosing] = useState(false); // ? for animation

//   useEffect(() => {
//     fetchLeaveTypes();
//   }, []);


//   const fetchLeaveTypes = async () => {
//     try {
//       const res = await leaveTypeService.getAll();
//       let data = res.data || res;
//       data = data.sort((a, b) => b.id - a.id); // newest first
//       setLeaveTypes(data);
//     } catch (error) {
//       console.error("Failed to fetch leave types:", error);
//     }
//   };

//   const handleSave = async () => {
//     try {
//       if (editId) {
//         await leaveTypeService.update(editId, newLeaveType);
//         toast.success("Leave successfully updated.", {
//           icon: false,
//         });
//       } else {
//         await leaveTypeService.create({ ...newLeaveType, created_by: 1 });
//         toast.success("Leave successfully created.", {
//           icon: false,
//         });
//       }
//       setNewLeaveType({ title: "", days: "" });
//       setEditId(null);
//       handleCloseModal();
//       fetchLeaveTypes();
//     } catch (error) {
//       console.error("Error saving leave type:", error);
//     }
//   };

//   const handleEdit = (leaveType) => {
//     setEditId(leaveType.id);
//     setNewLeaveType({ title: leaveType.title, days: leaveType.days });
//     setShowModal(true);
//   };


//   const handleDelete = (id) => {
//     confirmAlert({
//       customUI: ({ onClose }) => (
//         <div className="custom-confirm-modal bg-white p-4 rounded shadow text-center">
//           <div style={{ fontSize: "50px", color: "#ff9900" }}>❗</div>
//           <h4 className="fw-bold mt-2">Are you sure?</h4>
//           <p>This action can not be undone. Do you want to continue?</p>
//           <div className="d-flex justify-content-center mt-3">
//             <Button variant="danger" className="me-2 px-4" onClick={onClose}>
//               No
//             </Button>
//             <Button
//               variant="success"
//               className="px-4"
//               onClick={async () => {
//                 await leaveTypeService.remove(id);
//                 fetchLeaveTypes();
//                 onClose();
//                 toast.success("Leave deleted successfully.", {
//                   icon: false,
//                 });
//               }}
//             >
//               Yes
//             </Button>
//           </div>
//         </div>
//       ),
//     });
//   };

//   const handleCloseModal = () => {
//     setIsClosing(true);
//     setTimeout(() => {
//       setShowModal(false);
//       setIsClosing(false);
//     }, 400); // match animation duration
//   };

//   const filteredLeaveTypes = leaveTypes.filter((lt) =>
//     lt.title?.toLowerCase().includes(search.toLowerCase())
//   );

//   const startIndex = (currentPage - 1) * entriesPerPage;
//   const currentLeaveTypes = filteredLeaveTypes.slice(
//     startIndex,
//     startIndex + entriesPerPage
//   );
//   const pageCount = Math.ceil(filteredLeaveTypes.length / entriesPerPage);

//   return (
//     <div className="bg-white p-3 rounded shadow-sm">

//       <style>{`
//   .entries-select:focus {
//     border-color: #6FD943 !important;
//     box-shadow: 0 0 0px 4px #70d94360 !important;
//   }
// `}</style>
//       <style>{`
//           @keyframes slideInUp {
//             from { transform: translateY(100%); opacity: 0; }
//             to { transform: translateY(0); opacity: 1; }
//           }
//           @keyframes slideOutUp {
//             from { transform: translateY(0); opacity: 1; }
//             to { transform: translateY(-100%); opacity: 0; }
//           }
//           .custom-slide-modal.open .modal-dialog {
//             animation: slideInUp 0.7s ease forwards;
//           }
//           .custom-slide-modal.closing .modal-dialog {
//             animation: slideOutUp 0.7s ease forwards;
//           }
//         `}</style>
//       <div className="d-flex justify-content-between align-items-center mb-3">
//         <h5 className="fw-bold">Manage Leave Types</h5>
//         <OverlayTrigger overlay={<Tooltip>Create</Tooltip>}>
//         <Button variant="success" onClick={() => setShowModal(true)}>
//           <i className="bi bi-plus-lg fs-6"></i>
//         </Button>
//         </OverlayTrigger>
//       </div>

//       <div className="d-flex justify-content-between align-items-center mb-3">
//         <div className="d-flex align-items-center">
//           <select
//             className="form-select me-2 entries-select"
//             value={entriesPerPage}
//             onChange={(e) => {
//               setEntriesPerPage(Number(e.target.value));
//               setCurrentPage(1);
//             }}
//             style={{ width: "80px" }}
//           >
//             <option value="5">5</option>
//             <option value="10">10</option>
//             <option value="25">25</option>
//             <option value="50">50</option>
//             <option value="100">100</option>

//           </select>
//           <span>entries per page</span>
//         </div>
//         <Form.Control
//           type="text"
//           placeholder="Search..."
//           className="form-control-sm entries-select"
//           value={search}
//           onChange={(e) => {
//             setSearch(e.target.value);
//             setCurrentPage(1);
//           }}
//           style={{ maxWidth: "250px" }}
//         />
//       </div>

//       <div className="table-responsive">
//         <table className="table table-bordered table-hover table-striped">
//           <thead className="table-light">
//             <tr>
//               <th>Title</th>
//               <th>Days</th>
//               <th style={{ width: "120px" }}>Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {currentLeaveTypes.length > 0 ? (
//               currentLeaveTypes.map((lt) => (
//                 <tr key={lt.id}>
//                   <td>{lt.title}</td>
//                   <td>{lt.days}</td>
//                   <td>
//                     <OverlayTrigger
//                       placement="top"
//                       overlay={<Tooltip>Edit</Tooltip>}
//                     >
//                       <Button
//                         variant="info"
//                         size="sm"
//                         className="me-2"
//                         onClick={() => handleEdit(lt)}
//                       >
//                         <FaEdit />
//                       </Button>
//                     </OverlayTrigger>
//                     <OverlayTrigger
//                       placement="top"
//                       overlay={<Tooltip>Delete</Tooltip>}
//                     >
//                       <Button
//                         variant="danger"
//                         size="sm"
//                         onClick={() => handleDelete(lt.id)}
//                       >
//                         <FaTrash />
//                       </Button>
//                     </OverlayTrigger>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="3" className="text-center">
//                   No leave types found.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//       {/* Pagination */}
//       <div className="d-flex justify-content-between align-items-center">
//         <div className="small text-muted">
//           Showing {filteredLeaveTypes.length === 0 ? 0 : startIndex + 1} to{" "}
//           {Math.min(startIndex + entriesPerPage, filteredLeaveTypes.length)} of{" "}
//           {filteredLeaveTypes.length} entries
//         </div>
//         <div>
//           <ul className="pagination pagination-sm mb-0">
//             <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
//               <button
//                 className="page-link"
//                 onClick={() => setCurrentPage((p) => p - 1)}
//               >
//                 «
//               </button>
//             </li>
//             {Array.from({ length: pageCount }, (_, i) => (
//               <li
//                 key={i + 1}
//                 className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
//               >
//                 <button
//                   className="page-link"
//                   onClick={() => setCurrentPage(i + 1)}
//                 >
//                   {i + 1}
//                 </button>
//               </li>
//             ))}
//             <li
//               className={`page-item ${currentPage === pageCount ? "disabled" : ""
//                 }`}
//             >
//               <button
//                 className="page-link"
//                 onClick={() => setCurrentPage((p) => p + 1)}
//               >
//                 »
//               </button>
//             </li>
//           </ul>
//         </div>
//       </div>
//       <Modal
//         show={showModal}
//         onHide={handleCloseModal}
//         centered
//         className={`custom-slide-modal ${isClosing ? "closing" : "open"}`}
//         style={{ overflowY: "auto", scrollbarWidth: "none" }}
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>
//             {editId ? "Edit Leave Type" : "Create Leave Type"}
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form.Group className="mb-3">
//             <Form.Label>Title <span className="text-danger">*</span></Form.Label>
//             <Form.Control
//               type="text"
//               value={newLeaveType.title}
//               onChange={(e) =>
//                 setNewLeaveType({ ...newLeaveType, title: e.target.value })
//               }
//               placeholder="Enter leave title"
//             />
//           </Form.Group>
//           <Form.Group>
//             <Form.Label>Days <span className="text-danger">*</span></Form.Label>
//             <Form.Control
//               type="number"
//               value={newLeaveType.days}
//               onChange={(e) =>
//                 setNewLeaveType({ ...newLeaveType, days: e.target.value })
//               }
//               placeholder="Enter number of days"
//             />
//           </Form.Group>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={handleCloseModal}>
//             Cancel
//           </Button>
//           <Button variant="success" onClick={handleSave}>
//             {editId ? "Update" : "Create"}
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// };

// export default LeaveTypeList;













import React, { useState, useEffect } from "react";
import { Modal, Button, Form ,Spinner } from "react-bootstrap";
import leaveTypeService from "../../../services/leavetypeService";
import { FaEdit, FaTrash } from "react-icons/fa";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { toast } from "react-toastify";

const LeaveTypeList = () => {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newLeaveType, setNewLeaveType] = useState({ title: "", days: "" });
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isClosing, setIsClosing] = useState(false);
  const [errors, setErrors] = useState({}); // validation errors
    const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  const fetchLeaveTypes = async () => {
    try {
      const res = await leaveTypeService.getAll();
      let data = res.data || res;
      data = data.sort((a, b) => b.id - a.id);
      setLeaveTypes(data);
    } catch (error) {
      console.error("Failed to fetch leave types:", error);
    }
    finally{
      setLoading(false)
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    if (!newLeaveType.title.trim()) newErrors.title = "Title is required.";
    if (!newLeaveType.days || Number(newLeaveType.days) <= 0)
      newErrors.days = "Days must be greater than 0.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      if (editId) {
        await leaveTypeService.update(editId, newLeaveType);
        toast.success("Leave successfully updated.", { icon: false });
      } else {
        await leaveTypeService.create({ ...newLeaveType, created_by: 1 });
        toast.success("Leave successfully created.", { icon: false });
      }
      setNewLeaveType({ title: "", days: "" });
      setEditId(null);
      setErrors({});
      handleCloseModal();
      fetchLeaveTypes();
    } catch (error) {
      console.error("Error saving leave type:", error);
    }
  };

  const handleEdit = (leaveType) => {
    setEditId(leaveType.id);
    setNewLeaveType({ title: leaveType.title, days: leaveType.days });
    setErrors({});
    setShowModal(true);
  };

  const handleDelete = (id) => {
    confirmAlert({
      customUI: ({ onClose }) => (
        <div className="custom-confirm-modal bg-white p-4 rounded shadow text-center">
          <div style={{ fontSize: "50px", color: "#ff9900" }}>❗</div>
          <h4 className="fw-bold mt-2">Are you sure?</h4>
          <p>This action cannot be undone. Do you want to continue?</p>
          <div className="d-flex justify-content-center mt-3">
            <Button variant="danger" className="me-2 px-4" onClick={onClose}>
              No
            </Button>
            <Button
              variant="success"
              className="px-4"
              onClick={async () => {
                await leaveTypeService.remove(id);
                fetchLeaveTypes();
                onClose();
                toast.success("Leave deleted successfully.", { icon: false });
              }}
            >
              Yes
            </Button>
          </div>
        </div>
      ),
    });
  };

  const handleCloseModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowModal(false);
      setIsClosing(false);
      setErrors({});
    }, 400);
  };

  const filteredLeaveTypes = leaveTypes.filter((lt) =>
    lt.title?.toLowerCase().includes(search.toLowerCase())
  );

  const startIndex = (currentPage - 1) * entriesPerPage;
  const currentLeaveTypes = filteredLeaveTypes.slice(
    startIndex,
    startIndex + entriesPerPage
  );
  const pageCount = Math.ceil(filteredLeaveTypes.length / entriesPerPage);

  return (
    <div className="bg-white p-3 rounded shadow-sm">
      <style>{`
        .entries-select:focus {
          border-color: #6FD943 !important;
          box-shadow: 0 0 0px 4px #70d94360 !important;
        }
        .is-invalid {
          border-color: #dc3545 !important;
        }
        .invalid-feedback {
          display: block;
        }
      `}</style>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold">Manage Leave Types</h5>
        <OverlayTrigger overlay={<Tooltip>Create</Tooltip>}>
          <Button
            variant="success"
            onClick={() => {
              setShowModal(true);
              setEditId(null);
              setNewLeaveType({ title: "", days: "" });
              setErrors({});
            }}
          >
            <i className="bi bi-plus-lg fs-6"></i>
          </Button>
        </OverlayTrigger>
      </div>

      {/* Search & Entries */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center">
          <select
            className="form-select me-2 "
            value={entriesPerPage}
            onChange={(e) => {
              setEntriesPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            style={{ width: "80px" }}
          >
            {/* <option value="5">5</option> */}
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
        <Form.Control
          type="text"
          placeholder="Search..."
          className="form-control-sm"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          style={{ maxWidth: "250px" }}
        />
      </div>

      {/* Table */}
      <div className="table-responsive">
         {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="success" />
            </div>
          ) : (
        <table className="table table-bordered table-hover table-striped">
          <thead className="table-light">
            <tr>
              <th>Title</th>
              <th>Days</th>
              <th style={{ width: "120px" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {currentLeaveTypes.length > 0 ? (
              currentLeaveTypes.map((lt) => (
                <tr key={lt.id}>
                  <td>{lt.title}</td>
                  <td>{lt.days}</td>
                  <td>
                    <OverlayTrigger placement="top" overlay={<Tooltip>Edit</Tooltip>}>
                      <Button
                        variant="info"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEdit(lt)}
                      >
                       <i className="bi bi-pencil text-white"></i>
                      </Button>
                    </OverlayTrigger>
                    <OverlayTrigger placement="top" overlay={<Tooltip>Delete</Tooltip>}>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(lt.id)}
                      >
                        <FaTrash />
                      </Button>
                    </OverlayTrigger>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center">
                  No leave types found.
                </td>
              </tr>
            )}
          </tbody>
        </table>)}
      </div>

      {/* Pagination */}
      <div className="d-flex justify-content-between align-items-center">
        <div className="small text-muted">
          Showing {filteredLeaveTypes.length === 0 ? 0 : startIndex + 1} to{" "}
          {Math.min(startIndex + entriesPerPage, filteredLeaveTypes.length)} of{" "}
          {filteredLeaveTypes.length} entries
        </div>
        <div>
          <ul className="pagination pagination-sm mb-0">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => setCurrentPage((p) => p - 1)}>
                «
              </button>
            </li>
            {Array.from({ length: pageCount }, (_, i) => (
              <li
                key={i + 1}
                className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
              >
                <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
                  {i + 1}
                </button>
              </li>
            ))}
            <li className={`page-item ${currentPage === pageCount ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => setCurrentPage((p) => p + 1)}>
                »
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Modal */}
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        centered
        className={`custom-slide-modal ${isClosing ? "closing" : "open"}`}
        style={{ overflowY: "auto", scrollbarWidth: "none" }}
      >
        <Modal.Header closeButton>
          <Modal.Title>{editId ? "Edit Leave Type" : "Create Leave Type"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Title <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              value={newLeaveType.title}
              onChange={(e) => {
                setNewLeaveType({ ...newLeaveType, title: e.target.value });
                setErrors({ ...errors, title: "" });
              }}
              placeholder="Enter leave title"
              className={errors.title ? "is-invalid" : ""}
            />
            {errors.title && <div className="invalid-feedback">{errors.title}</div>}
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Days <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="number"
              value={newLeaveType.days}
              onChange={(e) => {
                setNewLeaveType({ ...newLeaveType, days: e.target.value });
                setErrors({ ...errors, days: "" });
              }}
              placeholder="Enter number of days"
              className={errors.days ? "-isinvalid" : ""}
            />
            {errors.days && <div className="invalid-feedback">{errors.days}</div>}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleSave}>
            {editId ? "Update" : "Create"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default LeaveTypeList;
