// import React, { useState, useEffect } from "react";
// import {
//   Form,
//   Button,
//   Card,
//   Row,
//   Col,
//   Badge,
//   Alert,
//   Spinner,
//   Image,
//   Modal,
//   InputGroup,
// } from "react-bootstrap";
// import { Link, useNavigate } from "react-router-dom";

// import {
//   createEmployee,
//   getEmployees,
//   getBranches,
//   getRequiredDocuments,
//   checkAadhaar,
//   rejoinEmployee, // ADDED: Import rejoin service
// } from "../../../services/hrmService";
// import branchService from "../../../services/branchService";
// import departmentService from "../../../services/departmentService";
// import designationService from "../../../services/designationService";
// import "./EmployeeForm.css";
// import { toast } from "react-toastify";

// // Constants for localStorage keys
// const EMPLOYEE_DRAFTS_KEY = "employee_drafts";
// const CURRENT_DRAFT_KEY = "current_employee_draft";

// const EmployeeCreate = () => {
//   const navigate = useNavigate();

//   // Step states
//   const [currentStep, setCurrentStep] = useState(1);
//   const [aadhaarNumber, setAadhaarNumber] = useState("");
//   const [aadhaarExists, setAadhaarExists] = useState(false);
//   const [checkingAadhaar, setCheckingAadhaar] = useState(false);
//   const [existingEmployeeData, setExistingEmployeeData] = useState(null);
//   const [allEmployees, setAllEmployees] = useState([]);
//   const [showAadhaarModal, setShowAadhaarModal] = useState(false);
//   const [showDraftsModal, setShowDraftsModal] = useState(false);
//   const [savingDraft, setSavingDraft] = useState(false);
//   const [rejoiningEmployee, setRejoiningEmployee] = useState(false); // ADDED: Rejoin loading state

//   // Form data - UPDATED WITH NEW FIELDS
//   const [formData, setFormData] = useState({
//     name: "",
//     phone: "",
//     dob: "",
//     gender: "Male",
//     email: "",
//     password: "",
//     address: "",
//     branch_id: "",
//     department_id: "",
//     designation_id: "",
//     company_doj: "",
//     account_holder_name: "",
//     account_number: "",
//     bank_name: "",
//     bank_identifier_code: "",
//     branch_location: "",
//     tax_payer_id: "",
//     aadhaar_number: "",
//     // NEW FIELDS
//     uan_number: "",
//     ip_number: "",
//     father_name: "",
//     skills: "",
//   });

//   const [phoneNumber, setPhoneNumber] = useState("");
//   const [branches, setBranches] = useState([]);
//   const [departments, setDepartments] = useState([]);
//   const [designations, setDesignations] = useState([]);
//   const [requiredDocs, setRequiredDocs] = useState([]);
//   const [docFiles, setDocFiles] = useState({});
//   const [docPreviews, setDocPreviews] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [nextEmployeeId, setNextEmployeeId] = useState("#EMP00000");
//   const [currentDraftId, setCurrentDraftId] = useState(null);
//   const [drafts, setDrafts] = useState([]);

//   // Load drafts from localStorage
//   const loadDrafts = () => {
//     try {
//       const savedDrafts = localStorage.getItem(EMPLOYEE_DRAFTS_KEY);
//       if (savedDrafts) {
//         setDrafts(JSON.parse(savedDrafts));
//       }
//     } catch (error) {
//       console.error("Error loading drafts:", error);
//     }
//   };

//   // Save draft to localStorage
//   const saveDraftToStorage = (draftData, draftId = null) => {
//     try {
//       const draftToSave = {
//         id: draftId || `draft_${Date.now()}`,
//         ...draftData,
//         saved_at: new Date().toISOString(),
//         employee_name: draftData.formData?.name || "Unnamed Employee",
//       };

//       let allDrafts = [];
//       const existingDrafts = localStorage.getItem(EMPLOYEE_DRAFTS_KEY);

//       if (existingDrafts) {
//         allDrafts = JSON.parse(existingDrafts);

//         // Update existing draft or add new one
//         const existingIndex = allDrafts.findIndex(
//           (draft) => draft.id === draftToSave.id
//         );
//         if (existingIndex !== -1) {
//           allDrafts[existingIndex] = draftToSave;
//         } else {
//           allDrafts.push(draftToSave);
//         }
//       } else {
//         allDrafts = [draftToSave];
//       }

//       localStorage.setItem(EMPLOYEE_DRAFTS_KEY, JSON.stringify(allDrafts));
//       localStorage.setItem(CURRENT_DRAFT_KEY, JSON.stringify(draftToSave));

//       return draftToSave.id;
//     } catch (error) {
//       console.error("Error saving draft:", error);
//       throw error;
//     }
//   };

//   // Load specific draft
//   const loadDraft = (draftId) => {
//     try {
//       const allDrafts = JSON.parse(
//         localStorage.getItem(EMPLOYEE_DRAFTS_KEY) || "[]"
//       );
//       const draft = allDrafts.find((d) => d.id === draftId);

//       if (draft) {
//         setFormData(draft.formData || {});
//         setPhoneNumber(draft.phoneNumber || "");
//         setAadhaarNumber(draft.aadhaarNumber || "");
//         setDocFiles(draft.docFiles || {});
//         setDocPreviews(draft.docPreviews || {});
//         setCurrentDraftId(draft.id);
//         setCurrentStep(draft.currentStep || 2);

//         toast.success(`Draft "${draft.employee_name}" loaded successfully!`);
//         return true;
//       }
//       return false;
//     } catch (error) {
//       console.error("Error loading draft:", error);
//       toast.error("Failed to load draft");
//       return false;
//     }
//   };

//   // Delete draft
//   const deleteDraft = (draftId) => {
//     try {
//       const allDrafts = JSON.parse(
//         localStorage.getItem(EMPLOYEE_DRAFTS_KEY) || "[]"
//       );
//       const updatedDrafts = allDrafts.filter((draft) => draft.id !== draftId);

//       localStorage.setItem(EMPLOYEE_DRAFTS_KEY, JSON.stringify(updatedDrafts));
//       setDrafts(updatedDrafts);

//       if (currentDraftId === draftId) {
//         setCurrentDraftId(null);
//         localStorage.removeItem(CURRENT_DRAFT_KEY);
//       }

//       toast.success("Draft deleted successfully!");
//     } catch (error) {
//       console.error("Error deleting draft:", error);
//       toast.error("Failed to delete draft");
//     }
//   };

//   // Save Draft Function
//   const handleSaveDraft = () => {
//     try {
//       setSavingDraft(true);

//       const draftData = {
//         formData,
//         phoneNumber,
//         aadhaarNumber,
//         docFiles,
//         docPreviews,
//         currentStep,
//         lastSaved: new Date().toISOString(),
//       };

//       const draftId = saveDraftToStorage(draftData, currentDraftId);
//       setCurrentDraftId(draftId);
//       loadDrafts(); // Refresh drafts list

//       toast.success("Draft saved successfully!");
//     } catch (error) {
//       console.error("Error saving draft:", error);
//       toast.error("Failed to save draft");
//     } finally {
//       setSavingDraft(false);
//     }
//   };

//   // Auto-load current draft on component mount
//   useEffect(() => {
//     loadDrafts();

//     // Check if there's a current draft
//     const currentDraft = localStorage.getItem(CURRENT_DRAFT_KEY);
//     if (currentDraft) {
//       const draft = JSON.parse(currentDraft);
//       loadDraft(draft.id);
//     }
//   }, []);

//   // Fetch initial data
//   useEffect(() => {
//     const fetchInitialData = async () => {
//       try {
//         setLoading(true);
//         const [branchesRes, employeesRes, docsRes] = await Promise.all([
//           getBranches(),
//           getEmployees(),
//           getRequiredDocuments(),
//         ]);

//         setBranches(branchesRes || []);
//         setRequiredDocs(docsRes || []);
//         setAllEmployees(employeesRes || []);

//         let maxId = 0;
//         if (employeesRes && employeesRes.length > 0) {
//           employeesRes.forEach((emp) => {
//             const idNum = emp.employee_id
//               ? parseInt(emp.employee_id.replace(/\D/g, ""))
//               : 0;
//             if (idNum > maxId) maxId = idNum;
//           });
//         }
//         setNextEmployeeId(`#EMP${String(maxId + 1).padStart(5, "0")}`);
//       } catch (err) {
//         console.error("Error fetching initial data:", err);
//         setError("Failed to load initial data");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchInitialData();
//   }, []);

//   // Fetch departments when branch changes
//   useEffect(() => {
//     const fetchDepartments = async () => {
//       if (!formData.branch_id) {
//         setDepartments([]);
//         setFormData((prev) => ({
//           ...prev,
//           department_id: "",
//           designation_id: "",
//         }));
//         return;
//       }
//       try {
//         const depts = await departmentService.getByBranch(formData.branch_id);
//         setDepartments(depts);
//         setFormData((prev) => ({
//           ...prev,
//           department_id: "",
//           designation_id: "",
//         }));
//       } catch (err) {
//         console.error("Error fetching departments:", err);
//         setError("Failed to load departments");
//       }
//     };
//     fetchDepartments();
//   }, [formData.branch_id]);

//   // Fetch designations when department changes
//   useEffect(() => {
//     const fetchDesignations = async () => {
//       if (!formData.department_id) {
//         setDesignations([]);
//         setFormData((prev) => ({ ...prev, designation_id: "" }));
//         return;
//       }

//       try {
//         const desigs = await designationService.getByDepartment(
//           formData.department_id
//         );
//         setDesignations(Array.isArray(desigs) ? desigs : []);
//         setFormData((prev) => ({ ...prev, designation_id: "" }));
//       } catch (err) {
//         console.error("Error fetching designations:", err);
//         setError("Failed to load designations");
//       }
//     };

//     fetchDesignations();
//   }, [formData.department_id]);

//   // Handle phone number input
//   const handlePhoneChange = (e) => {
//     const value = e.target.value.replace(/\D/g, "");
//     if (value.length <= 10) {
//       setPhoneNumber(value);
//     }
//   };

//   // Handle UAN number input (12 digits only)
//   const handleUanChange = (e) => {
//     const value = e.target.value.replace(/\D/g, "");
//     if (value.length <= 12) {
//       setFormData((prev) => ({ ...prev, uan_number: value }));
//     }
//   };

//   // Handle IP number input (10 digits only)
//   const handleIpChange = (e) => {
//     const value = e.target.value.replace(/\D/g, "");
//     if (value.length <= 10) {
//       setFormData((prev) => ({ ...prev, ip_number: value }));
//     }
//   };

//   // Get the full phone number with +91 prefix
//   const getFullPhoneNumber = () => {
//     return `+91${phoneNumber}`;
//   };

//   // Server-side Aadhaar validation
//   // const handleCheckAadhaar = async () => {
//   //   if (!aadhaarNumber || aadhaarNumber.length !== 12) {
//   //     toast.error("Please enter a valid 12-digit Aadhaar number");
//   //     return;
//   //   }

//   //   setCheckingAadhaar(true);
//   //   setError(null);

//   //   try {
//   //     console.log("🔍 Checking Aadhaar on server:", aadhaarNumber);
//   //     const response = await checkAadhaar({ aadhaar_number: aadhaarNumber });
//   //     console.log("📋 Server Aadhaar check response:", response);

//   //     if (response.success) {
//   //       if (response.exists) {
//   //         setAadhaarExists(true);
//   //         setExistingEmployeeData(response.data);
//   //         setShowAadhaarModal(true);
//   //         toast.error(
//   //           `Aadhaar already exists! Employee: ${
//   //             response.data.name
//   //           } in branch: ${response.data.branch?.name || "N/A"}`,
//   //           {
//   //             style: {
//   //               width: "400px",
//   //               padding: "30px 15px",
//   //             },
//   //           }
//   //         );
//   //       } else {
//   //         setAadhaarExists(false);
//   //         setExistingEmployeeData(null);
//   //         setFormData((prev) => ({ ...prev, aadhaar_number: aadhaarNumber }));
//   //         setCurrentStep(2);
//   //         toast.success("Aadhaar verified! Please fill employee details.");
//   //       }
//   //     } else {
//   //       throw new Error(response.message || "Aadhaar check failed");
//   //     }
//   //   } catch (err) {
//   //     console.error("❌ Error in server Aadhaar check:", err);
//   //     let errorMessage = "Aadhaar verification failed";
//   //     if (err.response?.data) {
//   //       errorMessage = err.response.data.message || errorMessage;
//   //     } else if (err.message) {
//   //       errorMessage = err.message;
//   //     }

