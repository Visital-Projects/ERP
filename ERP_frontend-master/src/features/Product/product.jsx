// // import React, { useState, useEffect, useMemo } from "react";
// // import {
// //   fetchProducts,
// //   createProduct,
// //   updateProduct,
// //   deleteProduct,
// // } from "../../services/productService";
// // import { fetchCategories } from "../../services/AccountingSetup";
// // import { fetchUnits } from "../../services/AccountingSetup";
// // import { fetchTaxes } from "../../services/AccountingSetup";
// // import { fetchChartAccounts } from "../../services/AccountingSetup";

// // const Product = () => {
// //   const [products, setProducts] = useState([]);
// //   const [categories, setCategories] = useState([]);
// //   const [units, setUnits] = useState([]);
// //   const [taxes, setTaxes] = useState([]);
// //   const [accounts, setAccounts] = useState([]);
// //   const [loading, setLoading] = useState(false);
// //   const [dialogOpen, setDialogOpen] = useState(false);
// //   const [editingProduct, setEditingProduct] = useState(null);
// //   const [snackbar, setSnackbar] = useState({ message: "", type: "" });
// //   const [formLoading, setFormLoading] = useState(false);

// //   const [formData, setFormData] = useState({
// //     name: "",
// //     sku: "",
// //     sale_price: "",
// //     purchase_price: "",
// //     quantity: "",
// //     description: "",
// //     type: "product",
// //     category_id: "",
// //     unit_id: "",
// //     tax_id: "",
// //     sale_chartaccount_id: "",
// //     expense_chartaccount_id: "",
// //     pro_image: null,
// //   });

// //   const [errors, setErrors] = useState({});

// //   useEffect(() => {
// //     fetchData();
// //   }, []);

// //   const fetchData = async () => {
// //     setLoading(true);
// //     try {
// //       const [productsData, categoriesData, unitsData, taxesData, accountsData] =
// //         await Promise.all([
// //           fetchProducts(),
// //           fetchCategories(),
// //           fetchUnits(),
// //           fetchTaxes(),
// //           fetchChartAccounts(),
// //         ]);
// //       setProducts(productsData || []);
// //       setCategories(categoriesData || []);
// //       setUnits(unitsData || []);
// //       setTaxes(taxesData || []);
// //       setAccounts(accountsData || []);
// //     } catch (err) {
// //       showSnackbar("Error fetching data", "danger");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   // FIXED: Group accounts into 3 main categories using proper accountType.name from API
// //   // const groupedAccounts = useMemo(() => {
// //   //   const groups = {
// //   //     "Assets Account": [],
// //   //     "Liabilities Accounts": [],
// //   //     "Liability Account": [],
// //   //   };

// //   //   accounts.forEach((account) => {
// //   //     const accountName = account.name || "";
// //   //     const accountType = account.accountType?.name || "";

// //   //     // FIXED: Use the actual accountType.name from API response
// //   //     if (
// //   //       accountType.toLowerCase().includes("asset") ||
// //   //       // Keep your existing fallback logic
// //   //       accountName.toLowerCase().includes("asset") ||
// //   //       accountName.toLowerCase().includes("cash") ||
// //   //       accountName.toLowerCase().includes("inventory") ||
// //   //       accountName.toLowerCase().includes("bank")
// //   //     ) {
// //   //       groups["Assets Account"].push(account);
// //   //     } else if (
// //   //       // FIXED: Handle both "Liabilities" and the typo "Liabiility"
// //   //       accountType.toLowerCase().includes("liability") ||
// //   //       accountType.toLowerCase().includes("liabiility") ||
// //   //       // Keep your existing fallback logic
// //   //       accountName.toLowerCase().includes("liability") ||
// //   //       accountName.toLowerCase().includes("payable") ||
// //   //       accountName.toLowerCase().includes("tax payable") ||
// //   //       accountName.toLowerCase().includes("loan")
// //   //     ) {
// //   //       // Distribute between the two liability groups
// //   //       if (
// //   //         groups["Liabilities Accounts"].length <=
// //   //         groups["Liability Account"].length
// //   //       ) {
// //   //         groups["Liabilities Accounts"].push(account);
// //   //       } else {
// //   //         groups["Liability Account"].push(account);
// //   //       }
// //   //     } else {
// //   //       // Default to Assets if no match (keeping your existing logic)
// //   //       groups["Assets Account"].push(account);
// //   //     }
// //   //   });

// //   //   return groups;
// //   // }, [accounts]);

// //   const groupedAccounts = useMemo(() => {
// //     const groups = {
// //       "Assets Account": [],
// //       "Liabilities Accounts": [],
// //       "Liability Account": [],
// //     };

// //     accounts.forEach((account) => {
// //       const accountType = account.accountType?.name || "";

// //       switch (accountType.toLowerCase()) {
// //         case "assets":
// //           groups["Assets Account"].push(account);
// //           break;
// //         case "liabilities":
// //         case "liabiility": // Handle the typo from your API
// //           // Distribute liabilities between the two groups
// //           if (
// //             groups["Liabilities Accounts"].length <=
// //             groups["Liability Account"].length
// //           ) {
// //             groups["Liabilities Accounts"].push(account);
// //           } else {
// //             groups["Liability Account"].push(account);
// //           }
// //           break;
// //         default:
// //           // For any other type, add to Liabilities as fallback
// //           groups["Liabilities Accounts"].push(account);
// //       }
// //     });

// //     return groups;
// //   }, [accounts]);

// //   // Function to render account options with 3 groups
// //   const renderAccountOptions = () => {
// //     return Object.entries(groupedAccounts).map(([groupName, accountList]) => {
// //       if (accountList.length === 0) return null;

// //       return (
// //         <optgroup key={groupName} label={groupName}>
// //           {accountList.map((account) => (
// //             <option key={account.id} value={account.id}>
// //               {account.name} ({account.code})
// //             </option>
// //           ))}
// //         </optgroup>
// //       );
// //     });
// //   };

// //   const showSnackbar = (message, type = "success") => {
// //     setSnackbar({ message, type });
// //     setTimeout(() => setSnackbar({ message: "", type: "" }), 3000);
// //   };

// //   const resetForm = () => {
// //     setFormData({
// //       name: "",
// //       sku: "",
// //       sale_price: "",
// //       purchase_price: "",
// //       quantity: "",
// //       description: "",
// //       type: "product",
// //       category_id: "",
// //       unit_id: "",
// //       tax_id: "",
// //       sale_chartaccount_id: "",
// //       expense_chartaccount_id: "",
// //       pro_image: null,
// //     });
// //     setErrors({});
// //     setEditingProduct(null);
// //   };

// //   const handleOpenDialog = (product = null) => {
// //     if (product) {
// //       setEditingProduct(product);
// //       setFormData({
// //         name: product.name,
// //         sku: product.sku || "",
// //         sale_price: product.sale_price,
// //         purchase_price: product.purchase_price || "",
// //         quantity: product.quantity || "",
// //         description: product.description || "",
// //         type: product.type,
// //         category_id: product.category_id || "",
// //         unit_id: product.unit_id || "",
// //         tax_id: product.tax_id || "",
// //         sale_chartaccount_id: product.sale_chartaccount_id || "",
// //         expense_chartaccount_id: product.expense_chartaccount_id || "",
// //         pro_image: null,
// //       });
// //     } else {
// //       resetForm();
// //     }
// //     setDialogOpen(true);
// //   };

// //   const handleCloseDialog = () => {
// //     setDialogOpen(false);
// //     resetForm();
// //   };

// //   const handleInputChange = (e) => {
// //     const { name, value } = e.target;

// //     setFormData((prev) => {
// //       if (name === "type") {
// //         if (value === "service") {
// //           return { ...prev, type: value, quantity: 0 };
// //         } else if (value === "product") {
// //           return { ...prev, type: value, quantity: "" };
// //         }
// //       }
// //       return { ...prev, [name]: value };
// //     });

// //     if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
// //   };

// //   const handleFileChange = (e) => {
// //     setFormData((prev) => ({ ...prev, pro_image: e.target.files[0] }));
// //   };

// //   const validateForm = () => {
// //     const newErrors = {};
// //     if (!formData.name.trim()) newErrors.name = "Name is required";
// //     if (!formData.sale_price || isNaN(formData.sale_price))
// //       newErrors.sale_price = "Valid sale price is required";
// //     if (
// //       formData.type === "product" &&
// //       (!formData.quantity || isNaN(formData.quantity))
// //     )
// //       newErrors.quantity = "Valid quantity is required";
// //     setErrors(newErrors);
// //     return Object.keys(newErrors).length === 0;
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     if (!validateForm()) return;

// //     setFormLoading(true);

// //     try {
// //       const payload = {
// //         ...formData,
// //         sale_price: parseFloat(formData.sale_price),
// //         purchase_price: formData.purchase_price
// //           ? parseFloat(formData.purchase_price)
// //           : undefined,
// //         quantity:
// //           formData.type === "service"
// //             ? 0
// //             : formData.quantity
// //             ? parseInt(formData.quantity)
// //             : undefined,
// //         category_id: formData.category_id
// //           ? parseInt(formData.category_id)
// //           : undefined,
// //         unit_id: formData.unit_id ? parseInt(formData.unit_id) : undefined,
// //         tax_id: formData.tax_id ? parseInt(formData.tax_id) : undefined,
// //         sale_chartaccount_id: formData.sale_chartaccount_id
// //           ? parseInt(formData.sale_chartaccount_id)
// //           : undefined,
// //         expense_chartaccount_id: formData.expense_chartaccount_id
// //           ? parseInt(formData.expense_chartaccount_id)
// //           : undefined,
// //         sku: formData.sku,
// //       };

// //       let result;
// //       if (editingProduct) {
// //         result = await updateProduct(editingProduct.id, payload);
// //       } else {
// //         result = await createProduct(payload);
// //       }

// //       if (result.code === 200 || result.code === 201) {
// //         showSnackbar(
// //           editingProduct ? "Product updated" : "Product created",
// //           "success"
// //         );
// //         handleCloseDialog();
// //         fetchData();
// //       } else {
// //         showSnackbar(result.error || "Error saving product", "danger");
// //       }
// //     } catch (err) {
// //       showSnackbar("Error saving product: " + err.message, "danger");
// //     } finally {
// //       setFormLoading(false);
// //     }
// //   };

