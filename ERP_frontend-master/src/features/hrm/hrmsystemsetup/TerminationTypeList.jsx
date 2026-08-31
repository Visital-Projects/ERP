// import React, { useEffect, useState } from "react";
// import {
//   getTerminationTypes,
//   createTerminationType,
//   updateTerminationType,
//   deleteTerminationType,
// } from "../../../services/terminationTypeService";
// import { Modal, Button, Form } from "react-bootstrap";
// import { FaEdit, FaTrash } from "react-icons/fa";
// import { confirmAlert } from "react-confirm-alert";
// import "react-confirm-alert/src/react-confirm-alert.css";

// const TerminationTypeList = () => {
//   const [terminationTypes, setTerminationTypes] = useState([]);
//   const [formData, setFormData] = useState({ name: "" });
//   const [showModal, setShowModal] = useState(false);
//   const [editId, setEditId] = useState(null);
//   const [search, setSearch] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [entriesPerPage, setEntriesPerPage] = useState(10);

//   const [isClosing, setIsClosing] = useState(false); // ✅ for animation

//   useEffect(() => {
//     loadTerminationTypes();
//   }, []);

//   const loadTerminationTypes = async () => {
//     try {
//       const res = await getTerminationTypes();
//       setTerminationTypes(res.data || []); // ✅ use res.data
//     } catch (err) {
//       console.error("Failed to load termination types", err);
//     }
//   };

//   const handleSave = async () => {
//     try {
//       if (!formData.name.trim()) {
//         alert("Name is required");
//         return;
//       }
//       if (editId) {
//         await updateTerminationType(editId, formData);
//       } else {
//         await createTerminationType(formData);
//       }
//       handleCloseModal();
//       setFormData({ name: "" });
//       setEditId(null);
//       loadTerminationTypes();
//     } catch (err) {
//       console.error("Failed to save", err);
//     }
//   };

//   const handleEdit = (item) => {
//     setFormData({ name: item.name });
//     setEditId(item.id);
//     setShowModal(true);
//   };

//   // const handleDelete = (id) => {
//   //   confirmAlert({
//   //     customUI: ({ onClose }) => (
//   //       <div className="custom-ui bg-white p-4 rounded shadow text-center">
//   //         <h5>Are you sure?</h5>
//   //         <p>This action cannot be undone.</p>
//   //         <Button variant="secondary" onClick={onClose} className="me-2">Cancel</Button>
//   //         <Button variant="danger" onClick={async () => {
//   //           await deleteTerminationType(id);
//   //           loadTerminationTypes();
//   //           onClose();
//   //         }}>Delete</Button>
//   //       </div>
//   //     )
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
//                 await deleteTerminationType(id);
//                 loadTerminationTypes();
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
//   const filtered = terminationTypes.filter((t) =>
//     t.name.toLowerCase().includes(search.toLowerCase())
//   );

//   const pageCount = Math.ceil(filtered.length / entriesPerPage);
//   const startIndex = (currentPage - 1) * entriesPerPage;
//   const currentData = filtered.slice(startIndex, startIndex + entriesPerPage);

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
//       <div className="d-flex justify-content-between mb-3">
//         <h5 className="fw-bold mb-0">Manage Termination Types</h5>
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
//               <th>Name</th>
//               <th style={{ width: "120px" }}>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {currentData.length > 0 ? (
//               currentData.map((item) => (
//                 <tr key={item.id}>
//                   <td>{item.name}</td>
//                   <td>
//                     <Button
//                       variant="info"
//                       size="sm"
//                       className="me-2"
//                       onClick={() => handleEdit(item)}
//                     >
//                       <FaEdit />
//                     </Button>
//                     <Button
//                       variant="danger"
//                       size="sm"
//                       onClick={() => handleDelete(item.id)}
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
//           Showing {filtered.length === 0 ? 0 : startIndex + 1} to{" "}
//           {Math.min(startIndex + entriesPerPage, filtered.length)} of{" "}
//           {filtered.length}
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
//           Showing {filtered.length === 0 ? 0 : startIndex + 1} to{" "}
//           {Math.min(startIndex + entriesPerPage, filtered.length)} of{" "}
//           {filtered.length} entries
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
//       {/*
//       <Modal show={showModal} onHide={() => setShowModal(false)} centered>
//         <Modal.Header closeButton>
//           <Modal.Title>
//             {editId ? "Edit" : "Create"} Termination Type
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form.Group>
//             <Form.Label>Name</Form.Label>
//             <Form.Control
//               type="text"
//               placeholder="Enter termination type"
//               value={formData.name}
//               onChange={(e) =>
//                 setFormData({ ...formData, name: e.target.value })
//               }
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
//         style={{
//           overflowY: "auto",
//           scrollbarWidth: "none",
//         }}
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>
//             {editId ? "Edit" : "Create"} Termination Type
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form.Group>
//             <Form.Label>Name</Form.Label>
//             <Form.Control
//               type="text"
//               placeholder="Enter termination type"
//               value={formData.name}
//               onChange={(e) =>
//                 setFormData({ ...formData, name: e.target.value })
//               }
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

