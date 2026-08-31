
// // controllers/plant_name.controller.js
// const PlantName = require("../models/plant_name.model");
// const JobMode = require("../models/job_mode.model");
// const Branch = require("../models/branch.model"); // NEW
// const Employee = require("../models/employee.model");

// /**
//  * Multi-tenant helper
//  */
// async function getCompanyId(req) {
//   if (req.user?.creator_id) return req.user.creator_id;

//   if (req.user?.type === "Employee") {
//     const emp = await Employee.findOne({
//       where: { user_id: req.user.id },
//       attributes: ["created_by"],
//     });
//     return emp?.created_by;
//   }

//   return req.user?.id;
// }

// // CREATE
// exports.create = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     const { job_mode_id, name, branch_id } = req.body;

//     if (!job_mode_id)
//       return res.status(400).json({ message: "job_mode_id is required" });
//     if (!name || !String(name).trim())
//       return res.status(400).json({ message: "name is required" });

//     // Validate job_mode belongs to company
//     const jm = await JobMode.findOne({
//       where: { id: job_mode_id, created_by: companyId },
//     });
//     if (!jm)
//       return res
//         .status(400)
//         .json({ message: "Invalid job_mode_id for this company" });

//     // Validate branch if provided
//     if (branch_id !== undefined && branch_id !== null) {
//       const branch = await Branch.findOne({
//         where: { id: branch_id, created_by: companyId },
//       });
//       if (!branch)
//         return res
//           .status(400)
//           .json({ message: "Invalid branch_id for this company" });
//     }

//     const payload = {
//       job_mode_id,
//       branch_id: branch_id || null,
//       name: String(name).trim(),
//       created_by: companyId,
//     };

//     // const data = await PlantName.create(payload);
//     // return res.status(201).json({ success: true, data });
//     const record = await PlantName.create(payload);

//     // Reload with associations (branch + job_mode)
//     const data = await PlantName.findOne({
//       where: { id: record.id },
//       include: [
//         { association: "job_mode", attributes: ["id", "name"] },
//         { association: "branch", attributes: ["id", "name"] },
//       ],
//     });

//     return res.status(201).json({ success: true, data });
//   } catch (err) {
//     console.error("Error creating plant:", err);
//     return res
//       .status(500)
//       .json({ message: "Server error", error: err.message });
//   }
// };

// // GET ALL (scoped to company)
// exports.getAll = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);

//     const data = await PlantName.findAll({
//       where: { created_by: companyId },
//       order: [["id", "DESC"]],
//       include: [
//         { association: "job_mode", attributes: ["id", "name"] },
//         { association: "branch", attributes: ["id", "name"] }, // NEW: include branch
//       ],
//     });

//     return res.json({ success: true, data });
//   } catch (err) {
//     console.error("Error fetching plants:", err);
//     return res
//       .status(500)
//       .json({ message: "Server error", error: err.message });
//   }
// };

// // GET BY ID (scoped)
// exports.getById = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     const data = await PlantName.findOne({
//       where: { id: req.params.id, created_by: companyId },
//       include: [
//         { association: "job_mode", attributes: ["id", "name"] },
//         { association: "branch", attributes: ["id", "name"] }, // NEW
//       ],
//     });

//     if (!data) return res.status(404).json({ message: "Plant not found" });
//     return res.json({ success: true, data });
//   } catch (err) {
//     console.error("Error fetching plant by id:", err);
//     return res
//       .status(500)
//       .json({ message: "Server error", error: err.message });
//   }
// };

// // UPDATE
// // exports.update = async (req, res) => {
// //   try {
// //     const companyId = await getCompanyId(req);

// //     const record = await PlantName.findOne({
// //       where: { id: req.params.id, created_by: companyId },
// //     });
// //     if (!record) return res.status(404).json({ message: "Plant not found" });

// //     const payload = { ...req.body };
// //     // Prevent overriding created_by
// //     delete payload.created_by;
// //     payload.created_by = companyId; // keep consistent

// //     // If job_mode_id provided, validate it belongs to same company
// //     if (payload.job_mode_id) {
// //       const jm = await JobMode.findOne({
// //         where: { id: payload.job_mode_id, created_by: companyId },
// //       });
// //       if (!jm)
// //         return res
// //           .status(400)
// //           .json({ message: "Invalid job_mode_id for this company" });
// //     }

// //     // If branch_id provided, validate branch belongs to same company
// //     if (payload.branch_id !== undefined) {
// //       if (payload.branch_id === null) {
// //         // allow clearing branch
// //       } else {
// //         const branch = await Branch.findOne({
// //           where: { id: payload.branch_id, created_by: companyId },
// //         });
// //         if (!branch)
// //           return res
// //             .status(400)
// //             .json({ message: "Invalid branch_id for this company" });
// //       }
// //     }