// //   const handleDelete = async (product) => {
// //     if (window.confirm(`Delete "${product.name}"?`)) {
// //       try {
// //         const result = await deleteProduct(product.id);
// //         if (result.code === 200) {
// //           showSnackbar("Deleted successfully", "success");
// //           fetchData();
// //         } else showSnackbar(result.error || "Error deleting", "danger");
// //       } catch (err) {
// //         showSnackbar("Error deleting product", "danger");
// //       }
// //     }
// //   };

// //   const generateSKU = () => {
// //     const newSku =
// //       "SKU-" + Math.random().toString(36).substring(2, 8).toUpperCase();
// //     setFormData((prev) => ({ ...prev, sku: newSku }));
// //   };

// //   return (
// //     <div className="container mt-4">
// //       <div className="d-flex justify-content-between align-items-center mb-3">
// //         <h2>Product Management</h2>
// //         <button className="btn btn-primary" onClick={() => handleOpenDialog()}>
// //           Add Product
// //         </button>
// //       </div>

// //       {snackbar.message && (
// //         <div className={`alert alert-${snackbar.type}`}>{snackbar.message}</div>
// //       )}

// //       {loading ? (
// //         <div className="text-center py-5">
// //           <div className="spinner-border text-primary"></div>
// //         </div>
// //       ) : (
// //         <div className="card">
// //           <div className="table-responsive">
// //             <table className="table table-hover mb-0">
// //               <thead className="table-light">
// //                 <tr>
// //                   <th>SKU</th>
// //                   <th>Name</th>
// //                   <th>Type</th>
// //                   <th>Category</th>
// //                   <th>Sale Price</th>
// //                   <th>Quantity</th>
// //                   <th>Image</th>
// //                   <th>Actions</th>
// //                 </tr>
// //               </thead>
// //               <tbody>
// //                 {products.map((p) => (
// //                   <tr key={p.id}>
// //                     <td>{p.sku || "N/A"}</td>
// //                     <td>
// //                       <strong>{p.name}</strong>
// //                       <br />
// //                       <small className="text-muted">{p.description}</small>
// //                     </td>
// //                     <td>
// //                       <span
// //                         className={`badge ${
// //                           p.type === "product" ? "bg-primary" : "bg-secondary"
// //                         }`}
// //                       >
// //                         {p.type}
// //                       </span>
// //                     </td>
// //                     <td>{p.category?.name || "N/A"}</td>
// //                     <td>${parseFloat(p.sale_price || 0).toFixed(2)}</td>
// //                     <td>{p.quantity || 0}</td>
// //                     <td>
// //                       {p.pro_image ? (
// //                         <a
// //                           href={`${import.meta.env.VITE_BASE_URL}/${
// //                             p.pro_image
// //                           }`}
// //                           target="_blank"
// //                           className="btn btn-sm btn-outline-secondary"
// //                         >
// //                           View
// //                         </a>
// //                       ) : (
// //                         "No image"
// //                       )}
// //                     </td>
// //                     <td>
// //                       <button
// //                         className="btn btn-sm btn-primary me-1"
// //                         onClick={() => handleOpenDialog(p)}
// //                       >
// //                         Edit
// //                       </button>
// //                       <button
// //                         className="btn btn-sm btn-danger"
// //                         onClick={() => handleDelete(p)}
// //                       >
// //                         Delete
// //                       </button>
// //                     </td>
// //                   </tr>
// //                 ))}
// //               </tbody>
// //             </table>
// //           </div>
// //         </div>
// //       )}

// //       {/* Modal */}
// //       {dialogOpen && (
// //         <div className="modal show d-block" tabIndex="-1">
// //           <div className="modal-dialog modal-lg">
// //             <form className="modal-content" onSubmit={handleSubmit}>
// //               <div className="modal-header">
// //                 <h5 className="modal-title">
// //                   {editingProduct ? "Edit Product" : "Add Product"}
// //                 </h5>
// //                 <button
// //                   type="button"
// //                   className="btn-close"
// //                   onClick={handleCloseDialog}
// //                 ></button>
// //               </div>
// //               <div className="modal-body">
// //                 <div className="row g-3">
// //                   <div className="col-md-6">
// //                     <label className="form-label">Name *</label>
// //                     <input
// //                       type="text"
// //                       className={`form-control ${
// //                         errors.name ? "is-invalid" : ""
// //                       }`}
// //                       name="name"
// //                       value={formData.name}
// //                       onChange={handleInputChange}
// //                       placeholder="Enter Name"
// //                     />
// //                     {errors.name && (
// //                       <div className="invalid-feedback">{errors.name}</div>
// //                     )}
// //                   </div>

// //                   <div className="col-md-6">
// //                     <label className="form-label">SKU</label>
// //                     <div className="input-group">
// //                       <input
// //                         type="text"
// //                         className="form-control"
// //                         name="sku"
// //                         value={formData.sku}
// //                         onChange={handleInputChange}
// //                         placeholder="Enter SKU"
// //                       />
// //                       <button
// //                         type="button"
// //                         className="btn btn-outline-success"
// //                         onClick={generateSKU}
// //                       >
// //                         Generate
// //                       </button>
// //                     </div>
// //                   </div>

// //                   <div className="col-md-6">
// //                     <label className="form-label">Sale Price *</label>
// //                     <input
// //                       type="number"
// //                       className={`form-control ${
// //                         errors.sale_price ? "is-invalid" : ""
// //                       }`}
// //                       name="sale_price"
// //                       value={formData.sale_price}
// //                       onChange={handleInputChange}
// //                       placeholder="Enter Sale Price"
// //                     />
// //                     {errors.sale_price && (
// //                       <div className="invalid-feedback">
// //                         {errors.sale_price}
// //                       </div>
// //                     )}
// //                   </div>

// //                   <div className="col-md-6">
// //                     <label className="form-label">Purchase Price</label>
// //                     <input
// //                       type="number"
// //                       className="form-control"
// //                       name="purchase_price"
// //                       value={formData.purchase_price}
// //                       onChange={handleInputChange}
// //                       placeholder="Enter Purchase Price"
// //                     />
// //                   </div>

// //                   <div className="col-md-6">
// //                     <label className="form-label">Tax</label>
// //                     <select
// //                       name="tax_id"
// //                       className="form-select"
// //                       value={formData.tax_id}
// //                       onChange={handleInputChange}
// //                     >
// //                       <option value="">Select Tax</option>
// //                       {taxes.map((tax) => (
// //                         <option key={tax.id} value={tax.id}>
// //                           {tax.name} ({tax.rate}%)
// //                         </option>
// //                       ))}
// //                     </select>
// //                     <small className="text-muted">
// //                       Create tax here. <a href="#">Create tax</a>
// //                     </small>
// //                   </div>

// //                   <div className="col-md-6">
// //                     <label className="form-label">Unit</label>
// //                     <select
// //                       name="unit_id"
// //                       className="form-select"
// //                       value={formData.unit_id}
// //                       onChange={handleInputChange}
// //                     >
// //                       <option value="">Select Unit</option>
// //                       {units.map((unit) => (
// //                         <option key={unit.id} value={unit.id}>
// //                           {unit.name}
// //                         </option>
// //                       ))}
// //                     </select>
// //                     <small className="text-muted">
// //                       Create unit here. <a href="#">Create unit</a>
// //                     </small>
// //                   </div>

// //                   <div className="col-md-6">
// //                     <label className="form-label">Type</label>
// //                     <select
// //                       name="type"
// //                       className="form-select"
// //                       value={formData.type}
// //                       onChange={handleInputChange}
// //                     >
// //                       <option value="product">Product</option>
// //                       <option value="service">Service</option>
// //                     </select>
// //                   </div>

// //                   <div className="col-md-6">
// //                     <label className="form-label">Income Account *</label>
// //                     <select
// //                       name="sale_chartaccount_id"
// //                       className="form-select"
// //                       value={formData.sale_chartaccount_id}
// //                       onChange={handleInputChange}
// //                     >
// //                       <option value="">Select Chart of Account</option>
// //                       {renderAccountOptions()}
// //                     </select>
// //                     <small className="text-muted">
// //                       Create account here. <a href="#">Create account</a>
// //                     </small>
// //                   </div>

// //                   <div className="col-md-6">
// //                     <label className="form-label">Expense Account *</label>
// //                     <select
// //                       name="expense_chartaccount_id"
// //                       className="form-select"
// //                       value={formData.expense_chartaccount_id}
// //                       onChange={handleInputChange}
// //                     >
// //                       <option value="">Select Chart of Account</option>
// //                       {renderAccountOptions()}
// //                     </select>
// //                     <small className="text-muted">
// //                       Create account here. <a href="#">Create account</a>
// //                     </small>
// //                   </div>

// //                   <div className="col-md-6">
// //                     <label className="form-label">Category</label>
// //                     <select
// //                       name="category_id"
// //                       className="form-select"
// //                       value={formData.category_id}
// //                       onChange={handleInputChange}
// //                     >
// //                       <option value="">Select Category</option>
// //                       {categories.map((cat) => (
// //                         <option key={cat.id} value={cat.id}>
// //                           {cat.name}
// //                         </option>
// //                       ))}
// //                     </select>
// //                     <small className="text-muted">
// //                       Create category here. <a href="#">Create Category</a>
// //                     </small>
// //                   </div>

// //                   <div className="col-md-6">
// //                     <label className="form-label">Quantity *</label>
// //                     <input
// //                       type="number"
// //                       className={`form-control ${
// //                         errors.quantity ? "is-invalid" : ""
// //                       }`}
// //                       name="quantity"
// //                       value={
// //                         formData.type === "service" ? 0 : formData.quantity
// //                       }
// //                       onChange={handleInputChange}
// //                       disabled={formData.type === "service"}
// //                       placeholder="Enter Quantity"
// //                     />
// //                     {errors.quantity && (
// //                       <div className="invalid-feedback">{errors.quantity}</div>
// //                     )}
// //                   </div>