//   //     setError(errorMessage);
//   //     toast.error(errorMessage);

//   //     const shouldProceed = window.confirm(
//   //       `${errorMessage}. Do you want to proceed with employee creation anyway?`
//   //     );

//   //     if (shouldProceed) {
//   //       setFormData((prev) => ({ ...prev, aadhaar_number: aadhaarNumber }));
//   //       setCurrentStep(2);
//   //       toast.warning("Proceeding without Aadhaar verification");
//   //     }
//   //   } finally {
//   //     setCheckingAadhaar(false);
//   //   }
//   // };
//   // Server-side Aadhaar validation with draft check
//   // const handleCheckAadhaar = async () => {
//   //   if (!aadhaarNumber || aadhaarNumber.length !== 12) {
//   //     toast.error("Please enter a valid 12-digit Aadhaar number");
//   //     return;
//   //   }

//   //   // ADDED: Check if this Aadhaar exists in drafts first
//   //   try {
//   //     const allDrafts = JSON.parse(
//   //       localStorage.getItem(EMPLOYEE_DRAFTS_KEY) || "[]"
//   //     );
//   //     const matchingDraft = allDrafts.find(
//   //       (draft) => draft.formData?.aadhaar_number === aadhaarNumber
//   //     );

//   //     if (matchingDraft) {
//   //       // Ask user if they want to load the existing draft
//   //       const shouldLoadDraft = window.confirm(
//   //         `A draft exists for this Aadhaar number (${matchingDraft.employee_name}). Do you want to load this draft?`
//   //       );

//   //       if (shouldLoadDraft) {
//   //         loadDraft(matchingDraft.id);
//   //         return; // Exit early - don't check on server
//   //       }
//   //       // If user says no, continue with server check below
//   //     }
//   //   } catch (error) {
//   //     console.error("Error checking drafts:", error);
//   //     // Continue with server check if draft check fails
//   //   }

//   //   // Original server-side Aadhaar check
//   //   setCheckingAadhaar(true);
//   //   setError(null);

//   //   try {
//   //     console.log("🔍 Checking Aadhaar on server:", aadhaarNumber);
//   //     const response = await checkAadhaar({ aadhaar_number: aadhaarNumber });
//   //     console.log("📋 Server Aadhaar check response:", response);

//   //     if (response.success) {
//   //       if (response.exists) {
//   //         setAadhaarExists(true);
//   //         setExistingEmployeeData(response.data);
//   //         setShowAadhaarModal(true);
//   //         toast.error(
//   //           `Aadhaar already exists! Employee: ${
//   //             response.data.name
//   //           } in branch: ${response.data.branch?.name || "N/A"}`,
//   //           {
//   //             style: {
//   //               width: "400px",
//   //               padding: "30px 15px",
//   //             },
//   //           }
//   //         );
//   //       } else {
//   //         setAadhaarExists(false);
//   //         setExistingEmployeeData(null);
//   //         setFormData((prev) => ({ ...prev, aadhaar_number: aadhaarNumber }));
//   //         setCurrentStep(2);
//   //         toast.success("Aadhaar verified! Please fill employee details.");
//   //       }
//   //     } else {
//   //       throw new Error(response.message || "Aadhaar check failed");
//   //     }
//   //   } catch (err) {
//   //     console.error("❌ Error in server Aadhaar check:", err);
//   //     let errorMessage = "Aadhaar verification failed";
//   //     if (err.response?.data) {
//   //       errorMessage = err.response.data.message || errorMessage;
//   //     } else if (err.message) {
//   //       errorMessage = err.message;
//   //     }

//   //     setError(errorMessage);
//   //     toast.error(errorMessage);

//   //     const shouldProceed = window.confirm(
//   //       `${errorMessage}. Do you want to proceed with employee creation anyway?`
//   //     );

//   //     if (shouldProceed) {
//   //       setFormData((prev) => ({ ...prev, aadhaar_number: aadhaarNumber }));
//   //       setCurrentStep(2);
//   //       toast.warning("Proceeding without Aadhaar verification");
//   //     }
//   //   } finally {
//   //     setCheckingAadhaar(false);
//   //   }
//   // };
//   // Server-side Aadhaar validation with draft check
//   const handleCheckAadhaar = async () => {
//     if (!aadhaarNumber || aadhaarNumber.length !== 12) {
//       toast.error("Please enter a valid 12-digit Aadhaar number");
//       return;
//     }

//     // ADDED: Check if this Aadhaar exists in drafts first
//     try {
//       const allDrafts = JSON.parse(
//         localStorage.getItem(EMPLOYEE_DRAFTS_KEY) || "[]"
//       );
//       const matchingDraft = allDrafts.find(
//         (draft) => draft.formData?.aadhaar_number === aadhaarNumber
//       );

//       if (matchingDraft) {
//         // Automatically load the draft without asking
//         loadDraft(matchingDraft.id);
//         return; // Exit early - don't check on server
//       }
//     } catch (error) {
//       console.error("Error checking drafts:", error);
//       // Continue with server check if draft check fails
//     }

//     // Original server-side Aadhaar check
//     setCheckingAadhaar(true);
//     setError(null);

//     try {
//       console.log("🔍 Checking Aadhaar on server:", aadhaarNumber);
//       const response = await checkAadhaar({ aadhaar_number: aadhaarNumber });
//       console.log("📋 Server Aadhaar check response:", response);

//       if (response.success) {
//         if (response.exists) {
//           setAadhaarExists(true);
//           setExistingEmployeeData(response.data);
//           setShowAadhaarModal(true);
//           toast.error(
//             `Aadhaar already exists! Employee: ${
//               response.data.name
//             } in branch: ${response.data.branch?.name || "N/A"}`,
//             {
//               style: {
//                 width: "400px",
//                 padding: "30px 15px",
//               },
//             }
//           );
//         } else {
//           setAadhaarExists(false);
//           setExistingEmployeeData(null);
//           setFormData((prev) => ({ ...prev, aadhaar_number: aadhaarNumber }));
//           setCurrentStep(2);
//           toast.success("Aadhaar verified! Please fill employee details.");
//         }
//       } else {
//         throw new Error(response.message || "Aadhaar check failed");
//       }
//     } catch (err) {
//       console.error("❌ Error in server Aadhaar check:", err);
//       let errorMessage = "Aadhaar verification failed";
//       if (err.response?.data) {
//         errorMessage = err.response.data.message || errorMessage;
//       } else if (err.message) {
//         errorMessage = err.message;
//       }

//       setError(errorMessage);
//       toast.error(errorMessage);

//       const shouldProceed = window.confirm(
//         `${errorMessage}. Do you want to proceed with employee creation anyway?`
//       );

//       if (shouldProceed) {
//         setFormData((prev) => ({ ...prev, aadhaar_number: aadhaarNumber }));
//         setCurrentStep(2);
//         toast.warning("Proceeding without Aadhaar verification");
//       }
//     } finally {
//       setCheckingAadhaar(false);
//     }
//   };

//   // ADDED: Handle Employee Rejoin Function
//   const handleRejoinEmployee = async (rejoinReason) => {
//     if (!rejoinReason || !rejoinReason.trim()) {
//       toast.error("Please provide a reason for rejoin");
//       return;
//     }

//     setRejoiningEmployee(true);
//     setShowAadhaarModal(false); // adding this
//     try {
//       const response = await rejoinEmployee({
//         aadhaar_number: aadhaarNumber,
//         rejoin_reason: rejoinReason.trim(),
//       });

//       if (response.success) {
//         toast.success(response.message || "Employee rejoined successfully!", {
//           style: {
//             width: "400px",
//             padding: "30px 15px",
//           },
//         });

//         // Navigate to employee edit page after successful rejoin
//         if (response.data && response.data.employee_id) {
//           navigate(`/employees/edit/${response.data.employee_id}`, {
//             state: {
//               success: response.message || "Employee rejoined successfully!",
//               rejoinedEmployee: response.data,
//               timestamp: new Date().toISOString(),
//             },
//           });
//         } else {
//           navigate("/employees");
//         }
//       } else {
//         throw new Error(response.message || "Rejoin failed");
//       }
//     } catch (err) {
//       console.error("❌ Error in rejoin employee:", err);
//       let errorMessage = "Failed to rejoin employee";
//       if (err.response?.data) {
//         errorMessage = err.response.data.message || errorMessage;
//       } else if (err.message) {
//         errorMessage = err.message;
//       }

//       toast.error(errorMessage);
//       setRejoiningEmployee(false); // adding this
//     } finally {
//       setRejoiningEmployee(false);
//       //removeing
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleDocFileChange = (docId, e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setDocFiles((prev) => ({ ...prev, [docId]: file }));

//       if (file.type.startsWith("image/")) {
//         setDocPreviews((prev) => ({
//           ...prev,
//           [docId]: URL.createObjectURL(file),
//         }));
//       } else {
//         setDocPreviews((prev) => ({
//           ...prev,
//           [docId]: file.name,
//         }));
//       }
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);

//     // Validate phone number
//     if (!phoneNumber || phoneNumber.length !== 10) {
//       setError("Please enter a valid 10-digit phone number");
//       setLoading(false);
//       return;
//     }

//     try {
//       const formDataToSend = new FormData();

//       // Append all employee data to FormData
//       Object.entries(formData).forEach(([key, value]) => {
//         if (value !== "") {
//           formDataToSend.append(key, value);
//         }
//       });

//       // Append phone number with +91 prefix
//       formDataToSend.append("phone", getFullPhoneNumber());

//       // Append document files if they exist
//       Object.entries(docFiles).forEach(([docId, file]) => {
//         formDataToSend.append(docId.toString(), file);
//       });

//       console.log("📤 Sending form data with Phone:", getFullPhoneNumber());

//       const response = await createEmployee(formDataToSend);

//       if (response.success) {
//         // Delete draft after successful creation
//         if (currentDraftId) {
//           deleteDraft(currentDraftId);
//         }

//         toast.success("Employee created successfully!");
//         navigate("/employees", {
//           state: {
//             success: `Employee ${response.data.employee_id} created successfully!`,
//             employeeId: response.data.employee_id,
//             timestamp: new Date().toISOString(),
//           },
//         });
//       } else {
//         throw new Error(response.message || "Employee creation failed");
//       }
//     } catch (err) {
//       console.error("Submission error:", err);
//       let errorMessage = "Failed to create employee";
//       if (err.response?.data) {
//         if (err.response.data.errors) {
//           errorMessage = Object.values(err.response.data.errors)
//             .flat()
//             .join(", ");
//         } else {
//           errorMessage = err.response.data.message || "Server error occurred";
//         }
//       } else if (err.message) {
//         errorMessage = err.message;
//       }

//       setError(errorMessage);
//       toast.error(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // const goBackToAadhaar = () => {
//   //   setCurrentStep(1);
//   //   setAadhaarNumber("");
//   //   setAadhaarExists(false);
//   //   setExistingEmployeeData(null);
//   //   setError(null);
//   // };
//   const goBackToAadhaar = () => {
//     setCurrentStep(1);
//     setAadhaarNumber("");
//     setAadhaarExists(false);
//     setExistingEmployeeData(null);
//     setError(null);

//     // Clear form data
//     setFormData({
//       name: "",
//       phone: "",
//       dob: "",
//       gender: "Male",
//       email: "",
//       password: "",
//       address: "",
//       branch_id: "",
//       department_id: "",
//       designation_id: "",
//       company_doj: "",
//       account_holder_name: "",
//       account_number: "",
//       bank_name: "",
//       bank_identifier_code: "",
//       branch_location: "",
//       tax_payer_id: "",
//       aadhaar_number: "",
//       uan_number: "",
//       ip_number: "",
//       father_name: "",
//       skills: "",
//     });

//     // Clear phone and document-related state
//     setPhoneNumber("");
//     setDocFiles({});
//     setDocPreviews({});

//     // Clear draft
//     setCurrentDraftId(null);
//     localStorage.removeItem(CURRENT_DRAFT_KEY);
//   };

//   // UPDATED: Handle Rejoin with API call
//   const handleRejoin = (rejoinReason) => {
//     handleRejoinEmployee(rejoinReason);
//   };

