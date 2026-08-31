// import React, { useEffect, useState } from "react";
// import {
//   getTrainingTypes,
//   createTrainingType,
//   updateTrainingType,
//   deleteTrainingType,
// } from "../../../services/trainingTypeService";
// import { Modal, Button, Form } from "react-bootstrap";
// import { FaEdit, FaTrash } from "react-icons/fa";
// import { confirmAlert } from "react-confirm-alert";
// import "react-confirm-alert/src/react-confirm-alert.css";

// const TrainingTypeList = () => {
//   const [trainingTypes, setTrainingTypes] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [newType, setNewType] = useState({ name: "" });
//   const [editId, setEditId] = useState(null);
//   const [search, setSearch] = useState("");
//   const [entriesPerPage, setEntriesPerPage] = useState(10);
//   const [currentPage, setCurrentPage] = useState(1);

//   const [isClosing, setIsClosing] = useState(false); // ✅ for animation

//   useEffect(() => {
//     loadTrainingTypes();
//   }, []);

//   const loadTrainingTypes = async () => {
//     try {
//       const data = await getTrainingTypes();
//       setTrainingTypes(data || []);
//     } catch (err) {
//       console.error("Error loading training types:", err.message || err);
//     }
//   };

//   const handleSave = async () => {
//     try {
//       if (!newType.name || newType.name.trim() === "") {
//         alert("Name is required");
//         return;
//       }

//       if (editId) {
//         await updateTrainingType(editId, { name: newType.name });
//       } else {
//         await createTrainingType({ name: newType.name });
//       }

//       setNewType({ name: "" });
//       setEditId(null);
//       handleCloseModal();
//       loadTrainingTypes();
//     } catch (err) {
//       console.error("Error saving training type:", err.message || err);
//       alert(err.message || "Failed to save training type");
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
//   //       <div className="custom-ui bg-white p-4 rounded text-center shadow">
//   //         <h5 className="fw-bold mb-2">Are you sure?</h5>
//   //         <p className="mb-3">This action cannot be undone.</p>
//   //         <Button variant="secondary" className="me-2" onClick={onClose}>
//   //           Cancel
//   //         </Button>
//   //         <Button
//   //           variant="danger"
//   //           onClick={async () => {
//   //             try {
//   //               await deleteTrainingType(id);
//   //               loadTrainingTypes();
//   //             } catch (err) {
//   //               console.error("Error deleting training type:", err.message || err);
//   //               alert(err.message || "Failed to delete");
//   //             }
//   //             onClose();
//   //           }}
//   //         >
//   //           Delete
//   //         </Button>
//   //       </div>
//   //     ),
//   //   });
//   // };

//   // Filter & paginate

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
//                 await deleteTrainingType(id);
//                 loadTrainingTypes();
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

//   const filtered = trainingTypes.filter((t) =>
//     t.name.toLowerCase().includes(search.toLowerCase())
//   );
//   const startIndex = (currentPage - 1) * entriesPerPage;
//   const currentData = filtered.slice(startIndex, startIndex + entriesPerPage);
//   const pageCount = Math.ceil(filtered.length / entriesPerPage);

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
//             animation: slideInUp 0.9s ease forwards;
//           }
//           .custom-slide-modal.closing .modal-dialog {
//             animation: slideOutUp 0.9s ease forwards;
//           }
//         `}</style>
//       <div className="d-flex justify-content-between mb-3 align-items-center">
//         <h5 className="fw-bold mb-0">Manage Training Types</h5>
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
//               <th>Training Type</th>
//               <th style={{ width: "120px" }}>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {currentData.length > 0 ? (
//               currentData.map((t) => (
//                 <tr key={t.id}>
//                   <td>{t.name}</td>
//                   <td>
//                     <Button
//                       variant="info"
//                       size="sm"
//                       className="me-2"
//                       onClick={() => handleEdit(t)}
//                     >
//                       <FaEdit />
//                     </Button>
//                     <Button
//                       variant="danger"
//                       size="sm"
//                       onClick={() => handleDelete(t.id)}
//                     >
//                       <FaTrash />
//                     </Button>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="2" className="text-center">
//                   No training types found.
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

