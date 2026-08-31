// import React, { useEffect, useState } from "react";
// import payslipTypeService from "../../../services/paysliptypeService";

// import { Modal, Button, Form } from "react-bootstrap";
// import { FaEdit, FaTrash } from "react-icons/fa";
// import { confirmAlert } from "react-confirm-alert";
// import "react-confirm-alert/src/react-confirm-alert.css";

// const PayslipTypeList = () => {
//   const [types, setTypes] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [newType, setNewType] = useState({ name: "" });
//   const [editId, setEditId] = useState(null);
//   const [search, setSearch] = useState("");
//   const [entriesPerPage, setEntriesPerPage] = useState(10);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [isClosing, setIsClosing] = useState(false); // ✅ for animation

//   useEffect(() => {
//     fetchTypes();
//   }, []);

//   const fetchTypes = async () => {
//     try {
//       const res = await payslipTypeService.getAll(); // res is already an array
//       console.log("Fetched data:", res); // Debug
//       setTypes(Array.isArray(res) ? res : []);
//     } catch (err) {
//       console.error("Error fetching types:", err);
//     }
//   };

//   const handleSave = async () => {
//     try {
//       if (editId) {
//         await payslipTypeService.update(editId, newType);
//       } else {
//         await payslipTypeService.create(newType);
//       }
//       setNewType({ name: "" });
//       setEditId(null);
//       handleCloseModal();
//       fetchTypes();
//     } catch (err) {
//       console.error("Error saving:", err);
//     }
//   };

//   const handleEdit = (type) => {
//     setEditId(type.id);
//     setNewType({ name: type.name });
//     setShowModal(true);
//   };

//   // const handleDelete = (id) => {
//   //   confirmAlert({
//   //     customUI: ({ onClose }) => (
//   //       <div className="custom-confirm-modal bg-white p-4 rounded shadow text-center">
//   //         <div style={{ fontSize: "50px", color: "#ff9900" }}>❗</div>
//   //         <h4 className="fw-bold mt-2">Are you sure?</h4>
//   //         <p>This action cannot be undone.</p>
//   //         <div className="d-flex justify-content-center mt-3">
//   //           <Button variant="danger" className="me-2 px-4" onClick={onClose}>
//   //             No
//   //           </Button>
//   //           <Button
//   //             variant="success"
//   //             className="px-4"
//   //             onClick={async () => {
//   //               await payslipTypeService.remove(id);
//   //               fetchTypes();
//   //               onClose();
//   //             }}
//   //           >
//   //             Yes
//   //           </Button>
//   //         </div>
//   //       </div>
//   //     ),
//   //   });
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
//                 await payslipTypeService.remove(id);

//                 fetchTypes();

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
//   const filteredTypes = types.filter((t) =>
//     t.name.toLowerCase().includes(search.toLowerCase())
//   );

//   const startIndex = (currentPage - 1) * entriesPerPage;
//   const currentTypes = filteredTypes.slice(
//     startIndex,
//     startIndex + entriesPerPage
//   );
//   const pageCount = Math.ceil(filteredTypes.length / entriesPerPage);

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
//         <h5 className="fw-bold">Manage Payslip Types</h5>
//         <Button variant="success" onClick={() => setShowModal(true)}>
//           +
//         </Button>
//       </div>

//       <div className="d-flex justify-content-between align-items-center mb-3">
//         <div className="d-flex align-items-center">
//           <select
//             className="form-select me-2"
//             style={{ width: "80px" }}
//             value={entriesPerPage}
//             onChange={(e) => {
//               setEntriesPerPage(Number(e.target.value));
//               setCurrentPage(1);
//             }}
//           >
//             <option value={10}>10</option>
//             <option value={25}>25</option>
//             <option value={50}>50</option>
//           </select>
//           <span>entries per page</span>
//         </div>
//         <Form.Control
//           type="text"
//           placeholder="Search..."
//           style={{ maxWidth: "250px" }}
//           value={search}
//           onChange={(e) => {
//             setSearch(e.target.value);
//             setCurrentPage(1);
//           }}
//         />
//       </div>