// //                   <div className="col-md-6">
// //                     <label className="form-label">Product Image</label>
// //                     <input
// //                       type="file"
// //                       className="form-control"
// //                       onChange={handleFileChange}
// //                       accept="image/*,.pdf"
// //                     />
// //                     <small className="text-muted">
// //                       Choose File - No file chosen
// //                     </small>
// //                   </div>

// //                   <div className="col-12">
// //                     <label className="form-label">Description</label>
// //                     <textarea
// //                       className="form-control"
// //                       name="description"
// //                       value={formData.description}
// //                       onChange={handleInputChange}
// //                       rows="3"
// //                       placeholder="Enter description"
// //                     ></textarea>
// //                   </div>
// //                 </div>
// //               </div>
// //               <div className="modal-footer">
// //                 <button
// //                   type="button"
// //                   className="btn btn-secondary"
// //                   onClick={handleCloseDialog}
// //                 >
// //                   Cancel
// //                 </button>
// //                 <button
// //                   type="submit"
// //                   className="btn btn-primary"
// //                   disabled={formLoading}
// //                 >
// //                   {formLoading ? (
// //                     <span className="spinner-border spinner-border-sm"></span>
// //                   ) : editingProduct ? (
// //                     "Update"
// //                   ) : (
// //                     "Create"
// //                   )}
// //                 </button>
// //               </div>
// //             </form>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // export default Product;

// import React, { useState, useEffect, useMemo } from "react";

// import BreadCrumb from "../../components/BreadCrumb";
// import { useLocation, useNavigate } from "react-router-dom";
// import { Modal, Button, Form, Spinner, Alert } from "react-bootstrap";

// import { confirmAlert } from "react-confirm-alert";
// import "react-confirm-alert/src/react-confirm-alert.css";
// import { OverlayTrigger, Tooltip } from "react-bootstrap";


// import {
//   fetchProducts,
//   createProduct,
//   updateProduct,
//   deleteProduct,
// } from "../../services/productService";
// import {
//   fetchCategories,
//   fetchUnits,
//   fetchTaxes,
//   fetchChartAccounts,
// } from "../../services/AccountingSetup";

// const Product = () => {
//   const [products, setProducts] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [units, setUnits] = useState([]);
//   const [taxes, setTaxes] = useState([]);
//   const [accounts, setAccounts] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [editingProduct, setEditingProduct] = useState(null);
//   const [snackbar, setSnackbar] = useState({ message: "", type: "" });
//   const [formLoading, setFormLoading] = useState(false);

//   const [viewProduct, setViewProduct] = useState(null);

//   const [isClosingModal, setIsClosingModal] = useState(false);

//   const navigate = useNavigate();
//   const location = useLocation();
//   const [showImage, setShowImage] = useState(false);

//   const [formData, setFormData] = useState({
//     name: "",
//     sku: "",
//     sale_price: "",
//     purchase_price: "",
//     quantity: "",
//     description: "",
//     type: "product",
//     category_id: "",
//     unit_id: "",
//     tax_id: "",
//     sale_chartaccount_id: "",
//     expense_chartaccount_id: "",
//     pro_image: null,
//   });

//   const [errors, setErrors] = useState({});

