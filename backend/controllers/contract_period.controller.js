// // // controllers/contract_period.controller.js
// // const ContractPeriod = require('../models/contract_period.model');
// // const JobMode = require('../models/job_mode.model');
// // const PlantName = require('../models/plant_name.model');
// // const Employee = require('../models/employee.model');

// // /**
// //  * Multi-tenant helper (same logic you used in allowance/plant controllers)
// //  */
// // async function getCompanyId(req) {
// //   if (req.user?.creator_id) return req.user.creator_id;

// //   if (req.user?.type === 'Employee') {
// //     const emp = await Employee.findOne({
// //       where: { user_id: req.user.id },
// //       attributes: ['created_by']
// //     });
// //     return emp?.created_by;
// //   }

// //   return req.user?.id;
// // }

// // exports.create = async (req, res) => {
// //   try {
// //     const companyId = await getCompanyId(req);
// //     const { job_mode_id, plant_id } = req.body;

// //     if (!job_mode_id) return res.status(400).json({ message: 'job_mode_id is required' });
// //     if (!plant_id) return res.status(400).json({ message: 'plant_id is required' });

// //     // ✅ Validate job_mode belongs to this company
// //     const jm = await JobMode.findOne({ where: { id: job_mode_id, created_by: companyId } });
// //     if (!jm) return res.status(400).json({ message: 'Invalid job_mode_id for this company' });

// //     // ✅ Validate plant belongs to this company
// //     const plant = await PlantName.findOne({ where: { id: plant_id, created_by: companyId } });
// //     if (!plant) return res.status(400).json({ message: 'Invalid plant_id for this company' });

// //     if (String(plant.job_mode_id) !== String(job_mode_id)) {
// //       return res.status(400).json({ message: 'Provided plant does not belong to the provided job_mode' });
// //     }

// //     // 1. Create record with placeholder
// //     let data = await ContractPeriod.create({
// //       job_mode_id,
// //       plant_id,
// //       created_by: companyId,
// //       po_wo_number: ""
// //     });

// //     // 2. Generate formatted PO/WO number
// //     const dateStr = new Date().toISOString().split("T")[0].replace(/-/g, ""); // YYYYMMDD
// //     const jobModeName = jm.name.replace(/\s+/g, "").toUpperCase(); // remove spaces
// //     const plantName = plant.name.replace(/\s+/g, "").toUpperCase();

// //     const generatedNumber = `PO/WO-${jobModeName}-${plantName}-${dateStr}-${data.id}`;

// //     // 3. Update record with generated PO/WO number
// //     await data.update({ po_wo_number: generatedNumber });

// //     return res.status(201).json({ success: true, data });
// //   } catch (err) {
// //     console.error("Error creating contract_period:", err);
// //     return res.status(500).json({ message: "Server error", error: err.message });
// //   }
// // };

// // // exports.create = async (req, res) => {
// // //   try {
// // //     const companyId = await getCompanyId(req);
// // //     const { job_mode_id, plant_id } = req.body;

// // //     if (!job_mode_id) return res.status(400).json({ message: 'job_mode_id is required' });
// // //     if (!plant_id) return res.status(400).json({ message: 'plant_id is required' });

// // //     // Validate job_mode belongs to this company
// // //     const jm = await JobMode.findOne({ where: { id: job_mode_id, created_by: companyId } });
// // //     if (!jm) return res.status(400).json({ message: 'Invalid job_mode_id for this company' });

// // //     // Validate plant belongs to this company
// // //     const plant = await PlantName.findOne({ where: { id: plant_id, created_by: companyId } });
// // //     if (!plant) return res.status(400).json({ message: 'Invalid plant_id for this company' });

// // //     // Optional: ensure plant.job_mode_id matches job_mode_id
// // //     if (String(plant.job_mode_id) !== String(job_mode_id)) {
// // //       return res.status(400).json({ message: 'Provided plant does not belong to the provided job_mode' });
// // //     }

// // //     // 1. Create record without po_wo_number
// // //     let data = await ContractPeriod.create({
// // //       job_mode_id,
// // //       plant_id,
// // //       created_by: companyId,
// // //       po_wo_number: '' // temporary placeholder
// // //     });

