// import React, { useEffect, useState } from "react";
// import { Modal, Button, Form } from "react-bootstrap";
// import { FaEdit, FaTrash } from "react-icons/fa";
// import goalTypeService from "../../../services/goalTypeService";
// import { confirmAlert } from "react-confirm-alert";
// import "react-confirm-alert/src/react-confirm-alert.css";

// const GoalTypeList = () => {
//   const [goalTypes, setGoalTypes] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [newGoalType, setNewGoalType] = useState({ name: "" });
//   const [editId, setEditId] = useState(null);
//   const [search, setSearch] = useState("");
//   const [entriesPerPage, setEntriesPerPage] = useState(10);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [isClosing, setIsClosing] = useState(false); // ✅ for animation

//   useEffect(() => {
//     fetchGoalTypes();
//   }, []);

//   // const fetchGoalTypes = async () => {
//   //   try {
//   //     const data = await goalTypeService.getAll();
//   //     setGoalTypes(data); // data is already the array
//   //   } catch (err) {
//   //     console.error("Error fetching goal types:", err);
//   //   }
//   // };

//   const fetchGoalTypes = async () => {
//     try {
//       const res = await goalTypeService.getAll();
//       let data = res.data || res;
//       data = data.sort((a, b) => b.id - a.id);
//       setGoalTypes(data);
//     } catch (err) {
//       console.error("Error fetching goal types:", err);
//     }
//   };

//   const handleSave = async () => {
//     try {
//       if (editId) {
//         await goalTypeService.update(editId, newGoalType);
//       } else {
//         await goalTypeService.create(newGoalType);
//       }
//       setNewGoalType({ name: "" });
//       setEditId(null);
//       handleCloseModal();
//       fetchGoalTypes();
//     } catch (err) {
//       console.error("Save error:", err);
//     }
//   };

//   const handleEdit = (goalType) => {
//     setEditId(goalType.id);
//     setNewGoalType({ name: goalType.name });
//     setShowModal(true);
//   };

//   // const handleDelete = (id) => {
//   //   confirmAlert({
//   //     customUI: ({ onClose }) => (
//   //       <div className="custom-ui bg-white p-4 rounded text-center shadow">
//   //         <h5 className="fw-bold mb-2">Are you sure?</h5>
//   //         <p className="mb-3">This action cannot be undone.</p>
//   //         <Button variant="secondary" className="me-2" onClick={onClose}>Cancel</Button>
//   //         <Button variant="danger" onClick={async () => {
//   //           await goalTypeService.remove(id);
//   //           fetchGoalTypes();
//   //           onClose();
//   //         }}>Delete</Button>
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
//                 await goalTypeService.remove(id);
//                 fetchGoalTypes();
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

//   const filteredGoalTypes = goalTypes.filter((g) =>
//     g.name.toLowerCase().includes(search.toLowerCase())
//   );

//   const startIndex = (currentPage - 1) * entriesPerPage;
//   const currentGoalTypes = filteredGoalTypes.slice(
//     startIndex,
//     startIndex + entriesPerPage
//   );
//   const pageCount = Math.ceil(filteredGoalTypes.length / entriesPerPage);

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
//         <h5 className="fw-bold mb-0">Manage Goal Types</h5>
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
//             style={{ width: "100px" }}
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
//               <th>Goal Type</th>
//               <th style={{ width: "120px" }}>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {currentGoalTypes.length > 0 ? (
//               currentGoalTypes.map((goal) => (
//                 <tr key={goal.id}>
//                   <td>{goal.name}</td>
//                   <td>
//                     <Button
//                       variant="info"
//                       size="sm"
//                       className="me-2"
//                       onClick={() => handleEdit(goal)}
//                     >
//                       <FaEdit />
//                     </Button>
//                     <Button
//                       variant="danger"
//                       size="sm"
//                       onClick={() => handleDelete(goal.id)}
//                     >
//                       <FaTrash />
//                     </Button>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="2" className="text-center">
//                   No goal types found.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* <div className="d-flex justify-content-between align-items-center">
//         <span>
//           Showing {filteredGoalTypes.length === 0 ? 0 : startIndex + 1} to{" "}
//           {Math.min(startIndex + entriesPerPage, filteredGoalTypes.length)} of{" "}
//           {filteredGoalTypes.length}
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
//           Showing {filteredGoalTypes.length === 0 ? 0 : startIndex + 1} to{" "}
//           {Math.min(startIndex + entriesPerPage, filteredGoalTypes.length)} of{" "}
//           {filteredGoalTypes.length} entries
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
//             {editId ? "Edit Goal Type" : "Create Goal Type"}
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form.Group>
//             <Form.Label>Name</Form.Label>
//             <Form.Control
//               type="text"
//               value={newGoalType.name}
//               onChange={(e) =>
//                 setNewGoalType({ ...newGoalType, name: e.target.value })
//               }
//               placeholder="Enter goal type name"
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
//             {editId ? "Edit Goal Type" : "Create Goal Type"}
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form.Group>
//             <Form.Label>Name</Form.Label>
//             <Form.Control
//               type="text"
//               value={newGoalType.name}
//               onChange={(e) =>
//                 setNewGoalType({ ...newGoalType, name: e.target.value })
//               }
//               placeholder="Enter goal type name"
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

