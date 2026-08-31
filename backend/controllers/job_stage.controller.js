




// const JobStage = require("../models/job_stage.model");
// const Employee = require("../models/employee.model");

// // ✅ Tenant isolation helper
// async function getCompanyId(req) {
//   if (req.user?.creator_id) return req.user.creator_id;

//   if (req.user?.type === "Employee") {
//     const emp = await Employee.findOne({
//       where: { user_id: req.user.id },
//       attributes: ["created_by"],
//     });
//     return emp?.created_by;
//   }

//   return req.user?.id; // company login
// }

// function isCompanyUser(req) {
//   const t = (req.user?.type || "").toLowerCase();
//   return t === "company" || t === "admin";
// }

// // ---------------------------------------------------
// // Get all job stages
// exports.getAllJobStages = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);

//     let where = { created_by: companyId };

//     if (!isCompanyUser(req)) {
//       // employee only sees company stages (no leakage)
//       where.created_by = companyId;
//     }

//     const stages = await JobStage.findAll({
//       where,
//       order: [["order", "ASC"]],
//     });
//     res.json({ success: true, data: stages });
//   } catch (err) {
//     console.error("❌ Get Job Stages Error:", err);
//     res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// };

// // ---------------------------------------------------
// // Get job stage by ID
// exports.getJobStageById = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     const stage = await JobStage.findOne({
//       where: { id: req.params.id, created_by: companyId },
//     });
//     if (!stage) return res.status(404).json({ success: false, message: "Job stage not found" });

//     res.json({ success: true, data: stage });
//   } catch (err) {
//     console.error("❌ Get Job Stage Error:", err);
//     res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// };

// // ---------------------------------------------------
// // Create job stage
// exports.createJobStage = async (req, res) => {
//   try {
//     const { title, order = 0 } = req.body;
//     if (!title?.trim()) return res.status(400).json({ success: false, message: "Title is required" });

//     const companyId = await getCompanyId(req);

//     // optional: prevent duplicate title per company
//     const exists = await JobStage.findOne({ where: { title: title.trim(), created_by: companyId } });
//     if (exists) {
//       return res.status(400).json({ success: false, message: "Job stage already exists" });
//     }

//     const stage = await JobStage.create({
//       title: title.trim(),
//       order,
//       created_by: companyId,
//     });

//     res.status(201).json({ success: true, data: stage });
//   } catch (err) {
//     console.error("❌ Create Job Stage Error:", err);
//     res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// };

// // ---------------------------------------------------
// // Update job stage
// exports.updateJobStage = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     const stage = await JobStage.findOne({
//       where: { id: req.params.id, created_by: companyId },
//     });

//     if (!stage) return res.status(404).json({ success: false, message: "Job stage not found" });

//     const { title, order } = req.body;

//     if (title?.trim()) {
//       const exists = await JobStage.findOne({
//         where: { title: title.trim(), created_by: companyId },
//       });
//       if (exists && exists.id !== stage.id) {
//         return res.status(400).json({ success: false, message: "Job stage already exists" });
//       }
//       stage.title = title.trim();
//     }

//     if (typeof order !== "undefined") {
//       stage.order = order;
//     }

//     await stage.save();

//     res.json({ success: true, data: stage });
//   } catch (err) {
//     console.error("❌ Update Job Stage Error:", err);
//     res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// };

// // ---------------------------------------------------
// // Delete job stage
// exports.deleteJobStage = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     const stage = await JobStage.findOne({
//       where: { id: req.params.id, created_by: companyId },
//     });
//     if (!stage) return res.status(404).json({ success: false, message: "Job stage not found" });

//     await stage.destroy();
//     res.json({ success: true, message: "Job stage deleted successfully" });
//   } catch (err) {
//     console.error("❌ Delete Job Stage Error:", err);
//     res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// };

// // ---------------------------------------------------
// // Reorder job stages
// exports.updateJobStageOrder = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     const { order = [] } = req.body;