// export default TerminationTypeList;

import React, { useEffect, useState } from "react";
import {
  getTerminationTypes,
  createTerminationType,
  updateTerminationType,
  deleteTerminationType,
} from "../../../services/terminationTypeService";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { toast } from "react-toastify";

const TerminationTypeList = () => {
  const [terminationTypes, setTerminationTypes] = useState([]);
  const [formData, setFormData] = useState({ name: "" });
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [validationError, setValidationError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isClosing, setIsClosing] = useState(false); // ? for animation

  useEffect(() => {
    loadTerminationTypes();
  }, []);

  const loadTerminationTypes = async () => {
    try {
      const res = await getTerminationTypes();
      setTerminationTypes(res.data || []); // ? use res.data
    } catch (err) {
      console.error("Failed to load termination types", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setValidationError("Termination type name is required");
      return;
    }

    setValidationError(""); // clear previous error

    try {
      if (editId) {
        await updateTerminationType(editId, formData);
        toast.success("Termination successfully updated.", { icon: false });
      } else {
        await createTerminationType(formData);
        toast.success("Termination successfully created.", { icon: false });
      }
      handleCloseModal();
      setFormData({ name: "" });
      setEditId(null);
      loadTerminationTypes();
    } catch (err) {
      console.error("Failed to save termination type", err);
      toast.error("Error saving termination type");
    }
  };

  const handleEdit = (item) => {
    setFormData({ name: item.name });
    setEditId(item.id);
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
                await deleteTerminationType(id);
                loadTerminationTypes();
                onClose();
                toast.success("Termination deleted successfully.", {
                  icon: false,
                });
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
    }, 400); // match animation duration
  };
  const filtered = terminationTypes.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const pageCount = Math.ceil(filtered.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const currentData = filtered.slice(startIndex, startIndex + entriesPerPage);

  return (
    <div className="bg-white p-3 rounded shadow-sm">
      <style>{`
  .entries-select:focus {
    border-color: #6FD943 !important;
    box-shadow: 0 0 0px 4px #70d94360 !important;
  }
`}</style>
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
      <div className="d-flex justify-content-between mb-3">
        <h5 className="fw-bold mb-0">Manage Termination Types</h5>
        <OverlayTrigger overlay={<Tooltip>Create</Tooltip>}>
          <Button
            variant="success"
            onClick={() => {
              setEditId(null); // ✅ clear edit mode
              setFormData({ name: "" }); // ✅ reset form input
              setValidationError(""); // ✅ clear old validation
              setShowModal(true); // ✅ open modal fresh
            }}
          >
            <i className="bi bi-plus-lg fs-6"></i>
          </Button>
        </OverlayTrigger>
      </div>

      <div className="d-flex justify-content-between mb-3">
        <div className="d-flex align-items-center">
          <Form.Select
            className="me-2"
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
                <th>Name</th>
                <th style={{ width: "120px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentData.length > 0 ? (
                currentData.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Edit</Tooltip>}
                      >
                        <Button
                          variant="info"
                          size="sm"
                          className="me-2"
                          onClick={() => handleEdit(item)}
                        >
                          <i className="bi bi-pencil text-white"></i>
                        </Button>
                      </OverlayTrigger>
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Delete</Tooltip>}
                      >
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
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
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="d-flex justify-content-between align-items-center">
        <div className="small text-muted">
          Showing {filtered.length === 0 ? 0 : startIndex + 1} to{" "}
          {Math.min(startIndex + entriesPerPage, filtered.length)} of{" "}
          {filtered.length} entries
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
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        centered
        className={`custom-slide-modal ${isClosing ? "closing" : "open"}`}
        style={{
          overflowY: "auto",
          scrollbarWidth: "none",
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editId ? "Edit" : "Create"} Termination Type
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>
                Name <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter termination type"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                isInvalid={!!validationError} // red border on error
              />
              <Form.Control.Feedback type="invalid">
                {validationError}
              </Form.Control.Feedback>
            </Form.Group>
          </Form>
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

export default TerminationTypeList;
