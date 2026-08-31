// import React, { useEffect, useState } from "react";
// import { Modal, Button, Form } from "react-bootstrap";
// import { FaEdit, FaTrash } from "react-icons/fa";
// import allowanceTypeService from "../../../services/allowanceTypeService";
// import { confirmAlert } from "react-confirm-alert";
// import "react-confirm-alert/src/react-confirm-alert.css";

// const AllowanceTypeList = () => {
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

//   // ✅ Fetch all allowance types
//   const fetchTypes = async () => {
//     try {
//       const data = await allowanceTypeService.getAllAllowanceOptions(); // ✅ updated
//       setTypes(data);
//     } catch (err) {
//       console.error("Failed to fetch allowance types:", err);
//     }
//   };

//   // ✅ Create or update
//   const handleSave = async () => {
//     try {
//       if (editId) {
//         await allowanceTypeService.updateAllowanceOption(editId, newType); // ✅ updated
//       } else {
//         await allowanceTypeService.createAllowanceOption(newType); // ✅ updated
//       }
//       setNewType({ name: "" });
//       setEditId(null);
//       handleCloseModal();
//       fetchTypes();
//     } catch (err) {
//       console.error("Save failed:", err);
//     }
//   };

//   // ✅ Edit modal
//   const handleEdit = (type) => {
//     setEditId(type.id);
//     setNewType({ name: type.name });
//     setShowModal(true);
//   };

//   // ✅ Delete
//   // const handleDelete = (id) => {
//   //   confirmAlert({
//   //     customUI: ({ onClose }) => (
//   //       <div className="custom-ui bg-white p-4 rounded text-center shadow">
//   //         <h5 className="fw-bold mb-2">Are you sure?</h5>
//   //         <p className="mb-3">This action cannot be undone.</p>
//   //         <Button variant="secondary" className="me-2" onClick={onClose}>
//   //           Cancel
//   //         </Button>
//   //         <Button
//   //           variant="danger"
//   //           onClick={async () => {
//   //             await allowanceTypeService.deleteAllowanceOption(id); // ✅ updated
//   //             fetchTypes();
//   //             onClose();
//   //           }}
//   //         >
//   //           Delete
//   //         </Button>
//   //       </div>
//   //     ),
//   //   });
//   // };

//   // const handleDelete = (id) => {
//   //   confirmAlert({
//   //     customUI: ({ onClose }) => (
//   //       <div className="custom-ui bg-white p-4 rounded text-center shadow">
//   //         <h5 className="fw-bold mb-2">Are you sure?</h5>

//   //         <p className="mb-3">This action cannot be undone.</p>

//   //         <Button variant="secondary" className="me-2" onClick={onClose}>
//   //           Cancel
//   //         </Button>

//   //         <Button
//   //           variant="danger"
//   //           onClick={async () => {
//   //             await allowanceTypeService.remove(id);

//   //             fetchTypes();

//   //             onClose();
//   //           }}
//   //         >
//   //           Delete
//   //         </Button>
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
//                 const handleDelete = (id) => {
//                   confirmAlert({
//                     customUI: ({ onClose }) => (
//                       <div className="custom-confirm-modal bg-white p-4 rounded shadow text-center">
//                         <div style={{ fontSize: "50px", color: "#ff9900" }}>
//                           ❗
//                         </div>
//                         <h4 className="fw-bold mt-2">Are you sure?</h4>
//                         <p>
//                           This action can not be undone. Do you want to
//                           continue?
//                         </p>
//                         <div className="d-flex justify-content-center mt-3">
//                           <Button
//                             variant="danger"
//                             className="me-2 px-4"
//                             onClick={onClose}
//                           >
//                             No
//                           </Button>
//                           <Button
//                             variant="success"
//                             className="px-4"
//                             onClick={async () => {
//                               await allowanceTypeService.remove(id);

//                               fetchTypes();
//                               onClose();
//                             }}
//                           >
//                             Yes
//                           </Button>
//                         </div>
//                       </div>
//                     ),
//                   });
//                 };
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
//       <div className="d-flex justify-content-between mb-3 align-items-center">
//         <h5 className="fw-bold mb-0">Manage Allowance Types</h5>
//         <Button variant="success" onClick={() => setShowModal(true)}>
//           +
//         </Button>
//       </div>

//       <div className="d-flex justify-content-between mb-3">
//         <div className="d-flex align-items-center">
//           <Form.Select
//             value={entriesPerPage}
//             onChange={(e) => {
//               setEntriesPerPage(Number(e.target.value));
//               setCurrentPage(1);
//             }}
//             className="me-2"
//             style={{ width: "80px" }}
//           >
//             <option value={10}>10</option>
//             <option value={25}>25</option>
//             <option value={50}>50</option>
//           </Form.Select>
//           <span>entries per page</span>
//         </div>
//         <Form.Control
//           type="text"
//           placeholder="Search..."
//           value={search}
//           onChange={(e) => {
//             setSearch(e.target.value);
//             setCurrentPage(1);
//           }}
//           style={{ width: "250px" }}
//         />
//       </div>