//       <div className="table-responsive">
//         <table className="table table-bordered table-hover table-striped">
//           <thead className="table-light">
//             <tr>
//               <th>Payslip Type Name</th>
//               <th style={{ width: "120px" }}>Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {currentTypes.length > 0 ? (
//               currentTypes.map((type) => (
//                 <tr key={type.id}>
//                   <td>{type.name}</td>
//                   <td>
//                     <Button
//                       className="btn btn-info btn-sm me-2"
//                       onClick={() => handleEdit(type)}
//                     >
//                       <FaEdit />
//                     </Button>
//                     <Button
//                       className="btn btn-danger btn-sm"
//                       onClick={() => handleDelete(type.id)}
//                     >
//                       <FaTrash />
//                     </Button>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="2" className="text-center">
//                   No payslip types found.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* <div className="d-flex justify-content-between align-items-center mt-3">
//         <span>
//           Showing {filteredTypes.length === 0 ? 0 : startIndex + 1} to{" "}
//           {Math.min(startIndex + entriesPerPage, filteredTypes.length)} of{" "}
//           {filteredTypes.length} entries
//         </span>
//         <ul className="pagination pagination-sm mb-0">
//           {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
//             <li
//               key={page}
//               className={`page-item ${currentPage === page ? "active" : ""}`}
//             >
//               <button
//                 className="page-link"
//                 onClick={() => setCurrentPage(page)}
//               >
//                 {page}
//               </button>
//             </li>
//           ))}
//         </ul>
//       </div> */}

//       {/* Pagination */}
//       <div className="d-flex justify-content-between align-items-center">
//         <div className="small text-muted">
//           Showing {filteredTypes.length === 0 ? 0 : startIndex + 1} to{" "}
//           {Math.min(startIndex + entriesPerPage, filteredTypes.length)} of{" "}
//           {filteredTypes.length} entries
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

//       {/* <Modal show={showModal} onHide={() => setShowModal(false)} centered>
//         <Modal.Header closeButton>
//           <Modal.Title>
//             {editId ? "Edit Payslip Type" : "Create Payslip Type"}
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form.Group className="mb-3">
//             <Form.Label>Payslip Type Name</Form.Label>
//             <Form.Control
//               type="text"
//               value={newType.name}
//               onChange={(e) => setNewType({ ...newType, name: e.target.value })}
//               placeholder="Enter payslip type name"
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
//             {editId ? "Edit Payslip Type" : "Create Payslip Type"}
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form.Group className="mb-3">
//             <Form.Label>Payslip Type Name</Form.Label>
//             <Form.Control
//               type="text"
//               value={newType.name}
//               onChange={(e) => setNewType({ ...newType, name: e.target.value })}
//               placeholder="Enter payslip type name"
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

// export default PayslipTypeList;

// import React, { useEffect, useState } from "react";
// import payslipTypeService from "../../../services/paysliptypeService";

// import { Modal, Button, Form } from "react-bootstrap";
// import { FaEdit, FaTrash } from "react-icons/fa";
// import { confirmAlert } from "react-confirm-alert";
// import "react-confirm-alert/src/react-confirm-alert.css";
// import { OverlayTrigger, Tooltip } from "react-bootstrap";
// import { toast } from "react-toastify";

// const PayslipTypeList = () => {
//   const [types, setTypes] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [newType, setNewType] = useState({ name: "" });
//   const [editId, setEditId] = useState(null);
//   const [search, setSearch] = useState("");
//   const [entriesPerPage, setEntriesPerPage] = useState(5);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [isClosing, setIsClosing] = useState(false); // ? for animation

//   useEffect(() => {
//     fetchTypes();
//   }, []);

//   const fetchTypes = async () => {
//     try {
//       const res = await payslipTypeService.getAll(); // res is already an array
//       console.log("Fetched data:", res); // Debug
//       setTypes(Array.isArray(res) ? res : []);
//     } catch (err) {
//       console.error("Error fetching types:", err);
//     }
//   };

//   const handleSave = async () => {
//     try {
//       if (editId) {
//         await payslipTypeService.update(editId, newType);
//         toast.success("Payslip successfully updated.", {
//           icon: false,
//         });
//       } else {
//         await payslipTypeService.create(newType);
//         toast.success("Payslip successfully created.", {
//           icon: false,
//         });
//       }
//       setNewType({ name: "" });
//       setEditId(null);
//       handleCloseModal();
//       fetchTypes();
//     } catch (err) {
//       console.error("Error saving:", err);
//     }
//   };

//   const handleEdit = (type) => {
//     setEditId(type.id);
//     setNewType({ name: type.name });
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
//                 await payslipTypeService.remove(id);

//                 fetchTypes();

//                 onClose();
//                 toast.success("Payslip deleted successfully.", {
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
//   const filteredTypes = types.filter((t) =>
//     t.name.toLowerCase().includes(search.toLowerCase())
//   );