//   // Clear current draft and start fresh
//   const startNewForm = () => {
//     setShowDraftsModal(false);
//     setFormData({
//       name: "",
//       phone: "",
//       dob: "",
//       gender: "",
//       email: "",
//       password: "",
//       address: "",
//       branch_id: "",
//       department_id: "",
//       designation_id: "",
//       company_doj: "",
//       account_holder_name: "",
//       account_number: "",
//       bank_name: "",
//       bank_identifier_code: "",
//       branch_location: "",
//       tax_payer_id: "",
//       aadhaar_number: "",
//       uan_number: "",
//       ip_number: "",
//       father_name: "",
//       skills: "",
//     });
//     setPhoneNumber("");
//     setAadhaarNumber("");
//     setDocFiles({});
//     setDocPreviews({});
//     setCurrentDraftId(null);
//     setCurrentStep(1);
//     localStorage.removeItem(CURRENT_DRAFT_KEY);
//     toast.success("Started new employee form");
//   };

//   // Step 1: Aadhaar Check Form - ADDED DRAFT LOADING BUTTON
//   const renderAadhaarStep = () => (
//     <div className="container mt-5">
//       <div className="row justify-content-center">
//         <div className="col-md-6">
//           <Card className="border-0 shadow-sm">
//             <Card.Body className="p-5">
//               <div className="text-center mb-4">
//                 <h2 className="text-primary">Create Employee</h2>
//                 <p className="text-muted">Start by verifying Aadhaar number</p>

//                 {/* Load Draft Button - ADDED */}
//                 {drafts.length > 0 && (
//                   <div className="mb-3">
//                     <Button
//                       variant="outline-primary"
//                       onClick={() => setShowDraftsModal(true)}
//                       size="sm"
//                     >
//                       <i className="bi bi-folder me-2"></i>
//                       Load Saved Draft ({drafts.length})
//                     </Button>
//                   </div>
//                 )}
//               </div>

//               {error && (
//                 <Alert variant="danger" className="mb-4">
//                   <strong>Error:</strong> {error}
//                 </Alert>
//               )}

//               <Form.Group className="mb-4">
//                 <Form.Label className="fw-bold fs-5">
//                   Aadhaar Number <span className="text-danger">*</span>
//                 </Form.Label>
//                 <Form.Control
//                   type="text"
//                   value={aadhaarNumber
//                     .replace(/(\d{4})(?=\d)/g, "$1 - ")
//                     .trim()}
//                   onChange={(e) => {
//                     let value = e.target.value.replace(/\D/g, "");
//                     if (value.length > 12) value = value.slice(0, 12);
//                     setAadhaarNumber(value);
//                   }}
//                   placeholder="Enter 12-digit Aadhaar number"
//                   className="py-3 fs-5 text-center"
//                   style={{ fontSize: "1.3rem" }}
//                   disabled={checkingAadhaar}
//                 />
//                 <Form.Text className="text-muted">
//                   We'll check if this Aadhaar is already registered in our
//                   system
//                 </Form.Text>
//               </Form.Group>

//               <div className="d-flex gap-2 justify-content-between">
//                 <Button
//                   variant="secondary"
//                   onClick={() => navigate("/employees")}
//                   className="py-2 w-100"
//                 >
//                   Back to Employees
//                 </Button>
//                 <Button
//                   variant="success"
//                   size="lg"
//                   onClick={handleCheckAadhaar}
//                   disabled={checkingAadhaar || aadhaarNumber.length !== 12}
//                   className="py-3 w-100"
//                 >
//                   {checkingAadhaar ? (
//                     <>
//                       <Spinner animation="border" size="sm" className="me-2" />
//                       Checking Aadhaar...
//                     </>
//                   ) : (
//                     "Verify Aadhaar & Continue"
//                   )}
//                 </Button>
//               </div>
//             </Card.Body>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );

//   // Step 2: Employee Creation Form - ADDED SAVE DRAFT BUTTON
//   const renderEmployeeForm = () => (
//     <div className="container mt-4">
//       <nav aria-label="breadcrumb" className="mb-4">
//         <div className="d-flex justify-content-between align-items-center">
//           <div>
//             <h2 className="mb-2">
//               Create Employee
//               {currentDraftId && (
//                 <Badge bg="warning" className="ms-2">
//                   Draft
//                 </Badge>
//               )}
//             </h2>
//             <ol className="breadcrumb">
//               <li className="breadcrumb-item">
//                 <Link to="/" className="text-success">
//                   Home
//                 </Link>
//               </li>
//               <li className="breadcrumb-item">
//                 <Link to="/employees" className="text-success">
//                   Employee
//                 </Link>
//               </li>
//               <li
//                 className="breadcrumb-item active text-muted"
//                 aria-current="page"
//               >
//                 Create Employee
//               </li>
//             </ol>
//           </div>
//           <div className="d-flex gap-2">
//             {/* ADDED SAVE DRAFT BUTTON */}
//             <Button
//               variant="primary"
//               onClick={handleSaveDraft}
//               disabled={savingDraft}
//             >
//               {savingDraft ? (
//                 <>
//                   <Spinner animation="border" size="sm" className="me-2" />
//                   Saving...
//                 </>
//               ) : (
//                 "Save Draft"
//               )}
//             </Button>
//             <Button variant="success" onClick={goBackToAadhaar}>
//               Back
//             </Button>
//           </div>
//         </div>
//       </nav>

//       {/* ADDED DRAFT INFO ALERT */}
//       {currentDraftId && (
//         <Alert variant="info" className="mb-4">
//           <div className="d-flex justify-content-between align-items-center">
//             <div>
//               <i className="bi bi-info-circle me-2"></i>
//               <strong>Working on draft:</strong> Your progress is automatically
//               saved.
//             </div>
//             <Button
//               variant="outline-info"
//               size="sm"
//               onClick={() => setShowDraftsModal(true)}
//             >
//               View All Drafts
//             </Button>
//           </div>
//         </Alert>
//       )}

//       {/* Aadhaar Info Banner */}
//       {formData.aadhaar_number && (
//         <Alert variant={aadhaarExists ? "warning" : "success"} className="mb-4">
//           <div className="d-flex justify-content-between align-items-center">
//             <div>
//               <strong>
//                 {aadhaarExists
//                   ? "⚠️ Aadhaar Already Exists: "
//                   : "✅ Aadhaar Verified: "}
//                 {formData.aadhaar_number}
//               </strong>
//               <Badge
//                 bg={aadhaarExists ? "warning" : "success"}
//                 className="ms-2"
//               >
//                 {aadhaarExists ? "Duplicate" : "Verified"}
//               </Badge>
//             </div>
//             {aadhaarExists && (
//               <Button
//                 variant="outline-warning"
//                 size="sm"
//                 onClick={() => setShowAadhaarModal(true)}
//               >
//                 View Details
//               </Button>
//             )}
//           </div>
//           {aadhaarExists && (
//             <div className="mt-2">
//               <small>
//                 This Aadhaar is already registered to{" "}
//                 <strong>{existingEmployeeData?.name}</strong>. Consider using a
//                 different number.
//               </small>
//             </div>
//           )}
//         </Alert>
//       )}

//       <div className="">
//         <div className="p-2">
//           {error && (
//             <Alert variant="danger" className="mb-4">
//               {error}
//             </Alert>
//           )}

//           <Form onSubmit={handleSubmit}>
//             {/* First Row - Personal Details and Company Details */}
//             <Row className="mb-4">
//               {/* Personal Details Card - FIXED DOB LAYOUT */}
//               <Col md={6} className="mb-4 mb-md-0">
//                 <Card className="border-0 shadow-sm h-100">
//                   <Card.Body>
//                     <h5 className="mb-3 text-primary">Personal Detail</h5>

//                     {/* Name + Phone in one row */}
//                     <Row className="mb-3">
//                       <Col md={12}>
//                         <Form.Group>
//                           <Form.Label className="fw-bold">
//                             Name <span className="text-danger">*</span>
//                           </Form.Label>
//                           <Form.Control
//                             type="text"
//                             name="name"
//                             value={formData.name}
//                             onChange={handleChange}
//                             placeholder="Enter employee name"
//                             required
//                             className="py-2"
//                           />
//                         </Form.Group>
//                       </Col>
//                       {/* <Col md={6}>
//                         <Form.Group>
//                           <Form.Label className="fw-bold">
//                             Phone <span className="text-danger">*</span>
//                           </Form.Label>
//                           <InputGroup>
//                             <InputGroup.Text className="bg-light border-end-0">
//                               +91
//                             </InputGroup.Text>
//                             <Form.Control
//                               type="tel"
//                               value={phoneNumber}
//                               onChange={handlePhoneChange}
//                               placeholder="Enter 10-digit phone number"
//                               required
//                               maxLength={10}
//                               className="border-start-0"
//                             />
//                           </InputGroup>
//                         </Form.Group>
//                       </Col> */}
//                     </Row>
//                     <Row className="mb-3">
//                       <Col md={6}>
//                         <Form.Group>
//                           <Form.Label className="fw-bold">
//                             Phone <span className="text-danger">*</span>
//                           </Form.Label>
//                           <InputGroup>
//                             <InputGroup.Text className="bg-light border-end-0">
//                               +91
//                             </InputGroup.Text>
//                             <Form.Control
//                               type="tel"
//                               value={phoneNumber}
//                               onChange={handlePhoneChange}
//                               placeholder="Enter 10-digit phone number"
//                               required
//                               maxLength={10}
//                               className="border-start-0"
//                             />
//                           </InputGroup>
//                         </Form.Group>
//                       </Col>
//                       <Col md={6}>
//                         <Form.Group>
//                           <Form.Label className="fw-bold">
//                             Date of Birth <span className="text-danger">*</span>
//                           </Form.Label>
//                           <Form.Control
//                             type="date"
//                             name="dob"
//                             value={formData.dob}
//                             onChange={handleChange}
//                             max="9999-12-31"
//                             required
//                             className="py-2"
//                           />
//                         </Form.Group>
//                       </Col>
//                     </Row>

//                     {/* Father's Name + Gender in one row */}
//                     <Row className="mb-3">
//                       <Col md={6}>
//                         <Form.Group>
//                           <Form.Label className="fw-bold">
//                             Father's Name
//                           </Form.Label>
//                           <Form.Control
//                             type="text"
//                             name="father_name"
//                             value={formData.father_name}
//                             onChange={handleChange}
//                             placeholder="Enter father's name"
//                             className="py-2"
//                           />
//                         </Form.Group>
//                       </Col>
//                       <Col md={6}>
//                         <Form.Group>
//                           <Form.Label className="fw-bold">
//                             Gender <span className="text-danger">*</span>
//                           </Form.Label>
//                           <Form.Select
//                             name="gender"
//                             value={formData.gender}
//                             onChange={handleChange}
//                             required
//                             className="py-2"
//                           >
//                             <option value="">Select Gender</option>
//                             <option value="Male">Male</option>
//                             <option value="Female">Female</option>
//                             <option value="Other">Other</option>
//                           </Form.Select>
//                         </Form.Group>
//                       </Col>
//                     </Row>

//                     {/* DOB - Full width to fix the gap issue */}
//                     {/* <Row className="mb-3">
//                       <Col md={12}>
//                         <Form.Group>
//                           <Form.Label className="fw-bold">
//                             Date of Birth <span className="text-danger">*</span>
//                           </Form.Label>
//                           <Form.Control
//                             type="date"
//                             name="dob"
//                             value={formData.dob}
//                             onChange={handleChange}
//                             max="9999-12-31"
//                             required
//                             className="py-2"
//                           />
//                         </Form.Group>
//                       </Col>
//                     </Row> */}

//                     {/* Email + Password in one row */}
//                     <Row className="mb-3">
//                       <Col md={6}>
//                         <Form.Group>
//                           <Form.Label className="fw-bold">
//                             Email <span className="text-danger">*</span>
//                           </Form.Label>
//                           <Form.Control
//                             type="email"
//                             name="email"
//                             value={formData.email}
//                             onChange={handleChange}
//                             placeholder="company@example.com"
//                             required
//                             className="py-2"
//                           />
//                         </Form.Group>
//                       </Col>
//                       <Col md={6}>
//                         <Form.Group>
//                           <Form.Label className="fw-bold">
//                             Password <span className="text-danger">*</span>
//                           </Form.Label>
//                           <Form.Control
//                             type="password"
//                             name="password"
//                             value={formData.password}
//                             onChange={handleChange}
//                             placeholder="Enter password"
//                             required
//                             minLength={6}
//                             className="py-2"
//                           />
//                         </Form.Group>
//                       </Col>
//                     </Row>

//                     <Row className="mb-3">
//                       <Col md={6}>
//                         <Form.Group>
//                           <Form.Label className="fw-bold">
//                             UAN Number
//                           </Form.Label>
//                           <Form.Control
//                             type="text"
//                             name="uan_number"
//                             value={formData.uan_number}
//                             onChange={handleUanChange}
//                             placeholder="12-digit UAN number"
//                             maxLength={12}
//                             className="py-2"
//                             isInvalid={
//                               formData.uan_number &&
//                               formData.uan_number.length !== 12
//                             }
//                           />