// // //     // 2. Generate po_wo_number (e.g., "PO/WO-<id>")
// // //     const generatedNumber = `PO/WO-${data.id}`;

// // //     // 3. Update record with generated number
// // //     await data.update({ po_wo_number: generatedNumber });

// // //     return res.status(201).json({ success: true, data });
// // //   } catch (err) {
// // //     console.error('Error creating contract_period:', err);
// // //     return res.status(500).json({ message: 'Server error', error: err.message });
// // //   }
// // // };





// // // GET ALL (scoped to company)
// // exports.getAll = async (req, res) => {
// //   try {
// //     const companyId = await getCompanyId(req);

// //     const data = await ContractPeriod.findAll({
// //       where: { created_by: companyId },
// //       order: [['id', 'DESC']],
// //       include: [
// //         { association: 'job_mode', attributes: ['id', 'name'] },
// //         { association: 'plant', attributes: ['id', 'name', 'job_mode_id'] }
// //       ]
// //     });

// //     return res.json({ success: true, data });
// //   } catch (err) {
// //     console.error('Error fetching contract_periods:', err);
// //     return res.status(500).json({ message: 'Server error', error: err.message });
// //   }
// // };

// // // GET BY ID (scoped)
// // exports.getById = async (req, res) => {
// //   try {
// //     const companyId = await getCompanyId(req);

// //     const data = await ContractPeriod.findOne({
// //       where: { id: req.params.id, created_by: companyId },
// //       include: [
// //         { association: 'job_mode', attributes: ['id', 'name'] },
// //         { association: 'plant', attributes: ['id', 'name', 'job_mode_id'] }
// //       ]
// //     });

// //     if (!data) return res.status(404).json({ message: 'Contract period not found' });
// //     return res.json({ success: true, data });
// //   } catch (err) {
// //     console.error('Error fetching contract_period by id:', err);
// //     return res.status(500).json({ message: 'Server error', error: err.message });
// //   }
// // };

// // // GET BY job_mode_id (scoped)
// // exports.getByJobModeId = async (req, res) => {
// //   try {
// //     const companyId = await getCompanyId(req);
// //     const { jobModeId } = req.params;

// //     if (!jobModeId) return res.status(400).json({ message: 'jobModeId is required' });

// //     const data = await ContractPeriod.findAll({
// //       where: { job_mode_id: jobModeId, created_by: companyId },
// //       order: [['id', 'DESC']],
// //       include: [{ association: 'plant', attributes: ['id', 'name', 'job_mode_id'] }]
// //     });

// //     return res.json({ success: true, data });
// //   } catch (err) {
// //     console.error('Error fetching contract_periods by job_mode:', err);
// //     return res.status(500).json({ message: 'Server error', error: err.message });
// //   }
// // };

// // // UPDATE
// // exports.update = async (req, res) => {
// //   try {
// //     const companyId = await getCompanyId(req);

// //     const record = await ContractPeriod.findOne({
// //       where: { id: req.params.id, created_by: companyId }
// //     });
// //     if (!record) return res.status(404).json({ message: 'Contract period not found' });

// //     // Prevent overriding created_by
// //     const payload = { ...req.body };
// //     delete payload.created_by;
// //     payload.created_by = companyId;

// //     // If job_mode_id provided, validate
// //     if (payload.job_mode_id) {
// //       const jm = await JobMode.findOne({ where: { id: payload.job_mode_id, created_by: companyId } });
// //       if (!jm) return res.status(400).json({ message: 'Invalid job_mode_id for this company' });
// //     }

// //     // If plant_id provided, validate
// //     if (payload.plant_id) {
// //       const plant = await PlantName.findOne({ where: { id: payload.plant_id, created_by: companyId } });
// //       if (!plant) return res.status(400).json({ message: 'Invalid plant_id for this company' });

// //       // If both provided, ensure plant matches job_mode
// //       const checkJobModeId = payload.job_mode_id || record.job_mode_id;
// //       if (String(plant.job_mode_id) !== String(checkJobModeId)) {
// //         return res.status(400).json({ message: 'Provided plant does not belong to the provided job_mode' });
// //       }
// //     }

// //     if (payload.po_wo_number !== undefined) payload.po_wo_number = String(payload.po_wo_number).trim();

// //     await record.update(payload);

