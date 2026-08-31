// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import {
//   fetchUsers,
//   createUser,
//   updateUser,
//   deleteUser,
//   uploadUsersExcel,
//   toggleUserLogin, //// modify for login toggle
// } from "../../services/userService";
// import apiClient from "../../services/apiClient";
// import UserFormModal from "./UserFormModal";
// import EditUserModal from "./EditUserModal";
// import "./UserList.css";
// import BreadCrumb from "../../components/BreadCrumb";
// import { useNavigate } from "react-router-dom";
// import {
//   Button,
//   Table,
//   Modal,
//   Form,
//   Badge,
//   InputGroup,
//   FormControl,
//   Pagination,
//   Tooltip,
// } from "react-bootstrap";
// import { confirmAlert } from "react-confirm-alert";
// import "react-confirm-alert/src/react-confirm-alert.css";
// import { MdOutlineLockReset } from "react-icons/md";
// import { OverlayTrigger } from "react-bootstrap";
// import { toast } from "react-toastify";

// const UserList = () => {
//   const [users, setUsers] = useState([]);
//   const [roles, setRoles] = useState([]);
//   const [createModalOpen, setCreateModalOpen] = useState(false);
//   const [editModalOpen, setEditModalOpen] = useState(false);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [loadingUser, setLoadingUser] = useState(null);
//   const [excelFile, setExcelFile] = useState(null);
//   const [showBulkModal, setShowBulkModal] = useState(false);
//   // modify for login toggle

//   const navigate = useNavigate();
//   const [entriesPerPage, setEntriesPerPage] = useState(50);
//   const [isClosingModal, setIsClosingModal] = useState(false);
//   const [showModal, setShowModal] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 10;

//   // ✅ Use base URL from .env
//   const BASE_URL = import.meta.env.VITE_BASE_URL;

//   // Load users and roles on mount
//   useEffect(() => {
//     loadUsers();
//     loadRoles();
//   }, []);

//   // Debug users
//   useEffect(() => {
//     console.log("🔄 Users state updated:", users);
//   }, [users]);

//   const loadUsers = async () => {
//     try {
//       const data = await fetchUsers();
//       setUsers(data); // modify for login toggle
//     } catch (error) {
//       console.error("Error loading users:", error);
//     }
//   };

//   const loadRoles = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       const res = await axios.get(`${BASE_URL}/api/roleusers`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setRoles(res.data);
//     } catch (error) {
//       console.error("Error loading roles:", error);
//     }
//   };

//   // Helper function to get role name from ID
//   const getRoleName = (roleId) => {
//     if (!roleId) return "N/A";
//     const role = roles.find((r) => r.id === parseInt(roleId));
//     return role ? role.name : roleId;
//   };

//   // const handleCreate = async (formData) => {
//   //   try {
//   //     await createUser(formData);
//   //     setCreateModalOpen(false);
//   //     loadUsers();
//   //     toast.success("User successfully Created.", {
//   //       icon: false,
//   //     });
//   //   } catch (error) {
//   //     console.error("Error creating user:", error);
//   //   }
//   // };

//   // const handleEdit = async (userId, formData) => {
//   //   try {
//   //     await updateUser(userId, formData);
//   //     setEditModalOpen(false);
//   //     setSelectedUser(null);
//   //     loadUsers();
//   //     toast.success("User successfully updated.", {
//   //       icon: false,
//   //     });
//   //   } catch (error) {
//   //     console.error("Error updating user:", error);
//   //   }
//   // };

//   // In your UserList component, update the handleCreate and handleEdit functions:

//   const handleCreate = async (formData) => {
//     try {
//       console.log("Creating user with data:", formData);
//       await createUser(formData);
//       setCreateModalOpen(false);
//       loadUsers();
//       toast.success("User successfully created.", {
//         icon: false,
//       });
//     } catch (error) {
//       console.error("Error creating user:", error);
//       toast.error(error.response?.data?.message || "Failed to create user", {
//         icon: false,
//       });
//       throw error; // Re-throw to handle in the modal
//     }
//   };

