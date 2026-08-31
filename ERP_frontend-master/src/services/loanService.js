// // services/loanService.js
// import apiClient from "./apiClient";

// // LOAN OPTIONS
// export const getLoanOptions = () => apiClient.get("/loan-options");
// export const createLoanOption = (data) => apiClient.post("/loan-options", data);
// export const updateLoanOption = (id, data) => apiClient.put(`/loan-options/${id}`, data);
// export const deleteLoanOption = (id) => apiClient.delete(`/loan-options/${id}`);

// // LOANS by EMPLOYEE
// export const getLoansByEmployee = (employeeId) => apiClient.get(`/loans/employee/${employeeId}`);
// export const createLoan = (data) => apiClient.post("/loans", data);
// export const updateLoan = (id, data) => apiClient.put(`/loans/${id}`, data);
// export const deleteLoan = (id) => apiClient.delete(`/loans/${id}`);



// // services/loanService.js
// import apiClient from "./apiClient";

// // LOAN OPTIONS - Fixed to handle response format
// export const getLoanOptions = () =>
//   apiClient.get("/loan-options").then(res => res.data);

// export const createLoanOption = (data) =>
//   apiClient.post("/loan-options", data).then(res => res.data);

// export const updateLoanOption = (id, data) =>
//   apiClient.put(`/loan-options/${id}`, data).then(res => res.data);

// export const deleteLoanOption = (id) =>
//   apiClient.delete(`/loan-options/${id}`).then(res => res.data);

// // LOANS by EMPLOYEE
// export const getLoansByEmployee = (employeeId) =>
//   apiClient.get(`/loans/employee/${employeeId}`).then(res => res.data);

// export const createLoan = (data) =>
//   apiClient.post("/loans", data).then(res => res.data);

// export const updateLoan = (id, data) =>
//   apiClient.put(`/loans/${id}`, data).then(res => res.data);

// export const deleteLoan = (id) =>
//   apiClient.delete(`/loans/${id}`).then(res => res.data);


// src/services/loanService.js
import apiClient from "./apiClient"; // your axios instance

// ✅ Get all loans (admin/company OR employee-specific auto-handled by backend)
const getAllLoans = async () => {
  const res = await apiClient.get("/loans");
  return res.data.data; // returns array of loans
};

// ✅ Get loans by specific employee ID
const getLoansByEmployee = async (employeeId) => {
  const res = await apiClient.get(`/loans/employee/${employeeId}`);
  return res.data.data; // returns array of loans for employee
};

// ✅ Create loan
const createLoan = async (loanData) => {
  const res = await apiClient.post("/loans", loanData);
  return res.data.data; // returns created loan object
};

// ✅ Update loan
const updateLoan = async (loanId, loanData) => {
  const res = await apiClient.put(`/loans/${loanId}`, loanData);
  return res.data.data; // returns updated loan object
};

// ✅ Delete loan
const deleteLoan = async (loanId) => {
  const res = await apiClient.delete(`/loans/${loanId}`);
  return res.data; // returns { success: true, message: "Loan deleted" }
};

const loanService = {
  getAllLoans,
  getLoansByEmployee,
  createLoan,
  updateLoan,
  deleteLoan,
};

export default loanService;