// //     return res.json({ success: true, data: record });
// //   } catch (err) {
// //     console.error('Error updating contract_period:', err);
// //     return res.status(500).json({ message: 'Server error', error: err.message });
// //   }
// // };

// // // DELETE
// // exports.remove = async (req, res) => {
// //   try {
// //     const companyId = await getCompanyId(req);

// //     const record = await ContractPeriod.findOne({
// //       where: { id: req.params.id, created_by: companyId }
// //     });
// //     if (!record) return res.status(404).json({ message: 'Contract period not found' });

// //     await record.destroy();
// //     return res.json({ success: true, message: 'Deleted successfully' });
// //   } catch (err) {
// //     console.error('Error deleting contract_period:', err);
// //     return res.status(500).json({ message: 'Server error', error: err.message });
// //   }
// // };




// // controllers/contract_period.controller.js
// const ContractPeriod = require('../models/contract_period.model');
// const JobMode = require('../models/job_mode.model');
// const PlantName = require('../models/plant_name.model');
// const Employee = require('../models/employee.model');
// const Branch = require("../models/branch.model");

// // =====================
// // Helper: resolve root company id dynamically
// // =====================
// async function getCompanyId(req) {
//   if (!req.user) return null;

//   const type = req.user.type?.toLowerCase();

//   // 1️⃣ Company login
//   if (type === "company") return req.user.id;

//   // 2️⃣ Employee login
//   if (type === "employee") {
//     const emp = await Employee.findOne({
//       where: { user_id: req.user.id },
//       attributes: ["created_by"],
//     });
//     if (emp?.created_by) return emp.created_by;
//   }

//   // 3️⃣ Other roles (Accountant, HR, Manager)
//   const emp = await Employee.findOne({
//     where: { user_id: req.user.id },
//     attributes: ["created_by"],
//   });
//   if (emp?.created_by) return emp.created_by;

//   // fallback: assume user is company creator
//   return req.user.id;
// }

// // =====================
// // CREATE
// // =====================
// // exports.create = async (req, res) => {
// //   try {
// //     const companyId = await getCompanyId(req);
// //     if (!companyId) return res.status(403).json({ message: "Unable to resolve company" });

// //     // Optional: restrict employees if needed
// //     if (req.user.type?.toLowerCase() === "employee") {
// //       return res.status(403).json({ message: "Not allowed to create ContractPeriod" });
// //     }

// //     const { job_mode_id, plant_id } = req.body;
// //     if (!job_mode_id) return res.status(400).json({ message: "job_mode_id is required" });
// //     if (!plant_id) return res.status(400).json({ message: "plant_id is required" });

// //     // Validate job_mode belongs to company
// //     const jm = await JobMode.findOne({ where: { id: job_mode_id, created_by: companyId } });
// //     if (!jm) return res.status(400).json({ message: "Invalid job_mode_id for this company" });

// //     // Validate plant belongs to company
// //     const plant = await PlantName.findOne({ where: { id: plant_id, created_by: companyId } });
// //     if (!plant) return res.status(400).json({ message: "Invalid plant_id for this company" });

// //     // Ensure plant matches job_mode
// //     if (String(plant.job_mode_id) !== String(job_mode_id)) {
// //       return res.status(400).json({ message: "Provided plant does not belong to the provided job_mode" });
// //     }

// //     // 1️⃣ Create record with placeholder
// //     let data = await ContractPeriod.create({
// //       job_mode_id,
// //       plant_id,
// //       created_by: companyId,
// //       po_wo_number: ""
// //     });

// //     // 2️⃣ Generate formatted PO/WO number
// //     const dateStr = new Date().toISOString().split("T")[0].replace(/-/g, "");
// //     const jobModeName = jm.name.replace(/\s+/g, "").toUpperCase();
// //     const plantName = plant.name.replace(/\s+/g, "").toUpperCase();
// //     const generatedNumber = `PO/WO-${jobModeName}-${plantName}-${dateStr}-${data.id}`;

// //     // 3️⃣ Update record with generated PO/WO number
// //     await data.update({ po_wo_number: generatedNumber });

// //     return res.status(201).json({ success: true, data });
// //   } catch (err) {
// //     console.error("Error creating contract_period:", err);
// //     return res.status(500).json({ message: "Server error", error: err.message });
// //   }
// // };

