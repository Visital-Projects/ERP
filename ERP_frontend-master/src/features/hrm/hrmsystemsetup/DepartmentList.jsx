// import React, { useState, useEffect } from "react";
// import { Modal, Button, Form,Spinner } from "react-bootstrap";
// import departmentService from "../../../services/departmentService";
// import branchService from "../../../services/branchService";
// import { FaEdit, FaTrash } from "react-icons/fa";
// import { confirmAlert } from "react-confirm-alert";
// import "react-confirm-alert/src/react-confirm-alert.css";
// import { OverlayTrigger, Tooltip } from "react-bootstrap";
// import { toast } from "react-toastify";

// const DepartmentList = () => {
//   const [departments, setDepartments] = useState([]);
//   const [branches, setBranches] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [newDepartment, setNewDepartment] = useState({
//     name: "",
//     branch_id: "",
//   });
//   const [editId, setEditId] = useState(null);
//   const [search, setSearch] = useState("");
//   const [entriesPerPage, setEntriesPerPage] = useState(10);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [errors, setErrors] = useState({}); // ✅ Validation errors
//   const [isClosing, setIsClosing] = useState(false); // for animation
//   const [loading, setLoading] = useState(true);
//   useEffect(() => {
//     fetchDepartments();
//     fetchBranches();
//   }, []);

//   const fetchDepartments = async () => {
//     try {
//       const res = await departmentService.getAll();
//       let data = res.data || res;
//       data = data.sort((a, b) => b.id - a.id);
//       setDepartments(data);
//     } catch (error) {
//       console.error("Failed to fetch departments:", error);
//     }finally{
//       setLoading(false)
//     }
//   };

//   const fetchBranches = async () => {
//     try {
//       const res = await branchService.getAll();
//       setBranches(res.data || res);
//     } catch (error) {
//       console.error("Failed to fetch branches:", error);
//     }
//   };

//   const handleSave = async () => {
//     // ✅ Validation
//     const newErrors = {};
//     if (!newDepartment.name.trim())
//       newErrors.name = "Department name is required";
//     if (!newDepartment.branch_id.trim())
//       newErrors.branch_id = "Branch selection is required";

//     if (Object.keys(newErrors).length > 0) {
//       setErrors(newErrors);
//       return;
//     }
//     setErrors({});

//     try {
//       if (editId) {
//         await departmentService.update(editId, newDepartment);
//         toast.success("Department successfully updated.", { icon: false });
//       } else {
//         await departmentService.create(newDepartment);
//         toast.success("Department successfully created.", { icon: false });
//       }

//       setNewDepartment({ name: "", branch_id: "" });
//       setEditId(null);
//       handleCloseModal();
//       fetchDepartments();
//     } catch (error) {
//       console.error("Error saving department:", error);
//     }
//   };

//   const handleEdit = (department) => {
//     setEditId(department.id);
//     setNewDepartment({
//       name: department.name,
//       branch_id: department.branch_id ? String(department.branch_id) : "",
//     });
//     setShowModal(true);
//   };

//   const handleDelete = (id) => {
//     confirmAlert({
//       customUI: ({ onClose }) => (
//         <div className="custom-confirm-modal bg-white p-4 rounded shadow text-center">
//           <div style={{ fontSize: "50px", color: "#ff9900" }}>❗</div>
//           <h4 className="fw-bold mt-2">Are you sure?</h4>
//           <p>This action cannot be undone. Do you want to continue?</p>
//           <div className="d-flex justify-content-center mt-3">
//             <Button variant="danger" className="me-2 px-4" onClick={onClose}>
//               No
//             </Button>
//             <Button
//               variant="success"
//               className="px-4"
//               onClick={async () => {
//                 await departmentService.remove(id);
//                 fetchDepartments();
//                 onClose();
//                 toast.success("Department deleted successfully.", {
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
//     }, 400);
//   };

//   const filteredDepartments = departments.filter((d) =>
//     d.name?.toLowerCase().includes(search.toLowerCase())
//   );

//   const startIndex = (currentPage - 1) * entriesPerPage;
//   const currentDepartments = filteredDepartments.slice(
//     startIndex,
//     startIndex + entriesPerPage
//   );
//   const pageCount = Math.ceil(filteredDepartments.length / entriesPerPage);

//   return (
//     <div className="bg-white p-3 rounded shadow-sm">
//       <style>{`
//         .entries-select:focus {
//           border-color: #6FD943 !important;
//           box-shadow: 0 0 0px 4px #70d94360 !important;
//         }
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

//       {/* Header */}
//       <div className="d-flex justify-content-between align-items-center mb-3">
//         <h5 className="fw-bold">Manage Department</h5>
//         <OverlayTrigger overlay={<Tooltip>Create</Tooltip>}>
//           <Button
//             variant="success"
//             onClick={() => {
//               setShowModal(true);
//               setEditId(null);
//               setNewDepartment({ name: "", branch_id: "" });
//               setErrors({});
//             }}
//           >
//             <i className="bi bi-plus-lg fs-6"></i>
//           </Button>
//         </OverlayTrigger>
//       </div>

