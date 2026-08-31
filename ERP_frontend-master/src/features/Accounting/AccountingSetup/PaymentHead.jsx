// import React, { useState, useEffect } from "react";
// import { Table, Button, Form, Pagination, Modal } from "react-bootstrap";
// import { Plus, PencilSquare, Trash } from "react-bootstrap-icons";
// import categoryService from "../../../services/expenseCategory";
// import { useOutletContext } from "react-router-dom";

// const PaymentHead = () => {
//   const { openAddForm, resetOpenAddForm } = useOutletContext();
//   const [data, setData] = useState([]);
//   const [entriesPerPage, setEntriesPerPage] = useState(10);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);

//   const [showModal, setShowModal] = useState(false);
//   const [editingItem, setEditingItem] = useState(null);
//   const [formData, setFormData] = useState({ name: "" });
//   const [saving, setSaving] = useState(false);

//   // Fetch categories
//   const fetchData = async () => {
//     try {
//       const categories = await categoryService.getAllCategories();
//       setData(categories);
//     } catch (error) {
//       console.error("Error fetching payment heads:", error);
//       setData([]);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   useEffect(() => {
//     if (openAddForm) {
//       handleAdd();
//       resetOpenAddForm();
//     }
//   }, [openAddForm]);

//   const handleAdd = () => {
//     setEditingItem(null);
//     setFormData({ name: "" });
//     setShowModal(true);
//   };

//   const handleEdit = (item) => {
//     setEditingItem(item);
//     setFormData({ name: item.name });
//     setShowModal(true);
//   };

//   const handleCloseModal = () => setShowModal(false);

//   const handleSave = async () => {
//     if (!formData.name?.trim()) {
//       alert("Payment Head name is required");
//       return;
//     }

//     setSaving(true);
//     try {
//       if (editingItem) {
//         await categoryService.updateCategory(editingItem.id, formData.name.trim());
//       } else {
//         await categoryService.createCategory(formData.name.trim());
//       }
//       fetchData();
//       setShowModal(false);
//     } catch (error) {
//       console.error(error);
//       alert(error.message || "Error saving payment head");
//     }
//     setSaving(false);
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Are you sure you want to delete?")) return;
//     try {
//       await categoryService.deleteCategory(id);
//       fetchData();
//     } catch (error) {
//       console.error(error);
//       alert(error.message || "Failed to delete category");
//     }
//   };

//   // Pagination
//   const filteredData = data.filter((item) =>
//     item.name.toLowerCase().includes(searchTerm.toLowerCase())
//   );
//   const totalPages = Math.ceil(filteredData.length / entriesPerPage);
//   const indexOfLast = currentPage * entriesPerPage;
//   const indexOfFirst = indexOfLast - entriesPerPage;
//   const currentData = filteredData.slice(indexOfFirst, indexOfLast);

//   return (
//     <div className="p-3 bg-white rounded" style={{ boxShadow: "0px 0px 10px 4px rgba(0,0,0,0.1)" }}>
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
//           placeholder="Search Payment Heads..."
//           style={{ maxWidth: "250px" }}
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//         />

//         <Button variant="success" onClick={handleAdd}>
//           <Plus /> Add
//         </Button>
//       </div>

//       <Table bordered hover responsive>
//         <thead className="table-light">
//           <tr>
//             <th>Payment Head Name</th>
//             <th>Action</th>
//           </tr>
//         </thead>
//         <tbody>
//           {currentData.length > 0 ? (
//             currentData.map((item) => (
//               <tr key={item.id}>
//                 <td>{item.name}</td>
//                 <td>
//                   <Button variant="info" size="sm" className="me-2" onClick={() => handleEdit(item)}>
//                     <PencilSquare />
//                   </Button>
//                   <Button variant="danger" size="sm" onClick={() => handleDelete(item.id)}>
//                     <Trash />
//                   </Button>
//                 </td>
//               </tr>
//             ))
//           ) : (
//             <tr>
//               <td colSpan="2" className="text-center text-muted">
//                 No payment heads found
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
//           <Modal.Title>{editingItem ? "Edit" : "Add"} Payment Head</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form>
//             <Form.Group className="mb-2">
//               <Form.Label>
//                 Payment Head Name <span className="text-danger">*</span>
//               </Form.Label>
//               <Form.Control
//                 type="text"
//                 value={formData.name || ""}
//                 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//               />
//             </Form.Group>
//           </Form>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={handleCloseModal}>
//             Cancel
//           </Button>
//           <Button variant="success" onClick={handleSave} disabled={saving}>
//             {saving ? "Saving..." : editingItem ? "Update" : "Create"}
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// };