// exports.create = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     if (!companyId) {
//       return res.status(403).json({ message: "Unable to resolve company" });
//     }

//     // Restrict employees if needed
//     if (req.user.type?.toLowerCase() === "employee") {
//       return res.status(403).json({ message: "Not allowed to create ContractPeriod" });
//     }

//     const { job_mode_id, branch_id } = req.body;
//     if (!job_mode_id) {
//       return res.status(400).json({ message: "job_mode_id is required" });
//     }

//     // ✅ Validate job_mode belongs to company
//     const jm = await JobMode.findOne({
//       where: { id: job_mode_id, created_by: companyId },
//     });
//     if (!jm) {
//       return res.status(400).json({ message: "Invalid job_mode_id for this company" });
//     }

//     // ✅ Validate branch belongs to company (if provided)
//     if (branch_id) {
//       const branch = await Branch.findOne({
//         where: { id: branch_id, created_by: companyId },
//       });
//       if (!branch) {
//         return res.status(400).json({ message: "Invalid branch_id for this company" });
//       }
//     }

//     // 1️⃣ Create record with placeholder PO/WO number
//     const record = await ContractPeriod.create({
//       job_mode_id,
//       branch_id: branch_id || null,
//       created_by: companyId,
//       po_wo_number: "", // will be updated later
//     });

//     // 2️⃣ Generate formatted PO/WO number
//     const dateStr = new Date().toISOString().split("T")[0].replace(/-/g, "");
//     const jobModeName = jm.name.replace(/\s+/g, "").toUpperCase();
//     const branchName = branch_id
//       ? (await Branch.findByPk(branch_id)).name.replace(/\s+/g, "").toUpperCase()
//       : "NOBRANCH";
//     const generatedNumber = `PO/WO-${jobModeName}-${branchName}-${dateStr}-${record.id}`;

//     await record.update({ po_wo_number: generatedNumber });

//     // 3️⃣ Fetch with associations for response
//     const data = await ContractPeriod.findOne({
//       where: { id: record.id },
//       include: [
//         { association: "job_mode", attributes: ["id", "name"] },
//         { association: "branch", attributes: ["id", "name"] },
//       ],
//     });

//     return res.status(201).json({ success: true, message: "ContractPeriod created", data });
//   } catch (err) {
//     console.error("Error creating contract_period:", err);
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };




// exports.getAll = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ message: "Unable to resolve company" });

//     const data = await ContractPeriod.findAll({
//       where: { created_by: companyId },
//       order: [["id", "DESC"]],
//       include: [
//         { association: "job_mode", attributes: ["id", "name"] },
//         { association: "plant", attributes: ["id", "name", "job_mode_id"] }
//       ]
//     });

//     return res.json({ success: true, data });
//   } catch (err) {
//     console.error("Error fetching contract_periods:", err);
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// // =====================
// // GET BY ID
// // =====================
// exports.getById = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ message: "Unable to resolve company" });

//     const data = await ContractPeriod.findOne({
//       where: { id: req.params.id, created_by: companyId },
//       include: [
//         { association: "job_mode", attributes: ["id", "name"] },
//         { association: "plant", attributes: ["id", "name", "job_mode_id"] }
//       ]
//     });

//     if (!data) return res.status(404).json({ message: "Contract period not found" });
//     return res.json({ success: true, data });
//   } catch (err) {
//     console.error("Error fetching contract_period by id:", err);
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// // =====================
// // GET BY JOB MODE ID
// // =====================
// exports.getByJobModeId = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ message: "Unable to resolve company" });

//     const { jobModeId } = req.params;
//     if (!jobModeId) return res.status(400).json({ message: "jobModeId is required" });

//     const data = await ContractPeriod.findAll({
//       where: { job_mode_id: jobModeId, created_by: companyId },
//       order: [["id", "DESC"]],
//       include: [{ association: "plant", attributes: ["id", "name", "job_mode_id"] }]
//     });

//     return res.json({ success: true, data });
//   } catch (err) {
//     console.error("Error fetching contract_periods by job_mode:", err);
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// // =====================
// // UPDATE
// // =====================
// exports.update = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ message: "Unable to resolve company" });

//     const record = await ContractPeriod.findOne({
//       where: { id: req.params.id, created_by: companyId }
//     });
//     if (!record) return res.status(404).json({ message: "Contract period not found" });