//       {/* Search + Entries per page */}
//       <div className="d-flex justify-content-between align-items-center mb-3">
//         <div className="d-flex align-items-center">
//           <select
//             className="form-select me-2 ms-2 "
//             value={entriesPerPage}
//             onChange={(e) => {
//               setEntriesPerPage(Number(e.target.value));
//               setCurrentPage(1);
//             }}
//             style={{ width: "80px" }}
//           >
//             {/* <option value="5">5</option> */}
//             <option value="10">10</option>
//             <option value="25">25</option>
//             <option value="50">50</option>
//             <option value="100">100</option>
//           </select>

//         </div>
//         <Form.Control
//           type="text"
//           className="form-control-sm"
//           style={{ maxWidth: "250px" }}
//           placeholder="Search..."
//           value={search}
//           onChange={(e) => {
//             setSearch(e.target.value);
//             setCurrentPage(1);
//           }}
//         />
//       </div>

//       {/* Table */}
//       <div className="table-responsive">
//          {loading ? (
//             <div className="text-center py-5">
//               <Spinner animation="border" variant="success" />
//             </div>
//           ) : (
//         <table className="table table-bordered table-hover table-striped">
//           <thead className="table-light">
//             <tr>
//               <th>Department</th>
//               <th>Branch</th>
//               <th style={{ width: "120px" }}>Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {currentDepartments.length > 0 ? (
//               currentDepartments.map((department) => (
//                 <tr key={department.id}>
//                   <td>{department.name}</td>
//                   <td>
//                     {branches.find((b) => b.id === department.branch_id)?.name ||
//                       "N/A"}
//                   </td>
//                   <td>
//                     <OverlayTrigger
//                       placement="top"
//                       overlay={<Tooltip>Edit</Tooltip>}
//                     >
//                       <Button
//                         className="btn btn-info btn-sm me-2"
//                         onClick={() => handleEdit(department)}
//                       >
//                         <i className="bi bi-pencil text-white"></i>
//                       </Button>
//                     </OverlayTrigger>
//                     <OverlayTrigger
//                       placement="top"
//                       overlay={<Tooltip>Delete</Tooltip>}
//                     >
//                       <Button
//                         className="btn btn-danger btn-sm"
//                         onClick={() => handleDelete(department.id)}
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
//                   No departments found.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>)}
//       </div>

//       {/* Pagination */}
//       <div className="d-flex justify-content-between align-items-center">
//         <div className="small text-muted">
//           Showing {filteredDepartments.length === 0 ? 0 : startIndex + 1} to{" "}
//           {Math.min(startIndex + entriesPerPage, filteredDepartments.length)} of{" "}
//           {filteredDepartments.length} entries
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
//                 className={`page-item ${
//                   currentPage === i + 1 ? "active" : ""
//                 }`}
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

//       {/* Modal with Validation */}
//       <Modal
//         show={showModal}
//         onHide={handleCloseModal}
//         centered
//         className={`custom-slide-modal ${isClosing ? "closing" : "open"}`}
//         style={{ overflowY: "auto", scrollbarWidth: "none" }}
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>
//             {editId ? "Edit Department" : "Create Department"}
//           </Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form.Group className="mb-3">
//             <Form.Label>
//               Department Name <span className="text-danger">*</span>
//             </Form.Label>
//             <Form.Control
//               type="text"
//               value={newDepartment.name}
//               onChange={(e) =>
//                 setNewDepartment({ ...newDepartment, name: e.target.value })
//               }
//               placeholder="Enter department name"
//               isInvalid={!!errors.name}
//             />
//             <Form.Control.Feedback type="invalid">
//               {errors.name}
//             </Form.Control.Feedback>
//           </Form.Group>

//           <Form.Group>
//             <Form.Label>
//               Select Branch <span className="text-danger">*</span>
//             </Form.Label>
//             <Form.Select
//               value={newDepartment.branch_id}
//               onChange={(e) =>
//                 setNewDepartment({
//                   ...newDepartment,
//                   branch_id: e.target.value,
//                 })
//               }
//               isInvalid={!!errors.branch_id}
//             >
//               <option value="">-- Select Branch --</option>
//               {branches.map((b) => (
//                 <option key={b.id} value={String(b.id)}>
//                   {b.name}
//                 </option>
//               ))}
//             </Form.Select>
//             <Form.Control.Feedback type="invalid">
//               {errors.branch_id}
//             </Form.Control.Feedback>
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

// export default DepartmentList;

import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import departmentService from "../../../services/departmentService";
import branchService from "../../../services/branchService";
import { FaEdit, FaTrash } from "react-icons/fa";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";