// export default GoalTypeList;



import React, { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { FaEdit, FaTrash } from "react-icons/fa";
import goalTypeService from "../../../services/goalTypeService";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { toast } from "react-toastify";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

const GoalTypeList = () => {
  const [goalTypes, setGoalTypes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newGoalType, setNewGoalType] = useState({ name: "" });
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isClosing, setIsClosing] = useState(false); // ? for animation

  useEffect(() => {
    fetchGoalTypes();
  }, []);

  const fetchGoalTypes = async () => {
    try {
      const res = await goalTypeService.getAll();
      let data = res.data || res;
      data = data.sort((a, b) => b.id - a.id);
      setGoalTypes(data);
    } catch (err) {
      console.error("Error fetching goal types:", err);
    }
  };

  const handleSave = async () => {
    try {
      if (editId) {
        await goalTypeService.update(editId, newGoalType);
        toast.success("Goal successfully updated.", {
          icon: false,
        });
      } else {
        await goalTypeService.create(newGoalType);
        toast.success("Goal successfully created.", {
          icon: false,
        });
      }
      setNewGoalType({ name: "" });
      setEditId(null);
      handleCloseModal();
      fetchGoalTypes();
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const handleEdit = (goalType) => {
    setEditId(goalType.id);
    setNewGoalType({ name: goalType.name });
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
                await goalTypeService.remove(id);
                fetchGoalTypes();
                onClose();
                toast.success("Goal deleted successfully.", {
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

  const filteredGoalTypes = goalTypes.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  const startIndex = (currentPage - 1) * entriesPerPage;
  const currentGoalTypes = filteredGoalTypes.slice(
    startIndex,
    startIndex + entriesPerPage
  );
  const pageCount = Math.ceil(filteredGoalTypes.length / entriesPerPage);

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
            animation: slideInUp 0.7s ease forwards;
          }
          .custom-slide-modal.closing .modal-dialog {
            animation: slideOutUp 0.7s ease forwards;
          }
        `}</style>
      <div className="d-flex justify-content-between mb-3 align-items-center">
        <h5 className="fw-bold mb-0">Manage Goal Types</h5>
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
              <th>Goal Type</th>
              <th style={{ width: "120px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentGoalTypes.length > 0 ? (
              currentGoalTypes.map((goal) => (
                <tr key={goal.id}>
                  <td>{goal.name}</td>
                  <td>
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip>Edit</Tooltip>}
                    >
                      <Button
                        variant="info"
                        size="sm"
                        className="me-2"
                        onClick={() => handleEdit(goal)}
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
                        onClick={() => handleDelete(goal.id)}
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
                  No goal types found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="d-flex justify-content-between align-items-center">
        <div className="small text-muted">
          Showing {filteredGoalTypes.length === 0 ? 0 : startIndex + 1} to{" "}
          {Math.min(startIndex + entriesPerPage, filteredGoalTypes.length)} of{" "}
          {filteredGoalTypes.length} entries
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
        style={{ overflowY: "auto", scrollbarWidth: "none" }}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editId ? "Edit Goal Type" : "Create Goal Type"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              value={newGoalType.name}
              onChange={(e) =>
                setNewGoalType({ ...newGoalType, name: e.target.value })
              }
              placeholder="Enter goal type name"
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

export default GoalTypeList;
