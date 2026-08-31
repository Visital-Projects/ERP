// import React, { useEffect, useState } from "react";
// import {
//   fetchAllAssets,
//   createAsset,
//   updateAsset,
//   deleteAsset,
// } from "../../services/assetsService";
// import { Button, Table, Modal, Form, Spinner, Alert } from "react-bootstrap";

// const Assets = () => {
//   const [assets, setAssets] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [showModal, setShowModal] = useState(false);
//   const [editMode, setEditMode] = useState(false);
//   const [selectedAsset, setSelectedAsset] = useState(null);
//   const [error, setError] = useState("");
//   const [formData, setFormData] = useState({
//     name: "",
//     category: "",
//     purchase_date: "",
//     purchase_cost: "",
//     location: "",
//     status: "active",
//     description: "",
//   });

//   // ✅ Load all assets on mount
//   useEffect(() => {
//     loadAssets();
//   }, []);

//   const loadAssets = async () => {
//     try {
//       setLoading(true);
//       const data = await fetchAllAssets();
//       setAssets(data || []);
//     } catch (err) {
//       console.error(err);
//       setError("Failed to fetch assets");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // const handleShowModal = (asset = null) => {
//   //   if (asset) {
//   //     setEditMode(true);
//   //     setSelectedAsset(asset);
//   //     setFormData(asset);
//   //   } else {
//   //     setEditMode(false);
//   //     setSelectedAsset(null);
//   //     setFormData({
//   //       name: "",
//   //       category: "",
//   //       purchase_date: "",
//   //       purchase_cost: "",
//   //       location: "",
//   //       status: "active",
//   //       description: "",
//   //     });
//   //   }
//   //   setShowModal(true);
//   // };

//   const handleShowModal = (asset = null) => {
//     if (asset) {
//       setEditMode(true);
//       setSelectedAsset(asset);
//       setFormData({
//         name: asset.name || "",
//         category: asset.category || "",
//         purchase_date: asset.purchase_date?.split("T")[0] || "", // ✅ convert to yyyy-mm-dd
//         purchase_cost: asset.purchase_cost || "",
//         location: asset.location || "",
//         status: asset.status || "active",
//         description: asset.description || "",
//       });
//     } else {
//       setEditMode(false);
//       setSelectedAsset(null);
//       setFormData({
//         name: "",
//         category: "",
//         purchase_date: "",
//         purchase_cost: "",
//         location: "",
//         status: "active",
//         description: "",
//       });
//     }
//     setShowModal(true);
//   };

//   // const handleSave = async () => {
//   //   try {
//   //     setLoading(true);
//   //     // Ensure purchase_cost is sent as number
//   //     const payload = {
//   //       ...formData,
//   //       purchase_cost: Number(formData.purchase_cost),
//   //     };

//   //     if (editMode && selectedAsset) {
//   //       await updateAsset(selectedAsset.id, payload);
//   //     } else {
//   //       await createAsset(payload);
//   //     }
//   //     setShowModal(false);
//   //     loadAssets();
//   //   } catch (err) {
//   //     console.error(err);
//   //     setError("Failed to save asset");
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };
//   const handleSave = async () => {
//     try {
//       setLoading(true);

//       // ✅ Strip out unwanted fields before sending
//       const payload = {
//         name: formData.name,
//         category: formData.category,
//         purchase_date: formData.purchase_date, // make sure it's yyyy-mm-dd
//         purchase_cost: Number(formData.purchase_cost),
//         location: formData.location,
//         status: formData.status,
//         description: formData.description,
//       };

//       if (editMode && selectedAsset) {
//         await updateAsset(selectedAsset.id, payload);
//       } else {
//         await createAsset(payload);
//       }

