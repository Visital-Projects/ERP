import apiClient from "./apiClient";
import * as XLSX from 'xlsx'; 

export const fetchUsers = async () => {
  const res = await apiClient.get("/users");
  return res.data.data;
};

export const getUserById = async (id) => {
  const res = await apiClient.get(`/users/${id}`);
  return res.data;
};

export const createUser = async (data) => {
  const res = await apiClient.post("/users/add", data);
  return res.data;
};

export const updateUser = async (id, data) => {
  const res = await apiClient.put(`/users/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const deleteUser = async (id) => {
  const res = await apiClient.delete(`/users/${id}`);
  return res.data;
};

export const resetUserPassword = async (id, newPassword) => {
  const res = await apiClient.post(`/users/${id}/reset-password`, {
    password: newPassword,
  });
  return res.data;
};

export const toggleUserLogin = async (id) => {
  const res = await apiClient.patch(`/users/${id}/toggle-login`);
  return res.data;
};

export const updateProfile = async (formData) => {
  const res = await apiClient.put("/profile", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const changePassword = async (id, data) => {
  const res = await apiClient.put(`/users/change-password/${id}`, data, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
};

export const fetchProfile = async () => {
  const res = await apiClient.get("/profile");
  return res.data;
};

// export const uploadUsersExcel = async (file) => {
//   const formData = new FormData();
//   // formData.append("excel", file); // 👈 must match multer field name

//   const res = await apiClient.post("excel/upload-excel", formData, {
//     headers: {
//       "Content-Type": "multipart/form-data",
//     },
//   });

//   return res.data;
// };

export const uploadUsersExcel = async (file) => {
  const formData = new FormData();
  formData.append("excel", file); // must match multer

  const res = await apiClient.post(
    "excel/upload-excel",
    formData
  );

  return res.data;
};



export const exportUsersExcel = async () => {
  try {
    const excelData = [
      {
        'Name': '',
        'Email': '',
        'Password': '',
        'DOB': '',
        'Gender': '',
        'Phone': '',
        'Address': '',
        'EmployeeID': '',
        'BiometricEmpID': '',
        'BranchName': '',
        'DepartmentName': '',
        'DesignationName': '',
        'CompanyDOJ': '',
        'Documents': '',
        'AccountHolderName': '',
        'AccountNumber': '',
        'BankName': '',
        'BankIdentifierCode': '',
        'BranchLocation': '',
        'TaxPayerID': '',
        // 'SalaryType': '',
        // 'Salary': '',
        'IsActive': '',
        // 'CreatedBy': '',
        // 'CreatedAt': '',
        // 'UpdatedAt': '',
        'AadhaarNumber': '',
        'EmployeeType': '',
        // 'DeletedAt': '',
        'RejoinReason': '',
        'UANNumber': '',
        'IPNumber': '',
        'FatherName': '',
        'Skills': '',        
        'GatePassNo': '',
      }
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    const colWidths = [
      { wch: 20 }, 
      { wch: 25 }, // Email
      { wch: 15 }, // Password
      { wch: 12 }, // DOB
      { wch: 10 }, // Gender
      { wch: 15 }, // Phone
      { wch: 30 }, // Address
      { wch: 15 }, // EmployeeID
      { wch: 15 }, // BiometricEmpID
      { wch: 32 }, // BranchID
      { wch: 20 }, // DepartmentID
      { wch: 20 }, // DesignationID
      { wch: 12 }, // CompanyDOJ
      { wch: 15 }, // Documents
      { wch: 20 }, // AccountHolderName
      { wch: 20 }, // AccountNumber
      { wch: 20 }, // BankName
      { wch: 15 }, // BankIdentifierCode
      { wch: 20 }, // BranchLocation
      { wch: 15 }, // TaxPayerID
      // { wch: 12 }, // SalaryType
      // { wch: 12 }, // Salary
      { wch: 10 }, // IsActive
      // { wch: 15 }, // CreatedBy
      // { wch: 15 }, // CreatedAt
      // { wch: 15 }, // UpdatedAt
      { wch: 15 }, // AadhaarNumber
      { wch: 15 }, // EmployeeType
      // { wch: 15 }, // DeletedAt
      { wch: 20 }, // RejoinReason
      { wch: 15 }, // UANNumber
      { wch: 15 }, // IPNumber
      { wch: 20 }, // FatherName
      { wch: 20 },  // Skills      
      { wch: 20 }, // GatePassNumber
    ];
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, "Employees");

    const instructions = [
      { 'Column': 'Name', 'Description': 'Full name of the employee', 'Required': 'Yes', 'Example': 'John Doe' },
      { 'Column': 'Email', 'Description': 'Email address', 'Required': 'Yes', 'Example': 'john@company.com' },
      { 'Column': 'Password', 'Description': 'Login password', 'Required': 'Yes', 'Example': 'password123' },
      { 'Column': 'DOB', 'Description': 'Date of Birth (YYYY-MM-DD)', 'Required': 'No', 'Example': '1990-01-15' },
      { 'Column': 'Gender', 'Description': 'Male/Female/Other', 'Required': 'No', 'Example': 'Male' },
      { 'Column': 'Phone', 'Description': 'Phone number', 'Required': 'No', 'Example': '+1234567890' },
      { 'Column': 'Address', 'Description': 'Complete address', 'Required': 'No', 'Example': '123 Main St, City' },
      { 'Column': 'EmployeeID', 'Description': 'Employee ID', 'Required': 'Yes', 'Example': 'EMP001' },
      { 'Column': 'BiometricEmpID', 'Description': 'Biometric ID', 'Required': 'No', 'Example': 'BIO001' },
{ 
  'Column': 'BranchName', 
  'Description': 'Branch Name (must exactly match existing branch name in system)', 
  'Required': 'No', 
  'Example': 'Bhubaneswar Plant' 
},
{ 
  'Column': 'DepartmentName', 
  'Description': 'Department Name (must exactly match existing department name)', 
  'Required': 'No', 
  'Example': 'Human Resources' 
},
{ 
  'Column': 'DesignationName', 
  'Description': 'Designation Name (must exactly match existing designation name)', 
  'Required': 'No', 
  'Example': 'HR Executive' 
},
      { 'Column': 'CompanyDOJ', 'Description': 'Date of Joining (YYYY-MM-DD)', 'Required': 'No', 'Example': '2023-01-01' },
      { 'Column': 'Salary', 'Description': 'Salary amount', 'Required': 'No', 'Example': '50000' },
      { 'Column': 'IsActive', 'Description': '1 for Active, 0 for Inactive', 'Required': 'No', 'Example': '1' },
      { 'Column': 'AadhaarNumber', 'Description': 'Aadhaar card number', 'Required': 'No', 'Example': '123456789012' },
      { 'Column': 'UANNumber', 'Description': 'UAN number', 'Required': 'No', 'Example': 'UAN123456' },
      { 'Column': 'FatherName', 'Description': "Father's name", 'Required': 'No', 'Example': 'Robert Doe' },
      { 'Column': 'Skills', 'Description': 'Skills (comma separated)', 'Required': 'No', 'Example': 'JavaScript,React,Node.js' },
            { 
  'Column': 'GatePassNo', 
  'Description': 'Gate Pass Number (can contain numbers or text)', 
  'Required': 'No', 
  'Example': 'GP001 or 12345' 
},
    ];

    const wsInstructions = XLSX.utils.json_to_sheet(instructions);
    const instructionColWidths = [
      { wch: 20 }, 
      { wch: 40 }, 
      { wch: 10 }, 
      { wch: 25 } 
    ];
    wsInstructions['!cols'] = instructionColWidths;
    XLSX.utils.book_append_sheet(wb, wsInstructions, "Instructions");

    const fileName = `Employees_Details_Template_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);

    return { success: true, filename: fileName };
  } catch (error) {
    console.error("Error generating Excel file:", error);
    throw new Error("Failed to generate Excel template");
  }
};
