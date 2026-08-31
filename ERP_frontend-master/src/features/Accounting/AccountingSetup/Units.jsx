// import React, { useState, useEffect } from "react";
// import { Table, Button, Form, Pagination, Modal } from "react-bootstrap";
// import { Plus, PencilSquare, Trash } from "react-bootstrap-icons";
// import { fetchUnits, createUnit, updateUnit, deleteUnit } from "../../../services/AccountingSetup";
// import { useOutletContext } from "react-router-dom";

// const Units = () => {
//   const { openAddForm ,  resetOpenAddForm  } = useOutletContext();
//   const [data, setData] = useState([]);
//   const [entriesPerPage, setEntriesPerPage] = useState(10);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);

//   const [showModal, setShowModal] = useState(false);
//   const [editingItem, setEditingItem] = useState(null);
//   const [saving, setSaving] = useState(false);

//   // Fetch units from API
//   const fetchData = async () => {
//     const result = await fetchUnits();
//     setData(result);
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);
// useEffect(() => {
//   if (openAddForm) {
//     handleAdd();       // open modal
//     resetOpenAddForm(); // reset parent flag
//   }
// }, [openAddForm]);


//   // Modal handlers
//   const handleAdd = () => {
//     setEditingItem({ name: "" });
//     setShowModal(true);
//   };

//   const handleEdit = (item) => {
//     setEditingItem(item);
//     setShowModal(true);
//   };

//   const handleCloseModal = () => setShowModal(false);

//   // Save unit (create or update)
//   const handleSave = async () => {
//     if (!editingItem?.name) {
//       alert("Unit name is required");
//       return;
//     }
//     setSaving(true);
//     let response;
//     try {
//       if (editingItem?.id) {
//         response = await updateUnit(editingItem.id, editingItem);
//       } else {
//         response = await createUnit(editingItem);
//       }

//       if (response?.success) {
//         fetchData();
//         setShowModal(false);
//       } else {
//         alert(response?.message || "Save failed");
//       }
//     } catch (error) {
//       console.error(error);
//       alert("Something went wrong");
//     }
//     setSaving(false);
//   };

//   // Delete unit
//   const handleDelete = async (id) => {
//     if (!window.confirm("Are you sure you want to delete?")) return;
//     const response = await deleteUnit(id);
//     if (response?.success) fetchData();
//     else alert(response?.message || "Delete failed");
//   };

//   // Pagination and search
//   const filteredData = data.filter((item) =>
//     item.name.toLowerCase().includes(searchTerm.toLowerCase())
//   );
//   const totalPages = Math.ceil(filteredData.length / entriesPerPage);
//   const indexOfLast = currentPage * entriesPerPage;
//   const indexOfFirst = indexOfLast - entriesPerPage;
//   const currentData = filteredData.slice(indexOfFirst, indexOfLast);

//   return (
//    <div className="p-3 bg-white rounded" style={{  boxShadow: "0px 0px 10px 4px rgba(0, 0, 0, 0.1)"}}>
//       <div className="d-flex justify-content-between mb-3">
//         <Form.Select
//           value={entriesPerPage}
//           onChange={(e) => setEntriesPerPage(Number(e.target.value))}
//           style={{ width: "80px" }}
//         >
//           <option value={10}>10</option>
//           <option value={25}>25</option>
//           <option value={50}>50</option>
//         </Form.Select>

//         <Form.Control
//           type="text"
//           placeholder="Search Units..."
//           style={{ maxWidth: "250px" }}
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//         />
//       </div>