//       <div className="table-responsive">
//         <table className="table table-bordered table-hover table-striped">
//           <thead className="table-light">
//             <tr>
//               <th>Allowance Type Name</th>
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
//                       variant="info"
//                       size="sm"
//                       className="me-2"
//                       onClick={() => handleEdit(type)}
//                     >
//                       <FaEdit />
//                     </Button>
//                     <Button
//                       variant="danger"
//                       size="sm"
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
//                   No records found.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* <div className="d-flex justify-content-between align-items-center">
//         <span>
//           Showing {filteredTypes.length === 0 ? 0 : startIndex + 1} to{" "}
//           {Math.min(startIndex + entriesPerPage, filteredTypes.length)} of{" "}
//           {filteredTypes.length}
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

//       {/* Modal */}
//       {/* <Modal show={showModal} onHide={() => setShowModal(false)} centered>
//         <Modal.Header closeButton>
//           <Modal.Title>
//             {editId ? "Edit Allowance Type" : "Create Allowance Type"}
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form.Group>
//             <Form.Label>Name</Form.Label>
//             <Form.Control
//               type="text"
//               value={newType.name}
//               onChange={(e) => setNewType({ ...newType, name: e.target.value })}
//               placeholder="Enter allowance type name"
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
//         animation={false}
//         className={
//           showModal || isClosing
//             ? `custom-slide-modal ${isClosing ? "closing" : "open"}`
//             : ""
//         }
//         style={{ overflowY: "auto", scrollbarWidth: "none" }}
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>
//             {editId ? "Edit Allowance Type" : "Create Allowance Type"}
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form.Group>
//             <Form.Label>Name</Form.Label>
//             <Form.Control
//               type="text"
//               value={newType.name}
//               onChange={(e) => setNewType({ ...newType, name: e.target.value })}
//               placeholder="Enter allowance type name"
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

// export default AllowanceTypeList;











// import React, { useEffect, useState } from "react";
// import { Modal, Button, Form } from "react-bootstrap";
// import { FaEdit, FaTrash } from "react-icons/fa";
// import allowanceTypeService from "../../../services/allowanceTypeService";
// import { confirmAlert } from "react-confirm-alert";
// import "react-confirm-alert/src/react-confirm-alert.css";
// import { OverlayTrigger, Tooltip } from "react-bootstrap";
// import { toast } from "react-toastify";

// const AllowanceTypeList = () => {
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

//   // ? Fetch all allowance types
//   const fetchTypes = async () => {
//     try {
//       const data = await allowanceTypeService.getAllAllowanceOptions(); // ? updated
//       setTypes(data);
//     } catch (err) {
//       console.error("Failed to fetch allowance types:", err);
//     }
//   };

//   // ? Create or update
//   const handleSave = async () => {
//     try {
//       if (editId) {
//         await allowanceTypeService.updateAllowanceOption(editId, newType); // ? updated
//         toast.success("Allowance successfully updated.", {
//           icon: false,
//         });
//       } else {
//         await allowanceTypeService.createAllowanceOption(newType); // ? updated
//         toast.success("Allowance successfully created.", {
//           icon: false,
//         });
//       }
//       setNewType({ name: "" });
//       setEditId(null);
//       handleCloseModal();
//       fetchTypes();
//     } catch (err) {
//       console.error("Save failed:", err);
//     }
//   };

//   // ? Edit modal
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
//                 await allowanceTypeService.deleteAllowanceOption(id);
//                 fetchTypes();
//                 onClose();
//                 toast.success("Allowance deleted successfully .", {
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
//     }, 700); // match animation duration
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
//       <div className="d-flex justify-content-between mb-3 align-items-center">
//         <h5 className="fw-bold mb-0">Manage Allowance Types</h5>

//         <OverlayTrigger overlay={<Tooltip>Create</Tooltip>}>
//         <Button variant="success" onClick={() => setShowModal(true)}>
//           <i className="bi bi-plus-lg fs-6"></i>
//         </Button>
//         </OverlayTrigger>

//       </div>

//       <div className="d-flex justify-content-between mb-3">
//         <div className="d-flex align-items-center">
//           <Form.Select
//           className="entries-select me-2"
//             value={entriesPerPage}
//             onChange={(e) => {
//               setEntriesPerPage(Number(e.target.value));
//               setCurrentPage(1);
//             }}

//             style={{ width: "80px" }}
//           >
//             <option value={5}>5</option>
//             <option value={10}>10</option>
//             <option value={25}>25</option>
//             <option value={50}>50</option>
//             <option value={100}>100</option>
//           </Form.Select>
//           <span>entries per page</span>
//         </div>
//         <Form.Control
//         className="entries-select"
//           type="text"
//           placeholder="Search..."
//           value={search}
//           onChange={(e) => {
//             setSearch(e.target.value);
//             setCurrentPage(1);
//           }}
//           style={{ width: "250px" }}
//         />
//       </div>

