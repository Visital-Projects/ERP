
// import apiClient from "./apiClient";


// const getEmployeeSalary = async (employeeId) => {
//   const res = await apiClient.get(`/employees/${employeeId}`);
//   return res.data;
// };

// const updateSalary = async (employeeId, data) => {
//   const res = await apiClient.post(`/set-salary/${employeeId}`, data);
//   return res.data;
// };


// const getAllowances = async (employeeId) => {
//   const res = await apiClient.get(`/allowances?employee_id=${employeeId}`);
//   return res.data;
// };

// const createAllowance = async (employeeId, data) => {
//   const res = await apiClient.post(`/allowances`, { ...data, employee_id: employeeId });
//   return res.data;
// };

// const updateAllowance = async (id, data) => {
//   const res = await apiClient.put(`/allowances/${id}`, data);
//   return res.data;
// };

// const deleteAllowance = async (id) => {
//   const res = await apiClient.delete(`/allowances/${id}`);
//   return res.data;
// };

// const getPayslips = async (page = 1, limit = 10, salary_month = "") => {

//   let year, month;

//   if (salary_month) {
//     const [yearStr, monthStr] = salary_month.split("-");
//     year = yearStr;
//     month = monthStr;
//   } else {
//     const currentDate = new Date();
//     month = String(currentDate.getMonth() + 1).padStart(2, "0");
//     year = currentDate.getFullYear().toString();
//   }

//   console.log("🔍 Frontend API Call:", {
//     year,
//     month,
//     page,
//     limit,
//     salary_month
//   });

//   try {

//     const res = await apiClient.get(
//       `/grossSalary/getAllgrosssalary?month=${month}&year=${year}&page=${page}&limit=${limit}`
//     );

//     console.log("✅ Backend Response:", {
//       success: res.data.success,
//       data_length: res.data.data?.length,
//       summary: res.data.summary
//     });

//     return res.data;

//   } catch (error) {

//     console.error("❌ API Error:", error.response?.data || error.message);
//     throw error;

//   }
// };

// const softDeletePayslip = async (employee_id) => {

//   const res = await apiClient.delete(`/payslips/${employee_id}/soft-delete`);
//   return res.data;

// };

// const bulkGeneratePayslips = async (data, salary_month = "") => {


//   let year, month;

//   if (salary_month) {
//     const [yearStr, monthStr] = salary_month.split("-");
//     year = yearStr;
//     month = monthStr;
//   } else {
//     const currentDate = new Date();
//     month = String(currentDate.getMonth() + 1).padStart(2, "0");
//     year = currentDate.getFullYear().toString();
//   }

//   console.log("🔍 Frontend API Call:", {
//     year,
//     month,
//     page,
//     limit,
//     salary_month
//   });

//   try {
//   const res = await apiClient.post(`/grossSalary/bulk-gross-salary?month=${month}&year=${year}`, data);
//   return res.data;
//   } catch (error) {

//     console.error("❌ API Error:", error.response?.data || error.message);
//     throw error;

//   }

// };

// const bulkPayment = async (data, salary_month = "") => {

//   let year, month;

//   if (salary_month) {
//     const [yearStr, monthStr] = salary_month.split("-");
//     year = yearStr;
//     month = monthStr;
//   } else {
//     const currentDate = new Date();
//     month = String(currentDate.getMonth() + 1).padStart(2, "0");
//     year = currentDate.getFullYear().toString();
//   }

//   console.log("🔍 Frontend API Call:", {
//     year,
//     month,
//     salary_month
//   });

//   try {

//   const res = await apiClient.post(`/grossSalary/bulk-gross-payment?month=${month}&year=${year}`, data);
//   return res.data;

//   } catch (error) {

//     console.error("❌ API Error:", error.response?.data || error.message);
//     throw error;

//   }

// };


// /* =====================================================
//    NEW API : UPDATE GROSS SALARY
// ===================================================== */

// const updateGrossSalary = async (data) => {

//   console.log("🔄 Updating salary:", data);