//     if (req.user.type?.toLowerCase() === "employee") {
//       return res.status(403).json({ message: "Not allowed to update ContractPeriod" });
//     }

//     const payload = { ...req.body };
//     delete payload.created_by;
//     payload.created_by = companyId;

//     if (payload.job_mode_id) {
//       const jm = await JobMode.findOne({ where: { id: payload.job_mode_id, created_by: companyId } });
//       if (!jm) return res.status(400).json({ message: "Invalid job_mode_id for this company" });
//     }

//     if (payload.plant_id) {
//       const plant = await PlantName.findOne({ where: { id: payload.plant_id, created_by: companyId } });
//       if (!plant) return res.status(400).json({ message: "Invalid plant_id for this company" });

//       const checkJobModeId = payload.job_mode_id || record.job_mode_id;
//       if (String(plant.job_mode_id) !== String(checkJobModeId)) {
//         return res.status(400).json({ message: "Provided plant does not belong to the provided job_mode" });
//       }
//     }

//     if (payload.po_wo_number !== undefined) payload.po_wo_number = String(payload.po_wo_number).trim();

//     await record.update(payload);
//     return res.json({ success: true, data: record });
//   } catch (err) {
//     console.error("Error updating contract_period:", err);
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// // =====================
// // DELETE
// // =====================
// exports.remove = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     if (!companyId) return res.status(403).json({ message: "Unable to resolve company" });

//     if (req.user.type?.toLowerCase() === "employee") {
//       return res.status(403).json({ message: "Not allowed to delete ContractPeriod" });
//     }

//     const record = await ContractPeriod.findOne({
//       where: { id: req.params.id, created_by: companyId }
//     });
//     if (!record) return res.status(404).json({ message: "Contract period not found" });

//     await record.destroy();
//     return res.json({ success: true, message: "Deleted successfully" });
//   } catch (err) {
//     console.error("Error deleting contract_period:", err);
//     return res.status(500).json({ message: "Server error", error: err.message });
//   }
// };




// controllers/contract_period.controller.js
const ContractPeriod = require('../models/contract_period.model');
const JobMode = require('../models/job_mode.model');
const Branch = require('../models/branch.model');
const Employee = require('../models/employee.model');

// Helper to resolve company id
async function getCompanyId(req) {
  if (!req.user) return null;

  const type = req.user.type?.toLowerCase();

  if (type === 'company') return req.user.id;

  const emp = await Employee.findOne({
    where: { user_id: req.user.id },
    attributes: ['created_by'],
  });
  if (emp?.created_by) return emp.created_by;

  return req.user.id;
}