const DepartmentList = () => {
  const [departments, setDepartments] = useState([]);
  const [branches, setBranches] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newDepartment, setNewDepartment] = useState({
    name: "",
    branch_id: "",
  });
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [errors, setErrors] = useState({}); // ✅ Validation errors
  const [isClosing, setIsClosing] = useState(false); // for animation
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    fetchDepartments();
    fetchBranches();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await departmentService.getAll();
      let data = res.data || res;
      data = data.sort((a, b) => b.id - a.id);
      setDepartments(data);
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const res = await branchService.getAll();
      setBranches(res.data || res);
    } catch (error) {
      console.error("Failed to fetch branches:", error);
    }
  };

  const handleSave = async () => {
    // ✅ Validation
    const newErrors = {};
    if (!newDepartment.name.trim())
      newErrors.name = "Department name is required";
    if (!newDepartment.branch_id.trim())
      newErrors.branch_id = "Branch selection is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    try {
      if (editId) {
        await departmentService.update(editId, newDepartment);
        toast.success("Department successfully updated.", { icon: false });
      } else {
        await departmentService.create(newDepartment);
        toast.success("Department successfully created.", { icon: false });
      }

      setNewDepartment({ name: "", branch_id: "" });
      setEditId(null);
      handleCloseModal();
      fetchDepartments();
      // {
      //   location.state?.from
      //     ? navigate("/employees/create", {
      //         state: { from: location.pathname },
      //       })
      //     : navigate(0);
      // }
      if (location.state?.from) {
        navigate("/employees/create", {
          state: { from: location.pathname },
        });
      }
    } catch (error) {
      console.error("Error saving department:", error);
    }
  };

  const handleEdit = (department) => {
    setEditId(department.id);
    setNewDepartment({
      name: department.name,
      branch_id: department.branch_id ? String(department.branch_id) : "",
    });
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
                await departmentService.remove(id);
                fetchDepartments();
                onClose();
                toast.success("Department deleted successfully.", {
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
    }, 400);
  };

  const filteredDepartments = departments.filter((d) =>
    d.name?.toLowerCase().includes(search.toLowerCase())
  );

  const startIndex = (currentPage - 1) * entriesPerPage;
  const currentDepartments = filteredDepartments.slice(
    startIndex,
    startIndex + entriesPerPage
  );
  const pageCount = Math.ceil(filteredDepartments.length / entriesPerPage);

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

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold">Manage Department</h5>
        <OverlayTrigger overlay={<Tooltip>Create</Tooltip>}>
          <Button
            variant="success"
            onClick={() => {
              setShowModal(true);
              setEditId(null);
              setNewDepartment({ name: "", branch_id: "" });
              setErrors({});
            }}
          >
            <i className="bi bi-plus-lg fs-6"></i>
          </Button>
        </OverlayTrigger>
      </div>

      {/* Search + Entries per page */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center">
          <select
            className="form-select me-2 ms-2 "
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
          className="form-control-sm"
          style={{ maxWidth: "250px" }}
          placeholder="Search..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
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
                <th>Department</th>
                <th>Site</th>
                <th style={{ width: "120px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentDepartments.length > 0 ? (
                currentDepartments.map((department) => (
                  <tr key={department.id}>
                    <td>{department.name}</td>
                    <td>
                      {branches.find((b) => b.id === department.branch_id)
                        ?.name || "N/A"}
                    </td>
                    <td>
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Edit</Tooltip>}
                      >
                        <Button
                          className="btn btn-info btn-sm me-2"
                          onClick={() => handleEdit(department)}
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
                          onClick={() => handleDelete(department.id)}
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
                    No departments found.
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
          Showing {filteredDepartments.length === 0 ? 0 : startIndex + 1} to{" "}
          {Math.min(startIndex + entriesPerPage, filteredDepartments.length)} of{" "}
          {filteredDepartments.length} entries
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

      {/* Modal with Validation */}
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        centered
        className={`custom-slide-modal ${isClosing ? "closing" : "open"}`}
        style={{ overflowY: "auto", scrollbarWidth: "none" }}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editId ? "Edit Department" : "Create Department"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>
              Department Name <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              value={newDepartment.name}
              onChange={(e) =>
                setNewDepartment({ ...newDepartment, name: e.target.value })
              }
              placeholder="Enter department name"
              isInvalid={!!errors.name}
            />
            <Form.Control.Feedback type="invalid">
              {errors.name}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group>
            <Form.Label>
              Select Site <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              value={newDepartment.branch_id}
              onChange={(e) =>
                setNewDepartment({
                  ...newDepartment,
                  branch_id: e.target.value,
                })
              }
              isInvalid={!!errors.branch_id}
            >
              <option value="">-- Select Site --</option>
              {branches.map((b) => (
                <option key={b.id} value={String(b.id)}>
                  {b.name}
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              {errors.branch_id}
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

export default DepartmentList;