//                           {formData.uan_number &&
//                             formData.uan_number.length !== 12 && (
//                               <Form.Control.Feedback type="invalid">
//                                 UAN number must be exactly 12 digits
//                               </Form.Control.Feedback>
//                             )}
//                         </Form.Group>
//                       </Col>
//                       <Col md={6}>
//                         <Form.Group>
//                           <Form.Label className="fw-bold">IP Number</Form.Label>
//                           <Form.Control
//                             type="text"
//                             name="ip_number"
//                             value={formData.ip_number}
//                             onChange={handleIpChange}
//                             placeholder="10-digit IP number"
//                             maxLength={10}
//                             className="py-2"
//                             isInvalid={
//                               formData.ip_number &&
//                               formData.ip_number.length !== 10
//                             }
//                           />

//                           {formData.ip_number &&
//                             formData.ip_number.length !== 10 && (
//                               <Form.Control.Feedback type="invalid">
//                                 IP number must be exactly 10 digits
//                               </Form.Control.Feedback>
//                             )}
//                         </Form.Group>
//                       </Col>
//                     </Row>

//                     {/* Aadhaar Number (Read-only) */}
//                     <Row className="mb-3">
//                       <Col md={12}>
//                         <Form.Group>
//                           <Form.Label className="fw-bold">
//                             Aadhaar Number<span className="text-danger">*</span>
//                             <Badge
//                               bg={aadhaarExists ? "warning" : "success"}
//                               className="ms-2"
//                             >
//                               {aadhaarExists ? "Duplicate" : "Verified"}
//                             </Badge>
//                           </Form.Label>
//                           <Form.Control
//                             type="text"
//                             value={formData.aadhaar_number}
//                             readOnly
//                             className={`py-2 ${
//                               aadhaarExists
//                                 ? "bg-warning-subtle"
//                                 : "bg-success-subtle"
//                             }`}
//                           />
//                         </Form.Group>
//                       </Col>
//                     </Row>

//                     {/* Address full width */}
//                     <Row>
//                       <Col md={12}>
//                         <Form.Group>
//                           <Form.Label className="fw-bold">
//                             Address <span className="text-danger">*</span>
//                           </Form.Label>
//                           <Form.Control
//                             as="textarea"
//                             rows={3}
//                             name="address"
//                             value={formData.address}
//                             onChange={handleChange}
//                             placeholder="Enter employee address"
//                             required
//                             className="py-2"
//                           />
//                         </Form.Group>
//                       </Col>
//                     </Row>
//                   </Card.Body>
//                 </Card>
//               </Col>

//               {/* Company Details Card - WITH SKILLS ADDED */}
//               <Col md={6}>
//                 <Card className="border-0 shadow-sm h-100">
//                   <Card.Body>
//                     <h5 className="mb-3 text-primary">Company Detail</h5>

//                     {/* Employee ID */}
//                     <Form.Group className="mb-3">
//                       <Form.Label className="fw-bold">Employee ID</Form.Label>
//                       <Form.Control
//                         type="text"
//                         value={nextEmployeeId}
//                         readOnly
//                         className="py-2 bg-light border-0"
//                       />
//                     </Form.Group>

//                     {/* Branch & Department */}
//                     <Row>
//                       <Col md={6}>
//                         <Form.Group className="mb-3">
//                           <Form.Label className="fw-bold">
//                             Select Site <span className="text-danger">*</span>
//                           </Form.Label>
//                           <Form.Select
//                             name="branch_id"
//                             value={formData.branch_id}
//                             onChange={handleChange}
//                             required
//                             className="py-2"
//                           >
//                             <option value="">Select Site</option>
//                             {branches.map((branch) => (
//                               <option key={branch.id} value={branch.id}>
//                                 {branch.name}
//                               </option>
//                             ))}
//                           </Form.Select>
//                           <Form.Text className="text-muted">
//                             Create Site here.{" "}
//                             <Link
//                               to="/hrmsystemsetup/branch"
//                               className="text-success"
//                               onClick={handleSaveDraft}
//                               state={{ from: location.pathname }}
//                             >
//                               Create Site
//                             </Link>
//                           </Form.Text>
//                         </Form.Group>
//                       </Col>

//                       <Col md={6}>
//                         <Form.Group className="mb-3">
//                           <Form.Label className="fw-bold">
//                             Select Department{" "}
//                             <span className="text-danger">*</span>
//                           </Form.Label>
//                           <Form.Select
//                             name="department_id"
//                             value={formData.department_id}
//                             onChange={handleChange}
//                             required
//                             disabled={!formData.branch_id}
//                             className="py-2"
//                           >
//                             <option value="">Select Department</option>
//                             {departments.map((dept) => (
//                               <option key={dept.id} value={dept.id}>
//                                 {dept.name}
//                               </option>
//                             ))}
//                           </Form.Select>
//                           <Form.Text className="text-muted">
//                             Create department here.{" "}
//                             <Link
//                               to="/hrmsystemsetup/department"
//                               className="text-success"
//                               onClick={handleSaveDraft}
//                               state={{ from: location.pathname }}
//                             >
//                               Create department
//                             </Link>
//                           </Form.Text>
//                         </Form.Group>
//                       </Col>
//                     </Row>

//                     {/* Designation & DOJ */}
//                     <Row>
//                       <Col md={6}>
//                         <Form.Group className="mb-3">
//                           <Form.Label className="fw-bold">
//                             Select Designation{" "}
//                             <span className="text-danger">*</span>
//                           </Form.Label>
//                           <Form.Select
//                             name="designation_id"
//                             value={formData.designation_id}
//                             onChange={handleChange}
//                             required
//                             disabled={!formData.department_id}
//                             className="py-2"
//                           >
//                             <option value="">Select Designation</option>
//                             {designations.map((designation) => (
//                               <option
//                                 key={designation.id}
//                                 value={designation.id}
//                               >
//                                 {designation.name}
//                               </option>
//                             ))}
//                           </Form.Select>
//                           <Form.Text className="text-muted">
//                             Create designation here.{" "}
//                             <Link
//                               to="/hrmsystemsetup/designation"
//                               className="text-success"
//                               state={{ from: location.pathname }}
//                               onClick={handleSaveDraft}
//                             >
//                               Create designation
//                             </Link>
//                           </Form.Text>
//                         </Form.Group>
//                       </Col>

//                       <Col md={6}>
//                         <Form.Group className="mb-3">
//                           <Form.Label className="fw-bold">
//                             Company Date Of Joining{" "}
//                             <span className="text-danger">*</span>
//                           </Form.Label>
//                           <Form.Control
//                             type="date"
//                             name="company_doj"
//                             value={formData.company_doj}
//                             onChange={handleChange}
//                             max="9999-12-31"
//                             required
//                             className="py-2"
//                           />
//                         </Form.Group>
//                       </Col>
//                     </Row>

//                     {/* Skills - Added to Company Details */}
//                     <Row>
//                       <Col md={12}>
//                         <Form.Group className="mb-3">
//                           <Form.Label className="fw-bold">Skills</Form.Label>
//                           <Form.Select
//                             name="skills"
//                             value={formData.skills}
//                             onChange={handleChange}
//                             className="py-2"
//                           >
//                             <option value="select skills">Select skills</option>

//                             <option value="Unskills">Unskills</option>
//                             <option value="Semi Skills">Semi Skills</option>
//                             <option value="Skills">Skills</option>
//                             <option value="High Skills">High Skills</option>
//                           </Form.Select>
//                         </Form.Group>
//                       </Col>
//                     </Row>
//                   </Card.Body>
//                 </Card>
//               </Col>
//             </Row>

//             {/* Second Row - Document and Bank Details (No changes needed) */}
//             <Row>
//               {/* Document Card */}
//               <Col md={6}>
//                 <Card
//                   className="border-0 shadow-sm"
//                   style={{ minHeight: "340px" }}
//                 >
//                   <Card.Body
//                     style={{
//                       maxHeight: "310px",
//                       overflowY: "auto",
//                       scrollbarWidth: "thin",
//                     }}
//                   >
//                     <Card.Title className="mb-4 text-primary">
//                       Documents
//                     </Card.Title>

//                     {requiredDocs.length === 0 ? (
//                       <Alert variant="info">No documents required</Alert>
//                     ) : (
//                       <div className="d-flex flex-column gap-3">
//                         {requiredDocs.map((doc) => (
//                           <div key={doc.id} className="border-bottom pb-3">
//                             <div className="d-flex align-items-start gap-3">
//                               <div
//                                 className="flex-shrink-0"
//                                 style={{ width: "120px" }}
//                               >
//                                 <span className="fw-semibold text-dark">
//                                   {doc.name}{" "}
//                                   <span className="text-danger">*</span>
//                                 </span>
//                               </div>

//                               <div className="flex-grow-1">
//                                 <Form.Group>
//                                   <div className="d-flex align-items-center gap-2">
//                                     <Form.Control
//                                       type="file"
//                                       className="d-none"
//                                       id={`document-${doc.id}`}
//                                       onChange={(e) =>
//                                         handleDocFileChange(doc.id, e)
//                                       }
//                                       accept=".jpg,.jpeg,.png,.pdf"
//                                       required
//                                     />

//                                     <label
//                                       htmlFor={`document-${doc.id}`}
//                                       className="btn btn-outline-success flex-grow-1 text-start py-2"
//                                       style={{ minWidth: "100px" }}
//                                     >
//                                       <i className="bi bi-cloud-arrow-up me-2"></i>
//                                       Choose file
//                                     </label>

//                                     {docPreviews[doc.id] && (
//                                       <div className="d-flex align-items-center ms-3">
//                                         {typeof docPreviews[doc.id] ===
//                                           "string" &&
//                                         docPreviews[doc.id].startsWith(
//                                           "blob:"
//                                         ) ? (
//                                           <>
//                                             <Image
//                                               src={docPreviews[doc.id]}
//                                               alt="Preview"
//                                               width={40}
//                                               height={40}
//                                               className="rounded me-2 border"
//                                             />
//                                             <span className="text-success small me-2">
//                                               <i className="bi bi-check-circle-fill me-1"></i>
//                                               Selected
//                                             </span>
//                                           </>
//                                         ) : (
//                                           <span className="text-success small me-2">
//                                             <i className="bi bi-check-circle-fill me-1"></i>
//                                             {docPreviews[doc.id].length > 15
//                                               ? `${docPreviews[
//                                                   doc.id
//                                                 ].substring(0, 15)}...`
//                                               : docPreviews[doc.id]}
//                                           </span>
//                                         )}
//                                         <Button
//                                           variant="link"
//                                           size="sm"
//                                           className="text-danger p-0"
//                                           onClick={() => {
//                                             const newPreviews = {
//                                               ...docPreviews,
//                                             };
//                                             const newFiles = { ...docFiles };
//                                             delete newPreviews[doc.id];
//                                             delete newFiles[doc.id];
//                                             setDocPreviews(newPreviews);
//                                             setDocFiles(newFiles);
//                                           }}
//                                           title="Remove file"
//                                         >
//                                           <i className="bi bi-x-lg"></i>
//                                         </Button>
//                                       </div>
//                                     )}
//                                   </div>
//                                 </Form.Group>
//                               </div>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </Card.Body>
//                 </Card>
//               </Col>

//               {/* Bank Details Card */}
//               <Col md={6}>
//                 <Card
//                   className="border-0 shadow-sm"
//                   style={{ minHeight: "340px" }}
//                 >
//                   <Card.Body>
//                     <h5 className="mb-3 text-primary">Bank Account Detail</h5>

//                     <Row>
//                       <Col md={6}>
//                         <Form.Group className="mb-3">
//                           <Form.Label className="fw-bold">
//                             Account Holder Name
//                             <span className="text-danger">*</span>
//                           </Form.Label>
//                           <Form.Control
//                             type="text"
//                             name="account_holder_name"
//                             value={formData.account_holder_name}
//                             onChange={handleChange}
//                             placeholder="Enter account holder name"
//                             className="py-2"
//                             required
//                           />
//                         </Form.Group>
//                       </Col>
//                       <Col md={6}>
//                         <Form.Group className="mb-3">
//                           <Form.Label className="fw-bold">
//                             Account Number<span className="text-danger">*</span>
//                           </Form.Label>
//                           <Form.Control
//                             type="text"
//                             name="account_number"
//                             value={formData.account_number}
//                             onChange={handleChange}
//                             placeholder="Enter account number"
//                             className="py-2"
//                             required
//                           />
//                         </Form.Group>
//                       </Col>
//                     </Row>