//     for (let i = 0; i < order.length; i++) {
//       await JobStage.update(
//         { order: i },
//         { where: { id: order[i], created_by: companyId } }
//       );
//     }

//     res.json({ success: true, message: "Order updated successfully" });
//   } catch (err) {
//     console.error("❌ Reorder Job Stages Error:", err);
//     res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// };



const JobStage = require("../models/job_stage.model");
const Employee = require("../models/employee.model");

// ✅ Tenant isolation helper
async function getCompanyId(req) {
  if (req.user?.creator_id) return req.user.creator_id;

  if (req.user?.type === "Employee") {
    const emp = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ["created_by"],
    });
    return emp?.created_by;
  }

  return req.user?.id; // company login
}

function isCompanyUser(req) {
  const t = (req.user?.type || "").toLowerCase();
  return t === "company" || t === "admin";
}

// ---------------------------------------------------
// Get all job stages
exports.getAllJobStages = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);

    const stages = await JobStage.findAll({
      where: { created_by: companyId },
      order: [["order", "ASC"]],
    });

    res.json({ success: true, data: stages });
  } catch (error) {
    console.error("❌ Get Job Stages Error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ---------------------------------------------------
// Get job stage by ID
exports.getJobStageById = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    const stage = await JobStage.findOne({
      where: { id: req.params.id, created_by: companyId },
    });

    if (!stage) return res.status(404).json({ success: false, message: "Job stage not found" });

    res.json({ success: true, data: stage });
  } catch (error) {
    console.error("❌ Get Job Stage Error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ---------------------------------------------------
// Create job stage
exports.createJobStage = async (req, res) => {
  try {
    const { title, order = 0 } = req.body;
    if (!title?.trim()) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }

    const companyId = await getCompanyId(req);

    // prevent duplicate title per company
    const exists = await JobStage.findOne({ where: { title: title.trim(), created_by: companyId } });
    if (exists) {
      return res.status(400).json({ success: false, message: "Job stage already exists" });
    }

    const stage = await JobStage.create({
      title: title.trim(),
      order,
      created_by: companyId,
    });

    res.status(201).json({ success: true, data: stage });
  } catch (error) {
    console.error("❌ Create Job Stage Error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ---------------------------------------------------
// Update job stage
exports.updateJobStage = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    const stage = await JobStage.findOne({
      where: { id: req.params.id, created_by: companyId },
    });

    if (!stage) return res.status(404).json({ success: false, message: "Job stage not found" });

    const { title, order } = req.body;

    if (title?.trim()) {
      const exists = await JobStage.findOne({
        where: { title: title.trim(), created_by: companyId },
      });
      if (exists && exists.id !== stage.id) {
        return res.status(400).json({ success: false, message: "Job stage already exists" });
      }
      stage.title = title.trim();
    }

    if (typeof order !== "undefined") {
      stage.order = order;
    }

    await stage.save();

    res.json({ success: true, data: stage });
  } catch (error) {
    console.error("❌ Update Job Stage Error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ---------------------------------------------------
// Delete job stage
exports.deleteJobStage = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    const stage = await JobStage.findOne({
      where: { id: req.params.id, created_by: companyId },
    });

    if (!stage) return res.status(404).json({ success: false, message: "Job stage not found" });

    await stage.destroy();
    res.json({ success: true, message: "Job stage deleted successfully" });
  } catch (error) {
    console.error("❌ Delete Job Stage Error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ---------------------------------------------------
// Reorder job stages
exports.updateJobStageOrder = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    const { order = [] } = req.body;

    if (!Array.isArray(order) || order.length === 0) {
      return res.status(400).json({ success: false, message: "Order must be a non-empty array" });
    }

    for (let i = 0; i < order.length; i++) {
      await JobStage.update(
        { order: i },
        { where: { id: order[i], created_by: companyId } }
      );
    }

    res.json({ success: true, message: "Order updated successfully" });
  } catch (error) {
    console.error("❌ Reorder Job Stages Error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