// =====================
// CREATE
// =====================
exports.create = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ message: 'Unable to resolve company' });

    if (req.user.type?.toLowerCase() === 'employee') {
      return res.status(403).json({ message: 'Not allowed to create ContractPeriod' });
    }

    const { job_mode_id, branch_id } = req.body;
    if (!job_mode_id) return res.status(400).json({ message: 'job_mode_id is required' });

    // Validate job_mode belongs to company
    const jm = await JobMode.findOne({ where: { id: job_mode_id, created_by: companyId } });
    if (!jm) return res.status(400).json({ message: 'Invalid job_mode_id for this company' });

    // Validate branch belongs to company (if provided)
    let branch = null;
    if (branch_id) {
      branch = await Branch.findOne({ where: { id: branch_id, created_by: companyId } });
      if (!branch) return res.status(400).json({ message: 'Invalid branch_id for this company' });
    }

    // Create with placeholder PO/WO
    const record = await ContractPeriod.create({
      job_mode_id,
      branch_id: branch_id || null,
      created_by: companyId,
      po_wo_number: '', // updated next
    });

    // Generate PO/WO number
    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const jobModeName = jm.name ? String(jm.name).replace(/\s+/g, '').toUpperCase() : 'NOJOBMODE';
    const branchName = branch ? String(branch.name).replace(/\s+/g, '').toUpperCase() : 'NOBRANCH';
    const generatedNumber = `PO/WO-${jobModeName}-${branchName}-${dateStr}-${record.id}`;

    await record.update({ po_wo_number: generatedNumber });

    // return with associations
    const data = await ContractPeriod.findOne({
      where: { id: record.id },
      include: [
        { association: 'job_mode', attributes: ['id', 'name'] },
        { association: 'branch', attributes: ['id', 'name'] },
      ],
    });

    return res.status(201).json({ success: true, message: 'ContractPeriod created', data });
  } catch (err) {
    console.error('Error creating contract_period:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// =====================
// GET ALL
// =====================
exports.getAll = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ message: 'Unable to resolve company' });

    const data = await ContractPeriod.findAll({
      where: { created_by: companyId },
      order: [['id', 'DESC']],
      include: [
        { association: 'job_mode', attributes: ['id', 'name'] },
        { association: 'branch', attributes: ['id', 'name'] },
      ],
    });

    return res.json({ success: true, data });
  } catch (err) {
    console.error('Error fetching contract_periods:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// =====================
// GET BY ID
// =====================
exports.getById = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ message: 'Unable to resolve company' });

    const data = await ContractPeriod.findOne({
      where: { id: req.params.id, created_by: companyId },
      include: [
        { association: 'job_mode', attributes: ['id', 'name'] },
        { association: 'branch', attributes: ['id', 'name'] },
      ],
    });

    if (!data) return res.status(404).json({ message: 'Contract period not found' });
    return res.json({ success: true, data });
  } catch (err) {
    console.error('Error fetching contract_period by id:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// =====================
// GET BY JOB MODE ID
// =====================
exports.getByJobModeId = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ message: 'Unable to resolve company' });

    const { jobModeId } = req.params;
    if (!jobModeId) return res.status(400).json({ message: 'jobModeId is required' });

    const data = await ContractPeriod.findAll({
      where: { job_mode_id: jobModeId, created_by: companyId },
      order: [['id', 'DESC']],
      include: [{ association: 'branch', attributes: ['id', 'name'] }],
    });

    return res.json({ success: true, data });
  } catch (err) {
    console.error('Error fetching contract_periods by job_mode:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// =====================
// UPDATE
// =====================
exports.update = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ message: 'Unable to resolve company' });

    const record = await ContractPeriod.findOne({
      where: { id: req.params.id, created_by: companyId },
    });
    if (!record) return res.status(404).json({ message: 'Contract period not found' });

    if (req.user.type?.toLowerCase() === 'employee') {
      return res.status(403).json({ message: 'Not allowed to update ContractPeriod' });
    }

    const payload = { ...req.body };
    delete payload.created_by;
    payload.created_by = companyId;

    if (payload.job_mode_id) {
      const jm = await JobMode.findOne({ where: { id: payload.job_mode_id, created_by: companyId } });
      if (!jm) return res.status(400).json({ message: 'Invalid job_mode_id for this company' });
    }

    if (payload.branch_id) {
      const branch = await Branch.findOne({ where: { id: payload.branch_id, created_by: companyId } });
      if (!branch) return res.status(400).json({ message: 'Invalid branch_id for this company' });

      // If Branch has job_mode_id field, check consistency
      const checkJobModeId = payload.job_mode_id || record.job_mode_id;
      if (branch.job_mode_id !== undefined && branch.job_mode_id !== null) {
        if (String(branch.job_mode_id) !== String(checkJobModeId)) {
          return res.status(400).json({ message: 'Provided branch does not belong to the provided job_mode' });
        }
      }
    }

    if (payload.po_wo_number !== undefined) payload.po_wo_number = String(payload.po_wo_number).trim();

    await record.update(payload);

    const updated = await ContractPeriod.findOne({
      where: { id: record.id },
      include: [
        { association: 'job_mode', attributes: ['id', 'name'] },
        { association: 'branch', attributes: ['id', 'name'] },
      ],
    });

    return res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Error updating contract_period:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// =====================
// DELETE
// =====================
exports.remove = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ message: 'Unable to resolve company' });

    if (req.user.type?.toLowerCase() === 'employee') {
      return res.status(403).json({ message: 'Not allowed to delete ContractPeriod' });
    }

    const record = await ContractPeriod.findOne({
      where: { id: req.params.id, created_by: companyId },
    });
    if (!record) return res.status(404).json({ message: 'Contract period not found' });

    await record.destroy();
    return res.json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    console.error('Error deleting contract_period:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};