//                     <Row>
//                       <Col md={6}>
//                         <Form.Group className="mb-3">
//                           <Form.Label className="fw-bold">
//                             Bank Name<span className="text-danger">*</span>
//                           </Form.Label>
//                           <Form.Control
//                             type="text"
//                             name="bank_name"
//                             value={formData.bank_name}
//                             onChange={handleChange}
//                             placeholder="Enter bank name"
//                             className="py-2"
//                             required
//                           />
//                         </Form.Group>
//                       </Col>
//                       <Col md={6}>
//                         <Form.Group className="mb-3">
//                           <Form.Label className="fw-bold">
//                             Bank Identifier Code
//                             <span className="text-danger">*</span>
//                           </Form.Label>
//                           <Form.Control
//                             type="text"
//                             name="bank_identifier_code"
//                             value={formData.bank_identifier_code}
//                             onChange={handleChange}
//                             placeholder="Enter bank identifier code"
//                             className="py-2"
//                             required
//                           />
//                         </Form.Group>
//                       </Col>
//                     </Row>

//                     <Row>
//                       <Col md={6}>
//                         <Form.Group className="mb-3">
//                           <Form.Label className="fw-bold">
//                             Bank Branch Location
//                             <span className="text-danger">*</span>
//                           </Form.Label>
//                           <Form.Control
//                             type="text"
//                             name="branch_location"
//                             value={formData.branch_location}
//                             onChange={handleChange}
//                             placeholder="Enter bank branch location"
//                             className="py-2"
//                           />
//                         </Form.Group>
//                       </Col>
//                       <Col md={6}>
//                         <Form.Group className="mb-0">
//                           <Form.Label className="fw-bold">
//                             Tax Payer ID<span className="text-danger">*</span>
//                           </Form.Label>
//                           <Form.Control
//                             type="text"
//                             name="tax_payer_id"
//                             value={formData.tax_payer_id}
//                             onChange={handleChange}
//                             placeholder="Enter tax payer id"
//                             className="py-2"
//                           />
//                         </Form.Group>
//                       </Col>
//                     </Row>
//                   </Card.Body>
//                 </Card>
//               </Col>
//             </Row>

//             <div className="d-flex justify-content-end gap-3 mt-4">
//               <Button
//                 variant="secondary"
//                 onClick={() => navigate("/employees")}
//                 disabled={loading}
//                 className="px-4 py-2"
//               >
//                 Cancel
//               </Button>
//               <Button
//                 variant="success"
//                 type="submit"
//                 disabled={loading}
//                 className="px-4 py-2"
//               >
//                 {loading ? (
//                   <>
//                     <Spinner animation="border" size="sm" className="me-2" />
//                     Creating...
//                   </>
//                 ) : (
//                   "Create Employee"
//                 )}
//               </Button>
//             </div>
//           </Form>
//         </div>
//       </div>
//     </div>
//   );

//   // UPDATED: Aadhaar exists modal with rejoin functionality
//   const AadhaarExistsModal = () => {
//     const [rejoinReason, setRejoinReason] = React.useState("");

//     const handleRejoinSubmit = () => {
//       handleRejoin(rejoinReason);
//     };

//     return (
//       <Modal show={showAadhaarModal} onHide={() => setShowAadhaarModal(false)}>
//         <Modal.Header closeButton>
//           <Modal.Title>Employee Already Exists - Rejoin Option</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           <Alert variant="warning">
//             <strong>Aadhaar Number: {aadhaarNumber}</strong> is already
//             registered in our system.
//           </Alert>

//           {existingEmployeeData && (
//             <div className="mb-3">
//               <h6>Employee Details:</h6>
//               <div className="row">
//                 <div className="col-6">
//                   <strong>Name:</strong> {existingEmployeeData.name}
//                 </div>
//                 <div className="col-6">
//                   <strong>Employee ID:</strong>{" "}
//                   {existingEmployeeData.employee_id || "N/A"}
//                 </div>
//               </div>
//               {existingEmployeeData.branch && (
//                 <div className="row mt-2">
//                   <div className="col-12">
//                     <strong>Site:</strong> {existingEmployeeData.branch.name}
//                   </div>
//                 </div>
//               )}
//               {/* <div className="row mt-2">
//                 <div className="col-12">
//                   <strong>Current Status:</strong>{" "}
//                   <Badge
//                     bg={existingEmployeeData.is_active ? "success" : "warning"}
//                   >
//                     {existingEmployeeData.is_active ? "Active" : "Inactive"}
//                   </Badge>
//                 </div>
//               </div> */}
//             </div>
//           )}

//           {/* <p className="text-info mb-3">
//             <strong>
//               You can rejoin this employee instead of creating a new one.
//             </strong>
//           </p> */}

//           <Form.Group>
//             <Form.Label className="fw-bold">
//               Reason for Rejoin <span className="text-danger">*</span>
//             </Form.Label>
//             <Form.Control
//               as="textarea"
//               rows={3}
//               value={rejoinReason}
//               onChange={(e) => setRejoinReason(e.target.value)}
//               placeholder="Please provide the reason for rejoin (e.g., Returning after studies, Medical leave completion, etc.)"
//               required
//             />
//             <Form.Text className="text-muted">
//               This reason will be recorded in the employee's record.
//             </Form.Text>
//           </Form.Group>
//         </Modal.Body>
//         <Modal.Footer>
//           <Button
//             variant="secondary"
//             onClick={() => setShowAadhaarModal(false)}
//           >
//             Cancel
//           </Button>
//           <Button
//             variant="success"
//             onClick={handleRejoinSubmit}
//             disabled={!rejoinReason.trim() || rejoiningEmployee}
//           >
//             {rejoiningEmployee ? (
//               <>
//                 <Spinner animation="border" size="sm" className="me-2" />
//                 Rejoining...
//               </>
//             ) : (
//               "Rejoin Employee"
//             )}
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     );
//   };

//   // ADDED DRAFTS MODAL
//   const DraftsModal = () => (
//     <Modal
//       show={showDraftsModal}
//       onHide={() => setShowDraftsModal(false)}
//       size="lg"
//     >
//       <Modal.Header closeButton>
//         <Modal.Title>Saved Drafts</Modal.Title>
//       </Modal.Header>
//       <Modal.Body>
//         {drafts.length === 0 ? (
//           <Alert variant="info">No saved drafts found.</Alert>
//         ) : (
//           <div className="list-group">
//             {drafts.map((draft) => (
//               <div key={draft.id} className="list-group-item">
//                 <div className="d-flex justify-content-between align-items-center">
//                   <div>
//                     <h6 className="mb-1">{draft.employee_name}</h6>
//                     <small className="text-muted">
//                       Saved: {new Date(draft.saved_at).toLocaleString()}
//                     </small>
//                     {draft.formData?.aadhaar_number && (
//                       <div>
//                         <small>Aadhaar: {draft.formData.aadhaar_number}</small>
//                       </div>
//                     )}
//                   </div>
//                   <div className="d-flex gap-2">
//                     <Button
//                       variant="outline-success"
//                       size="sm"
//                       onClick={() => {
//                         loadDraft(draft.id);
//                         setShowDraftsModal(false);
//                       }}
//                     >
//                       Load
//                     </Button>
//                     <Button
//                       variant="outline-danger"
//                       size="sm"
//                       onClick={() => deleteDraft(draft.id)}
//                     >
//                       Delete
//                     </Button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </Modal.Body>
//       <Modal.Footer>
//         <Button variant="secondary" onClick={() => setShowDraftsModal(false)}>
//           Close
//         </Button>
//         <Button variant="primary" onClick={startNewForm}>
//           Start New Form
//         </Button>
//       </Modal.Footer>
//     </Modal>
//   );

//   return (
//     <>
//       {currentStep === 1 ? renderAadhaarStep() : renderEmployeeForm()}
//       <AadhaarExistsModal />
//       <DraftsModal />
//     </>
//   );
// };

// export default EmployeeCreate;