// //     if (payload.name !== undefined) payload.name = String(payload.name).trim();

// //     await record.update(payload);
// //     // reload including branch & job_mode
// //     const updated = await PlantName.findOne({
// //       where: { id: record.id },
// //       include: [
// //         { association: "job_mode", attributes: ["id", "name"] },
// //         { association: "branch", attributes: ["id", "name"] },
// //       ],
// //     });

// //     return res.json({ success: true, data: updated });
// //   } catch (err) {
// //     console.error("Error updating plant:", err);
// //     return res
// //       .status(500)
// //       .json({ message: "Server error", error: err.message });
// //   }
// // };

// exports.update = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);

//     // Find existing record scoped to company
//     const record = await PlantName.findOne({
//       where: { id: req.params.id, created_by: companyId },
//     });
//     if (!record) {
//       return res.status(404).json({ message: "Plant not found" });
//     }

//     const payload = { ...req.body };

//     // Ensure created_by is not overridden
//     delete payload.created_by;
//     payload.created_by = companyId;

//     // Validate job_mode_id if provided
//     if (payload.job_mode_id) {
//       const jm = await JobMode.findOne({
//         where: { id: payload.job_mode_id, created_by: companyId },
//       });
//       if (!jm) {
//         return res
//           .status(400)
//           .json({ message: "Invalid job_mode_id for this company" });
//       }
//     }

//     // Validate branch_id if provided
//     if (payload.branch_id !== undefined) {
//       if (payload.branch_id !== null) {
//         const branch = await Branch.findOne({
//           where: { id: payload.branch_id, created_by: companyId },
//         });
//         if (!branch) {
//           return res
//             .status(400)
//             .json({ message: "Invalid branch_id for this company" });
//         }
//       }
//     }

//     // Normalize name if provided
//     if (payload.name !== undefined) {
//       payload.name = String(payload.name).trim();
//     }

//     // Perform update
//     await record.update(payload);

//     // Reload with associations
//     const updated = await PlantName.findOne({
//       where: { id: record.id },
//       include: [
//         { association: "job_mode", attributes: ["id", "name"] },
//         { association: "branch", attributes: ["id", "name"] },
//       ],
//     });

//     return res.json({ success: true, data: updated });
//   } catch (err) {
//     console.error("Error updating plant:", err);
//     return res
//       .status(500)
//       .json({ message: "Server error", error: err.message });
//   }
// };



// // DELETE
// exports.remove = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);

//     const record = await PlantName.findOne({
//       where: { id: req.params.id, created_by: companyId },
//     });
//     if (!record) return res.status(404).json({ message: "Plant not found" });

//     await record.destroy();
//     return res.json({ success: true, message: "Deleted successfully" });
//   } catch (err) {
//     console.error("Error deleting plant:", err);
//     return res
//       .status(500)
//       .json({ message: "Server error", error: err.message });
//   }
// };

// // GET all plants by job_mode_id (scoped to company)
// exports.getByJobModeId = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     const { jobModeId } = req.params;

//     if (!jobModeId) {
//       return res.status(400).json({ message: "jobModeId is required" });
//     }

//     const data = await PlantName.findAll({
//       where: { job_mode_id: jobModeId, created_by: companyId },
//       order: [["id", "DESC"]],
//       include: [{ association: "branch", attributes: ["id", "name"] }],
//     });

//     return res.json({ success: true, data });
//   } catch (err) {
//     console.error("Error fetching plants by jobModeId:", err);
//     return res
//       .status(500)
//       .json({ message: "Server error", error: err.message });
//   }
// };





// controllers/plant_name.controller.js
const PlantName = require("../models/plant_name.model");
const JobMode = require("../models/job_mode.model");
const Branch = require("../models/branch.model");
const Employee = require("../models/employee.model");

// =====================
// Helper: get root company id dynamically
// =====================
async function getCompanyId(req) {
  if (!req.user) return null;

  const type = req.user.type?.toLowerCase();

  // 1️⃣ Company login
  if (type === "company") return req.user.id;

  // 2️⃣ Employee login
  if (type === "employee") {
    const emp = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ["created_by"],
    });
    if (emp?.created_by) return emp.created_by;
  }

  // 3️⃣ Other roles (Accountant, HR, Manager)
  // Lookup employee table to resolve company
  const emp = await Employee.findOne({
    where: { user_id: req.user.id },
    attributes: ["created_by"],
  });
  if (emp?.created_by) return emp.created_by;

  // fallback: assume user is company creator
  return req.user.id;
}