//       <div className="table-responsive">
//         <table className="table table-bordered table-hover table-striped">
//           <thead className="table-light">
//             <tr>
//               <th>Allowance Type Name</th>
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
//                         variant="info"
//                         size="sm"
//                         className="me-2"
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
//                         variant="danger"
//                         size="sm"
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
//                   No records found.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
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

//       <Modal
//         show={showModal}
//         onHide={handleCloseModal}
//         centered
//         animation={false}
//         className={
//           showModal || isClosing
//             ? `custom-slide-modal ${isClosing ? "closing" : "open"}`
//             : ""
//         }
//         style={{ overflowY: "auto", scrollbarWidth: "none" }}
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>
//             {editId ? "Edit Allowance Type" : "Create Allowance Type"}
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form.Group>
//             <Form.Label>Name <span className="text-danger">*</span></Form.Label>
//             <Form.Control
//               type="text"
//               value={newType.name}
//               onChange={(e) => setNewType({ ...newType, name: e.target.value })}
//               placeholder="Enter allowance type name"
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

// export default AllowanceTypeList;














import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";
import allowanceTypeService from "../../../services/allowanceTypeService";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { toast } from "react-toastify";

const AllowanceTypeList = () => {
  const [types, setTypes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newType, setNewType] = useState({ name: "" });
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isClosing, setIsClosing] = useState(false);
  const [errors, setErrors] = useState({}); // ✅ validation state
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    try {
      const data = await allowanceTypeService.getAllAllowanceOptions();
      setTypes(data);
    } catch (err) {
      console.error("Failed to fetch allowance types:", err);
    } finally {
      setLoading(false)
    }
  };

  // ✅ Form validation before save
  const handleSave = async () => {
    const newErrors = {};
    if (!newType.name.trim()) newErrors.name = "Allowance type name is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    try {
      if (editId) {
        await allowanceTypeService.updateAllowanceOption(editId, newType);
        toast.success("Allowance successfully updated.", { icon: false });
      } else {
        await allowanceTypeService.createAllowanceOption(newType);
        toast.success("Allowance successfully created.", { icon: false });
      }
      setNewType({ name: "" });
      setEditId(null);
      handleCloseModal();
      fetchTypes();
    } catch (err) {
      console.error("Save failed:", err);
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
                await allowanceTypeService.deleteAllowanceOption(id);
                fetchTypes();
                onClose();
                toast.success("Allowance deleted successfully.", { icon: false });
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
      setErrors({}); // ✅ reset errors on modal close
    }, 700);
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

      <div className="d-flex justify-content-between mb-3 align-items-center">
        <h5 className="fw-bold mb-0">Manage Allowance Types</h5>
        <OverlayTrigger overlay={<Tooltip>Create</Tooltip>}>
          <Button
            variant="success"
            onClick={() => {
              setEditId(null); // ✅ clear edit mode
              setNewType({ name: "" }); // ✅ clear input field
              setErrors({}); // ✅ clear validation errors
              setShowModal(true); // ✅ open fresh modal
            }}
          >
            <i className="bi bi-plus-lg fs-6"></i>
          </Button>
        </OverlayTrigger>

      </div>

      <div className="d-flex justify-content-between mb-3">
        <div className="d-flex align-items-center">
          <Form.Select
            className=" me-2"
            value={entriesPerPage}
            onChange={(e) => {
              setEntriesPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            style={{ width: "80px" }}
          >

            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </Form.Select>

        </div>
        <Form.Control
          className=""
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          style={{ width: "250px" }}
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
                <th>Allowance Type Name</th>
                <th style={{ width: "120px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentTypes.length > 0 ? (
                currentTypes.map((type) => (
                  <tr key={type.id}>
                    <td>{type.name}</td>
                    <td>
                      <OverlayTrigger placement="top" overlay={<Tooltip>Edit</Tooltip>}>
                        <Button
                          variant="info"
                          size="sm"
                          className="me-2"
                          onClick={() => handleEdit(type)}
                        >
                          <i className="bi bi-pencil text-white"></i>
                        </Button>
                      </OverlayTrigger>
                      <OverlayTrigger placement="top" overlay={<Tooltip>Delete</Tooltip>}>
                        <Button
                          variant="danger"
                          size="sm"
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
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>)}
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
                <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
                  {i + 1}
                </button>
              </li>
            ))}
            <li
              className={`page-item ${currentPage === pageCount ? "disabled" : ""}`}
            >
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
        animation={false}
        className={showModal || isClosing ? `custom-slide-modal ${isClosing ? "closing" : "open"}` : ""}
        style={{ overflowY: "auto", scrollbarWidth: "none" }}
      >
        <Modal.Header closeButton>
          <Modal.Title>{editId ? "Edit Allowance Type" : "Create Allowance Type"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>
              Name <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              value={newType.name}
              onChange={(e) => setNewType({ ...newType, name: e.target.value })}
              placeholder="Enter allowance type name"
              isInvalid={!!errors.name} // ✅ show red border if invalid
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

export default AllowanceTypeList;