//   const handleEdit = async (userId, formData) => {
//     try {
//       console.log("Updating user:", userId, "with data:", formData);
//       await updateUser(userId, formData);
//       setEditModalOpen(false);
//       setSelectedUser(null);
//       loadUsers();
//       toast.success("User successfully updated.", {
//         icon: false,
//       });
//     } catch (error) {
//       console.error("Error updating user:", error);
//       toast.error(error.response?.data?.message || "Failed to update user", {
//         icon: false,
//       });
//       throw error; // Re-throw to handle in the modal
//     }
//   };

//   const handleDelete = (userId) => {
//     confirmAlert({
//       customUI: ({ onClose }) => (
//         <div className="custom-confirm-modal bg-white p-4 rounded shadow text-center">
//           <div style={{ fontSize: "50px", color: "#ff9900" }}>?</div>
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
//                   await deleteUser(userId);
//                   loadUsers();
//                   toast.success("User deleted successfully.", {
//                     icon: false,
//                   });
//                 } catch (error) {
//                   console.error("Error deleting user:", error);
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

//   const handleResetPassword = async (userId) => {
//     if (window.confirm("Reset this user's password?")) {
//       try {
//         await apiClient.post(`/users/${userId}/reset-password`);
//         alert("Password reset successful");
//       } catch (error) {
//         console.error("Reset password failed:", error);
//         alert("Failed to reset password");
//       }
//     }
//   };

//   const handleExcelUpload = async () => {
//     if (!excelFile) {
//       toast.error("Please select an Excel file first!");
//       return;
//     }

//     try {
//       const response = await uploadUsersExcel(excelFile);
//       toast.success(response.message || "Excel uploaded successfully!");
//       setExcelFile(null);
//       await loadUsers(); // 🔄 refresh user list after upload
//     } catch (error) {
//       console.error("Excel upload failed:", error);
//       toast.error("Failed to upload Excel file");
//     }
//   };

//   const handleToggleLogin = async (userId) => {
//     console.log("🔄 Toggling login for user:", userId);
//     setLoadingUser(userId);
//     try {
//       const res = await toggleUserLogin(userId);
//       console.log("✅ Toggle response:", res);

//       // Force reload all users from API to ensure UI is in sync
//       await loadUsers();
//     } catch (error) {
//       console.error("❌ Toggle login failed:", error);
//       console.error("❌ Error response:", error.response?.data);
//       alert("Failed to toggle login");
//     } finally {
//       setLoadingUser(null);
//     }
//   };

//   const filteredAssets = users.filter(
//     (asset) =>
//       asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       (asset.description &&
//         asset.description.toLowerCase().includes(searchTerm.toLowerCase()))
//   );

//   const startIndex = (currentPage - 1) * entriesPerPage;
//   const paginatedAssets = filteredAssets.slice(
//     startIndex,
//     startIndex + entriesPerPage
//   );

//   const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);
//   const pageCount = Math.ceil(filteredAssets.length / entriesPerPage);
//   const handlePageChange = (pageNumber) => {
//     setCurrentPage(pageNumber);
//   };

//   const handleCloseModal = () => {
//     setIsClosingModal(true);
//     setTimeout(() => {
//       setIsClosingModal(false);
//       setCreateModalOpen(false);
//       setEditModalOpen(false);
//     }, 700);
//   };