//       {/* <Modal show={showModal} onHide={() => setShowModal(false)} centered>
//         <Modal.Header closeButton>
//           <Modal.Title>{editId ? "Edit" : "Create"} Training Type</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form.Group>
//             <Form.Label>Name</Form.Label>
//             <Form.Control
//               type="text"
//               value={newType.name}
//               onChange={(e) => setNewType({ name: e.target.value })}
//               placeholder="Enter training type name"
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
//           <Modal.Title>{editId ? "Edit" : "Create"} Training Type</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form.Group>
//             <Form.Label>Name</Form.Label>
//             <Form.Control
//               type="text"
//               value={newType.name}
//               onChange={(e) => setNewType({ name: e.target.value })}
//               placeholder="Enter training type name"
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

// export default TrainingTypeList;



import React, { useEffect, useState } from "react";
import {
  getTrainingTypes,
  createTrainingType,
  updateTrainingType,
  deleteTrainingType,
} from "../../../services/trainingTypeService";
import { Modal, Button, Form } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { toast } from "react-toastify";

const TrainingTypeList = () => {
  const [trainingTypes, setTrainingTypes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newType, setNewType] = useState({ name: "" });
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [isClosing, setIsClosing] = useState(false); // ? for animation

  useEffect(() => {
    loadTrainingTypes();
  }, []);

  const loadTrainingTypes = async () => {
    try {
      const data = await getTrainingTypes();
      setTrainingTypes(data || []);
    } catch (err) {
      console.error("Error loading training types:", err.message || err);
    }
  };

  const handleSave = async () => {
    try {
      if (!newType.name || newType.name.trim() === "") {
        alert("Name is required");
        return;
      }

      if (editId) {
        await updateTrainingType(editId, { name: newType.name });
        toast.success("Training successfully updated.", {
          icon: false,
        });
      } else {
        await createTrainingType({ name: newType.name });
        toast.success("Training successfully created.", {
          icon: false,
        });
      }

      setNewType({ name: "" });
      setEditId(null);
      handleCloseModal();
      loadTrainingTypes();
    } catch (err) {
      console.error("Error saving training type:", err.message || err);
      alert(err.message || "Failed to save training type");
    }
  };

  const handleEdit = (type) => {
    setEditId(type.id);
    setNewType({ name: type.name });
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
                await deleteTrainingType(id);
                loadTrainingTypes();
                onClose();
                toast.success("Training deleted successfully.", {
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

  const filtered = trainingTypes.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );
  const startIndex = (currentPage - 1) * entriesPerPage;
  const currentData = filtered.slice(startIndex, startIndex + entriesPerPage);
  const pageCount = Math.ceil(filtered.length / entriesPerPage);

  return (
    <div className="bg-white p-3 rounded shadow-sm">
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
            animation: slideInUp 0.9s ease forwards;
          }
          .custom-slide-modal.closing .modal-dialog {
            animation: slideOutUp 0.9s ease forwards;
          }
        `}</style>
      <div className="d-flex justify-content-between mb-3 align-items-center">
        <h5 className="fw-bold mb-0">Manage Training Types</h5>
        <Button variant="success" onClick={() => setShowModal(true)}>
          +
        </Button>
      </div>

      <div className="d-flex justify-content-between mb-3">
        <div className="d-flex align-items-center">
          <Form.Select
            value={entriesPerPage}
            onChange={(e) => {
              setEntriesPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="me-2"
            style={{ width: "80px" }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </Form.Select>
          <span>entries per page</span>
        </div>
        <Form.Control
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
        <table className="table table-bordered table-hover table-striped">
          <thead className="table-light">
            <tr>
              <th>Training Type</th>
              <th style={{ width: "120px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentData.length > 0 ? (
              currentData.map((t) => (
                <tr key={t.id}>
                  <td>{t.name}</td>
                  <td>
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip>Edit</Tooltip>}
                    >
                      <Button
                        variant="info"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEdit(t)}
                      >
                        <FaEdit />
                      </Button>
                    </OverlayTrigger>
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip>Delete</Tooltip>}
                    >

                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(t.id)}
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
                  No training types found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
              className={`page-item ${currentPage === pageCount ? "disabled" : ""
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
          <Modal.Title>{editId ? "Edit" : "Create"} Training Type</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              value={newType.name}
              onChange={(e) => setNewType({ name: e.target.value })}
              placeholder="Enter training type name"
            />
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

export default TrainingTypeList;