import React, { useState, useEffect } from "react";
import {
  Form,
  Button,
  Card,
  Row,
  Col,
  Badge,
  Alert,
  Spinner,
  Image,
  Modal,
  InputGroup,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

import {
  createEmployee,
  getEmployees,
  getBranches,
  getRequiredDocuments,
  checkAadhaar,
  rejoinEmployee,
} from "../../../services/hrmService";
import branchService from "../../../services/branchService";
import departmentService from "../../../services/departmentService";
import designationService from "../../../services/designationService";
import skillService from "../../../services/skillService";

import "./EmployeeForm.css";
import { toast } from "react-toastify";

// Constants for localStorage keys
const EMPLOYEE_DRAFTS_KEY = "employee_drafts";
const CURRENT_DRAFT_KEY = "current_employee_draft";

const EmployeeCreate = () => {
  const navigate = useNavigate();

  // Step states
  const [currentStep, setCurrentStep] = useState(1);
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [aadhaarExists, setAadhaarExists] = useState(false);
  const [checkingAadhaar, setCheckingAadhaar] = useState(false);
  const [existingEmployeeData, setExistingEmployeeData] = useState(null);
  const [allEmployees, setAllEmployees] = useState([]);
  const [showAadhaarModal, setShowAadhaarModal] = useState(false);
  const [showDraftsModal, setShowDraftsModal] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [rejoiningEmployee, setRejoiningEmployee] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userBranch, setUserBranch] = useState(null);
  const [skillsList, setSkillsList] = useState([]);

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    dob: "",
    gender: "Male",
    email: "",
    password: "",
    address: "",
    branch_id: "",
    department_id: "",
    designation_id: "",
    company_doj: "",
    account_holder_name: "",
    account_number: "",
    bank_name: "",
    bank_identifier_code: "",
    branch_location: "",
    tax_payer_id: "",
    aadhaar_number: "",
    uan_number: "",
    ip_number: "",
    father_name: "",
    skill_id: "",

    gatepassno: "",
  });

  const [phoneNumber, setPhoneNumber] = useState("");
  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [requiredDocs, setRequiredDocs] = useState([]);
  const [docFiles, setDocFiles] = useState({});
  const [docPreviews, setDocPreviews] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nextEmployeeId, setNextEmployeeId] = useState("#EMP00000");
  const [currentDraftId, setCurrentDraftId] = useState(null);
  const [drafts, setDrafts] = useState([]);

  // Check if current user is a branch manager
  const isBranchManager =
    userRole === "Branch Manager" || userRole === "Branch Manager ";

  // Load user info and set branch for branch manager
  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const userData = localStorage.getItem("user");

        if (userData) {
          const user = JSON.parse(userData);
          console.log("🔍 User Data from localStorage:", user);

          // Set user role
          setUserRole(user.type);

          // For Branch Manager, use the first branch as their branch
          if (
            user.type === "Branch Manager" ||
            user.type === "Branch Manager "
          ) {
            try {
              // Fetch branches and use the first one as the branch manager's branch
              const branchesRes = await getBranches();
              if (branchesRes && branchesRes.length > 0) {
                const firstBranch = branchesRes[0];
                setUserBranch({
                  id: firstBranch.id,
                  name: firstBranch.name,
                });

                // Auto-set the branch in form data
                setFormData((prev) => ({
                  ...prev,
                  branch_id: firstBranch.id,
                }));

                console.log("🟢 Branch Manager assigned to:", firstBranch.name);
              }
            } catch (branchError) {
              console.error("Error fetching branches:", branchError);
            }
          }
        }
      } catch (error) {
        console.error("Error getting user info:", error);
      }
    };

    getUserInfo();
  }, []);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const list = await skillService.getAll();
        console.log("🟢 Loaded skills for employee form:", list);
        setSkillsList(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Failed to load skills:", err);
      }
    };

    fetchSkills();
  }, []);

  // Load drafts from localStorage
  const loadDrafts = () => {
    try {
      const savedDrafts = localStorage.getItem(EMPLOYEE_DRAFTS_KEY);
      if (savedDrafts) {
        setDrafts(JSON.parse(savedDrafts));
      }
    } catch (error) {
      console.error("Error loading drafts:", error);
    }
  };

  // Save draft to localStorage
  const saveDraftToStorage = (draftData, draftId = null) => {
    try {
      const draftToSave = {
        id: draftId || `draft_${Date.now()}`,
        ...draftData,
        saved_at: new Date().toISOString(),
        employee_name: draftData.formData?.name || "Unnamed Employee",
      };

      let allDrafts = [];
      const existingDrafts = localStorage.getItem(EMPLOYEE_DRAFTS_KEY);

      if (existingDrafts) {
        allDrafts = JSON.parse(existingDrafts);

        // Update existing draft or add new one
        const existingIndex = allDrafts.findIndex(
          (draft) => draft.id === draftToSave.id
        );
        if (existingIndex !== -1) {
          allDrafts[existingIndex] = draftToSave;
        } else {
          allDrafts.push(draftToSave);
        }
      } else {
        allDrafts = [draftToSave];
      }

      localStorage.setItem(EMPLOYEE_DRAFTS_KEY, JSON.stringify(allDrafts));
      localStorage.setItem(CURRENT_DRAFT_KEY, JSON.stringify(draftToSave));

      return draftToSave.id;
    } catch (error) {
      console.error("Error saving draft:", error);
      throw error;
    }
  };

  // Load specific draft
  // const loadDraft = (draftId) => {
  //   try {
  //     const allDrafts = JSON.parse(
  //       localStorage.getItem(EMPLOYEE_DRAFTS_KEY) || "[]"
  //     );
  //     const draft = allDrafts.find((d) => d.id === draftId);

  //     if (draft) {
  //       setFormData(draft.formData || {});
  //       setPhoneNumber(draft.phoneNumber || "");
  //       setAadhaarNumber(draft.aadhaarNumber || "");
  //       setDocFiles(draft.docFiles || {});
  //       setDocPreviews(draft.docPreviews || {});
  //       setCurrentDraftId(draft.id);
  //       setCurrentStep(draft.currentStep || 2);

  //       toast.success(`Draft "${draft.employee_name}" loaded successfully!`);
  //       return true;
  //     }
  //     return false;
  //   } catch (error) {
  //     console.error("Error loading draft:", error);
  //     toast.error("Failed to load draft");
  //     return false;
  //   }
  // };

  const loadDraft = (draftId) => {
    try {
      const allDrafts = JSON.parse(
        localStorage.getItem(EMPLOYEE_DRAFTS_KEY) || "[]"
      );

      const draft = allDrafts.find((d) => d.id === draftId);
      if (!draft) return false;

      const fd = { ...(draft.formData || {}) };

      // 🔥 REMOVE LEGACY POISON FIELD
      delete fd.skills;

      setFormData({
        ...fd,
        skill_id: fd.skill_id ? String(fd.skill_id) : "",
      });

      setPhoneNumber(draft.phoneNumber || "");
      setAadhaarNumber(draft.aadhaarNumber || "");
      setDocFiles(draft.docFiles || {});
      setDocPreviews(draft.docPreviews || {});
      setCurrentDraftId(draft.id);
      setCurrentStep(draft.currentStep || 2);

      toast.success(`Draft "${draft.employee_name}" loaded successfully!`);
      return true;
    } catch (err) {
      console.error("Draft load failed:", err);
      toast.error("Failed to load draft");
      return false;
    }
  };

  // Delete draft
  const deleteDraft = (draftId) => {
    try {
      const allDrafts = JSON.parse(
        localStorage.getItem(EMPLOYEE_DRAFTS_KEY) || "[]"
      );
      const updatedDrafts = allDrafts.filter((draft) => draft.id !== draftId);

      localStorage.setItem(EMPLOYEE_DRAFTS_KEY, JSON.stringify(updatedDrafts));
      setDrafts(updatedDrafts);

      if (currentDraftId === draftId) {
        setCurrentDraftId(null);
        localStorage.removeItem(CURRENT_DRAFT_KEY);
      }

      toast.success("Draft deleted successfully!");
    } catch (error) {
      console.error("Error deleting draft:", error);
      toast.error("Failed to delete draft");
    }
  };

  // Save Draft Function
  const handleSaveDraft = () => {
    try {
      setSavingDraft(true);

      // const draftData = {
      //   formData,
      //   phoneNumber,
      //   aadhaarNumber,
      //   docFiles,
      //   docPreviews,
      //   currentStep,
      //   lastSaved: new Date().toISOString(),
      // };

      const cleanedFormData = { ...formData };
      delete cleanedFormData.skills;

      const draftData = {
        formData: cleanedFormData,
        phoneNumber,
        aadhaarNumber,
        docFiles,
        docPreviews,
        currentStep,
        lastSaved: new Date().toISOString(),
      };

      const draftId = saveDraftToStorage(draftData, currentDraftId);
      setCurrentDraftId(draftId);
      loadDrafts(); // Refresh drafts list

      toast.success("Draft saved successfully!");
    } catch (error) {
      console.error("Error saving draft:", error);
      toast.error("Failed to save draft");
    } finally {
      setSavingDraft(false);
    }
  };

  // Auto-load current draft on component mount
  useEffect(() => {
    loadDrafts();

    // Check if there's a current draft
    // const currentDraft = localStorage.getItem(CURRENT_DRAFT_KEY);
    // if (currentDraft) {
    //   const draft = JSON.parse(currentDraft);
    //   loadDraft(draft.id);
    // }
    const currentDraft = localStorage.getItem(CURRENT_DRAFT_KEY);
    if (currentDraft) {
      const draft = JSON.parse(currentDraft);

      if (draft.formData?.skills) {
        // ❌ legacy corrupted draft
        localStorage.removeItem(CURRENT_DRAFT_KEY);
      } else {
        loadDraft(draft.id);
      }
    }
  }, []);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [branchesRes, employeesRes, docsRes] = await Promise.all([
          getBranches(),
          getEmployees(),
          getRequiredDocuments(),
        ]);

        setBranches(branchesRes || []);
        setRequiredDocs(docsRes || []);
        setAllEmployees(employeesRes || []);

        let maxId = 0;
        if (employeesRes && employeesRes.length > 0) {
          employeesRes.forEach((emp) => {
            const idNum = emp.employee_id
              ? parseInt(emp.employee_id.replace(/\D/g, ""))
              : 0;
            if (idNum > maxId) maxId = idNum;
          });
        }
        setNextEmployeeId(`#EMP${String(maxId + 1).padStart(5, "0")}`);
      } catch (err) {
        console.error("Error fetching initial data:", err);
        setError("Failed to load initial data");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Fetch departments when branch changes
  useEffect(() => {
    const fetchDepartments = async () => {
      if (!formData.branch_id) {
        setDepartments([]);
        setFormData((prev) => ({
          ...prev,
          department_id: "",
          designation_id: "",
        }));
        return;
      }
      try {
        const depts = await departmentService.getByBranch(formData.branch_id);
        setDepartments(depts);
        setFormData((prev) => ({
          ...prev,
          department_id: "",
          designation_id: "",
        }));
      } catch (err) {
        console.error("Error fetching departments:", err);
        setError("Failed to load departments");
      }
    };
    fetchDepartments();
  }, [formData.branch_id]);

  // Fetch designations when department changes
  useEffect(() => {
    const fetchDesignations = async () => {
      if (!formData.department_id) {
        setDesignations([]);
        setFormData((prev) => ({ ...prev, designation_id: "" }));
        return;
      }

      try {
        const desigs = await designationService.getByDepartment(
          formData.department_id
        );
        setDesignations(Array.isArray(desigs) ? desigs : []);
        setFormData((prev) => ({ ...prev, designation_id: "" }));
      } catch (err) {
        console.error("Error fetching designations:", err);
        setError("Failed to load designations");
      }
    };

    fetchDesignations();
  }, [formData.department_id]);

  // Handle phone number input
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 10) {
      setPhoneNumber(value);
    }
  };

  // Handle UAN number input (12 digits only)
  const handleUanChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 12) {
      setFormData((prev) => ({ ...prev, uan_number: value }));
    }
  };

  // Handle IP number input (10 digits only)
  const handleIpChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 10) {
      setFormData((prev) => ({ ...prev, ip_number: value }));
    }
  };

  // Get the full phone number with +91 prefix
  const getFullPhoneNumber = () => {
    return `+91${phoneNumber}`;
  };

  // Server-side Aadhaar validation with draft check
  const handleCheckAadhaar = async () => {
    if (!aadhaarNumber || aadhaarNumber.length !== 12) {
      toast.error("Please enter a valid 12-digit Aadhaar number");
      return;
    }

    // Check if this Aadhaar exists in drafts first
    try {
      const allDrafts = JSON.parse(
        localStorage.getItem(EMPLOYEE_DRAFTS_KEY) || "[]"
      );
      const matchingDraft = allDrafts.find(
        (draft) => draft.formData?.aadhaar_number === aadhaarNumber
      );

      if (matchingDraft) {
        // Automatically load the draft without asking
        loadDraft(matchingDraft.id);
        return; // Exit early - don't check on server
      }
    } catch (error) {
      console.error("Error checking drafts:", error);
      // Continue with server check if draft check fails
    }

    // Original server-side Aadhaar check
    setCheckingAadhaar(true);
    setError(null);

    try {
      console.log("🔍 Checking Aadhaar on server:", aadhaarNumber);
      const response = await checkAadhaar({ aadhaar_number: aadhaarNumber });
      console.log("📋 Server Aadhaar check response:", response);

      if (response.success) {
        if (response.exists) {
          setAadhaarExists(true);
          setExistingEmployeeData(response.data);
          setShowAadhaarModal(true);
          toast.error(
            `Aadhaar already exists! Employee: ${
              response.data.name
            } in branch: ${response.data.branch?.name || "N/A"}`,
            {
              style: {
                width: "400px",
                padding: "30px 15px",
              },
            }
          );
        } else {
          setAadhaarExists(false);
          setExistingEmployeeData(null);
          setFormData((prev) => ({ ...prev, aadhaar_number: aadhaarNumber }));
          setCurrentStep(2);
          toast.success("Aadhaar verified! Please fill employee details.");
        }
      } else {
        throw new Error(response.message || "Aadhaar check failed");
      }
    } catch (err) {
      console.error("❌ Error in server Aadhaar check:", err);
      let errorMessage = "Aadhaar verification failed";
      if (err.response?.data) {
        errorMessage = err.response.data.message || errorMessage;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      toast.error(errorMessage);

      const shouldProceed = window.confirm(
        `${errorMessage}. Do you want to proceed with employee creation anyway?`
      );

      if (shouldProceed) {
        setFormData((prev) => ({ ...prev, aadhaar_number: aadhaarNumber }));
        setCurrentStep(2);
        toast.warning("Proceeding without Aadhaar verification");
      }
    } finally {
      setCheckingAadhaar(false);
    }
  };

  // Handle Employee Rejoin Function
  const handleRejoinEmployee = async (rejoinReason) => {
    if (!rejoinReason || !rejoinReason.trim()) {
      toast.error("Please provide a reason for rejoin");
      return;
    }

    setRejoiningEmployee(true);
    setShowAadhaarModal(false);
    try {
      const response = await rejoinEmployee({
        aadhaar_number: aadhaarNumber,
        rejoin_reason: rejoinReason.trim(),
      });

      if (response.success) {
        toast.success(response.message || "Employee rejoined successfully!", {
          style: {
            width: "400px",
            padding: "30px 15px",
          },
        });

        // Navigate to employee edit page after successful rejoin
        if (response.data && response.data.employee_id) {
          navigate(`/employees/edit/${response.data.employee_id}`, {
            state: {
              success: response.message || "Employee rejoined successfully!",
              rejoinedEmployee: response.data,
              timestamp: new Date().toISOString(),
            },
          });
        } else {
          navigate("/employees");
        }
      } else {
        throw new Error(response.message || "Rejoin failed");
      }
    } catch (err) {
      console.error("❌ Error in rejoin employee:", err);
      let errorMessage = "Failed to rejoin employee";
      if (err.response?.data) {
        errorMessage = err.response.data.message || errorMessage;
      } else if (err.message) {
        errorMessage = err.message;
      }

      toast.error(errorMessage);
      setRejoiningEmployee(false);
    } finally {
      setRejoiningEmployee(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDocFileChange = (docId, e) => {
    const file = e.target.files[0];
    if (file) {
      setDocFiles((prev) => ({ ...prev, [docId]: file }));

      if (file.type.startsWith("image/")) {
        setDocPreviews((prev) => ({
          ...prev,
          [docId]: URL.createObjectURL(file),
        }));
      } else {
        setDocPreviews((prev) => ({
          ...prev,
          [docId]: file.name,
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate phone number
    if (!phoneNumber || phoneNumber.length !== 10) {
      setError("Please enter a valid 10-digit phone number");
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();

      // Append all employee data to FormData
      // Object.entries(formData).forEach(([key, value]) => {
      //   if (value !== "") {
      //     formDataToSend.append(key, value);
      //   }
      // });
      Object.entries(formData).forEach(([key, value]) => {
        if (value === "") return;

        if (key === "skill_id") {
          formDataToSend.append("skill_id", Number(value));
        } else {
          formDataToSend.append(key, value);
        }
      });

      // Append phone number with +91 prefix
      formDataToSend.append("phone", getFullPhoneNumber());

      // Append document files if they exist
      Object.entries(docFiles).forEach(([docId, file]) => {
        formDataToSend.append(docId.toString(), file);
      });

      console.log("📤 Sending form data with Phone:", getFullPhoneNumber());

      const response = await createEmployee(formDataToSend);

      if (response.success) {
        // Delete draft after successful creation
        if (currentDraftId) {
          deleteDraft(currentDraftId);
        }

        toast.success("Employee created successfully!");
        navigate("/employees", {
          state: {
            success: `Employee ${response.data.employee_id} created successfully!`,
            employeeId: response.data.employee_id,
            timestamp: new Date().toISOString(),
          },
        });
      } else {
        throw new Error(response.message || "Employee creation failed");
      }
    } catch (err) {
      console.error("Submission error:", err);
      let errorMessage = "Failed to create employee";
      if (err.response?.data) {
        if (err.response.data.errors) {
          errorMessage = Object.values(err.response.data.errors)
            .flat()
            .join(", ");
        } else {
          errorMessage = err.response.data.message || "Server error occurred";
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const goBackToAadhaar = () => {
    setCurrentStep(1);
    setAadhaarNumber("");
    setAadhaarExists(false);
    setExistingEmployeeData(null);
    setError(null);

    // Clear form data
    setFormData({
      name: "",
      phone: "",
      dob: "",
      gender: "Male",
      email: "",
      password: "",
      address: "",
      branch_id: "",
      department_id: "",
      designation_id: "",
      company_doj: "",
      account_holder_name: "",
      account_number: "",
      bank_name: "",
      bank_identifier_code: "",
      branch_location: "",
      tax_payer_id: "",
      aadhaar_number: "",
      uan_number: "",
      ip_number: "",
      father_name: "",
      skill_id: "",
    });

    // Clear phone and document-related state
    setPhoneNumber("");
    setDocFiles({});
    setDocPreviews({});

    // Clear draft
    setCurrentDraftId(null);
    localStorage.removeItem(CURRENT_DRAFT_KEY);
  };

  // Handle Rejoin with API call
  const handleRejoin = (rejoinReason) => {
    handleRejoinEmployee(rejoinReason);
  };

  // Clear current draft and start fresh
  const startNewForm = () => {
    setShowDraftsModal(false);
    setFormData({
      name: "",
      phone: "",
      dob: "",
      gender: "",
      email: "",
      password: "",
      address: "",
      branch_id: "",
      department_id: "",
      designation_id: "",
      company_doj: "",
      account_holder_name: "",
      account_number: "",
      bank_name: "",
      bank_identifier_code: "",
      branch_location: "",
      tax_payer_id: "",
      aadhaar_number: "",
      uan_number: "",
      ip_number: "",
      father_name: "",
      // skills: "",
      skill_id: "",
    });
    setPhoneNumber("");
    setAadhaarNumber("");
    setDocFiles({});
    setDocPreviews({});
    setCurrentDraftId(null);
    setCurrentStep(1);
    localStorage.removeItem(CURRENT_DRAFT_KEY);
    toast.success("Started new employee form");
  };

  // Step 1: Aadhaar Check Form
  const renderAadhaarStep = () => (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <h2 className="text-primary">Create Employee</h2>
                <p className="text-muted">Start by verifying Aadhaar number</p>

                {/* Load Draft Button */}
                {drafts.length > 0 && (
                  <div className="mb-3">
                    <Button
                      variant="outline-primary"
                      onClick={() => setShowDraftsModal(true)}
                      size="sm"
                    >
                      <i className="bi bi-folder me-2"></i>
                      Load Saved Draft ({drafts.length})
                    </Button>
                  </div>
                )}
              </div>

              {error && (
                <Alert variant="danger" className="mb-4">
                  <strong>Error:</strong> {error}
                </Alert>
              )}

              <Form.Group className="mb-4">
                <Form.Label className="fw-bold fs-5">
                  Aadhaar Number <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  value={aadhaarNumber
                    .replace(/(\d{4})(?=\d)/g, "$1 - ")
                    .trim()}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, "");
                    if (value.length > 12) value = value.slice(0, 12);
                    setAadhaarNumber(value);
                  }}
                  placeholder="Enter 12-digit Aadhaar number"
                  className="py-3 fs-5 text-center"
                  style={{ fontSize: "1.3rem" }}
                  disabled={checkingAadhaar}
                />
                <Form.Text className="text-muted">
                  We'll check if this Aadhaar is already registered in our
                  system
                </Form.Text>
              </Form.Group>

              <div className="d-flex gap-2 justify-content-between">
                <Button
                  variant="secondary"
                  onClick={() => navigate("/employees")}
                  className="py-2 w-100"
                >
                  Back to Employees
                </Button>
                <Button
                  variant="success"
                  size="lg"
                  onClick={handleCheckAadhaar}
                  disabled={checkingAadhaar || aadhaarNumber.length !== 12}
                  className="py-3 w-100"
                >
                  {checkingAadhaar ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Checking Aadhaar...
                    </>
                  ) : (
                    "Verify Aadhaar & Continue"
                  )}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );

  // Step 2: Employee Creation Form
  const renderEmployeeForm = () => (
    <div className="container mt-4">
      <nav aria-label="breadcrumb" className="mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="mb-2">
              Create Employee
              {currentDraftId && (
                <Badge bg="warning" className="ms-2">
                  Draft
                </Badge>
              )}
            </h2>
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <Link to="/" className="text-success">
                  Home
                </Link>
              </li>
              <li className="breadcrumb-item">
                <Link to="/employees" className="text-success">
                  Employee
                </Link>
              </li>
              <li
                className="breadcrumb-item active text-muted"
                aria-current="page"
              >
                Create Employee
              </li>
            </ol>
          </div>
          <div className="d-flex gap-2">
            {/* SAVE DRAFT BUTTON */}
            <Button
              variant="primary"
              onClick={handleSaveDraft}
              disabled={savingDraft}
            >
              {savingDraft ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Saving...
                </>
              ) : (
                "Save Draft"
              )}
            </Button>
            <Button variant="success" onClick={goBackToAadhaar}>
              Back
            </Button>
          </div>
        </div>
      </nav>

      {/* DRAFT INFO ALERT */}
      {currentDraftId && (
        <Alert variant="info" className="mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <i className="bi bi-info-circle me-2"></i>
              <strong>Working on draft:</strong> Your progress is automatically
              saved.
            </div>
            <Button
              variant="outline-info"
              size="sm"
              onClick={() => setShowDraftsModal(true)}
            >
              View All Drafts
            </Button>
          </div>
        </Alert>
      )}

      {/* Aadhaar Info Banner */}
      {formData.aadhaar_number && (
        <Alert variant={aadhaarExists ? "warning" : "success"} className="mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <strong>
                {aadhaarExists
                  ? "⚠️ Aadhaar Already Exists: "
                  : "✅ Aadhaar Verified: "}
                {formData.aadhaar_number}
              </strong>
              <Badge
                bg={aadhaarExists ? "warning" : "success"}
                className="ms-2"
              >
                {aadhaarExists ? "Duplicate" : "Verified"}
              </Badge>
            </div>
            {aadhaarExists && (
              <Button
                variant="outline-warning"
                size="sm"
                onClick={() => setShowAadhaarModal(true)}
              >
                View Details
              </Button>
            )}
          </div>
          {aadhaarExists && (
            <div className="mt-2">
              <small>
                This Aadhaar is already registered to{" "}
                <strong>{existingEmployeeData?.name}</strong>. Consider using a
                different number.
              </small>
            </div>
          )}
        </Alert>
      )}

      <div className="">
        <div className="p-2">
          {error && (
            <Alert variant="danger" className="mb-4">
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            {/* First Row - Personal Details and Company Details */}
            <Row className="mb-4">
              {/* Personal Details Card */}
              <Col md={6} className="mb-4 mb-md-0">
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body>
                    <h5 className="mb-3 text-primary">Personal Detail</h5>

                    {/* Name */}
                    <Row className="mb-3">
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label className="fw-bold">
                            Name <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter employee name"
                            required
                            className="py-2"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    {/* Phone + DOB */}
                    <Row className="mb-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="fw-bold">
                            Phone <span className="text-danger">*</span>
                          </Form.Label>
                          <InputGroup>
                            <InputGroup.Text className="bg-light border-end-0">
                              +91
                            </InputGroup.Text>
                            <Form.Control
                              type="tel"
                              value={phoneNumber}
                              onChange={handlePhoneChange}
                              placeholder="Enter 10-digit phone number"
                              required
                              maxLength={10}
                              className="border-start-0"
                            />
                          </InputGroup>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="fw-bold">
                            Date of Birth <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            type="date"
                            name="dob"
                            value={formData.dob}
                            onChange={handleChange}
                            max="9999-12-31"
                            required
                            className="py-2"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    {/* Father's Name + Gender */}
                    <Row className="mb-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="fw-bold">
                            Father's Name
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="father_name"
                            value={formData.father_name}
                            onChange={handleChange}
                            placeholder="Enter father's name"
                            className="py-2"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="fw-bold">
                            Gender <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            required
                            className="py-2"
                          >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>

                    {/* Email + Password */}
                    <Row className="mb-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="fw-bold">
                            Email <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="company@example.com"
                            required
                            className="py-2"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="fw-bold">
                            Password <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter password"
                            required
                            minLength={6}
                            className="py-2"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    {/* UAN + IP Number */}
                    <Row className="mb-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="fw-bold">
                            UAN Number
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="uan_number"
                            value={formData.uan_number}
                            onChange={handleUanChange}
                            placeholder="12-digit UAN number"
                            maxLength={12}
                            className="py-2"
                            isInvalid={
                              formData.uan_number &&
                              formData.uan_number.length !== 12
                            }
                          />
                          {formData.uan_number &&
                            formData.uan_number.length !== 12 && (
                              <Form.Control.Feedback type="invalid">
                                UAN number must be exactly 12 digits
                              </Form.Control.Feedback>
                            )}
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="fw-bold">IP Number</Form.Label>
                          <Form.Control
                            type="text"
                            name="ip_number"
                            value={formData.ip_number}
                            onChange={handleIpChange}
                            placeholder="10-digit IP number"
                            maxLength={10}
                            className="py-2"
                            isInvalid={
                              formData.ip_number &&
                              formData.ip_number.length !== 10
                            }
                          />
                          {formData.ip_number &&
                            formData.ip_number.length !== 10 && (
                              <Form.Control.Feedback type="invalid">
                                IP number must be exactly 10 digits
                              </Form.Control.Feedback>
                            )}
                        </Form.Group>
                      </Col>
                    </Row>

                    {/* Aadhaar Number (Read-only) */}
                    <Row className="mb-3">
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label className="fw-bold">
                            Aadhaar Number<span className="text-danger">*</span>
                            <Badge
                              bg={aadhaarExists ? "warning" : "success"}
                              className="ms-2"
                            >
                              {aadhaarExists ? "Duplicate" : "Verified"}
                            </Badge>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            value={formData.aadhaar_number}
                            readOnly
                            className={`py-2 ${
                              aadhaarExists
                                ? "bg-warning-subtle"
                                : "bg-success-subtle"
                            }`}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    {/* Address */}
                    <Row>
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label className="fw-bold">
                            Address <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Enter employee address"
                            required
                            className="py-2"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>

              {/* Company Details Card */}
              <Col md={6}>
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body>
                    <h5 className="mb-3 text-primary">Company Detail</h5>

                    {/* Employee ID */}
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Employee ID</Form.Label>
                      <Form.Control
                        type="text"
                        value={nextEmployeeId}
                        readOnly
                        className="py-2 bg-light border-0"
                      />
                    </Form.Group>

                    {/* Branch & Department - UPDATED FOR BRANCH MANAGER */}
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold">
                            Site <span className="text-danger">*</span>
                            {isBranchManager && userBranch && (
                              <Badge bg="info" className="ms-2">
                                Your Site
                              </Badge>
                            )}
                          </Form.Label>

                          {isBranchManager && userBranch ? (
                            // For Branch Manager - Dynamic branch display
                            <div>
                              <Form.Control
                                type="text"
                                value={userBranch.name}
                                readOnly
                                className="py-2 bg-light border-success"
                                style={{ fontWeight: "bold" }}
                              />
                              <Form.Text className="text-success">
                                <i className="bi bi-check-circle me-1"></i>
                                Employees will be assigned to your branch
                                automatically
                              </Form.Text>
                              <input
                                type="hidden"
                                name="branch_id"
                                value={userBranch.id}
                              />
                            </div>
                          ) : (
                            // For Admin/Company - Dropdown
                            <>
                              <Form.Select
                                name="branch_id"
                                value={formData.branch_id}
                                onChange={handleChange}
                                required
                                className="py-2"
                              >
                                <option value="">Select Site</option>
                                {branches.map((branch) => (
                                  <option key={branch.id} value={branch.id}>
                                    {branch.name}
                                  </option>
                                ))}
                              </Form.Select>
                              <Form.Text className="text-muted">
                                Create Site here.{" "}
                                <Link
                                  to="/hrmsystemsetup/branch"
                                  className="text-success"
                                  onClick={handleSaveDraft}
                                  state={{ from: location.pathname }}
                                >
                                  Create Site
                                </Link>
                              </Form.Text>
                            </>
                          )}
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold">
                            Select Department{" "}
                            <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Select
                            name="department_id"
                            value={formData.department_id}
                            onChange={handleChange}
                            required
                            disabled={!formData.branch_id}
                            className="py-2"
                          >
                            <option value="">Select Department</option>
                            {departments.map((dept) => (
                              <option key={dept.id} value={dept.id}>
                                {dept.name}
                              </option>
                            ))}
                          </Form.Select>
                          <Form.Text className="text-muted">
                            Create department here.{" "}
                            <Link
                              to="/hrmsystemsetup/department"
                              className="text-success"
                              onClick={handleSaveDraft}
                              state={{ from: location.pathname }}
                            >
                              Create department
                            </Link>
                          </Form.Text>
                        </Form.Group>
                      </Col>
                    </Row>

                    {/* Designation & DOJ */}
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold">
                            Select Designation{" "}
                            <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Select
                            name="designation_id"
                            value={formData.designation_id}
                            onChange={handleChange}
                            required
                            disabled={!formData.department_id}
                            className="py-2"
                          >
                            <option value="">Select Designation</option>
                            {designations.map((designation) => (
                              <option
                                key={designation.id}
                                value={designation.id}
                              >
                                {designation.name}
                              </option>
                            ))}
                          </Form.Select>
                          <Form.Text className="text-muted">
                            Create designation here.{" "}
                            <Link
                              to="/hrmsystemsetup/designation"
                              className="text-success"
                              state={{ from: location.pathname }}
                              onClick={handleSaveDraft}
                            >
                              Create designation
                            </Link>
                          </Form.Text>
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold">
                            Company Date Of Joining{" "}
                            <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            type="date"
                            name="company_doj"
                            value={formData.company_doj}
                            onChange={handleChange}
                            max="9999-12-31"
                            required
                            className="py-2"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    {/* Skills */}
                    <Row>
                      <Col md={12}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold">Skills</Form.Label>
                          {/* <Form.Select
                            name="skills"
                            value={formData.skills}
                            onChange={handleChange}
                            className="py-2"
                          >
                            <option value="select skills">Select skills</option>
                            <option value="Unskills">Unskills</option>
                            <option value="Semi Skills">Semi Skills</option>
                            <option value="Skills">Skills</option>
                            <option value="High Skills">High Skills</option>
                          </Form.Select> */}

                          {/* <Form.Select
                            name="skill_id"
                            value={formData.skill_id}
                            onChange={handleChange}
                            className="py-2"
                          >
                            <option value="">Select skills</option>
                            {skillsList.map((skill) => (
                              <option key={skill.id} value={skill.id}>
                                {skill.name}
                              </option>
                            ))}
                          </Form.Select> */}

                          <Form.Select
                            name="skill_id"
                            value={formData.skill_id}
                            onChange={handleChange}
                          >
                            <option value="">Select skills</option>
                            {skillsList.map((skill) => (
                              <option key={skill.id} value={String(skill.id)}>
                                {skill.name}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>

                    {/* Gate Pass Number */}
                    <Row className="mb-3">
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label className="fw-bold">
                            Gate Pass Number
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="gatepassno"
                            value={formData.gatepassno}
                            onChange={handleChange}
                            placeholder="Enter gate pass number"
                            className="py-2"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Second Row - Document and Bank Details */}
            <Row>
              {/* Document Card */}
              <Col md={6}>
                <Card
                  className="border-0 shadow-sm"
                  style={{ minHeight: "340px" }}
                >
                  <Card.Body
                    style={{
                      maxHeight: "310px",
                      overflowY: "auto",
                      scrollbarWidth: "thin",
                    }}
                  >
                    <Card.Title className="mb-4 text-primary">
                      Documents
                    </Card.Title>

                    {requiredDocs.length === 0 ? (
                      <Alert variant="info">No documents required</Alert>
                    ) : (
                      <div className="d-flex flex-column gap-3">
                        {requiredDocs.map((doc) => (
                          <div key={doc.id} className="border-bottom pb-3">
                            <div className="d-flex align-items-start gap-3">
                              <div
                                className="flex-shrink-0"
                                style={{ width: "120px" }}
                              >
                                <span className="fw-semibold text-dark">
                                  {doc.name}{" "}
                                  <span className="text-danger">*</span>
                                </span>
                              </div>

                              <div className="flex-grow-1">
                                <Form.Group>
                                  <div className="d-flex align-items-center gap-2">
                                    <Form.Control
                                      type="file"
                                      className="d-none"
                                      id={`document-${doc.id}`}
                                      onChange={(e) =>
                                        handleDocFileChange(doc.id, e)
                                      }
                                      accept=".jpg,.jpeg,.png,.pdf"
                                      required
                                    />

                                    <label
                                      htmlFor={`document-${doc.id}`}
                                      className="btn btn-outline-success flex-grow-1 text-start py-2"
                                      style={{ minWidth: "100px" }}
                                    >
                                      <i className="bi bi-cloud-arrow-up me-2"></i>
                                      Choose file
                                    </label>

                                    {docPreviews[doc.id] && (
                                      <div className="d-flex align-items-center ms-3">
                                        {typeof docPreviews[doc.id] ===
                                          "string" &&
                                        docPreviews[doc.id].startsWith(
                                          "blob:"
                                        ) ? (
                                          <>
                                            <Image
                                              src={docPreviews[doc.id]}
                                              alt="Preview"
                                              width={40}
                                              height={40}
                                              className="rounded me-2 border"
                                            />
                                            <span className="text-success small me-2">
                                              <i className="bi bi-check-circle-fill me-1"></i>
                                              Selected
                                            </span>
                                          </>
                                        ) : (
                                          <span className="text-success small me-2">
                                            <i className="bi bi-check-circle-fill me-1"></i>
                                            {docPreviews[doc.id].length > 15
                                              ? `${docPreviews[
                                                  doc.id
                                                ].substring(0, 15)}...`
                                              : docPreviews[doc.id]}
                                          </span>
                                        )}
                                        <Button
                                          variant="link"
                                          size="sm"
                                          className="text-danger p-0"
                                          onClick={() => {
                                            const newPreviews = {
                                              ...docPreviews,
                                            };
                                            const newFiles = { ...docFiles };
                                            delete newPreviews[doc.id];
                                            delete newFiles[doc.id];
                                            setDocPreviews(newPreviews);
                                            setDocFiles(newFiles);
                                          }}
                                          title="Remove file"
                                        >
                                          <i className="bi bi-x-lg"></i>
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </Form.Group>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              {/* Bank Details Card */}
              <Col md={6}>
                <Card
                  className="border-0 shadow-sm"
                  style={{ minHeight: "340px" }}
                >
                  <Card.Body>
                    <h5 className="mb-3 text-primary">Bank Account Detail</h5>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold">
                            Account Holder Name
                            <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="account_holder_name"
                            value={formData.account_holder_name}
                            onChange={handleChange}
                            placeholder="Enter account holder name"
                            className="py-2"
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold">
                            Account Number<span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="account_number"
                            value={formData.account_number}
                            onChange={handleChange}
                            placeholder="Enter account number"
                            className="py-2"
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold">
                            Bank Name<span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="bank_name"
                            value={formData.bank_name}
                            onChange={handleChange}
                            placeholder="Enter bank name"
                            className="py-2"
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold">
                            Bank Identifier Code
                            <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="bank_identifier_code"
                            value={formData.bank_identifier_code}
                            onChange={handleChange}
                            placeholder="Enter bank identifier code"
                            className="py-2"
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-bold">
                            Bank Branch Location
                            <span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="branch_location"
                            value={formData.branch_location}
                            onChange={handleChange}
                            placeholder="Enter bank branch location"
                            className="py-2"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-0">
                          <Form.Label className="fw-bold">
                            Tax Payer ID<span className="text-danger">*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            name="tax_payer_id"
                            value={formData.tax_payer_id}
                            onChange={handleChange}
                            placeholder="Enter tax payer id"
                            className="py-2"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-3 mt-4">
              <Button
                variant="secondary"
                onClick={() => navigate("/employees")}
                disabled={loading}
                className="px-4 py-2"
              >
                Cancel
              </Button>
              <Button
                variant="success"
                type="submit"
                disabled={loading}
                className="px-4 py-2"
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Creating...
                  </>
                ) : (
                  "Create Employee"
                )}
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );

  // Aadhaar exists modal with rejoin functionality
  const AadhaarExistsModal = () => {
    const [rejoinReason, setRejoinReason] = React.useState("");

    const handleRejoinSubmit = () => {
      handleRejoin(rejoinReason);
    };

    return (
      <Modal show={showAadhaarModal} onHide={() => setShowAadhaarModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Employee Already Exists - Rejoin Option</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning">
            <strong>Aadhaar Number: {aadhaarNumber}</strong> is already
            registered in our system.
          </Alert>

          {existingEmployeeData && (
            <div className="mb-3">
              <h6>Employee Details:</h6>
              <div className="row">
                <div className="col-6">
                  <strong>Name:</strong> {existingEmployeeData.name}
                </div>
                <div className="col-6">
                  <strong>Employee ID:</strong>{" "}
                  {existingEmployeeData.employee_id || "N/A"}
                </div>
              </div>
              {existingEmployeeData.branch && (
                <div className="row mt-2">
                  <div className="col-12">
                    <strong>Site:</strong> {existingEmployeeData.branch.name}
                  </div>
                </div>
              )}
            </div>
          )}

          <Form.Group>
            <Form.Label className="fw-bold">
              Reason for Rejoin <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={rejoinReason}
              onChange={(e) => setRejoinReason(e.target.value)}
              placeholder="Please provide the reason for rejoin (e.g., Returning after studies, Medical leave completion, etc.)"
              required
            />
            <Form.Text className="text-muted">
              This reason will be recorded in the employee's record.
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowAadhaarModal(false)}
          >
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={handleRejoinSubmit}
            disabled={!rejoinReason.trim() || rejoiningEmployee}
          >
            {rejoiningEmployee ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Rejoining...
              </>
            ) : (
              "Rejoin Employee"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  // DRAFTS MODAL
  const DraftsModal = () => (
    <Modal
      show={showDraftsModal}
      onHide={() => setShowDraftsModal(false)}
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title>Saved Drafts</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {drafts.length === 0 ? (
          <Alert variant="info">No saved drafts found.</Alert>
        ) : (
          <div className="list-group">
            {drafts.map((draft) => (
              <div key={draft.id} className="list-group-item">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">{draft.employee_name}</h6>
                    <small className="text-muted">
                      Saved: {new Date(draft.saved_at).toLocaleString()}
                    </small>
                    {draft.formData?.aadhaar_number && (
                      <div>
                        <small>Aadhaar: {draft.formData.aadhaar_number}</small>
                      </div>
                    )}
                  </div>
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={() => {
                        loadDraft(draft.id);
                        setShowDraftsModal(false);
                      }}
                    >
                      Load
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => deleteDraft(draft.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowDraftsModal(false)}>
          Close
        </Button>
        <Button variant="primary" onClick={startNewForm}>
          Start New Form
        </Button>
      </Modal.Footer>
    </Modal>
  );

  return (
    <>
      {currentStep === 1 ? renderAadhaarStep() : renderEmployeeForm()}
      <AadhaarExistsModal />
      <DraftsModal />
    </>
  );
};

export default EmployeeCreate;
