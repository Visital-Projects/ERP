 // src/services/appraisalService.js
import apiClient from "./apiClient"; // your existing axios instance

// 1️⃣ Get indicators by branch name
export const getIndicatorsByBranchName = async (branchName) => {
  try {
    // First fetch all branches to find the branch ID
    const branchRes = await apiClient.get("/branches");
    const branch = branchRes.data.find(
      (b) => b.name.toLowerCase() === branchName.toLowerCase()
    );

    if (!branch) throw new Error("Branch not found");

    // Then fetch indicators for that branch
    const res = await apiClient.get(`/indicators/branch/${branch.id}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching indicators:", error);
    throw error;
  }
};

// 2️⃣ Get all appraisals
export const getAppraisals = async () => {
  try {
    const res = await apiClient.get("/appraisals");
    return res.data;
  } catch (error) {
    console.error("Error fetching appraisals:", error);
    throw error;
  }
};

// 3️⃣ Get single appraisal by ID
export const getAppraisalById = async (id) => {
  try {
    const res = await apiClient.get(`/appraisals/${id}`);
    return res.data;
  } catch (error) {
    console.error(`Error fetching appraisal ${id}:`, error);
    throw error;
  }
};


// 4️⃣ Create appraisal
export const createAppraisal = async (data) => {
  try {
    const res = await apiClient.post("/appraisals", data);
    return res.data;
  } catch (error) {
    console.error("Error creating appraisal:", error);
    throw error;
  }
};

// 5️⃣ Update appraisal
export const updateAppraisal = async (id, data) => {
  try {
    const res = await apiClient.put(`/appraisals/${id}`, data);
    return res.data;
  } catch (error) {
    console.error("Error updating appraisal:", error);
    throw error;
  }
};

// 6️⃣ Delete appraisal
export const deleteAppraisal = async (id) => {
  try {
    const res = await apiClient.delete(`/appraisals/${id}`);
    return res.data;
  } catch (error) {
    console.error("Error deleting appraisal:", error);
    throw error;
  }
};
 
// src/services/appraisalService.js
 

export const getAppraisalsWithTargetAndOverall = async () => {
  try {
    // 1️⃣ Fetch appraisals
    const appraisalRes = await apiClient.get("/appraisals");
    const appraisals = appraisalRes.data;

    // 2️⃣ Fetch indicators
    const indicatorsRes = await apiClient.get("/indicators");
    const indicators = indicatorsRes.data;

    // 3️⃣ Prepare list of employee IDs missing details
    const missingEmployeeIds = appraisals
      .filter(app => !app.employee_detail && app.employee)
      .map(app => app.employee);

    let employeeMap = {};
    if (missingEmployeeIds.length > 0) {
      // Fetch employees data
      const empRes = await apiClient.get("/employees");
      employeeMap = empRes.data.reduce((acc, emp) => {
        acc[emp.id] = emp.name;
        return acc;
      }, {});
    }

    // 4️⃣ Merge data
    const mergedData = appraisals.map((app) => {
      // Parse appraisal ratings
      let appraisalRatings = {};
      try {
        appraisalRatings = JSON.parse(app.rating || "{}");
      } catch {
        appraisalRatings = {};
      }

      // Find matching indicators for branch
      const branchIndicators = indicators.filter(
        (ind) => ind.branch === app.branch
      );

      // Parse indicator ratings
      const indicatorRatings = branchIndicators.flatMap((ind) => {
        try {
          return Object.values(JSON.parse(ind.rating || "{}"));
        } catch {
          return [];
        }
      });

      // Compute averages
      const targetAvg =
        indicatorRatings.length > 0
          ? indicatorRatings.reduce((a, b) => a + Number(b), 0) /
            indicatorRatings.length
          : 0;

     const overallAvg = (() => {
  const values = Object.values(appraisalRatings).map(Number).filter(v => !isNaN(v));
  if (values.length === 0) return 0;
  return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
})();


      return {
  id: app.id,
  branch: app.branch_detail?.name || "N/A",
  department: app.department_detail?.name || "",
  designation: app.designation_detail?.name || "",
  employee:
    app.employee_detail?.name ||
    employeeMap[app.employee] ||
    "Unknown",
  targetRating: targetAvg.toFixed(1),
  overallRating: overallAvg,  // ✅ fixed
  month: app.month,           // ✅ include month so table doesn’t break
  appraisalDate: app.appraisal_date,
};

    });

    return mergedData;
  } catch (error) {
    console.error("Error fetching appraisals with ratings:", error);
    throw error;
  }
};