//   // ✅ Pagination + Search states
//   const [page, setPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(5);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [totalEntries, setTotalEntries] = useState(0);
//   const [totalPages, setTotalPages] = useState(1);

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const fetchData = async () => {
//     setLoading(true);
//     try {
//       const [productsData, categoriesData, unitsData, taxesData, accountsData] =
//         await Promise.all([
//           fetchProducts(),
//           fetchCategories(),
//           fetchUnits(),
//           fetchTaxes(),
//           fetchChartAccounts(),
//         ]);
//       setProducts(productsData || []);
//       setCategories(categoriesData || []);
//       setUnits(unitsData || []);
//       setTaxes(taxesData || []);
//       setAccounts(accountsData || []);
//     } catch (err) {
//       showSnackbar("Error fetching data", "danger");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const showSnackbar = (message, type = "success") => {
//     setSnackbar({ message, type });
//     setTimeout(() => setSnackbar({ message: "", type: "" }), 3000);
//   };

//   // ✅ Add grouped accounts logic here
//   const groupedAccounts = useMemo(() => {
//     const groups = {
//       "Assets Account": [],
//       "Liabilities Accounts": [],
//       "Liability Account": [],
//     };

//     accounts.forEach((account) => {
//       const accountType = account.accountType?.name || "";

//       switch (accountType.toLowerCase()) {
//         case "assets":
//           groups["Assets Account"].push(account);
//           break;
//         case "liabilities":
//         case "liabiility": // handle typo
//           if (
//             groups["Liabilities Accounts"].length <=
//             groups["Liability Account"].length
//           ) {
//             groups["Liabilities Accounts"].push(account);
//           } else {
//             groups["Liability Account"].push(account);
//           }
//           break;
//         default:
//           groups["Liabilities Accounts"].push(account);
//       }
//     });

//     return groups;
//   }, [accounts]);

//   // ✅ Add this just below groupedAccounts
//   const renderAccountOptions = () => {
//     return Object.entries(groupedAccounts).map(([groupName, accountList]) => {
//       if (accountList.length === 0) return null;

//       return (
//         <optgroup key={groupName} label={groupName}>
//           {accountList.map((account) => (
//             <option key={account.id} value={account.id}>
//               {account.name} ({account.code})
//             </option>
//           ))}
//         </optgroup>
//       );
//     });
//   };

//   // ✅ Filter + Paginate products
//   const filteredProducts = useMemo(() => {
//     const filtered = products.filter(
//       (p) =>
//         p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
//     );
//     setTotalEntries(filtered.length);
//     setTotalPages(Math.ceil(filtered.length / itemsPerPage));

//     const startIndex = (page - 1) * itemsPerPage;
//     return filtered.slice(startIndex, startIndex + itemsPerPage);
//   }, [products, searchTerm, page, itemsPerPage]);

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

//   const handleOpenDialog = (product = null) => {
//     if (product) {
//       setEditingProduct(product);
//       setFormData({
//         name: product.name,
//         sku: product.sku || "",
//         sale_price: product.sale_price,
//         purchase_price: product.purchase_price || "",
//         quantity: product.quantity || "",
//         description: product.description || "",
//         type: product.type,
//         category_id: product.category_id || "",
//         unit_id: product.unit_id || "",
//         tax_id: product.tax_id || "",
//         sale_chartaccount_id: product.sale_chartaccount_id || "",
//         expense_chartaccount_id: product.expense_chartaccount_id || "",
//         pro_image: null,
//       });
//     } else {
//       resetForm();
//     }
//     setDialogOpen(true);
//     //modified
//     setIsClosingModal(false);

//     // Lock scroll
//     const scrollBarWidth =
//       window.innerWidth - document.documentElement.clientWidth;
//     document.body.style.overflow = "hidden";
//     document.body.style.paddingRight = `${scrollBarWidth}px`;
//   };

//   const handleCloseDialog = () => {
//     setIsClosingModal(true);
//     setTimeout(() => {
//       setDialogOpen(false);
//       setIsClosingModal(false);
//       resetForm();

//       // Restore scroll
//       document.body.style.overflow = "auto";
//       document.body.style.paddingRight = "0px";
//     }, 500); // match animation duration
//   };

//   const resetForm = () => {
//     setFormData({
//       name: "",
//       sku: "",
//       sale_price: "",
//       purchase_price: "",
//       quantity: "",
//       description: "",
//       type: "product",
//       category_id: "",
//       unit_id: "",
//       tax_id: "",
//       sale_chartaccount_id: "",
//       expense_chartaccount_id: "",
//       pro_image: null,
//     });
//     setErrors({});
//     setEditingProduct(null);
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => {
//       if (name === "type") {
//         return {
//           ...prev,
//           type: value,
//           quantity: value === "service" ? 0 : prev.quantity,
//         };
//       }
//       return { ...prev, [name]: value };
//     });
//     if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
//   };

//   const handleFileChange = (e) => {
//     setFormData((prev) => ({ ...prev, pro_image: e.target.files[0] }));
//   };

//   const validateForm = () => {
//     const newErrors = {};

//     // Name
//     if (!formData.name.trim()) {
//       newErrors.name = "Name is required";
//     }

//     // SKU
//     if (!formData.sku.trim()) {
//       newErrors.sku = "SKU is required";
//     }

//     // Sale Price
//     if (!formData.sale_price || isNaN(formData.sale_price)) {
//       newErrors.sale_price = "Valid sale price is required";
//     }

//     // Purchase Price
//     if (!formData.purchase_price || isNaN(formData.purchase_price)) {
//       newErrors.purchase_price = "Valid purchase price is required";
//     }

//     // Tax
//     if (!formData.tax_id) {
//       newErrors.tax_id = "Tax is required";
//     }

//     // Unit
//     if (!formData.unit_id) {
//       newErrors.unit_id = "Unit is required";
//     }

//     // Type
//     if (!formData.type) {
//       newErrors.type = "Type is required";
//     }

//     // Income Account
//     if (!formData.sale_chartaccount_id) {
//       newErrors.sale_chartaccount_id = "Income account is required";
//     }

//     // Expense Account
//     if (!formData.expense_chartaccount_id) {
//       newErrors.expense_chartaccount_id = "Expense account is required";
//     }

//     // Category
//     if (!formData.category_id) {
//       newErrors.category_id = "Category is required";
//     }

//     // Quantity (only when type = product)
//     if (
//       formData.type === "product" &&
//       (!formData.quantity || isNaN(formData.quantity))
//     ) {
//       newErrors.quantity = "Valid quantity is required";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validateForm()) return;
//     setFormLoading(true);
//     try {
//       const payload = {
//         ...formData,
//         sale_price: parseFloat(formData.sale_price),
//         purchase_price: formData.purchase_price
//           ? parseFloat(formData.purchase_price)
//           : undefined,
//         quantity:
//           formData.type === "service"
//             ? 0
//             : formData.quantity
//             ? parseInt(formData.quantity)
//             : undefined,
//         category_id: formData.category_id
//           ? parseInt(formData.category_id)
//           : undefined,
//         unit_id: formData.unit_id ? parseInt(formData.unit_id) : undefined,
//         tax_id: formData.tax_id ? parseInt(formData.tax_id) : undefined,
//         sale_chartaccount_id: formData.sale_chartaccount_id
//           ? parseInt(formData.sale_chartaccount_id)
//           : undefined,
//         expense_chartaccount_id: formData.expense_chartaccount_id
//           ? parseInt(formData.expense_chartaccount_id)
//           : undefined,
//       };
//       let result;
//       if (editingProduct) {
//         result = await updateProduct(editingProduct.id, payload);
//       } else {
//         result = await createProduct(payload);
//       }
//       if (result.code === 200 || result.code === 201) {
//         showSnackbar(
//           editingProduct ? "Product updated" : "Product created",
//           "success"
//         );
//         handleCloseDialog();
//         fetchData();
//       } else {
//         showSnackbar(result.error || "Error saving product", "danger");
//       }
//     } catch (err) {
//       showSnackbar("Error saving product: " + err.message, "danger");
//     } finally {
//       setFormLoading(false);
//     }
//   };

//   const handleDelete = (product) => {
//     confirmAlert({
//       customUI: ({ onClose }) => (
//         <div className="custom-confirm-modal bg-white p-4 rounded shadow text-center">
//           <div style={{ fontSize: "50px", color: "#ff9900" }}>❗</div>
//           <h4 className="fw-bold mt-2">Are you sure?</h4>
//           <p>
//             You are about to delete <strong>{product.name}</strong>. This action
//             cannot be undone.
//           </p>
//           <div className="d-flex justify-content-center mt-3">
//             <button
//               className="btn btn-danger me-2 px-4"
//               onClick={() => {
//                 document.body.style.overflow = "auto"; // restore scroll
//                 onClose();
//               }}
//             >
//               No
//             </button>
//             <button
//               className="btn btn-success px-4"
//               onClick={async () => {
//                 try {
//                   const result = await deleteProduct(product.id);
//                   if (result.code === 200) {
//                     showSnackbar("Product deleted successfully", "success");
//                     fetchData();
//                   } else {
//                     showSnackbar(
//                       result.error || "Error deleting product",
//                       "danger"
//                     );
//                   }
//                 } catch (error) {
//                   showSnackbar(
//                     "Error deleting product: " + error.message,
//                     "danger"
//                   );
//                 }
//                 document.body.style.overflow = "auto"; // restore scroll
//                 onClose();
//               }}
//             >
//               Yes
//             </button>
//           </div>
//         </div>
//       ),
//       // ✅ Properly lock/unlock body scroll
//       onClickOutside: () => {
//         document.body.style.overflow = "auto";
//       },
//       afterOpen: () => {
//         document.body.style.overflow = "hidden"; // lock scroll when dialog opens
//       },
//       onClose: () => {
//         document.body.style.overflow = "auto"; // restore scroll after close
//       },
//     });
//   };

//   const handleCloseViewModal = () => {
//     setViewProduct(null);
//   };

//   const generateSKU = () => {
//     const newSku =
//       "SKU-" + Math.random().toString(36).substring(2, 8).toUpperCase();
//     setFormData((prev) => ({ ...prev, sku: newSku }));
//   };

//   return (
//     <div className="container mt-4">
//       <style>{`
//   .entries-select:focus {
//     border-color: #6FD943!important;
//     box-shadow: 0 0 0px 4px #70d94360 !important;
//   }
// `}</style>

//       <style>{`
//   /* Backdrop fade */
//   .custom-slide-modal {
//     opacity: 0;
//     transition: opacity 0.5s ease;
//     background-color: rgba(0,0,0,0.5);
//   }

//   .custom-slide-modal.open {
//     opacity: 1;
//   }

//   .custom-slide-modal.closing {
//     opacity: 0;
//   }

//   /* Slide modal content */
//   .custom-slide-modal .modal-dialog {
//     transform: translateY(-30px);
//     opacity: 0;
//     transition: transform 0.5s ease, opacity 0.5s ease;
//   }

//   .custom-slide-modal.open .modal-dialog {
//     transform: translateY(0);
//     opacity: 1;
//   }

//   .custom-slide-modal.closing .modal-dialog {
//     transform: translateY(-30px);
//     opacity: 0;
//   }
// `}</style>

//       <div className="d-flex justify-content-between align-items-center mb-3">
//         <div>
//           <h2 className="mb-0">Product Management</h2>
//           <BreadCrumb pathname={location.pathname} onNavigate={navigate} />
//         </div>
//          <OverlayTrigger overlay={<Tooltip>Create</Tooltip>}>
//         <button
//           className="btn btn-success d-flex align-items-center justify-content-center p-0"
//           style={{ width: "45px", height: "45px", borderRadius: "6px" }}
//           onClick={() => handleOpenDialog()}
//         >
//           <i className="bi bi-plus-lg fs-6"></i>
//         </button>
//         </OverlayTrigger>
//       </div>

//       {snackbar.message && (
//         <div className={`alert alert-${snackbar.type}`}>{snackbar.message}</div>
//       )}

//       {/* Table + Pagination */}
//       <div className="bg-white p-3 rounded shadow-sm">
//         {/* Table filter row */}
//         <div className="row mb-2">
//           <div className="col-12 col-md-6 d-flex align-items-center mb-2 mb-md-0  e">
//             <select
//               className="form-select me-2 entries-select"
//               value={itemsPerPage}
//               onChange={(e) => {
//                 setItemsPerPage(Number(e.target.value));
//                 setPage(1);
//               }}
//               style={{ width: "80px" }}
//             >
//               <option value="5">5</option>
//               <option value="10">10</option>
//               <option value="25">25</option>
//               <option value="50">50</option>
//                <option value="100">100</option>
//             </select>
//             <span className="d-none d-sm-inline">entries per page</span>
//           </div>
//           <div className="col-12 col-md-6 ">
//             <input
//               type="text"
//               className="form-control form-control-sm w-auto ms-auto  entries-select"
//               placeholder="Search products..."
//               value={searchTerm}
//               onChange={(e) => {
//                 setSearchTerm(e.target.value);
//                 setPage(1);
//               }}
//             />
//           </div>
//         </div>

//         {loading ? (
//           <div className="d-flex justify-content-center p-3">
//             <div className="spinner-border" role="status"></div>
//           </div>
//         ) : (
//           <>
//             <div className="table-responsive">
//               <table className="table table-striped table-hover table-bordered mb-0">
//                 <thead className="table-light">
//                   <tr>
//                     <th>Name</th>
//                     <th>SKU</th>
//                     <th>Sale Price</th>
//                     <th>Purchase Price</th>
//                     <th>Tax</th>
//                     <th>Category</th>
//                     <th>Unit</th>
//                     <th>Quantity</th>
//                     <th>Type</th>
//                     <th style={{ minWidth: "120px" }}>Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredProducts.length > 0 ? (
//                     filteredProducts.map((p) => (
//                       <tr key={p.id}>
//                         {/* Name */}
//                         <td>
//                           <strong>{p.name}</strong>
//                           <br />
//                           <small className="text-muted">{p.description}</small>
//                         </td>
//                         {/* SKU */}
//                         <td>{p.sku || "N/A"}</td>
//                         {/* Sale Price */}
//                         <td>${parseFloat(p.sale_price || 0).toFixed(2)}</td>
//                         {/* Purchase Price */}
//                         <td>
//                           {p.purchase_price
//                             ? `₹${parseFloat(p.purchase_price).toFixed(2)}`
//                             : "N/A"}
//                         </td>
//                         {/* Tax */}
//                         <td>
//                           {p.tax?.name
//                             ? `${p.tax.name} (${p.tax.rate}%)`
//                             : "N/A"}
//                         </td>
//                         {/* Category */}
//                         <td>{p.category?.name || "N/A"}</td>
//                         {/* Unit */}
//                         <td>{p.unit?.name || "N/A"}</td>
//                         {/* Quantity */}
//                         <td>{p.quantity || 0}</td>
//                         {/* Type */}
//                         <td>
//                           <span
//                             className={`badge ${
//                               p.type === "product"
//                                 ? "bg-success"
//                                 : "bg-secondary"
//                             }`}
//                           >
//                             {p.type}
//                           </span>
//                         </td>
//                         {/* Actions */}

//                         {/* Actions */}
//                         {/* Actions */}
//                         <td>
//                           {/* 👁️ View/Warehouse button */}

//                            <OverlayTrigger overlay={<Tooltip>View</Tooltip>}>
//                           <button
//                             className="btn btn-sm bg-warning me-2"
//                             onClick={() => setViewProduct(p)}
//                           >
//                             <i className="bi bi-eye text-white"></i>
//                           </button>
//                           </OverlayTrigger>

//                           {/* ✏️ Edit button */}
//                           <OverlayTrigger overlay={<Tooltip>Edit</Tooltip>}>
//                           <button
//                             className="btn btn-sm btn-info me-2"
//                             onClick={() => handleOpenDialog(p)}
//                           >
//                             <i className="bi bi-pencil-fill"></i>
//                           </button>
//                           </OverlayTrigger>

//                           {/* 🗑️ Delete button */}
//                           <OverlayTrigger overlay={<Tooltip>Delete</Tooltip>}>
//                           <button
//                             className="btn btn-sm btn-danger"
//                             onClick={() => handleDelete(p)}
//                           >
//                             <i className="bi bi-trash-fill"></i>
//                           </button>
//                           </OverlayTrigger>
//                         </td>
//                       </tr>
//                     ))
//                   ) : (
//                     <tr>
//                       <td colSpan="10" className="text-center">
//                         No products found.
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>

//             {/* Pagination */}
//             <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-2">
//               <span className="mb-2 mb-md-0">
//                 Showing{" "}
//                 {filteredProducts.length === 0
//                   ? 0
//                   : (page - 1) * itemsPerPage + 1}{" "}
//                 to {Math.min(page * itemsPerPage, totalEntries)} of{" "}
//                 {totalEntries} entries
//               </span>
//               <nav>
//                 <ul className="pagination pagination-sm mb-0">
//                   <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
//                     <button
//                       className="page-link"
//                       onClick={() => page > 1 && handlePageChange(page - 1)}
//                     >
//                       &laquo;
//                     </button>
//                   </li>
//                   {renderPaginationItems()}
//                   <li
//                     className={`page-item ${
//                       page === totalPages ? "disabled" : ""
//                     }`}
//                   >
//                     <button
//                       className="page-link"
//                       onClick={() =>
//                         page < totalPages && handlePageChange(page + 1)
//                       }
//                     >
//                       &raquo;
//                     </button>
//                   </li>
//                 </ul>
//               </nav>
//             </div>
//           </>
//         )}
//       </div>

//       {dialogOpen && (
//         <div
//           className={`modal show d-block custom-slide-modal ${
//             isClosingModal ? "closing" : "open"
//           }`}
//           tabIndex="-1"
//           style={{ overflowY: "auto", scrollbarWidth: "none" }}
//           onClick={handleCloseDialog}
//         >
//           <div
//             className="modal-dialog modal-lg"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <form className="modal-content" onSubmit={handleSubmit}>
//               <div className="modal-header">
//                 <h5 className="modal-title">
//                   {editingProduct ? "Edit Product" : "Add Product"}
//                 </h5>
//                 <button
//                   type="button"
//                   className="btn-close"
//                   onClick={handleCloseDialog}
//                 ></button>
//               </div>
//               <div className="modal-body">
//                 <div className="row g-3">
//                   {/* Name */}
//                   <div className="col-md-6">
//                     <label className="form-label">
//                       Name <span class="text-danger">*</span>
//                     </label>
//                     <input
//                       type="text"
//                       className={`form-control ${
//                         errors.name ? "is-invalid" : ""
//                       }`}
//                       name="name"
//                       value={formData.name}
//                       onChange={handleInputChange}
//                     />
//                     {errors.name && (
//                       <div className="invalid-feedback">{errors.name}</div>
//                     )}
//                   </div>

//                   {/* SKU */}
//                   <div className="col-md-6">
//                     <label htmlFor="sku" className="form-label">
//                       SKU <span className="text-danger">*</span>
//                     </label>
//                     <div className="input-group">
//                       <input
//                         type="text"
//                         className={`form-control ${
//                           errors.sku ? "is-invalid" : ""
//                         }`}
//                         name="sku"
//                         id="sku"
//                         placeholder="Enter SKU"
//                         value={formData.sku}
//                         onChange={handleInputChange}
//                       />

//                       <button
//                         type="button"
//                         className="btn btn-outline-success"
//                         onClick={generateSKU}
//                         style={{ height: "199%" }} // make button same height as input
//                       >
//                         Generate
//                       </button>
//                       {errors.sku && (
//                         <div className="invalid-feedback">{errors.sku}</div>
//                       )}
//                     </div>
//                   </div>

//                   {/* Sale Price */}
//                   <div className="col-md-6">
//                     <label className="form-label">
//                       Sale Price <span class="text-danger">*</span>
//                     </label>
//                     <input
//                       type="number"
//                       className={`form-control ${
//                         errors.sale_price ? "is-invalid" : ""
//                       }`}
//                       name="sale_price"
//                       value={formData.sale_price}
//                       onChange={handleInputChange}
//                     />
//                     {errors.sale_price && (
//                       <div className="invalid-feedback">
//                         {errors.sale_price}
//                       </div>
//                     )}
//                   </div>

//                   {/* Purchase Price */}
//                   <div className="col-md-6">
//                     <label className="form-label">
//                       Purchase Price <span class="text-danger">*</span>
//                     </label>
//                     <input
//                       type="number"
//                       className={`form-control ${
//                         errors.purchase_price ? "is-invalid" : ""
//                       }`}
//                       name="purchase_price"
//                       value={formData.purchase_price}
//                       onChange={handleInputChange}
//                     />
//                     {errors.purchase_price && (
//                       <div className="invalid-feedback">
//                         {errors.purchase_price}
//                       </div>
//                     )}
//                   </div>

//                   {/* Tax */}
//                   <div className="col-md-6">
//                     <label className="form-label">
//                       Tax <span class="text-danger">*</span>
//                     </label>
//                     <select
//                       name="tax_id"
//                       className={`form-control ${
//                         errors.tax_id ? "is-invalid" : ""
//                       }`}
//                       value={formData.tax_id}
//                       onChange={handleInputChange}
//                     >
//                       <option value="">Select Tax</option>
//                       {taxes.map((t) => (
//                         <option key={t.id} value={t.id}>
//                           {t.name} ({t.rate}%)
//                         </option>
//                       ))}
//                     </select>
//                     <small className="text-muted">
//                       Create tax here.{" "}
//                       <a
//                         href="accounting/accountingsetup/tax"
//                         style={{ color: "#78D13D" }}
//                       >
//                         Create tax
//                       </a>
//                     </small>

//                     {errors.tax_id && (
//                       <div className="invalid-feedback">{errors.tax_id}</div>
//                     )}
//                   </div>

//                   {/* Unit */}
//                   <div className="col-md-6">
//                     <label className="form-label">
//                       Unit <span class="text-danger">*</span>
//                     </label>
//                     <select
//                       name="unit_id"
//                       className={`form-control ${
//                         errors.unit_id ? "is-invalid" : ""
//                       }`}
//                       value={formData.unit_id}
//                       onChange={handleInputChange}
//                     >
//                       <option value="">Select Unit</option>
//                       {units.map((u) => (
//                         <option key={u.id} value={u.id}>
//                           {u.name}
//                         </option>
//                       ))}
//                     </select>
//                     <small className="text-muted">
//                       Create account here.{" "}
//                       <a
//                         href="/accounting/accountingsetup/tax"
//                         style={{ color: "#78D13D" }}
//                       >
//                         Create account
//                       </a>
//                     </small>
//                     {errors.unit_id && (
//                       <div className="invalid-feedback">{errors.unit_id}</div>
//                     )}
//                   </div>

//                   {/* Type */}
//                   <div className="col-md-6">
//                     <label className="form-label">
//                       Type <span class="text-danger">*</span>
//                     </label>
//                     <select
//                       name="type"
//                       className={`form-control ${
//                         errors.type ? "is-invalid" : ""
//                       }`}
//                       value={formData.type}
//                       onChange={handleInputChange}
//                     >
//                       <option value="product">Product</option>
//                       <option value="service">Service</option>
//                     </select>
//                     {/* <small className="text-muted">
//                       Create account here.{" "}
//                       <a href="#" style={{ color: "#78D13D" }}>
//                         Create account
//                       </a>
//                     </small> */}

//                     {errors.type && (
//                       <div className="invalid-feedback">{errors.type}</div>
//                     )}
//                   </div>

//                   {/* Income Account */}
//                   <div className="col-md-6">
//                     <label className="form-label">
//                       Income Account <span class="text-danger">*</span>
//                     </label>
//                     <select
//                       name="sale_chartaccount_id"
//                       className={`form-control ${
//                         errors.sale_chartaccount_id ? "is-invalid" : ""
//                       }`}
//                       value={formData.sale_chartaccount_id}
//                       onChange={handleInputChange}
//                     >
//                       <option value="">Select Chart of Account</option>

//                       {renderAccountOptions()}

//                       {/* {accounts.map((a) => (
//                         <option key={a.id} value={a.id}>
//                           {a.name}
//                         </option>
//                       ))} */}
//                     </select>
//                     <small className="text-muted  ">
//                       Create account here.{" "}
//                       <a
//                         href="/double-entry/chart-of-accounts"
//                         style={{ color: "#78D13D" }}
//                       >
//                         Create account
//                       </a>
//                     </small>

//                     {errors.sale_chartaccount_id && (
//                       <div className="invalid-feedback">
//                         {errors.sale_chartaccount_id}
//                       </div>
//                     )}
//                   </div>

//                   {/* Expense Account */}
//                   <div className="col-md-6">
//                     <label className="form-label">
//                       Expense Account <span class="text-danger">*</span>
//                     </label>
//                     <select
//                       name="expense_chartaccount_id"
//                       className={`form-control ${
//                         errors.expense_chartaccount_id ? "is-invalid" : ""
//                       }`}
//                       value={formData.expense_chartaccount_id}
//                       onChange={handleInputChange}
//                     >
//                       <option value="">Select Chart of Account</option>

//                       {renderAccountOptions()}

//                       {/* {accounts.map((a) => (
//                         <option key={a.id} value={a.id}>
//                           {a.name}
//                         </option>
//                       ))} */}
//                     </select>

//                     <small className="text-muted">
//                       Create account here.{" "}
//                       <a
//                         href="/double-entry/chart-of-accounts"
//                         style={{ color: "#78D13D" }}
//                       >
//                         Create account
//                       </a>
//                     </small>

//                     {errors.expense_chartaccount_id && (
//                       <div className="invalid-feedback">
//                         {errors.expense_chartaccount_id}
//                       </div>
//                     )}
//                   </div>

//                   {/* Category */}
//                   <div className="col-md-6">
//                     <label className="form-label">
//                       Category <span class="text-danger">*</span>
//                     </label>
//                     <select
//                       name="category_id"
//                       className={`form-control ${
//                         errors.category_id ? "is-invalid" : ""
//                       }`}
//                       value={formData.category_id}
//                       onChange={handleInputChange}
//                     >
//                       <option value="">Select Category</option>
//                       {categories.map((c) => (
//                         <option key={c.id} value={c.id}>
//                           {c.name}
//                         </option>
//                       ))}
//                     </select>

//                     <small className="text-muted">
//                       Create catagory here.{" "}
//                       <a
//                         href="accounting/accountingsetup/tax"
//                         style={{ color: "#78D13D" }}
//                       >
//                         Create catagory
//                       </a>
//                     </small>

//                     {errors.category_id && (
//                       <div className="invalid-feedback">
//                         {errors.category_id}
//                       </div>
//                     )}
//                   </div>

//                   {/* Quantity */}
//                   {formData.type === "product" && (
//                     <div className="col-md-6">
//                       <label className="form-label">
//                         Quantity <span class="text-danger">*</span>
//                       </label>
//                       <input
//                         type="number"
//                         className={`form-control ${
//                           errors.quantity ? "is-invalid" : ""
//                         }`}
//                         name="quantity"
//                         value={formData.quantity}
//                         onChange={handleInputChange}
//                       />
//                       {errors.quantity && (
//                         <div className="invalid-feedback">
//                           {errors.quantity}
//                         </div>
//                       )}
//                     </div>
//                   )}

//                   {/* Description */}
//                   <div className="col-12">
//                     <label className="form-label">Description</label>
//                     <textarea
//                       className="form-control"
//                       name="description"
//                       rows="3"
//                       value={formData.description}
//                       onChange={handleInputChange}
//                     ></textarea>
//                   </div>

//                   {/* Image */}
//                   <div className="col-12">
//                     <label className="form-label">Image</label>
//                     <input
//                       type="file"
//                       className="form-control"
//                       name="pro_image"
//                       accept="image/*"
//                       onChange={handleFileChange}
//                     />
//                     {editingProduct?.pro_image && (
//                       <img
//                         src={`https://erpcopy.vnvision.in/${editingProduct.pro_image}`}
//                         alt="Product"
//                         className="mt-2 rounded"
//                         width={100}
//                       />
//                     )}
//                   </div>
//                 </div>
//               </div>

//               <div className="modal-footer">
//                 <button
//                   type="button"
//                   className="btn btn-secondary"
//                   onClick={handleCloseDialog}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="btn btn-success"
//                   disabled={formLoading}
//                 >
//                   {formLoading ? (
//                     <span className="spinner-border spinner-border-sm"></span>
//                   ) : editingProduct ? (
//                     "Update Product"
//                   ) : (
//                     "Add Product"
//                   )}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {viewProduct && (
//         <Modal
//           show={!!viewProduct}
//           onHide={handleCloseViewModal}
//           centered
//           size="lg"
//           style={{
//             overflowY: "auto",
//             scrollbarWidth: "none",
//             backgroundColor: "rgba(100, 98, 98, 0.35)",
//           }}
//         >
//           <Modal.Header closeButton>
//             <Modal.Title>Product Details</Modal.Title>
//           </Modal.Header>
//           <Modal.Body>
//             <p>
//               <strong>Name:</strong> {viewProduct.name || "N/A"}
//             </p>
//             <p>
//               <strong>SKU:</strong> {viewProduct.sku || "N/A"}
//             </p>
//             <p>
//               <strong>Sale Price:</strong> $
//               {parseFloat(viewProduct.sale_price || 0).toFixed(2)}
//             </p>
//             <p>
//               <strong>Purchase Price:</strong>{" "}
//               {viewProduct.purchase_price
//                 ? `$${parseFloat(viewProduct.purchase_price).toFixed(2)}`
//                 : "N/A"}
//             </p>
//             <p>
//               <strong>Tax:</strong>{" "}
//               {viewProduct.tax?.name
//                 ? `${viewProduct.tax.name} (${viewProduct.tax.rate}%)`
//                 : "N/A"}
//             </p>
//             <p>
//               <strong>Category:</strong> {viewProduct.category?.name || "N/A"}
//             </p>
//             <p>
//               <strong>Unit:</strong> {viewProduct.unit?.name || "N/A"}
//             </p>
//             <p>
//               <strong>Quantity:</strong> {viewProduct.quantity || 0}
//             </p>
//             <p>
//               <strong>Type:</strong>{" "}
//               <span
//                 className={`badge ${
//                   viewProduct.type === "product" ? "bg-primary" : "bg-secondary"
//                 }`}
//               >
//                 {viewProduct.type}
//               </span>
//             </p>

//             {/* NEW: View Image Button */}
//             {viewProduct.pro_image && (
//               <div className="mt-3">
//                 <Button
//                   variant="info"
//                   size="sm"
//                   onClick={() => setShowImage((prev) => !prev)}
//                 >
//                   {showImage ? "Hide Image" : "View Image"}
//                 </Button>

//                 {showImage && (
//                   <div className="mt-2">
//                     <img
//                       src={`https://erpcopy.vnvision.in/${viewProduct.pro_image}`}
//                       alt="Product"
//                       className="rounded shadow-sm"
//                       width={150}
//                     />
//                   </div>
//                 )}
//               </div>
//             )}

//             {viewProduct.description && (
//               <div className="mt-3">
//                 <h6>Description</h6>
//                 <p>{viewProduct.description}</p>
//               </div>
//             )}
//           </Modal.Body>
//           <Modal.Footer>
//             <Button variant="secondary" onClick={handleCloseViewModal}>
//               Close
//             </Button>
//           </Modal.Footer>
//         </Modal>
//       )}
//     </div>
//   );
// };

// export default Product;



import React, { useState, useEffect, useMemo } from "react";

import BreadCrumb from "../../components/BreadCrumb";
import { useLocation, useNavigate } from "react-router-dom";
import { Modal, Button, Form, Spinner, Alert } from "react-bootstrap";

import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { toast } from "react-toastify";

import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../services/productService";
import {
  fetchCategories,
  fetchUnits,
  fetchTaxes,
  fetchChartAccounts,
} from "../../services/AccountingSetup";

const Product = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [snackbar, setSnackbar] = useState({ message: "", type: "" });
  const [formLoading, setFormLoading] = useState(false);

  const [viewProduct, setViewProduct] = useState(null);

  const [isClosingModal, setIsClosingModal] = useState(false);
  const [isClosingViewModal, setIsClosingViewModal] = useState(false);


  const navigate = useNavigate();
  const location = useLocation();
  const [showImage, setShowImage] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    sale_price: "",
    purchase_price: "",
    quantity: "",
    description: "",
    type: "product",
    category_id: "",
    unit_id: "",
    tax_id: "",
    sale_chartaccount_id: "",
    expense_chartaccount_id: "",
    pro_image: null,
  });

  const [errors, setErrors] = useState({});

  // ✅ Pagination + Search states
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalEntries, setTotalEntries] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsData, categoriesData, unitsData, taxesData, accountsData] =
        await Promise.all([
          fetchProducts(),
          fetchCategories(),
          fetchUnits(),
          fetchTaxes(),
          fetchChartAccounts(),
        ]);
      setProducts(productsData || []);
      setCategories(categoriesData || []);
      setUnits(unitsData || []);
      setTaxes(taxesData || []);
      setAccounts(accountsData || []);
    } catch (err) {
      showSnackbar("Error fetching data", "danger");
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, type = "success") => {
    setSnackbar({ message, type });
    setTimeout(() => setSnackbar({ message: "", type: "" }), 3000);
  };

  // ✅ Add grouped accounts logic here
  const groupedAccounts = useMemo(() => {
    const groups = {
      "Assets Account": [],
      "Liabilities Accounts": [],
      "Liability Account": [],
    };

    accounts.forEach((account) => {
      const accountType = account.accountType?.name || "";

      switch (accountType.toLowerCase()) {
        case "assets":
          groups["Assets Account"].push(account);
          break;
        case "liabilities":
        case "liabiility": // handle typo
          if (
            groups["Liabilities Accounts"].length <=
            groups["Liability Account"].length
          ) {
            groups["Liabilities Accounts"].push(account);
          } else {
            groups["Liability Account"].push(account);
          }
          break;
        default:
          groups["Liabilities Accounts"].push(account);
      }
    });

    return groups;
  }, [accounts]);

  // ✅ Add this just below groupedAccounts
  const renderAccountOptions = () => {
    return Object.entries(groupedAccounts).map(([groupName, accountList]) => {
      if (accountList.length === 0) return null;

      return (
        <optgroup key={groupName} label={groupName}>
          {accountList.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name} ({account.code})
            </option>
          ))}
        </optgroup>
      );
    });
  };

  // ✅ Filter + Paginate products
  const filteredProducts = useMemo(() => {
    const filtered = products.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setTotalEntries(filtered.length);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));

    const startIndex = (page - 1) * itemsPerPage;
    return filtered.slice(startIndex, startIndex + itemsPerPage);
  }, [products, searchTerm, page, itemsPerPage]);

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

  const handleOpenDialog = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        sku: product.sku || "",
        sale_price: product.sale_price,
        purchase_price: product.purchase_price || "",
        quantity: product.quantity || "",
        description: product.description || "",
        type: product.type,
        category_id: product.category_id || "",
        unit_id: product.unit_id || "",
        tax_id: product.tax_id || "",
        sale_chartaccount_id: product.sale_chartaccount_id || "",
        expense_chartaccount_id: product.expense_chartaccount_id || "",
        pro_image: null,
      });
    } else {
      resetForm();
    }
    setDialogOpen(true);
    //modified
    setIsClosingModal(false);

    // Lock scroll
    const scrollBarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollBarWidth}px`;
  };

  const handleCloseDialog = () => {
    setIsClosingModal(true);
    setTimeout(() => {
      setDialogOpen(false);
      setIsClosingModal(false);
      resetForm();

      // Restore scroll
      document.body.style.overflow = "auto";
      document.body.style.paddingRight = "0px";
    }, 500); // match animation duration
  };

  const resetForm = () => {
    setFormData({
      name: "",
      sku: "",
      sale_price: "",
      purchase_price: "",
      quantity: "",
      description: "",
      type: "product",
      category_id: "",
      unit_id: "",
      tax_id: "",
      sale_chartaccount_id: "",
      expense_chartaccount_id: "",
      pro_image: null,
    });
    setErrors({});
    setEditingProduct(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === "type") {
        return {
          ...prev,
          type: value,
          quantity: value === "service" ? 0 : prev.quantity,
        };
      }
      return { ...prev, [name]: value };
    });
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, pro_image: e.target.files[0] }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Name
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    // SKU
    if (!formData.sku.trim()) {
      newErrors.sku = "SKU is required";
    }

    // Sale Price
    if (!formData.sale_price || isNaN(formData.sale_price)) {
      newErrors.sale_price = "Valid sale price is required";
    }

    // Purchase Price
    if (!formData.purchase_price || isNaN(formData.purchase_price)) {
      newErrors.purchase_price = "Valid purchase price is required";
    }

    // Tax
    if (!formData.tax_id) {
      newErrors.tax_id = "Tax is required";
    }

    // Unit
    if (!formData.unit_id) {
      newErrors.unit_id = "Unit is required";
    }

    // Type
    if (!formData.type) {
      newErrors.type = "Type is required";
    }

    // Income Account
    if (!formData.sale_chartaccount_id) {
      newErrors.sale_chartaccount_id = "Income account is required";
    }

    // Expense Account
    if (!formData.expense_chartaccount_id) {
      newErrors.expense_chartaccount_id = "Expense account is required";
    }

    // Category
    if (!formData.category_id) {
      newErrors.category_id = "Category is required";
    }

    // Quantity (only when type = product)
    if (
      formData.type === "product" &&
      (!formData.quantity || isNaN(formData.quantity))
    ) {
      newErrors.quantity = "Valid quantity is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setFormLoading(true);
    try {
      const payload = {
        ...formData,
        sale_price: parseFloat(formData.sale_price),
        purchase_price: formData.purchase_price
          ? parseFloat(formData.purchase_price)
          : undefined,
        quantity:
          formData.type === "service"
            ? 0
            : formData.quantity
              ? parseInt(formData.quantity)
              : undefined,
        category_id: formData.category_id
          ? parseInt(formData.category_id)
          : undefined,
        unit_id: formData.unit_id ? parseInt(formData.unit_id) : undefined,
        tax_id: formData.tax_id ? parseInt(formData.tax_id) : undefined,
        sale_chartaccount_id: formData.sale_chartaccount_id
          ? parseInt(formData.sale_chartaccount_id)
          : undefined,
        expense_chartaccount_id: formData.expense_chartaccount_id
          ? parseInt(formData.expense_chartaccount_id)
          : undefined,
      };
      let result;
      if (editingProduct) {
        result = await updateProduct(editingProduct.id, payload);
        toast.success("Product successfully updated.", {
          icon: false,
        });
      } else {
        result = await createProduct(payload);
        toast.success("Product successfully created.", {
          icon: false,
        });
      }
      if (result.code === 200 || result.code === 201) {
        showSnackbar(
          editingProduct ? "Product updated" : "Product created",
          "success"
        );
        handleCloseDialog();
        fetchData();
      } else {
        showSnackbar(result.error || "Error saving product", "danger");
      }
    } catch (err) {
      showSnackbar("Error saving product: " + err.message, "danger");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = (product) => {
    confirmAlert({
      customUI: ({ onClose }) => (
        <div className="custom-confirm-modal bg-white p-4 rounded shadow text-center">
          <div style={{ fontSize: "50px", color: "#ff9900" }}>❗</div>
          <h4 className="fw-bold mt-2">Are you sure?</h4>
          <p>
            You are about to delete <strong>{product.name}</strong>. This action
            cannot be undone.
          </p>
          <div className="d-flex justify-content-center mt-3">
            <button
              className="btn btn-danger me-2 px-4"
              onClick={() => {
                document.body.style.overflow = "auto"; // restore scroll
                onClose();
              }}
            >
              No
            </button>
            <button
              className="btn btn-success px-4"
              onClick={async () => {
                try {
                  const result = await deleteProduct(product.id);
                  if (result.code === 200) {
                    showSnackbar("Product deleted successfully", "success");
                    fetchData();
                    toast.success("Transfer deleted successfully.", {
                      icon: false,
                    });
                  } else {
                    showSnackbar(
                      result.error || "Error deleting product",
                      "danger"
                    );
                  }
                } catch (error) {
                  showSnackbar(
                    "Error deleting product: " + error.message,
                    "danger"
                  );
                }
                document.body.style.overflow = "auto"; // restore scroll
                onClose();
              }}
            >
              Yes
            </button>
          </div>
        </div>
      ),
      // ✅ Properly lock/unlock body scroll
      onClickOutside: () => {
        document.body.style.overflow = "auto";
      },
      afterOpen: () => {
        document.body.style.overflow = "hidden"; // lock scroll when dialog opens
      },
      onClose: () => {
        document.body.style.overflow = "auto"; // restore scroll after close
      },
    });
  };

  // const handleCloseViewModal = () => {
  //   setViewProduct(null);
  // };

  const handleCloseViewModal = () => {
    setIsClosingViewModal(true);
    setTimeout(() => {
      setViewProduct(null);
      setIsClosingViewModal(false);
    }, 500); // match CSS transition duration
  };

  const generateSKU = () => {
    const newSku =
      "SKU-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    setFormData((prev) => ({ ...prev, sku: newSku }));
  };

  return (
    <div className="container mt-4">


      <style>{`
  /* Backdrop fade */
  .custom-slide-modal {
    opacity: 0;
    transition: opacity 0.5s ease;
    background-color: rgba(0,0,0,0.5);
  }

  .custom-slide-modal.open {
    opacity: 1;
  }

  .custom-slide-modal.closing {
    opacity: 0;
  }

  /* Slide modal content */
  .custom-slide-modal .modal-dialog {
    transform: translateY(-30px);
    opacity: 0;
    transition: transform 0.5s ease, opacity 0.5s ease;
  }

  .custom-slide-modal.open .modal-dialog {
    transform: translateY(0);
    opacity: 1;
  }

  .custom-slide-modal.closing .modal-dialog {
    transform: translateY(-30px);
    opacity: 0;
  }