// =====================
// CREATE
// =====================
exports.create = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ message: "Unable to resolve company" });

    // Optional: restrict employees if needed
    if (req.user.type?.toLowerCase() === "employee") {
      return res.status(403).json({ message: "Not allowed to create PlantName" });
    }

    const { job_mode_id, name, branch_id } = req.body;
    if (!job_mode_id) return res.status(400).json({ message: "job_mode_id is required" });
    if (!name || !String(name).trim()) return res.status(400).json({ message: "name is required" });

    // Validate job_mode belongs to company
    const jm = await JobMode.findOne({ where: { id: job_mode_id, created_by: companyId } });
    if (!jm) return res.status(400).json({ message: "Invalid job_mode_id for this company" });

    // Validate branch belongs to company
    if (branch_id) {
      const branch = await Branch.findOne({ where: { id: branch_id, created_by: companyId } });
      if (!branch) return res.status(400).json({ message: "Invalid branch_id for this company" });
    }

    const record = await PlantName.create({
      job_mode_id,
      branch_id: branch_id || null,
      name: String(name).trim(),
      created_by: companyId,
    });

    const data = await PlantName.findOne({
      where: { id: record.id },
      include: [
        { association: "job_mode", attributes: ["id", "name"] },
        { association: "branch", attributes: ["id", "name"] },
      ],
    });

    return res.status(201).json({ success: true, message: "Plant created", data });
  } catch (err) {
    console.error("Error creating plant:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// =====================
// GET ALL
// =====================
exports.getAll = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ message: "Unable to resolve company" });

    let whereClause = { created_by: companyId };

    const data = await PlantName.findAll({
      where: whereClause,
      order: [["id", "DESC"]],
      include: [
        { association: "job_mode", attributes: ["id", "name"] },
        { association: "branch", attributes: ["id", "name"] },
      ],
    });

    return res.json({ success: true, data });
  } catch (err) {
    console.error("Error fetching plants:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// =====================
// GET BY ID
// =====================
exports.getById = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ message: "Unable to resolve company" });

    const plantId = req.params.id;

    const data = await PlantName.findOne({
      where: { id: plantId, created_by: companyId },
      include: [
        { association: "job_mode", attributes: ["id", "name"] },
        { association: "branch", attributes: ["id", "name"] },
      ],
    });

    if (!data) return res.status(404).json({ message: "Plant not found" });
    return res.json({ success: true, data });
  } catch (err) {
    console.error("Error fetching plant by id:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// =====================
// UPDATE
// =====================
exports.update = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ message: "Unable to resolve company" });

    if (req.user.type?.toLowerCase() === "employee") {
      return res.status(403).json({ message: "Not allowed to update PlantName" });
    }

    const record = await PlantName.findOne({ where: { id: req.params.id, created_by: companyId } });
    if (!record) return res.status(404).json({ message: "Plant not found" });

    const payload = { ...req.body };
    delete payload.created_by;
    payload.created_by = companyId;

    if (payload.job_mode_id) {
      const jm = await JobMode.findOne({ where: { id: payload.job_mode_id, created_by: companyId } });
      if (!jm) return res.status(400).json({ message: "Invalid job_mode_id for this company" });
    }

    if (payload.branch_id !== undefined && payload.branch_id !== null) {
      const branch = await Branch.findOne({ where: { id: payload.branch_id, created_by: companyId } });
      if (!branch) return res.status(400).json({ message: "Invalid branch_id for this company" });
    }

    if (payload.name !== undefined) payload.name = String(payload.name).trim();

    await record.update(payload);

    const updated = await PlantName.findOne({
      where: { id: record.id },
      include: [
        { association: "job_mode", attributes: ["id", "name"] },
        { association: "branch", attributes: ["id", "name"] },
      ],
    });

    return res.json({ success: true, message: "Plant updated", data: updated });
  } catch (err) {
    console.error("Error updating plant:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// =====================
// DELETE
// =====================
exports.remove = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ message: "Unable to resolve company" });

    if (req.user.type?.toLowerCase() === "employee") {
      return res.status(403).json({ message: "Not allowed to delete PlantName" });
    }

    const record = await PlantName.findOne({ where: { id: req.params.id, created_by: companyId } });
    if (!record) return res.status(404).json({ message: "Plant not found" });

    await record.destroy();
    return res.json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    console.error("Error deleting plant:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// =====================
// GET BY JOB MODE ID
// =====================
exports.getByJobModeId = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ message: "Unable to resolve company" });

    const { jobModeId } = req.params;
    if (!jobModeId) return res.status(400).json({ message: "jobModeId is required" });

    const data = await PlantName.findAll({
      where: { job_mode_id: jobModeId, created_by: companyId },
      order: [["id", "DESC"]],
      include: [{ association: "branch", attributes: ["id", "name"] }],
    });

    return res.json({ success: true, data });
  } catch (err) {
    console.error("Error fetching plants by jobModeId:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};