//       setShowModal(false);
//       loadAssets();
//     } catch (err) {
//       console.error("❌ Save failed:", err.response?.data || err.message);
//       setError(
//         err.response?.data?.message ||
//           "Failed to save asset. Check data format."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this asset?")) return;
//     try {
//       await deleteAsset(id);
//       loadAssets();
//     } catch (err) {
//       console.error(err);
//       setError("Failed to delete asset");
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   return (
//     <div className="container mt-4">
//       <h2 className="mb-3">Assets Management</h2>
//       {error && <Alert variant="danger">{error}</Alert>}

//       <Button className="mb-3" onClick={() => handleShowModal()}>
//         ➕ Add Asset
//       </Button>

//       {loading ? (
//         <Spinner animation="border" />
//       ) : (
//         <Table striped bordered hover responsive>
//           <thead>
//             <tr>
//               {/* <th>ID</th> */}
//               <th>Name</th>
//               <th>Category</th>
//               <th>Purchase Date</th>
//               <th>Cost</th>
//               <th>Location</th>
//               <th>Status</th>
//               <th>Description</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {assets.length > 0 ? (
//               assets.map((asset) => (
//                 <tr key={asset.id}>
//                   {/* <td>{asset.id}</td> */}
//                   <td>{asset.name}</td>
//                   <td>{asset.category}</td>
//                   <td>{asset.purchase_date}</td>
//                   <td>{asset.purchase_cost}</td>
//                   <td>{asset.location}</td>
//                   <td>{asset.status}</td>
//                   <td>{asset.description}</td>
//                   <td>
//                     <Button
//                       size="sm"
//                       variant="warning"
//                       className="me-2"
//                       onClick={() => handleShowModal(asset)}
//                     >
//                       ✏️ Edit
//                     </Button>
//                     <Button
//                       size="sm"
//                       variant="danger"
//                       onClick={() => handleDelete(asset.id)}
//                     >
//                       🗑 Delete
//                     </Button>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="9" className="text-center">
//                   No assets found
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </Table>
//       )}

//       {/* ✅ Modal for Create/Edit */}
//       <Modal show={showModal} onHide={() => setShowModal(false)} centered>
//         <Modal.Header closeButton>
//           <Modal.Title>{editMode ? "Edit Asset" : "Add Asset"}</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Form>
//             <Form.Group className="mb-3">
//               <Form.Label>NAME</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="name"
//                 value={formData.name}
//                 onChange={handleChange}
//               />
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>CATEGORY</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="category"
//                 value={formData.category}
//                 onChange={handleChange}
//               />
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>PURCHASE DATE</Form.Label>
//               <Form.Control
//                 type="date"
//                 name="purchase_date"
//                 value={formData.purchase_date}
//                 onChange={handleChange}
//               />
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>PURCHASE COST</Form.Label>
//               <Form.Control
//                 type="number"
//                 name="purchase_cost"
//                 value={formData.purchase_cost}
//                 onChange={handleChange}
//               />
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>LOCATION</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="location"
//                 value={formData.location}
//                 onChange={handleChange}
//               />
//             </Form.Group>

//             {/* ✅ Status as Dropdown */}
//             <Form.Group className="mb-3">
//               <Form.Label>STATUS</Form.Label>
//               <Form.Select
//                 name="status"
//                 value={formData.status}
//                 onChange={handleChange}
//               >
//                 <option value="active">Active</option>
//                 <option value="maintenance">Maintenance</option>
//                 <option value="disposed">Disposed</option>
//                 <option value="inactive">Inactive</option>
//               </Form.Select>
//             </Form.Group>

//             <Form.Group className="mb-3">
//               <Form.Label>DESCRIPTION</Form.Label>
//               <Form.Control
//                 type="text"
//                 name="description"
//                 value={formData.description}
//                 onChange={handleChange}
//               />
//             </Form.Group>
//           </Form>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowModal(false)}>
//             Cancel
//           </Button>
//           <Button variant="primary" onClick={handleSave}>
//             {editMode ? "Update" : "Save"}
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// };

// export default Assets;

// import React, { useEffect, useState } from "react";
// import {
//   fetchAllAssets,
//   createAsset,
//   updateAsset,
//   deleteAsset,
// } from "../../services/assetsService";
// import { Button, Table, Form, Spinner } from "react-bootstrap";
// import { confirmAlert } from "react-confirm-alert";
// import "react-confirm-alert/src/react-confirm-alert.css";
// import { useNavigate, useLocation } from "react-router-dom";
// import BreadCrumb from "../../components/BreadCrumb";
// import { OverlayTrigger, Tooltip } from "react-bootstrap";

// const Assets = () => {
//   const [assets, setAssets] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [showModal, setShowModal] = useState(false);
//   const [editMode, setEditMode] = useState(false);
//   const [selectedAsset, setSelectedAsset] = useState(null);
//   const [error, setError] = useState("");
//   const [formData, setFormData] = useState({
//     name: "",
//     category: "",
//     purchase_date: "",
//     purchase_cost: "",
//     location: "",
//     status: "active",
//     description: "",
//   });

//   // Pagination
//   const [page, setPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(10);
//   const [totalEntries, setTotalEntries] = useState(0);

//   // Search
//   const [searchTerm, setSearchTerm] = useState("");

//   // Modal animation
//   const [isClosingModal, setIsClosingModal] = useState(false);

//   // Alert
//   const [alert, setAlert] = useState({
//     show: false,
//     message: "",
//     type: "success",
//   });

//   // Router
//   const navigate = useNavigate();
//   const location = useLocation();

//   // Load assets
//   useEffect(() => {
//     loadAssets();
//   }, [page, itemsPerPage, searchTerm]);

//   const loadAssets = async () => {
//     try {
//       setLoading(true);
//       let data = await fetchAllAssets();
//       data = data || [];

//       // Filter
//       const filtered = data.filter(
//         (a) =>
//           a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           a.category.toLowerCase().includes(searchTerm.toLowerCase())
//       );

//       setTotalEntries(filtered.length);

//       // Pagination
//       const startIndex = (page - 1) * itemsPerPage;
//       setAssets(filtered.slice(startIndex, startIndex + itemsPerPage));
//     } catch (err) {
//       console.error(err);
//       setError("Failed to fetch assets");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Modal handlers
//   const handleShowModal = (asset = null) => {
//     if (asset) {
//       setEditMode(true);
//       setSelectedAsset(asset);
//       setFormData({
//         name: asset.name || "",
//         category: asset.category || "",
//         purchase_date: asset.purchase_date?.split("T")[0] || "",
//         purchase_cost: asset.purchase_cost || "",
//         location: asset.location || "",
//         status: asset.status || "active",
//         description: asset.description || "",
//       });
//     } else {
//       setEditMode(false);
//       setSelectedAsset(null);
//       setFormData({
//         name: "",
//         category: "",
//         purchase_date: "",
//         purchase_cost: "",
//         location: "",
//         status: "active",
//         description: "",
//       });
//     }
//     setShowModal(true);
//   };

//   const handleCloseModal = () => {
//     setIsClosingModal(true);
//     setTimeout(() => {
//       setShowModal(false);
//       setIsClosingModal(false);
//       setSelectedAsset(null);
//       setFormData({
//         name: "",
//         category: "",
//         purchase_date: "",
//         purchase_cost: "",
//         location: "",
//         status: "active",
//         description: "",
//       });
//     }, 700);
//   };

//   const handleSave = async () => {
//     try {
//       setLoading(true);
//       const payload = {
//         name: formData.name,
//         category: formData.category,
//         purchase_date: formData.purchase_date,
//         purchase_cost: Number(formData.purchase_cost),
//         location: formData.location,
//         status: formData.status,
//         description: formData.description,
//       };

//       if (editMode && selectedAsset) {
//         await updateAsset(selectedAsset.id, payload);
//         showAlert("Asset updated successfully", "success");
//       } else {
//         await createAsset(payload);
//         showAlert("Asset created successfully", "success");
//       }

//       handleCloseModal();
//       loadAssets();
//     } catch (err) {
//       console.error("❌ Save failed:", err.response?.data || err.message);
//       setError(
//         err.response?.data?.message ||
//           "Failed to save asset. Check data format."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = (id) => {
//     confirmAlert({
//       customUI: ({ onClose }) => (
//         <div className="custom-confirm-modal bg-white p-4 rounded shadow text-center">
//           <div style={{ fontSize: "50px", color: "#ff9900" }}>❗</div>
//           <h4 className="fw-bold mt-2">Are you sure?</h4>
//           <p>This action cannot be undone. Do you want to continue?</p>
//           <div className="d-flex justify-content-center mt-3">
//             <button
//               className="btn btn-danger me-2 px-4"
//               onClick={() => {
//                 document.body.style.overflow = "auto";
//                 onClose();
//               }}
//             >
//               No
//             </button>
//             <button
//               className="btn btn-success px-4"
//               onClick={async () => {
//                 try {
//                   await deleteAsset(id);
//                   showAlert("Asset deleted successfully", "success");
//                   loadAssets();
//                 } catch (err) {
//                   showAlert("Failed to delete asset", "danger");
//                 }
//                 document.body.style.overflow = "auto";
//                 onClose();
//               }}
//             >
//               Yes
//             </button>
//           </div>
//         </div>
//       ),
//       onClickOutside: () => (document.body.style.overflow = "auto"),
//       afterOpen: () => (document.body.style.overflow = "hidden"),
//       onClose: () => (document.body.style.overflow = "auto"),
//     });
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const showAlert = (message, type = "success") => {
//     setAlert({ show: true, message, type });
//     setTimeout(() => setAlert({ ...alert, show: false }), 5000);
//   };

//   const totalPages = Math.ceil(totalEntries / itemsPerPage);
//   const handlePageChange = (newPage) => setPage(newPage);

//   const renderPaginationItems = () => {
//     const items = [];
//     for (let i = 1; i <= totalPages; i++) {
//       items.push(
//         <li key={i} className={`page-item ${page === i ? "active" : ""}`}>
//           <button className="page-link" onClick={() => handlePageChange(i)}>
//             {i}
//           </button>
//         </li>
//       );
//     }
//     return items;
//   };

//   return (
//     <div className="container mt-4">
//       {/* Global styles */}
//       <style>{`
//         .entries-select:focus {
//           border-color: #6FD943 !important;
//           box-shadow: 0 0 0px 4px #70d94360 !important;
//         }
//         @keyframes slideInUp { from {transform: translateY(100%); opacity:0;} to {transform: translateY(0); opacity:1;} }
//         @keyframes slideOutUp { from {transform: translateY(0); opacity:1;} to {transform: translateY(-100%); opacity:0;} }
//         .custom-slide-modal.open .modal-dialog { animation: slideInUp 0.7s ease forwards; }
//         .custom-slide-modal.closing .modal-dialog { animation: slideOutUp 0.7s ease forwards; }
//       `}</style>

//       {/* Alert */}
//       {alert.show && (
//         <div
//           className={`alert alert-${alert.type} alert-dismissible fade show position-fixed`}
//           style={{
//             top: "20px",
//             right: "20px",
//             zIndex: 1050,
//             minWidth: "300px",
//           }}
//         >
//           {alert.message}
//           <button
//             type="button"
//             className="btn-close"
//             onClick={() => setAlert({ ...alert, show: false })}
//           ></button>
//         </div>
//       )}

//       {/* Breadcrumb + Header */}
//       <div className="d-flex justify-content-between align-items-center mb-3">
//         <div>
//           <h4 className="mb-0 fw-bold">Assets Management</h4>
//           <BreadCrumb pathname={location.pathname} onNavigate={navigate} />
//         </div>
//         <OverlayTrigger overlay={<Tooltip>Create</Tooltip>}>
//         <Button
//           onClick={() => handleShowModal()}
//           className="btn-success d-flex align-items-center justify-content-center p-0"
//           style={{ width: "45px", height: "45px", borderRadius: "6px" }}
//         >
//           <i className="bi bi-plus-lg fs-6"></i>
//         </Button>
//         </OverlayTrigger>

//       </div>

//       {/* Search + Entries */}
//       <div className="row mb-2">
//         <div className="col-12 col-md-6 d-flex align-items-center mb-2 mb-md-0">
//           <select
//             className="form-select me-2 "
//             value={itemsPerPage}
//             onChange={(e) => {
//               setItemsPerPage(Number(e.target.value));
//               setPage(1);
//             }}
//             style={{ width: "80px" }}
//           >
//             {/* <option value={5}>5</option> */}
//             <option value={10}>10</option>
//             <option value={25}>25</option>
//             <option value={50}>50</option>
//             <option value={100}>100</option>
//           </select>

//         </div>
//         <div className="col-12 col-md-6">
//           <input
//             type="text"
//             className="form-control form-control-sm ms-auto  w-auto "
//             placeholder="Search..."
//             value={searchTerm}
//             onChange={(e) => {
//               setSearchTerm(e.target.value);
//               setPage(1);
//             }}
//           />
//         </div>
//       </div>

//       {loading ? (
//         <div className="d-flex justify-content-center p-3 align-items-center" style={{height:"50vh"}}>
//           <Spinner animation="border" variant="success" />
//         </div>
//       ) : (
//         <>
//           <Table striped bordered hover responsive>
//             <thead>
//               <tr>
//                 <th>Name</th>
//                 <th>Category</th>
//                 <th>Purchase Date</th>
//                 <th>Cost</th>
//                 <th>Location</th>
//                 <th>Status</th>
//                 <th>Description</th>
//                 <th style={{ minWidth: "100px" }}>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {assets.length > 0 ? (
//                 assets.map((asset) => (
//                   <tr key={asset.id}>
//                     <td>{asset.name}</td>
//                     <td>{asset.category}</td>
//                     <td>{asset.purchase_date}</td>
//                     <td>{asset.purchase_cost}</td>
//                     <td>{asset.location}</td>
//                     <td>{asset.status}</td>
//                     <td>{asset.description}</td>
//                     <td>
//                       <OverlayTrigger overlay={<Tooltip>Create</Tooltip>}>
//                       <Button
//                         size="sm"
//                         variant="info"
//                         className="me-2"
//                         onClick={() => handleShowModal(asset)}
//                       >
//                         <i className="bi bi-pencil-fill"></i>
//                       </Button>
//                       </OverlayTrigger>
//                       <OverlayTrigger overlay={<Tooltip>Create</Tooltip>}>
//                       <Button
//                         size="sm"
//                         variant="danger"
//                         onClick={() => handleDelete(asset.id)}
//                       >
//                         <i className="bi bi-trash-fill"></i>
//                       </Button>
//                       </OverlayTrigger>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="8" className="text-center">
//                     No assets found
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </Table>

//           {/* Pagination */}
//           <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-2">
//             <span>
//               Showing {assets.length === 0 ? 0 : (page - 1) * itemsPerPage + 1}{" "}
//               to {Math.min(page * itemsPerPage, totalEntries)} of {totalEntries}{" "}
//               entries
//             </span>
//             <nav>
//               <ul className="pagination pagination-sm mb-0">
//                 <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
//                   <button
//                     className="page-link"
//                     onClick={() => page > 1 && handlePageChange(page - 1)}
//                   >
//                     &laquo;
//                   </button>
//                 </li>
//                 {renderPaginationItems()}
//                 <li
//                   className={`page-item ${
//                     page === totalPages ? "disabled" : ""
//                   }`}
//                 >
//                   <button
//                     className="page-link"
//                     onClick={() =>
//                       page < totalPages && handlePageChange(page + 1)
//                     }
//                   >
//                     &raquo;
//                   </button>
//                 </li>
//               </ul>
//             </nav>
//           </div>
//         </>
//       )}

//       {/* Modal */}
//       {showModal && (
//         <div
//           className={`modal fade show d-block custom-slide-modal ${
//             isClosingModal ? "closing" : "open"
//           }`}
//           tabIndex="-1"
//           onClick={handleCloseModal}
//           style={{
//             overflowY: "auto",
//             scrollbarWidth: "none",
//             backgroundColor: "rgba(0,0,0,0.5)",
//           }}
//         >
//           <div
//             className="modal-dialog modal-dialog-centered"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className="modal-content">
//               <div className="modal-header">
//                 <h5 className="modal-title">
//                   {editMode ? "Edit Asset" : "Add Asset"}
//                 </h5>
//                 <button
//                   type="button"
//                   className="btn-close"
//                   onClick={handleCloseModal}
//                 ></button>
//               </div>
//               <div className="modal-body">
//                 <Form>
//                   <Form.Group className="mb-3">
//                     <Form.Label>Name <span className="text-danger">*</span></Form.Label>
//                     <Form.Control
//                       type="text"
//                       name="name"
//                       value={formData.name}
//                       onChange={handleChange}
//                     />
//                   </Form.Group>
//                   <Form.Group className="mb-3">
//                     <Form.Label>Category</Form.Label>
//                     <Form.Control
//                       type="text"
//                       name="category"
//                       value={formData.category}
//                       onChange={handleChange}
//                     />
//                   </Form.Group>
//                   <Form.Group className="mb-3">
//                     <Form.Label>Purchase Date <span className="text-danger">*</span></Form.Label>
//                     <Form.Control
//                       type="date"
//                       name="purchase_date"
//                       value={formData.purchase_date}
//                       onChange={handleChange}
//                     />
//                   </Form.Group>
//                   <Form.Group className="mb-3">
//                     <Form.Label>Purchase Cost</Form.Label>
//                     <Form.Control
//                       type="number"
//                       name="purchase_cost"
//                       value={formData.purchase_cost}
//                       onChange={handleChange}
//                     />
//                   </Form.Group>
//                   <Form.Group className="mb-3">
//                     <Form.Label>Location</Form.Label>
//                     <Form.Control
//                       type="text"
//                       name="location"
//                       value={formData.location}
//                       onChange={handleChange}
//                     />
//                   </Form.Group>
//                   <Form.Group className="mb-3">
//                     <Form.Label>Status</Form.Label>
//                     <Form.Select
//                       name="status"
//                       value={formData.status}
//                       onChange={handleChange}
//                     >
//                       <option value="active">Active</option>
//                       <option value="maintenance">Maintenance</option>
//                       <option value="disposed">Disposed</option>
//                       <option value="inactive">Inactive</option>
//                     </Form.Select>
//                   </Form.Group>
//                   <Form.Group className="mb-3">
//                     <Form.Label>Description</Form.Label>
//                     <Form.Control
//                       type="text"
//                       name="description"
//                       value={formData.description}
//                       onChange={handleChange}
//                     />
//                   </Form.Group>
//                 </Form>
//               </div>
//               <div className="modal-footer">
//                 <Button variant="secondary" onClick={handleCloseModal}>
//                   Cancel
//                 </Button>
//                 <Button variant="success" onClick={handleSave}>
//                   {editMode ? "Update" : "Save"}
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Assets;

import React, { useEffect, useState } from "react";
import {
  fetchAllAssets,
  createAsset,
  updateAsset,
  deleteAsset,
} from "../../services/assetsService";
import { Button, Table, Form, Spinner } from "react-bootstrap";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { useNavigate, useLocation } from "react-router-dom";
import BreadCrumb from "../../components/BreadCrumb";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

const Assets = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    purchase_date: "",
    purchase_cost: "",
    location: "",
    status: "active",
    description: "",
  });

  // Pagination
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalEntries, setTotalEntries] = useState(0);

  // Search
  const [searchTerm, setSearchTerm] = useState("");

  // Modal animation
  const [isClosingModal, setIsClosingModal] = useState(false);

  // Alert
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // Router
  const navigate = useNavigate();
  const location = useLocation();

  // Load assets
  useEffect(() => {
    loadAssets();
  }, [page, itemsPerPage, searchTerm]);

  const loadAssets = async () => {
    try {
      setLoading(true);
      let data = await fetchAllAssets();
      data = data || [];

      // Filter
      const filtered = data.filter(
        (a) =>
          a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.category.toLowerCase().includes(searchTerm.toLowerCase())
      );

      setTotalEntries(filtered.length);

      // Pagination
      const startIndex = (page - 1) * itemsPerPage;
      setAssets(filtered.slice(startIndex, startIndex + itemsPerPage));
    } catch (err) {
      console.error(err);
      setError("Failed to fetch assets");
    } finally {
      setLoading(false);
    }
  };

  // Modal handlers
  const handleShowModal = (asset = null) => {
    if (asset) {
      setEditMode(true);
      setSelectedAsset(asset);
      setFormData({
        name: asset.name || "",
        category: asset.category || "",
        purchase_date: asset.purchase_date?.split("T")[0] || "",
        purchase_cost: asset.purchase_cost || "",
        location: asset.location || "",
        status: asset.status || "active",
        description: asset.description || "",
      });
    } else {
      setEditMode(false);
      setSelectedAsset(null);
      setFormData({
        name: "",
        category: "",
        purchase_date: "",
        purchase_cost: "",
        location: "",
        status: "active",
        description: "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setIsClosingModal(true);
    setTimeout(() => {
      setShowModal(false);
      setIsClosingModal(false);
      setSelectedAsset(null);
      setFormData({
        name: "",
        category: "",
        purchase_date: "",
        purchase_cost: "",
        location: "",
        status: "active",
        description: "",
      });
    }, 700);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const payload = {
        name: formData.name,
        category: formData.category,
        purchase_date: formData.purchase_date,
        purchase_cost: Number(formData.purchase_cost),
        location: formData.location,
        status: formData.status,
        description: formData.description,
      };

      if (editMode && selectedAsset) {
        await updateAsset(selectedAsset.id, payload);
        showAlert("Asset updated successfully", "success");
      } else {
        await createAsset(payload);
        showAlert("Asset created successfully", "success");
      }

      handleCloseModal();
      loadAssets();
    } catch (err) {
      console.error("❌ Save failed:", err.response?.data || err.message);
      setError(
        err.response?.data?.message ||
          "Failed to save asset. Check data format."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    confirmAlert({
      customUI: ({ onClose }) => (
        <div className="custom-confirm-modal bg-white p-4 rounded shadow text-center">
          <div style={{ fontSize: "50px", color: "#ff9900" }}>❗</div>
          <h4 className="fw-bold mt-2">Are you sure?</h4>
          <p>This action cannot be undone. Do you want to continue?</p>
          <div className="d-flex justify-content-center mt-3">
            <button
              className="btn btn-danger me-2 px-4"
              onClick={() => {
                document.body.style.overflow = "auto";
                onClose();
              }}
            >
              No
            </button>
            <button
              className="btn btn-success px-4"
              onClick={async () => {
                try {
                  await deleteAsset(id);
                  showAlert("Asset deleted successfully", "success");
                  loadAssets();
                } catch (err) {
                  showAlert("Failed to delete asset", "danger");
                }
                document.body.style.overflow = "auto";
                onClose();
              }}
            >
              Yes
            </button>
          </div>
        </div>
      ),
      onClickOutside: () => (document.body.style.overflow = "auto"),
      afterOpen: () => (document.body.style.overflow = "hidden"),
      onClose: () => (document.body.style.overflow = "auto"),
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const showAlert = (message, type = "success") => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ ...alert, show: false }), 5000);
  };

  const totalPages = Math.ceil(totalEntries / itemsPerPage);
  const handlePageChange = (newPage) => setPage(newPage);

  const renderPaginationItems = () => {
    const items = [];
    for (let i = 1; i <= totalPages; i++) {
      items.push(
        <li key={i} className={`page-item ${page === i ? "active" : ""}`}>
          <button className="page-link" onClick={() => handlePageChange(i)}>
            {i}
          </button>
        </li>
      );
    }
    return items;
  };

  return (
    <div className="container mt-4">
      {/* Global styles */}
      <style>{`
        .entries-select:focus {
          border-color: #6FD943 !important;
          box-shadow: 0 0 0px 4px #70d94360 !important;
        }
        @keyframes slideInUp { from {transform: translateY(100%); opacity:0;} to {transform: translateY(0); opacity:1;} }
        @keyframes slideOutUp { from {transform: translateY(0); opacity:1;} to {transform: translateY(-100%); opacity:0;} }
        .custom-slide-modal.open .modal-dialog { animation: slideInUp 0.7s ease forwards; }
        .custom-slide-modal.closing .modal-dialog { animation: slideOutUp 0.7s ease forwards; }
      `}</style>

      {/* Alert */}
      {alert.show && (
        <div
          className={`alert alert-${alert.type} alert-dismissible fade show position-fixed`}
          style={{
            top: "20px",
            right: "20px",
            zIndex: 1050,
            minWidth: "300px",
          }}
        >
          {alert.message}
          <button
            type="button"
            className="btn-close"
            onClick={() => setAlert({ ...alert, show: false })}
          ></button>
        </div>
      )}

      {/* Breadcrumb + Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="mb-0 fw-bold">Assets Management</h4>
          <BreadCrumb pathname={location.pathname} onNavigate={navigate} />
        </div>
        <OverlayTrigger overlay={<Tooltip>Create</Tooltip>}>
          <Button
            onClick={() => handleShowModal()}
            className="btn-success d-flex align-items-center justify-content-center p-0"
            style={{ width: "45px", height: "45px", borderRadius: "6px" }}
          >
            <i className="bi bi-plus-lg fs-6"></i>
          </Button>
        </OverlayTrigger>
      </div>

      <div className="bg-white p-3 rounded shadow-sm">
        {/* Search + Entries */}
        <div className="row mb-2">
          <div className="col-12 col-md-6 d-flex align-items-center mb-2 mb-md-0">
            <select
              className="form-select me-2 "
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setPage(1);
              }}
              style={{ width: "80px" }}
            >
              {/* <option value={5}>5</option> */}
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <div className="col-12 col-md-6">
            <input
              type="text"
              className="form-control form-control-sm ms-auto  w-auto "
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        {loading ? (
          <div
            className="d-flex justify-content-center p-3 align-items-center"
            style={{ height: "50vh" }}
          >
            <Spinner animation="border" variant="success" />
          </div>
        ) : (
          <>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Purchase Date</th>
                  <th>Cost</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Description</th>
                  <th style={{ minWidth: "100px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assets.length > 0 ? (
                  assets.map((asset) => (
                    <tr key={asset.id}>
                      <td>{asset.name}</td>
                      <td>{asset.category}</td>
                      <td>{asset.purchase_date}</td>
                      <td>{asset.purchase_cost}</td>
                      <td>{asset.location}</td>
                      <td>{asset.status}</td>
                      <td
                        style={{
                          width: "200px",
                          whiteSpace: "normal",
                          wordWrap: "break-word",
                          overflowWrap: "break-word",
                        }}
                      >
                        {asset.description}
                      </td>
                      <td>
                        <OverlayTrigger overlay={<Tooltip>Create</Tooltip>}>
                          <Button
                            size="sm"
                            variant="info"
                            className="me-2"
                            onClick={() => handleShowModal(asset)}
                          >
                            <i className="bi bi-pencil-fill"></i>
                          </Button>
                        </OverlayTrigger>
                        <OverlayTrigger overlay={<Tooltip>Create</Tooltip>}>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDelete(asset.id)}
                          >
                            <i className="bi bi-trash-fill"></i>
                          </Button>
                        </OverlayTrigger>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center">
                      No assets found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>

            {/* Pagination */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-2">
              <span>
                Showing{" "}
                {assets.length === 0 ? 0 : (page - 1) * itemsPerPage + 1} to{" "}
                {Math.min(page * itemsPerPage, totalEntries)} of {totalEntries}{" "}
                entries
              </span>
              <nav>
                <ul className="pagination pagination-sm mb-0">
                  <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                    <button
                      className="page-link"
                      onClick={() => page > 1 && handlePageChange(page - 1)}
                    >
                      &laquo;
                    </button>
                  </li>
                  {renderPaginationItems()}
                  <li
                    className={`page-item ${
                      page === totalPages ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() =>
                        page < totalPages && handlePageChange(page + 1)
                      }
                    >
                      &raquo;
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </>
        )}
      </div>
      {/* Modal */}
      {showModal && (
        <div
          className={`modal fade show d-block custom-slide-modal ${
            isClosingModal ? "closing" : "open"
          }`}
          tabIndex="-1"
          onClick={handleCloseModal}
          style={{
            overflowY: "auto",
            scrollbarWidth: "none",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editMode ? "Edit Asset" : "Add Asset"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                ></button>
              </div>
              <div className="modal-body">
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Name <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Category</Form.Label>
                    <Form.Control
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Purchase Date <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="date"
                      name="purchase_date"
                      value={formData.purchase_date}
                      max="9999-12-31"
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Purchase Cost</Form.Label>
                    <Form.Control
                      type="number"
                      name="purchase_cost"
                      value={formData.purchase_cost}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Location</Form.Label>
                    <Form.Control
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      <option value="active">Active</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="disposed">Disposed</option>
                      <option value="inactive">Inactive</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      type="text"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Form>
              </div>
              <div className="modal-footer">
                <Button variant="secondary" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button variant="success" onClick={handleSave}>
                  {editMode ? "Update" : "Save"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assets;