//   const startIndex = (currentPage - 1) * entriesPerPage;
//   const currentTypes = filteredTypes.slice(
//     startIndex,
//     startIndex + entriesPerPage
//   );
//   const pageCount = Math.ceil(filteredTypes.length / entriesPerPage);

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
//         <h5 className="fw-bold">Manage Payslip Types</h5>
//        <OverlayTrigger overlay={<Tooltip>Create</Tooltip>}>
//         <Button variant="success" onClick={() => setShowModal(true)}>
//           <i className="bi bi-plus-lg fs-6"></i>
//         </Button>
//         </OverlayTrigger>
//       </div>

//       <div className="d-flex justify-content-between align-items-center mb-3">
//         <div className="d-flex align-items-center">
//           <select
//             className="form-select me-2 entries-select"
//             style={{ width: "80px" }}
//             value={entriesPerPage}
//             onChange={(e) => {
//               setEntriesPerPage(Number(e.target.value));
//               setCurrentPage(1);
//             }}
//           >
//             <option value={5}>5</option>
//             <option value={10}>10</option>
//             <option value={25}>25</option>
//             <option value={50}>50</option>
//             <option value={100}>100</option>
//           </select>
//           <span>entries per page</span>
//         </div>
//         <Form.Control
//         className="entries-select"
//           type="text"
//           placeholder="Search..."
//           style={{ maxWidth: "250px" }}
//           value={search}
//           onChange={(e) => {
//             setSearch(e.target.value);
//             setCurrentPage(1);
//           }}
//         />
//       </div>

//       <div className="table-responsive">
//         <table className="table table-bordered table-hover table-striped">
//           <thead className="table-light">
//             <tr>
//               <th>Payslip Type Name</th>
//               <th style={{ width: "120px" }}>Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {currentTypes.length > 0 ? (
//               currentTypes.map((type) => (
//                 <tr key={type.id}>
//                   <td>{type.name}</td>
//                   <td>
//                     <OverlayTrigger
//                       placement="top"
//                       overlay={<Tooltip>Edit</Tooltip>}
//                     >
//                       <Button
//                         className="btn btn-info btn-sm me-2"
//                         onClick={() => handleEdit(type)}
//                       >
//                         <FaEdit />
//                       </Button>
//                     </OverlayTrigger>
//                     <OverlayTrigger
//                       placement="top"
//                       overlay={<Tooltip>Delete</Tooltip>}
//                     >
//                       <Button
//                         className="btn btn-danger btn-sm"
//                         onClick={() => handleDelete(type.id)}
//                       >
//                         <FaTrash />
//                       </Button>
//                     </OverlayTrigger>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="2" className="text-center">
//                   No payslip types found.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Pagination */}
//       <div className="d-flex justify-content-between align-items-center">
//         <div className="small text-muted">
//           Showing {filteredTypes.length === 0 ? 0 : startIndex + 1} to{" "}
//           {Math.min(startIndex + entriesPerPage, filteredTypes.length)} of{" "}
//           {filteredTypes.length} entries
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
//             {editId ? "Edit Payslip Type" : "Create Payslip Type"}
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form.Group className="mb-3">
//             <Form.Label>Payslip Type Name <span className="text-danger">*</span></Form.Label>
//             <Form.Control
//               type="text"
//               value={newType.name}
//               onChange={(e) => setNewType({ ...newType, name: e.target.value })}
//               placeholder="Enter payslip type name"
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

// export default PayslipTypeList;

import React, { useEffect, useState } from "react";
import payslipTypeService from "../../../services/paysliptypeService";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { toast } from "react-toastify";