//   const res = await apiClient.put(`/grossSalary/update`, data);

//   return res.data;

// };



// const salaryService = {
//   getEmployeeSalary,
//   updateSalary,
//   getAllowances,
//   createAllowance,
//   updateAllowance,
//   deleteAllowance,
//   getPayslips,
//   softDeletePayslip,
//   bulkGeneratePayslips,
//   bulkPayment,
//   updateGrossSalary, // ? new function for updating gross salary
// };


// export default salaryService;








// import apiClient from "./apiClient";

// const getEmployeeSalary = async (employeeId) => {
//   const res = await apiClient.get(`/employees/${employeeId}`);
//   return res.data;
// };

// const updateSalary = async (employeeId, data) => {
//   const res = await apiClient.post(`/set-salary/${employeeId}`, data);
//   return res.data;
// };

// const getAllowances = async (employeeId) => {
//   const res = await apiClient.get(`/allowances?employee_id=${employeeId}`);
//   return res.data;
// };

// const createAllowance = async (employeeId, data) => {
//   const res = await apiClient.post(`/allowances`, { ...data, employee_id: employeeId });
//   return res.data;
// };

// const updateAllowance = async (id, data) => {
//   const res = await apiClient.put(`/allowances/${id}`, data);
//   return res.data;
// };

// const deleteAllowance = async (id) => {
//   const res = await apiClient.delete(`/allowances/${id}`);
//   return res.data;
// };

// const getPayslips = async (page = 1, limit = 10, salary_month = "") => {
//   let year, month;

//   if (salary_month) {
//     const [yearStr, monthStr] = salary_month.split("-");
//     year = yearStr;
//     month = monthStr;
//   } else {
//     const currentDate = new Date();
//     month = String(currentDate.getMonth() + 1).padStart(2, "0");
//     year = currentDate.getFullYear().toString();
//   }

//   console.log("🔍 Frontend API Call:", {
//     year,
//     month,
//     page,
//     limit,
//     salary_month
//   });

//   try {
//     const res = await apiClient.get(
//       `/grossSalary/getAllgrosssalary?month=${month}&year=${year}&page=${page}&limit=${limit}`
//     );

//     console.log("✅ Backend Response:", {
//       success: res.data.success,
//       data_length: res.data.data?.length,
//       summary: res.data.summary
//     });

//     return res.data;
//   } catch (error) {
//     console.error("❌ API Error:", error.response?.data || error.message);
//     throw error;
//   }
// };

// const softDeletePayslip = async (employee_id) => {
//   const res = await apiClient.delete(`/payslips/${employee_id}/soft-delete`);
//   return res.data;
// };

// const bulkGeneratePayslips = async (params) => {
//   // params should contain { month, year }

//   console.log("🔍 Frontend API Call - Bulk Generate:", {
//     month: params.month,
//     year: params.year
//   });

//   try {
//     // Send as query parameters, not in the body
//      const res = await apiClient.post(`/grossSalary/bulk-gross-salary?month=${params.month}&year=${params.year}`);
//     return res.data;
//   } catch (error) {
//     console.error("❌ API Error:", error.response?.data || error.message);
//     throw error;
//   }
// };

// const bulkPayment = async (data, salary_month = "") => {
//   let year, month;

//   if (salary_month) {
//     const [yearStr, monthStr] = salary_month.split("-");
//     year = yearStr;
//     month = monthStr;
//   } else {
//     const currentDate = new Date();
//     month = String(currentDate.getMonth() + 1).padStart(2, "0");
//     year = currentDate.getFullYear().toString();
//   }

//   console.log("🔍 Frontend API Call - Bulk Payment:", {
//     year,
//     month,
//     salary_month
//   });

//   try {
//     // Send as POST with only query parameters, NO BODY DATA
//     const res = await apiClient.post(`/grossSalary/bulk-gross-payment?month=${month}&year=${year}`);

//     console.log("✅ Bulk Payment Response:", res.data);
//     return res.data;
//   } catch (error) {
//     console.error("❌ API Error:", error.response?.data || error.message);
//     throw error;
//   }
// };  