`}</style>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="mb-0">Product Management</h2>
          <BreadCrumb pathname={location.pathname} onNavigate={navigate} />
        </div>
        <OverlayTrigger overlay={<Tooltip>Create</Tooltip>}>
          <button
            className="btn btn-success d-flex align-items-center justify-content-center p-0"
            style={{ width: "45px", height: "45px", borderRadius: "6px" }}
            onClick={() => handleOpenDialog()}
          >
            <i className="bi bi-plus-lg fs-6"></i>
          </button>
        </OverlayTrigger>
      </div>

      {snackbar.message && (
        <div className={`alert alert-${snackbar.type}`}>{snackbar.message}</div>
      )}

      {/* Table + Pagination */}
      <div className="bg-white p-3 rounded shadow-sm">
        {/* Table filter row */}
        <div className="row mb-2">
          <div className="col-12 col-md-6 d-flex align-items-center mb-2 mb-md-0  e">
            <select
              className="form-select me-2 "
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setPage(1);
              }}
              style={{ width: "80px" }}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
          <div className="col-12 col-md-6 ">
            <input
              type="text"
              className="form-control form-control-sm w-auto ms-auto  "
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
          <div className="d-flex justify-content-center p-3">
            {/* <div className="spinner-border " role="status"></div> */}
            <Spinner animation="border" variant="success" />
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-striped table-hover table-bordered mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Name</th>
                    <th>SKU</th>
                    <th>Sale Price</th>
                    <th>Purchase Price</th>
                    <th>Tax</th>
                    <th>Category</th>
                    <th>Unit</th>
                    <th>Quantity</th>
                    <th>Type</th>
                    <th style={{ minWidth: "120px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((p) => (
                      <tr key={p.id}>
                        {/* Name */}
                        <td>
                          <strong>{p.name}</strong>
                          <br />
                          <small className="text-muted">{p.description}</small>
                        </td>
                        {/* SKU */}
                        <td>{p.sku || "N/A"}</td>
                        {/* Sale Price */}
                        <td>${parseFloat(p.sale_price || 0).toFixed(2)}</td>
                        {/* Purchase Price */}
                        <td>
                          {p.purchase_price
                            ? `₹${parseFloat(p.purchase_price).toFixed(2)}`
                            : "N/A"}
                        </td>
                        {/* Tax */}
                        <td>
                          {p.tax?.name
                            ? `${p.tax.name} (${p.tax.rate}%)`
                            : "N/A"}
                        </td>
                        {/* Category */}
                        <td>{p.category?.name || "N/A"}</td>
                        {/* Unit */}
                        <td>{p.unit?.name || "N/A"}</td>
                        {/* Quantity */}
                        <td>{p.quantity || 0}</td>
                        {/* Type */}
                        <td>
                          <span
                            className={`badge ${p.type === "product"
                              ? "bg-success"
                              : "bg-secondary"
                              }`}
                          >
                            {p.type}
                          </span>
                        </td>

                        {/* Actions */}
                        <td>
                          {/* 👁️ View/Warehouse button */}

                          <OverlayTrigger overlay={<Tooltip>View</Tooltip>}>
                            <button
                              className="btn btn-sm bg-warning me-2"
                              onClick={() => setViewProduct(p)}
                            >
                              <i className="bi bi-eye text-white"></i>
                            </button>
                          </OverlayTrigger>

                          {/* ✏️ Edit button */}
                          <OverlayTrigger overlay={<Tooltip>Edit</Tooltip>}>
                            <button
                              className="btn btn-sm btn-info me-2"
                              onClick={() => handleOpenDialog(p)}
                            >
                              <i className="bi bi-pencil-fill"></i>
                            </button>
                          </OverlayTrigger>

                          {/* 🗑️ Delete button */}
                          <OverlayTrigger overlay={<Tooltip>Delete</Tooltip>}>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDelete(p)}
                            >
                              <i className="bi bi-trash-fill"></i>
                            </button>
                          </OverlayTrigger>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="10" className="text-center">
                        No products found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-2">
              <span className="mb-2 mb-md-0">
                Showing{" "}
                {filteredProducts.length === 0
                  ? 0
                  : (page - 1) * itemsPerPage + 1}{" "}
                to {Math.min(page * itemsPerPage, totalEntries)} of{" "}
                {totalEntries} entries
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
                    className={`page-item ${page === totalPages ? "disabled" : ""
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

      {dialogOpen && (
        <div
          className={`modal show d-block custom-slide-modal ${isClosingModal ? "closing" : "open"
            }`}
          tabIndex="-1"
          style={{ overflowY: "auto", scrollbarWidth: "none" }}
          onClick={handleCloseDialog}
        >
          <div
            className="modal-dialog modal-md"
            onClick={(e) => e.stopPropagation()}
          >
            <form className="modal-content" onSubmit={handleSubmit}>
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingProduct ? "Edit Product" : "Add Product"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseDialog}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  {/* Name */}
                  <div className="col-md-6">
                    <label className="form-label">
                      Name <span class="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.name ? "is-invalid" : ""
                        }`}
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                    {errors.name && (
                      <div className="invalid-feedback">{errors.name}</div>
                    )}
                  </div>

                  {/* SKU */}
                  <div className="col-md-6">
                    <label htmlFor="sku" className="form-label">
                      SKU <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <input
                        type="text"
                        className={`form-control ${errors.sku ? "is-invalid" : ""
                          }`}
                        name="sku"
                        id="sku"
                        placeholder="Enter SKU"
                        value={formData.sku}
                        onChange={handleInputChange}
                      />

                      <button
                        type="button"
                        className="btn btn-outline-success"
                        onClick={generateSKU}
                        style={{ height: "199%" }} // make button same height as input
                      >
                        Generate
                      </button>
                      {errors.sku && (
                        <div className="invalid-feedback">{errors.sku}</div>
                      )}
                    </div>
                  </div>

                  {/* Sale Price */}
                  <div className="col-md-6">
                    <label className="form-label">
                      Sale Price <span class="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      className={`form-control ${errors.sale_price ? "is-invalid" : ""
                        }`}
                      name="sale_price"
                      value={formData.sale_price}
                      onChange={handleInputChange}
                    />
                    {errors.sale_price && (
                      <div className="invalid-feedback">
                        {errors.sale_price}
                      </div>
                    )}
                  </div>

                  {/* Purchase Price */}
                  <div className="col-md-6">
                    <label className="form-label">
                      Purchase Price <span class="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      className={`form-control ${errors.purchase_price ? "is-invalid" : ""
                        }`}
                      name="purchase_price"
                      value={formData.purchase_price}
                      onChange={handleInputChange}
                    />
                    {errors.purchase_price && (
                      <div className="invalid-feedback">
                        {errors.purchase_price}
                      </div>
                    )}
                  </div>

                  {/* Tax */}
                  <div className="col-md-6">
                    <label className="form-label">
                      Tax <span class="text-danger">*</span>
                    </label>
                    <select
                      name="tax_id"
                      className={`form-control ${errors.tax_id ? "is-invalid" : ""
                        }`}
                      value={formData.tax_id}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Tax</option>
                      {taxes.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.rate}%)
                        </option>
                      ))}
                    </select>
                    <small className="text-muted">
                      Create tax here.{" "}
                      <a
                        href="accounting/accountingsetup/tax"
                        style={{ color: "#78D13D" }}
                      >
                        Create tax
                      </a>
                    </small>

                    {errors.tax_id && (
                      <div className="invalid-feedback">{errors.tax_id}</div>
                    )}
                  </div>

                  {/* Unit */}
                  <div className="col-md-6">
                    <label className="form-label">
                      Unit <span class="text-danger">*</span>
                    </label>
                    <select
                      name="unit_id"
                      className={`form-control ${errors.unit_id ? "is-invalid" : ""
                        }`}
                      value={formData.unit_id}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Unit</option>
                      {units.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                    <small className="text-muted">
                      Create account here.{" "}
                      <a
                        href="/accounting/accountingsetup/tax"
                        style={{ color: "#78D13D" }}
                      >
                        Create account
                      </a>
                    </small>
                    {errors.unit_id && (
                      <div className="invalid-feedback">{errors.unit_id}</div>
                    )}
                  </div>

                  {/* Type */}
                  <div className="col-md-6">
                    <label className="form-label">
                      Type <span class="text-danger">*</span>
                    </label>
                    <select
                      name="type"
                      className={`form-control ${errors.type ? "is-invalid" : ""
                        }`}
                      value={formData.type}
                      onChange={handleInputChange}
                    >
                      <option value="product">Product</option>
                      <option value="service">Service</option>
                    </select>
                    {/* <small className="text-muted">
                      Create account here.{" "}
                      <a href="#" style={{ color: "#78D13D" }}>
                        Create account
                      </a>
                    </small> */}

                    {errors.type && (
                      <div className="invalid-feedback">{errors.type}</div>
                    )}
                  </div>

                  {/* Income Account */}
                  <div className="col-md-6">
                    <label className="form-label">
                      Income Account <span class="text-danger">*</span>
                    </label>
                    <select
                      name="sale_chartaccount_id"
                      className={`form-control ${errors.sale_chartaccount_id ? "is-invalid" : ""
                        }`}
                      value={formData.sale_chartaccount_id}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Chart of Account</option>

                      {renderAccountOptions()}

                      {/* {accounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))} */}
                    </select>
                    <small className="text-muted  ">
                      Create account here.{" "}
                      <a
                        href="/double-entry/chart-of-accounts"
                        style={{ color: "#78D13D" }}
                      >
                        Create account
                      </a>
                    </small>

                    {errors.sale_chartaccount_id && (
                      <div className="invalid-feedback">
                        {errors.sale_chartaccount_id}
                      </div>
                    )}
                  </div>

                  {/* Expense Account */}
                  <div className="col-md-6">
                    <label className="form-label">
                      Expense Account <span class="text-danger">*</span>
                    </label>
                    <select
                      name="expense_chartaccount_id"
                      className={`form-control ${errors.expense_chartaccount_id ? "is-invalid" : ""
                        }`}
                      value={formData.expense_chartaccount_id}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Chart of Account</option>

                      {renderAccountOptions()}

                      {/* {accounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))} */}
                    </select>

                    <small className="text-muted">
                      Create account here.{" "}
                      <a
                        href="/double-entry/chart-of-accounts"
                        style={{ color: "#78D13D" }}
                      >
                        Create account
                      </a>
                    </small>

                    {errors.expense_chartaccount_id && (
                      <div className="invalid-feedback">
                        {errors.expense_chartaccount_id}
                      </div>
                    )}
                  </div>

                  {/* Category */}
                  <div className="col-md-6">
                    <label className="form-label">
                      Category <span class="text-danger">*</span>
                    </label>
                    <select
                      name="category_id"
                      className={`form-control ${errors.category_id ? "is-invalid" : ""
                        }`}
                      value={formData.category_id}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>

                    <small className="text-muted">
                      Create catagory here.{" "}
                      <a
                        href="accounting/accountingsetup/tax"
                        style={{ color: "#78D13D" }}
                      >
                        Create catagory
                      </a>
                    </small>

                    {errors.category_id && (
                      <div className="invalid-feedback">
                        {errors.category_id}
                      </div>
                    )}
                  </div>

                  {/* Quantity */}
                  {formData.type === "product" && (
                    <div className="col-md-6">
                      <label className="form-label">
                        Quantity <span class="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        className={`form-control ${errors.quantity ? "is-invalid" : ""
                          }`}
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleInputChange}
                      />
                      {errors.quantity && (
                        <div className="invalid-feedback">
                          {errors.quantity}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Description */}
                  <div className="col-12">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      name="description"
                      rows="3"
                      value={formData.description}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>

                  {/* Image */}
                  <div className="col-12">
                    <label className="form-label">Image</label>
                    <input
                      type="file"
                      className="form-control"
                      name="pro_image"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    {editingProduct?.pro_image && (
                      <img
                        src={`https://erpcopy.vnvision.in/${editingProduct.pro_image}`}
                        alt="Product"
                        className="mt-2 rounded"
                        width={100}
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseDialog}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={formLoading}
                >
                  {formLoading ? (
                    <span className="spinner-border spinner-border-sm"></span>
                  ) : editingProduct ? (
                    "Update Product"
                  ) : (
                    "Add Product"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewProduct && (
        <Modal
          show={!!viewProduct}
          onHide={handleCloseViewModal}
          centered
          size="md"
          className={`modal show d-block custom-slide-modal ${isClosingViewModal ? "closing" : "open"
            }`}

          style={{
            overflowY: "auto",
            scrollbarWidth: "none",
            backgroundColor: "rgba(100, 98, 98, 0.35)",
          }}
        >
          <Modal.Header closeButton>
            <Modal.Title>Product Details</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              <strong>Name:</strong> {viewProduct.name || "N/A"}
            </p>
            <p>
              <strong>SKU:</strong> {viewProduct.sku || "N/A"}
            </p>
            <p>
              <strong>Sale Price:</strong> $
              {parseFloat(viewProduct.sale_price || 0).toFixed(2)}
            </p>
            <p>
              <strong>Purchase Price:</strong>{" "}
              {viewProduct.purchase_price
                ? `$${parseFloat(viewProduct.purchase_price).toFixed(2)}`
                : "N/A"}
            </p>
            <p>
              <strong>Tax:</strong>{" "}
              {viewProduct.tax?.name
                ? `${viewProduct.tax.name} (${viewProduct.tax.rate}%)`
                : "N/A"}
            </p>
            <p>
              <strong>Category:</strong> {viewProduct.category?.name || "N/A"}
            </p>
            <p>
              <strong>Unit:</strong> {viewProduct.unit?.name || "N/A"}
            </p>
            <p>
              <strong>Quantity:</strong> {viewProduct.quantity || 0}
            </p>
            <p>
              <strong>Type:</strong>{" "}
              <span
                className={`badge ${viewProduct.type === "product" ? "bg-primary" : "bg-secondary"
                  }`}
              >
                {viewProduct.type}
              </span>
            </p>

            {/* NEW: View Image Button */}
            {viewProduct.pro_image && (
              <div className="mt-3">
                <Button
                  variant="info"
                  size="sm"
                  onClick={() => setShowImage((prev) => !prev)}
                >
                  {showImage ? "Hide Image" : "View Image"}
                </Button>

                {showImage && (
                  <div className="mt-2">
                    <img
                      src={`https://erpcopy.vnvision.in/${viewProduct.pro_image}`}
                      alt="Product"
                      className="rounded shadow-sm"
                      width={150}
                    />
                  </div>
                )}
              </div>
            )}

            {viewProduct.description && (
              <div className="mt-3">
                <h6>Description</h6>
                <p>{viewProduct.description}</p>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseViewModal}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default Product;