//       <Table bordered hover responsive>
//         <thead className="table-light">
//           <tr>
//             <th>Unit</th>
//             <th>Action</th>
//           </tr>
//         </thead>
//         <tbody>
//           {currentData.length > 0 ? (
//             currentData.map((item) => (
//               <tr key={item.id}>
//                 <td>{item.name}</td>
//                 <td>
//                   <Button
//                     variant="info"
//                     size="sm"
//                     className="me-2"
//                     onClick={() => handleEdit(item)}
//                   >
//                     <PencilSquare />
//                   </Button>
//                   <Button
//                     variant="danger"
//                     size="sm"
//                     onClick={() => handleDelete(item.id)}
//                   >
//                     <Trash />
//                   </Button>
//                 </td>
//               </tr>
//             ))
//           ) : (
//             <tr>
//               <td colSpan="2" className="text-center text-muted">
//                 No Units found
//               </td>
//             </tr>
//           )}
//         </tbody>
//       </Table>

//       {filteredData.length > entriesPerPage && (
//         <Pagination className="justify-content-end">
//           {Array.from({ length: totalPages }, (_, i) => (
//             <Pagination.Item
//               key={i + 1}
//               active={i + 1 === currentPage}
//               onClick={() => setCurrentPage(i + 1)}
//             >
//               {i + 1}
//             </Pagination.Item>
//           ))}
//         </Pagination>
//       )}

//       {/* Modal */}
//       <Modal show={showModal} onHide={handleCloseModal} centered>
//         <Modal.Header closeButton>
//           <Modal.Title>{editingItem?.id ? "Edit" : "Add"} Unit</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form>
//             <Form.Group className="mb-2">
//               <Form.Label>
//                 Unit Name <span className="text-danger">*</span>
//               </Form.Label>
//               <Form.Control
//                 type="text"
//                 value={editingItem?.name || ""}
//                 onChange={(e) =>
//                   setEditingItem({ ...editingItem, name: e.target.value })
//                 }
//                 placeholder="Enter unit name"
//               />
//             </Form.Group>
//           </Form>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={handleCloseModal}>
//             Cancel
//           </Button>
//           <Button variant="success" onClick={handleSave} disabled={saving}>
//             {saving
//               ? "Saving..."
//               : editingItem?.id
//               ? "Update"
//               : "Create"}
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// };

// export default Units;










import React, { useState, useEffect } from "react";
import { Table, Button, Form, Modal, Spinner } from "react-bootstrap";
import { Plus, PencilSquare, Trash } from "react-bootstrap-icons";
import {
  fetchUnits,
  createUnit,
  updateUnit,
  deleteUnit,
} from "../../../services/AccountingSetup";
import { useOutletContext } from "react-router-dom";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