// /* =====================================================
//    NEW API : UPDATE GROSS SALARY
// ===================================================== */

// const updateGrossSalary = async (data) => {
//   console.log("🔄 Updating salary:", data);
//   const res = await apiClient.put(`/grossSalary/update`, data);
//   return res.data;
// };

// const salaryService = {
//   getEmployeeSalary,
//   updateSalary,
//   getAllowances,
//   createAllowance,
//   updateAllowance,
//   deleteAllowance,
//   getPayslips,
//   softDeletePayslip,
//   bulkGeneratePayslips,
//   bulkPayment,
//   updateGrossSalary, // new function for updating gross salary
// };

// export default salaryService;









import apiClient from "./apiClient";

const getEmployeeSalary = async (employeeId) => {
  const res = await apiClient.get(`/employees/${employeeId}`);
  return res.data;
};

const updateSalary = async (employeeId, data) => {
  const res = await apiClient.post(`/set-salary/${employeeId}`, data);
  return res.data;
};

const getAllowances = async (employeeId) => {
  const res = await apiClient.get(`/allowances?employee_id=${employeeId}`);
  return res.data;
};

const createAllowance = async (employeeId, data) => {
  const res = await apiClient.post(`/allowances`, { ...data, employee_id: employeeId });
  return res.data;
};

const updateAllowance = async (id, data) => {
  const res = await apiClient.put(`/allowances/${id}`, data);
  return res.data;
};

const deleteAllowance = async (id) => {
  const res = await apiClient.delete(`/allowances/${id}`);
  return res.data;
};

/* =====================================================
   GROSS SALARY APIS
===================================================== */

const getPayslips = async (page = 1, limit = 10, salary_month = "") => {
  let year, month;

  if (salary_month) {
    const [yearStr, monthStr] = salary_month.split("-");
    year = yearStr;
    month = monthStr;
  } else {
    const currentDate = new Date();
    month = String(currentDate.getMonth() + 1).padStart(2, "0");
    year = currentDate.getFullYear().toString();
  }

  console.log("🔍 Frontend API Call - Get Gross:", {
    year,
    month,
    page,
    limit,
    salary_month
  });

  try {
    const res = await apiClient.get(
      `/grossSalary/getAllgrosssalary?month=${month}&year=${year}&page=${page}&limit=${limit}`
    );

    return res.data;
  } catch (error) {
    console.error("❌ API Error:", error.response?.data || error.message);
    throw error;
  }
};

const softDeletePayslip = async (employee_id) => {
  const res = await apiClient.delete(`/payslips/${employee_id}/soft-delete`);
  return res.data;
};

const bulkGeneratePayslips = async (params) => {
  console.log("🔍 Frontend API Call - Bulk Generate Gross:", {
    month: params.month,
    year: params.year
  });

  try {
    const res = await apiClient.post(`/grossSalary/bulk-gross-salary?month=${params.month}&year=${params.year}`);
    return res.data;
  } catch (error) {
    console.error("❌ API Error:", error.response?.data || error.message);
    throw error;
  }
};

const bulkPayment = async (salary_month = "") => {
  let year, month;

  if (salary_month) {
    const [yearStr, monthStr] = salary_month.split("-");
    year = yearStr;
    month = String(monthStr).padStart(2, '0');
  } else {
    const currentDate = new Date();
    month = String(currentDate.getMonth() + 1).padStart(2, "0");
    year = currentDate.getFullYear().toString();
  }

  console.log("🔍 Frontend API Call - Bulk Gross Payment:", {
    year,
    month
  });

  try {
    const res = await apiClient.post(`/grossSalary/bulk-gross-payment?month=${month}&year=${year}`);
    return res.data;
  } catch (error) {
    console.error("❌ API Error:", error.response?.data || error.message);
    throw error;
  }
};

const updateGrossSalary = async (data) => {
  console.log("🔄 Updating gross salary:", data);
  const res = await apiClient.put(`/grossSalary/update`, data);
  return res.data;
};