//   return (
//     <div className="container mt-4">
//       <div className="d-flex justify-content-between align-items-center">
//         <h4 className="mb-0">User Management</h4>
//         <div className="d-flex">
//           <OverlayTrigger
//             placement="top"
//             overlay={<Tooltip>Create User</Tooltip>}
//           >
//             <Button
//               className="btn btn-success d-flex align-items-center justify-content-center"
//               style={{ width: "55px", height: "40px", borderRadius: "6px" }}
//               variant="success"
//               onClick={() => setCreateModalOpen(true)}
//             >
//               <i className="bi bi-plus-lg fs-6"></i>
//             </Button>
//           </OverlayTrigger>
//           <Button
//             variant="warning"
//             size="sm"
//             className="ms-2 d-flex align-items-center"
//             onClick={() => setShowBulkModal(true)}
//           >
//             <i className="bi bi-upload me-1"></i> Bulk Upload
//           </Button>
//         </div>
//       </div>

//       <div className="d-flex justify-content-between align-items-center mb-3">
//         <BreadCrumb pathname={location.pathname} onNavigate={navigate} />
//       </div>

//       <div className="bg-white p-3 rounded shadow-sm">
//         <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
//           <div className="d-flex align-items-center mb-2">
//             <select
//               className="form-select me-2"
//               value={entriesPerPage}
//               onChange={(e) => {
//                 setEntriesPerPage(Number(e.target.value));
//                 setCurrentPage(1);
//               }}
//               style={{ width: "80px" }}
//             >
//               {/* <option value="10">10</option>
//               <option value="25">25</option> */}
//               <option value="50">50</option>
//               <option value="100">100</option>
//               <option value="200">200</option>
//               <option value="500">500</option>
//               <option value="1000">1000</option>
//               <option value="1500">1500</option>
//             </select>
//           </div>
//           <div>
//             <input
//               type="text"
//               className="form-control form-control-sm"
//               style={{ maxWidth: "250px" }}
//               placeholder="Search..."
//               value={searchTerm}
//               onChange={(e) => {
//                 setSearchTerm(e.target.value);
//                 setCurrentPage(1);
//               }}
//             />
//           </div>
//         </div>