const PayslipTypeList = () => {
  const [types, setTypes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newType, setNewType] = useState({ name: "" });
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isClosing, setIsClosing] = useState(false);
  const [errors, setErrors] = useState({}); // ✅ added validation state
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    try {
      const res = await payslipTypeService.getAll();
      setTypes(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("Error fetching types:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Added validation logic before saving
  const handleSave = async () => {
    const newErrors = {};
    if (!newType.name.trim()) newErrors.name = "Payslip type name is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    try {
      if (editId) {
        await payslipTypeService.update(editId, newType);
        toast.success("Payslip successfully updated.", { icon: false });
      } else {
        await payslipTypeService.create(newType);
        toast.success("Payslip successfully created.", { icon: false });
      }
      setNewType({ name: "" });
      setEditId(null);
      handleCloseModal();
      fetchTypes();
    } catch (err) {
      console.error("Error saving:", err);
    }
  };

  const handleEdit = (type) => {
    setEditId(type.id);
    setNewType({ name: type.name });
    setErrors({}); // ✅ clear errors on edit
    setShowModal(true);
  };

  const handleDelete = (id) => {
    confirmAlert({
      customUI: ({ onClose }) => (
        <div className="custom-confirm-modal bg-white p-4 rounded shadow text-center">
          <div style={{ fontSize: "50px", color: "#ff9900" }}>❗</div>
          <h4 className="fw-bold mt-2">Are you sure?</h4>
          <p>This action can not be undone. Do you want to continue?</p>
          <div className="d-flex justify-content-center mt-3">
            <Button variant="danger" className="me-2 px-4" onClick={onClose}>
              No
            </Button>
            <Button
              variant="success"
              className="px-4"
              onClick={async () => {
                await payslipTypeService.remove(id);
                fetchTypes();
                onClose();
                toast.success("Payslip deleted successfully.", { icon: false });
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
      setErrors({}); // ✅ reset errors on close
    }, 400);
  };

  const filteredTypes = types.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const startIndex = (currentPage - 1) * entriesPerPage;
  const currentTypes = filteredTypes.slice(
    startIndex,
    startIndex + entriesPerPage
  );
  const pageCount = Math.ceil(filteredTypes.length / entriesPerPage);

  return (
    <div className="bg-white p-3 rounded shadow-sm">
      <style>{`
        .entries-select:focus {
          border-color: #6FD943 !important;
          box-shadow: 0 0 0px 4px #70d94360 !important;
        }
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

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold">Manage Payslip Types</h5>
        <OverlayTrigger overlay={<Tooltip>Create</Tooltip>}>
          <Button
            variant="success"
            onClick={() => {
              setEditId(null);
              setNewType({ name: "" }); // ✅ clear previous data
              setErrors({}); // ✅ clear any validation errors
              setShowModal(true);
            }}
          >
            <i className="bi bi-plus-lg fs-6"></i>
          </Button>
        </OverlayTrigger>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center">
          <select
            className="form-select me-2 "
            style={{ width: "80px" }}
            value={entriesPerPage}
            onChange={(e) => {
              setEntriesPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            {/* <option value={5}>5</option> */}
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <Form.Control
          className=""
          type="text"
          placeholder="Search..."
          style={{ maxWidth: "250px" }}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      <div className="table-responsive">
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="success" />
          </div>
        ) : (
          <table className="table table-bordered table-hover table-striped">
            <thead className="table-light">
              <tr>
                <th>Payslip Type Name</th>
                <th style={{ width: "120px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentTypes.length > 0 ? (
                currentTypes.map((type) => (
                  <tr key={type.id}>
                    <td>{type.name}</td>
                    <td>
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Edit</Tooltip>}
                      >
                        <Button
                          className="btn btn-info btn-sm me-2"
                          onClick={() => handleEdit(type)}
                        >
                         <i className="bi bi-pencil text-white"></i>
                        </Button>
                      </OverlayTrigger>
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Delete</Tooltip>}
                      >
                        <Button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(type.id)}
                        >
                          <FaTrash />
                        </Button>
                      </OverlayTrigger>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="2" className="text-center">
                    No payslip types found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="d-flex justify-content-between align-items-center">
        <div className="small text-muted">
          Showing {filteredTypes.length === 0 ? 0 : startIndex + 1} to{" "}
          {Math.min(startIndex + entriesPerPage, filteredTypes.length)} of{" "}
          {filteredTypes.length} entries
        </div>
        <div>
          <ul className="pagination pagination-sm mb-0">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button
                className="page-link"
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                «
              </button>
            </li>
            {Array.from({ length: pageCount }, (_, i) => (
              <li
                key={i + 1}
                className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              </li>
            ))}
            <li
              className={`page-item ${
                currentPage === pageCount ? "disabled" : ""
              }`}
            >
              <button
                className="page-link"
                onClick={() => setCurrentPage((p) => p + 1)}
              >
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
          <Modal.Title>
            {editId ? "Edit Payslip Type" : "Create Payslip Type"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* ✅ Added validation feedback */}
          <Form.Group className="mb-3">
            <Form.Label>
              Payslip Type Name <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              value={newType.name}
              onChange={(e) => setNewType({ ...newType, name: e.target.value })}
              placeholder="Enter payslip type name"
              isInvalid={!!errors.name}
            />
            <Form.Control.Feedback type="invalid">
              {errors.name}
            </Form.Control.Feedback>
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

export default PayslipTypeList;