// export default PaymentHead;










import React, { useState, useEffect } from "react";
import { Table, Button, Form, Modal, Spinner } from "react-bootstrap";
import { Plus, PencilSquare, Trash } from "react-bootstrap-icons";
import categoryService from "../../../services/expenseCategory";
import { useOutletContext } from "react-router-dom";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

const PaymentHead = () => {
  const { openAddForm, resetOpenAddForm } = useOutletContext();
  const [data, setData] = useState([]);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: "" });
  const [saving, setSaving] = useState(false);
  const [isClosingModal, setIsClosingModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch categories
  const fetchData = async () => {
    setLoading(true);
    try {
      const categories = await categoryService.getAllCategories();
      setData(categories);
    } catch (error) {
      console.error("Error fetching payment heads:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
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

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({ name: "" });
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({ name: item.name });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setIsClosingModal(true);
    setTimeout(() => {
      setShowModal(false);
      setIsClosingModal(false);
      setEditingItem(null);
      setFormData({ name: "" });
    }, 400);
  };

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      alert("Payment Head name is required");
      return;
    }

    setSaving(true);
    try {
      if (editingItem) {
        await categoryService.updateCategory(editingItem.id, formData.name.trim());
      } else {
        await categoryService.createCategory(formData.name.trim());
      }
      fetchData();
      handleCloseModal();
    } catch (error) {
      console.error(error);
      alert(error.message || "Error saving payment head");
    }
    setSaving(false);
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
                  await categoryService.deleteCategory(id);
                  fetchData();
                } catch (error) {
                  console.error(error);
                  alert(error.message || "Failed to delete category");
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

  // ✅ Pagination Logic
  const filteredData = data.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredData.length / entriesPerPage);
  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentData = filteredData.slice(indexOfFirst, indexOfLast);

  useEffect(() => {
    setCurrentPage(1);
  }, [entriesPerPage]);

  return (
    <div
      className="p-3 bg-white rounded"
      style={{ boxShadow: "0px 0px 10px 4px rgba(0,0,0,0.1)" }}
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
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* ✅ Table + Scroll Logic Merged */}
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
            // border: "1px solid #dee2e6",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          {/* ✅ Top Sticky Controls */}
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
              placeholder="Search Payment Heads..."
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
            <Table bordered  hover responsive striped className="mb-0">
              <thead
                className="table-light"
                style={{ position: "sticky", top: 0, zIndex: 2 }}
              >
                <tr>
                  <th>Payment Head Name</th>
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
                      No payment heads found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>

          {/* ✅ Sticky Footer with Pagination */}
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
                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage((p) => p - 1)}
                    disabled={currentPage === 1}
                  >
                    «
                  </button>
                </li>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <li
                    key={page}
                    className={`page-item ${currentPage === page ? "active" : ""}`}
                  >
                    <button className="page-link" onClick={() => setCurrentPage(page)}>
                      {page}
                    </button>
                  </li>
                ))}

                <li
                  className={`page-item ${
                    currentPage === totalPages || totalPages === 0 ? "disabled" : ""
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
      <Modal.Title>{editingItem ? "Edit" : "Add"} Payment Head</Modal.Title>
    </Modal.Header>

    <Modal.Body>
      <Form.Group className="mb-2">
        <Form.Label>
          Payment Head Name <span className="text-danger">*</span>
        </Form.Label>
        <Form.Control
          type="text"
          value={formData.name || ""}
          onChange={(e) =>
            setFormData({ ...formData, name: e.target.value })
          }
          required
          placeholder="Enter payment head name"
        />
      </Form.Group>
    </Modal.Body>

    <Modal.Footer className="d-flex justify-content-end gap-2">
      <Button variant="secondary" onClick={handleCloseModal}>
        Cancel
      </Button>
      <Button variant="success" type="submit" disabled={saving}>
        {saving ? "Saving..." : editingItem ? "Update" : "Create"}
      </Button>
    </Modal.Footer>
  </Form>
</Modal>

    </div>
  );
};

export default PaymentHead;