const Units = () => {
  const { openAddForm, resetOpenAddForm } = useOutletContext();
  const [data, setData] = useState([]);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isClosingModal, setIsClosingModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch units from API
  const fetchData = async () => {
    setLoading(true);
    const result = await fetchUnits();
    setData(result);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (openAddForm) {
      handleAdd();
      resetOpenAddForm();
    }
  }, [openAddForm]);

  // Modal handlers
  const handleAdd = () => {
    setEditingItem({ name: "" });
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setIsClosingModal(true);
    setTimeout(() => {
      setShowModal(false);
      setIsClosingModal(false);
      setEditingItem(null);
    }, 400);
  };

  // Save unit (create or update)
  const handleSave = async () => {
    if (!editingItem?.name) {
      alert("Unit name is required");
      return;
    }
    setSaving(true);
    let response;
    try {
      if (editingItem?.id) {
        response = await updateUnit(editingItem.id, editingItem);
      } else {
        response = await createUnit(editingItem);
      }

      if (response?.success) {
        fetchData();
        handleCloseModal();
      } else {
        alert(response?.message || "Save failed");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
    setSaving(false);
  };

  // Delete unit
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
                  const response = await deleteUnit(id);
                  if (response?.success) fetchData();
                  else alert(response?.message || "Delete failed");
                } catch (err) {
                  console.error("Failed to delete unit:", err);
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

  // Pagination and search
  const filteredData = data.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredData.length / entriesPerPage);
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentData = filteredData.slice(indexOfFirst, indexOfLast);

  return (
    <div
      className="p-3 bg-white rounded"
      style={{ boxShadow: "0px 0px 10px 4px rgba(0, 0, 0, 0.1)" }}
    >
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
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="success" />
        </div>
      ) : (
        <div
          className="position-relative"
          style={{
            display: "flex",
            flexDirection: "column",
            height: "480px",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          {/* ✅ Top Controls (sticky) */}
          <div
            className="d-flex justify-content-between align-items-center px-3 py-2 bg-white border-bottom"
            style={{ position: "sticky", top: 0, zIndex: 5 }}
          >
            <Form.Select
              value={entriesPerPage}
              onChange={(e) => setEntriesPerPage(Number(e.target.value))}
              style={{ width: "80px", height: "40px" }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </Form.Select>

            <Form.Control
              className="w-auto"
              type="text"
              placeholder="Search Units..."
              style={{ maxWidth: "250px" }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* ✅ Scrollable Table */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
            className="hide-scrollbar"
          >
            <Table bordered hover responsive striped className="mb-0">
              <thead
                className="table-light"
                style={{ position: "sticky", top: 0, zIndex: 2 }}
              >
                <tr>
                  <th>Unit</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {currentData.length > 0 ? (
                  currentData.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>
                        <OverlayTrigger overlay={<Tooltip>Edit</Tooltip>}>
                          <Button
                            variant="info"
                            size="sm"
                            className="me-2"
                            onClick={() => handleEdit(item)}
                          >
                            <PencilSquare />
                          </Button>
                        </OverlayTrigger>

                        <OverlayTrigger overlay={<Tooltip>Delete</Tooltip>}>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash />
                          </Button>
                        </OverlayTrigger>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="text-center text-muted">
                      No Units found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>

          {/* ✅ Sticky Footer Pagination */}
          <div
            className="d-flex flex-column flex-md-row justify-content-between align-items-center px-3 py-2 bg-white border-top"
            style={{ position: "sticky", bottom: 0, zIndex: 5 }}
          >
            <span className="mb-2 mb-md-0">
              Showing {filteredData.length === 0 ? 0 : indexOfFirst + 1} to{" "}
              {Math.min(indexOfLast, filteredData.length)} of{" "}
              {filteredData.length} entries
            </span>

            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li
                  className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage((p) => p - 1)}
                    disabled={currentPage === 1}
                  >
                    «
                  </button>
                </li>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <li
                      key={page}
                      className={`page-item ${
                        currentPage === page ? "active" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    </li>
                  )
                )}

                <li
                  className={`page-item ${
                    currentPage === totalPages || totalPages === 0
                      ? "disabled"
                      : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage((p) => p + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                  >
                    »
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}

    


      <Modal
  show={showModal}
  onHide={handleCloseModal}
  backdrop="static"
  keyboard={false}
  centered
  className={`custom-slide-modal ${isClosingModal ? "closing" : "open"}`}
  style={{ overflowY: "auto", scrollbarWidth: "none" }}
>
  <Form
    onSubmit={(e) => {
      e.preventDefault();
      handleSave();
    }}
  >
    <Modal.Header closeButton>
      <Modal.Title>{editingItem?.id ? "Edit" : "Add"} Unit</Modal.Title>
    </Modal.Header>

    <Modal.Body>
      <Form.Group className="mb-2">
        <Form.Label>
          Unit Name <span className="text-danger">*</span>
        </Form.Label>
        <Form.Control
          type="text"
          value={editingItem?.name || ""}
          onChange={(e) =>
            setEditingItem({ ...editingItem, name: e.target.value })
          }
          required
          placeholder="Enter unit name"
        />
      </Form.Group>
    </Modal.Body>

    {/* ✅ Buttons in footer, still part of the form */}
    <Modal.Footer className="d-flex justify-content-end gap-2">
      <Button variant="secondary" onClick={handleCloseModal}>
        Cancel
      </Button>
      <Button variant="success" type="submit" disabled={saving}>
        {saving ? "Saving..." : editingItem?.id ? "Update" : "Create"}
      </Button>
    </Modal.Footer>
  </Form>
</Modal>

    </div>
  );
};

export default Units;