//         <div className="table-responsive">
//           <table className="table table-hover table-bordered mb-0 table-striped">
//             <thead>
//               <tr>
//                 <th>Avatar</th>
//                 <th>Name</th>
//                 <th>Email</th>
//                 <th>Role/Type</th>
//                 <th>Status</th>
//                 {/* <th>Login</th> */}
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {paginatedAssets.length ? (
//                 paginatedAssets.map((user) => (
//                   <tr key={user.id}>
//                     <td>
//                       {user.avatar ? (
//                         <img
//                           src={`${BASE_URL}/${user.avatar}`}
//                           alt="avatar"
//                           className="avatar-img"
//                         />
//                       ) : (
//                         <span className="no-avatar">N/A</span>
//                       )}
//                     </td>
//                     <td>{user.name}</td>
//                     <td>{user.email}</td>
//                     <td>{getRoleName(user.type)}</td>
//                     <td>{user.is_active ? "Active" : "Inactive"}</td>
//                     {/* <td>
//                       <label className="switch">
//                         <input
//                           type="checkbox"
//                           checked={!!user.is_enable_login}
//                           onChange={() => handleToggleLogin(user.id)}
//                           disabled={loadingUser === user.id}
//                         />
//                         <span className="slider round"></span>
//                       </label>
//                     </td> */}
//                     <td>
//                       <OverlayTrigger
//                         placement="top"
//                         overlay={<Tooltip>Edit</Tooltip>}
//                       >
//                         <Button
//                           variant="info"
//                           size="sm"
//                           onClick={() => {
//                             setSelectedUser(user);
//                             setEditModalOpen(true);
//                           }}
//                           className="me-1"
//                         >
//                           <i className="bi bi-pencil-fill text-white"></i>
//                         </Button>
//                       </OverlayTrigger>

//                       {/* <OverlayTrigger
//                         placement="top"
//                         overlay={<Tooltip>Reset Password</Tooltip>}
//                       >
//                         <Button
//                           variant="secondary"
//                           size="sm"
//                           onClick={() => handleResetPassword(user.id)}
//                           disabled
//                         >
//                           <MdOutlineLockReset />
//                         </Button>
//                       </OverlayTrigger> */}
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="7" style={{ textAlign: "center" }}>
//                     No users found.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>

//         <div className="d-flex justify-content-between align-items-center mt-3">
//           <div className="small text-muted">
//             Showing {currentPage * entriesPerPage - entriesPerPage + 1} to{" "}
//             {Math.min(currentPage * entriesPerPage, filteredAssets.length)} of{" "}
//             {filteredAssets.length} entries
//           </div>

//           <nav>
//             <ul className="pagination pagination-sm mb-0">
//               <li
//                 className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
//               >
//                 <button
//                   className="page-link"
//                   onClick={() => setCurrentPage((p) => p - 1)}
//                 >
//                   «
//                 </button>
//               </li>

//               {Array.from({ length: pageCount }, (_, i) => i + 1).map(
//                 (page) => (
//                   <li
//                     key={page}
//                     className={`page-item ${
//                       currentPage === page ? "active" : ""
//                     }`}
//                   >
//                     <button
//                       className="page-link"
//                       onClick={() => handlePageChange(page)}
//                     >
//                       {page}
//                     </button>
//                   </li>
//                 )
//               )}

//               <li
//                 className={`page-item ${
//                   currentPage === pageCount ? "disabled" : ""
//                 }`}
//               >
//                 <button
//                   className="page-link"
//                   onClick={() => setCurrentPage((p) => p + 1)}
//                 >
//                   »
//                 </button>
//               </li>
//             </ul>
//           </nav>
//         </div>
//       </div>

//       {/* Create User Modal */}
//       <UserFormModal
//         isOpen={createModalOpen}
//         isClosingModal={isClosingModal}
//         onClose={() => setCreateModalOpen(false)}
//         onSubmit={handleCreate}
//         roles={roles}
//         handleCloseModal={handleCloseModal}
//         className={`custom-slide-modal ${isClosingModal ? "closing" : "open"}`}
//       />

//       {/* Edit User Modal */}
//       <EditUserModal
//         isOpen={editModalOpen}
//         isClosingModal={isClosingModal}
//         onClose={() => {
//           setEditModalOpen(false);
//           setSelectedUser(null);
//         }}
//         userData={selectedUser}
//         onSubmit={handleEdit}
//         handleCloseModal={handleCloseModal}
//         roles={roles}
//       />

//       <Modal
//         show={showBulkModal}
//         onHide={() => setShowBulkModal(false)}
//         centered
//       >
//         <Modal.Header closeButton>
//           <Modal.Title>Bulk Upload Users</Modal.Title>
//         </Modal.Header>

//         <Modal.Body>
//           <Form>
//             <Form.Group controlId="formFile">
//               <Form.Label>Select Excel File</Form.Label>
//               <Form.Control
//                 type="file"
//                 accept=".xlsx, .xls"
//                 onChange={(e) => setExcelFile(e.target.files[0])}
//               />
//             </Form.Group>
//           </Form>
//         </Modal.Body>

//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowBulkModal(false)}>
//             Cancel
//           </Button>
//           <Button
//             variant="success"
//             onClick={async () => {
//               await handleExcelUpload();
//               setShowBulkModal(false);
//             }}
//           >
//             Upload
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// };

// export default UserList;

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  uploadUsersExcel,
  exportUsersExcel,
  toggleUserLogin, //// modify for login toggle
} from "../../services/userService";
import apiClient from "../../services/apiClient";
import UserFormModal from "./UserFormModal";
import EditUserModal from "./EditUserModal";
import "./UserList.css";
import BreadCrumb from "../../components/BreadCrumb";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Table,
  Modal,
  Form,
  Badge,
  InputGroup,
  FormControl,
  Pagination,
  Tooltip,
} from "react-bootstrap";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { MdOutlineLockReset } from "react-icons/md";
import { OverlayTrigger } from "react-bootstrap";
import { toast } from "react-toastify";

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(null);
  const [excelFile, setExcelFile] = useState(null);
  const [excelError, setExcelError] = useState("");

  const [showBulkModal, setShowBulkModal] = useState(false);
  // modify for login toggle

  const navigate = useNavigate();
  const [entriesPerPage, setEntriesPerPage] = useState(50);
  const [isClosingModal, setIsClosingModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ✅ Use base URL from .env
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  // Load users and roles on mount
  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

  // Debug users
  useEffect(() => {
    console.log("🔄 Users state updated:", users);
  }, [users]);

  const loadUsers = async () => {
    try {
      const data = await fetchUsers();
      setUsers(data); // modify for login toggle
    } catch (error) {
      console.error("Error loading users:", error);
    }
  };

  const loadRoles = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/api/roleusers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRoles(res.data);
    } catch (error) {
      console.error("Error loading roles:", error);
    }
  };

  // Helper function to get role name from ID
  const getRoleName = (roleId) => {
    if (!roleId) return "N/A";
    const role = roles.find((r) => r.id === parseInt(roleId));
    return role ? role.name : roleId;
  };

  // const handleCreate = async (formData) => {
  //   try {
  //     await createUser(formData);
  //     setCreateModalOpen(false);
  //     loadUsers();
  //     toast.success("User successfully Created.", {
  //       icon: false,
  //     });
  //   } catch (error) {
  //     console.error("Error creating user:", error);
  //   }
  // };

  // const handleEdit = async (userId, formData) => {
  //   try {
  //     await updateUser(userId, formData);
  //     setEditModalOpen(false);
  //     setSelectedUser(null);
  //     loadUsers();
  //     toast.success("User successfully updated.", {
  //       icon: false,
  //     });
  //   } catch (error) {
  //     console.error("Error updating user:", error);
  //   }
  // };

  // In your UserList component, update the handleCreate and handleEdit functions:

  const handleCreate = async (formData) => {
    try {
      console.log("Creating user with data:", formData);
      await createUser(formData);
      setCreateModalOpen(false);
      loadUsers();
      toast.success("User successfully created.", {
        icon: false,
      });
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error(error.response?.data?.message || "Failed to create user", {
        icon: false,
      });
      throw error; // Re-throw to handle in the modal
    }
  };

  const handleEdit = async (userId, formData) => {
    try {
      console.log("Updating user:", userId, "with data:", formData);
      await updateUser(userId, formData);
      setEditModalOpen(false);
      setSelectedUser(null);
      loadUsers();
      toast.success("User successfully updated.", {
        icon: false,
      });
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error(error.response?.data?.message || "Failed to update user", {
        icon: false,
      });
      throw error; // Re-throw to handle in the modal
    }
  };

  const handleDelete = (userId) => {
    confirmAlert({
      customUI: ({ onClose }) => (
        <div className="custom-confirm-modal bg-white p-4 rounded shadow text-center">
          <div style={{ fontSize: "50px", color: "#ff9900" }}>?</div>
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
                  await deleteUser(userId);
                  loadUsers();
                  toast.success("User deleted successfully.", {
                    icon: false,
                  });
                } catch (error) {
                  console.error("Error deleting user:", error);
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

  // ? ADDED: Export Excel functionality (Frontend)
  const handleExportExcel = async () => {
    try {
      toast.info("Generating Excel template...", {
        icon: false,
      });

      await exportUsersExcel();

      toast.success("Excel template downloaded successfully!", {
        icon: false,
      });
    } catch (error) {
      console.error("Error exporting Excel:", error);
      toast.error(error.message || "Failed to download Excel template", {
        icon: false,
      });
    }
  };

  const handleResetPassword = async (userId) => {
    if (window.confirm("Reset this user's password?")) {
      try {
        await apiClient.post(`/users/${userId}/reset-password`);
        alert("Password reset successful");
      } catch (error) {
        console.error("Reset password failed:", error);
        alert("Failed to reset password");
      }
    }
  };

  const handleExcelUpload = async () => {
    if (!excelFile) {
      toast.error("Please select an Excel file first!");
      return;
    }

    try {
      const response = await uploadUsersExcel(excelFile);
      toast.success(response.message || "Excel uploaded successfully!");
      setExcelFile(null);
      await loadUsers(); // 🔄 refresh user list after upload
    } catch (error) {
      console.error("Excel upload failed:", error);
      toast.error("Failed to upload Excel file");
    }
  };

  const handleToggleLogin = async (userId) => {
    console.log("🔄 Toggling login for user:", userId);
    setLoadingUser(userId);
    try {
      const res = await toggleUserLogin(userId);
      console.log("✅ Toggle response:", res);

      // Force reload all users from API to ensure UI is in sync
      await loadUsers();
    } catch (error) {
      console.error("❌ Toggle login failed:", error);
      console.error("❌ Error response:", error.response?.data);
      alert("Failed to toggle login");
    } finally {
      setLoadingUser(null);
    }
  };

  const filteredAssets = users.filter(
    (asset) =>
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (asset.description &&
        asset.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedAssets = filteredAssets.slice(
    startIndex,
    startIndex + entriesPerPage
  );

  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);
  const pageCount = Math.ceil(filteredAssets.length / entriesPerPage);
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleCloseModal = () => {
    setIsClosingModal(true);
    setTimeout(() => {
      setIsClosingModal(false);
      setCreateModalOpen(false);
      setEditModalOpen(false);
    }, 700);
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center">
        <h4 className="mb-0">User Management</h4>

        <div className="d-flex">
          {/* ? ADDED: Export Excel Button */}
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip>Download Excel Template</Tooltip>}
          >
            <Button
              variant="primary"
              size="sm"
              className="me-2 d-flex align-items-center"
              onClick={handleExportExcel}
            >
              <i className="bi bi-download me-1"></i> Download Excel
            </Button>
          </OverlayTrigger>
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip>Create User</Tooltip>}
          >
            <Button
              className="btn btn-success d-flex align-items-center justify-content-center"
              style={{ width: "55px", height: "40px", borderRadius: "6px" }}
              variant="success"
              onClick={() => setCreateModalOpen(true)}
            >
              <i className="bi bi-plus-lg fs-6"></i>
            </Button>
          </OverlayTrigger>
          <Button
            variant="warning"
            size="sm"
            className="ms-2 d-flex align-items-center"
            onClick={() => setShowBulkModal(true)}
          >
            <i className="bi bi-upload me-1"></i> Bulk Upload
          </Button>
        </div>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <BreadCrumb pathname={location.pathname} onNavigate={navigate} />
      </div>

      <div className="bg-white p-3 rounded shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
          <div className="d-flex align-items-center mb-2">
            <select
              className="form-select me-2"
              value={entriesPerPage}
              onChange={(e) => {
                setEntriesPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{ width: "80px" }}
            >
              {/* <option value="10">10</option>
              <option value="25">25</option> */}
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="200">200</option>
              <option value="500">500</option>
              <option value="1000">1000</option>
              <option value="1500">1500</option>
            </select>
          </div>
          <div>
            <input
              type="text"
              className="form-control form-control-sm"
              style={{ maxWidth: "250px" }}
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover table-bordered mb-0 table-striped">
            <thead>
              <tr>
                <th>Avatar</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role/Type</th>
                <th>Status</th>
                {/* <th>Login</th> */}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAssets.length ? (
                paginatedAssets.map((user) => (
                  <tr key={user.id}>
                    <td>
                      {user.avatar ? (
                        <img
                          src={`${BASE_URL}/${user.avatar}`}
                          alt="avatar"
                          className="avatar-img"
                        />
                      ) : (
                        <span className="no-avatar">N/A</span>
                      )}
                    </td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{getRoleName(user.type)}</td>
                    <td>{user.is_active ? "Active" : "Inactive"}</td>
                    {/* <td>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={!!user.is_enable_login}
                          onChange={() => handleToggleLogin(user.id)}
                          disabled={loadingUser === user.id}
                        />
                        <span className="slider round"></span>
                      </label>
                    </td> */}
                    <td>
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Edit</Tooltip>}
                      >
                        <Button
                          variant="info"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setEditModalOpen(true);
                          }}
                          className="me-1"
                        >
                          <i className="bi bi-pencil-fill text-white"></i>
                        </Button>
                      </OverlayTrigger>

                      {/* <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Reset Password</Tooltip>}
                      >
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleResetPassword(user.id)}
                          disabled
                        >
                          <MdOutlineLockReset />
                        </Button>
                      </OverlayTrigger> */}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center" }}>
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="d-flex justify-content-between align-items-center mt-3">
          <div className="small text-muted">
            Showing {currentPage * entriesPerPage - entriesPerPage + 1} to{" "}
            {Math.min(currentPage * entriesPerPage, filteredAssets.length)} of{" "}
            {filteredAssets.length} entries
          </div>

          <nav>
            <ul className="pagination pagination-sm mb-0">
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  «
                </button>
              </li>

              {Array.from({ length: pageCount }, (_, i) => i + 1).map(
                (page) => (
                  <li
                    key={page}
                    className={`page-item ${
                      currentPage === page ? "active" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  </li>
                )
              )}

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
          </nav>
        </div>
      </div>

      {/* Create User Modal */}
      <UserFormModal
        isOpen={createModalOpen}
        isClosingModal={isClosingModal}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreate}
        roles={roles}
        handleCloseModal={handleCloseModal}
        className={`custom-slide-modal ${isClosingModal ? "closing" : "open"}`}
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={editModalOpen}
        isClosingModal={isClosingModal}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedUser(null);
        }}
        userData={selectedUser}
        onSubmit={handleEdit}
        handleCloseModal={handleCloseModal}
        roles={roles}
      />

      <Modal
        show={showBulkModal}
        onHide={() => setShowBulkModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Bulk Upload Users</Modal.Title>
        </Modal.Header>

        {/* <Modal.Body>
          <Form>
            <Form.Group controlId="formFile">
              <Form.Label>Select Excel File</Form.Label>
              <Form.Control
                type="file"
                accept=".xlsx, .xls"
                onChange={(e) => setExcelFile(e.target.files[0])}
              />
            </Form.Group>
          </Form>
        </Modal.Body> */}

        <Modal.Body>
          {/* ? ADDED: Helpful instructions */}
          <div className="alert alert-info mb-3">
            <small>
              <strong>Instructions:</strong>
              <br />
              1. First, download the Excel template using the "Download Excel"
              button
              <br />
              2. Fill in the user data in the template
              <br />
              3. Upload the completed file here
            </small>
          </div> 
          <Form noValidate>
            <Form.Group controlId="formFile" className="mb-3">
              <Form.Label>
                Select Excel File <span className="text-danger">*</span>
              </Form.Label>
              <div className="position-relative">
                <Form.Control
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={(e) => {
                    setExcelFile(e.target.files[0]);
                    setExcelError(""); // clear error on change
                  }}
                  isInvalid={!!excelError}
                />
                {excelError && (
                  <Form.Control.Feedback type="invalid" className="d-block">
                    {excelError}
                  </Form.Control.Feedback>
                )}
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBulkModal(false)}>
            Cancel
          </Button>
          <Button
            variant="success"
            // onClick={async () => {
            //   await handleExcelUpload();
            //   setShowBulkModal(false);
            // }}
            onClick={async () => {
              if (!excelFile) {
                setExcelError("Excel file is required");
                return;
              }
              await handleExcelUpload();
              setShowBulkModal(false);
            }}
          >
            Upload
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UserList;