/* =====================================================
   OT (OVERTIME) SALARY APIS
===================================================== */


// 1. Get all OT payslips
const getOTPayslips = async (page = 1, limit = 10, salary_month = "") => {
  let year, month;

  if (salary_month) {
    const [yearStr, monthStr] = salary_month.split("-");
    year = yearStr;
    month = monthStr;
  } else {
    const currentDate = new Date();
    month = String(currentDate.getMonth() + 1).padStart(2, "0");
    year = currentDate.getFullYear().toString();
  }

  console.log("🔍 Frontend API Call - Get OT Payslips:", {
    year,
    month,
    page,
    limit
  });

  try {
    const res = await apiClient.get(
      `/otPayment/ot-payslips?month=${month}&year=${year}&page=${page}&limit=${limit}`
    );
    return res.data;
  } catch (error) {
    console.error("❌ API Error:", error.response?.data || error.message);

    // If it's a 404, return the actual error response from backend
    if (error.response?.status === 404) {
      // Return the actual error data from backend, don't modify it
      return error.response.data;
    }

    throw error;
  }
};

// 2. Bulk Generate OT Payslips
const bulkGenerateOTPayslips = async (params) => {
  console.log("🔍 Frontend API Call - Bulk Generate OT:", {
    month: params.month,
    year: params.year
  });

  try {
    const res = await apiClient.post(`/otPayment/bulk-generate-ot-salary?month=${params.month}&year=${params.year}`);
    console.log("✅ Bulk Generate OT Response:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ API Error:", error.response?.data || error.message);

    // If the error response contains the "already generated" message, return it as data
    if (error.response?.data?.message === "OT salary payslips already generated for this month") {
      return error.response.data; // Return the error data so it can be handled in the component
    }

    throw error;
  }
};

// 3. Bulk OT Payment
const bulkOTPayment = async (salary_month = "") => {
  let year, month;

  if (salary_month) {
    const [yearStr, monthStr] = salary_month.split("-");
    year = yearStr;
    month = monthStr;
  } else {
    const currentDate = new Date();
    month = String(currentDate.getMonth() + 1).padStart(2, "0");
    year = currentDate.getFullYear().toString();
  }

  console.log("🔍 Frontend API Call - Bulk OT Payment:", {
    year,
    month
  });

  try {
    const res = await apiClient.post(`/otPayment/bulk-ot-payment?month=${month}&year=${year}`);
    return res.data;
  } catch (error) {
    console.error("❌ API Error:", error.response?.data || error.message);
    throw error;
  }
};

// 4. Update OT Payment Amount
const updateOTPayment = async (data) => {
  console.log("🔄 Updating OT payment:", data);

  // Expected data format:
  // {
  //   employee_id: "123",
  //   salary_month: "2026-03",
  //   ot_payment: 5000,
  //   remark: "Updated OT payment"
  // }

  try {
    const res = await apiClient.put(`/otPayment/update`, data);
    return res.data;
  } catch (error) {
    console.error("❌ API Error:", error.response?.data || error.message);
    throw error;
  }
};

// 5. Soft Delete OT Payslip
const softDeleteOTPayslip = async (id) => {
  console.log("🗑️ Soft deleting OT payslip:", id);

  try {
    const res = await apiClient.delete(`/otPayment/${id}/soft-delete`);
    return res.data;
  } catch (error) {
    console.error("❌ API Error:", error.response?.data || error.message);
    throw error;
  }
};

/* =====================================================
   EXPORT ALL SERVICES
===================================================== */

const salaryService = {
  // Existing Gross Salary APIs
  getEmployeeSalary,
  updateSalary,
  getAllowances,
  createAllowance,
  updateAllowance,
  deleteAllowance,
  getPayslips,
  softDeletePayslip,
  bulkGeneratePayslips,
  bulkPayment,
  updateGrossSalary,

  // New OT Salary APIs
  getOTPayslips,
  bulkGenerateOTPayslips,
  bulkOTPayment,
  updateOTPayment,
  softDeleteOTPayslip,
};

export default salaryService;