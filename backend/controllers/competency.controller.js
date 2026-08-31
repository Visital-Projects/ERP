


// const Competency = require("../models/competency.model");
// const PerformanceType = require("../models/performanceType.model");

// // Get all competencies
// exports.getAll = async (req, res) => {
//   try {
//     const createdBy = req.user?.created_by || req.user?.id;
//     const competencies = await Competency.findAll({
//       where: { created_by: createdBy },
//       include: [
//         {
//           model: PerformanceType,
//           as: "performanceType",
//           attributes: ["id", "name"],
//         },
//       ],
//     });
//     res.json(competencies);
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// exports.getById = async (req, res) => {
//   try {
//     const competency = await Competency.findByPk(req.params.id, {
//       include: [
//         {
//           model: PerformanceType,
//           as: "performanceType",
//           attributes: ["id", "name"],
//         },
//       ],
//     });

//     if (!competency) {
//       return res.status(404).json({ message: "Competency not found" });
//     }

//     res.json(competency);
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };


// // Create new competency
// exports.create = async (req, res) => {
//   try {
//     const { name, type } = req.body;
//     const createdBy = req.user?.created_by || req.user?.id;

//     if (!name || !type) {
//       return res.status(400).json({ message: "Name and type are required" });
//     }

//     const newCompetency = await Competency.create({
//       name,
//       type,
//       created_by: createdBy,
//     });

//     res.status(201).json(newCompetency);
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// // Update competency
// exports.update = async (req, res) => {
//   try {
//     const { name, type } = req.body;
//     const competency = await Competency.findByPk(req.params.id);
//     if (!competency) return res.status(404).json({ message: "Not found" });

//     competency.name = name || competency.name;
//     competency.type = type || competency.type;
//     await competency.save();

//     res.json(competency);
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// // Delete competency
// exports.delete = async (req, res) => {
//   try {
//     const competency = await Competency.findByPk(req.params.id);
//     if (!competency) return res.status(404).json({ message: "Not found" });

//     await competency.destroy();
//     res.json({ message: "Deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };




// const Competency = require("../models/competency.model");
// const PerformanceType = require("../models/performanceType.model");

// // Helper for tenant isolation
// function getCompanyId(req) {
//   return req.user?.creator_id || req.user?.id;
// }

// // Get all competencies
// exports.getAll = async (req, res) => {
//   try {
//     const companyId = getCompanyId(req);
//     const competencies = await Competency.findAll({
//       where: { created_by: companyId },
//       include: [
//         {
//           model: PerformanceType,
//           as: "performanceType",
//           attributes: ["id", "name"],
//         },
//       ],
//       order: [["id", "DESC"]],
//     });
//     res.json({ success: true, data: competencies });
//   } catch (err) {
//     res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// };

// exports.getById = async (req, res) => {
//   try {
//     const companyId = getCompanyId(req);
//     const competency = await Competency.findOne({
//       where: { id: req.params.id, created_by: companyId },
//       include: [
//         { model: PerformanceType, as: "performanceType", attributes: ["id", "name"] }
//       ]
//     });

//     if (!competency) {
//       return res.status(404).json({ success: false, message: "Competency not found" });
//     }

//     res.json({ success: true, data: competency });
//   } catch (err) {
//     res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// };

// // Create new competency
// exports.create = async (req, res) => {
//   try {
//     const { name, type } = req.body;
//     const companyId = getCompanyId(req);

//     if (!name || !type) {
//       return res.status(400).json({ success: false, message: "Name and type are required" });
//     }

//     const newCompetency = await Competency.create({
//       name,
//       type,
//       created_by: companyId,
//     });

//     res.status(201).json({ success: true, data: newCompetency });
//   } catch (err) {
//     res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// };

// // Update competency
// exports.update = async (req, res) => {
//   try {
//     const { name, type } = req.body;
//     const companyId = getCompanyId(req);

//     const competency = await Competency.findOne({ where: { id: req.params.id, created_by: companyId } });
//     if (!competency) return res.status(404).json({ success: false, message: "Not found" });

//     competency.name = name || competency.name;
//     competency.type = type || competency.type;
//     await competency.save();

//     res.json({ success: true, data: competency });
//   } catch (err) {
//     res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// };

// // Delete competency
// exports.delete = async (req, res) => {
//   try {
//     const companyId = getCompanyId(req);
//     const competency = await Competency.findOne({ where: { id: req.params.id, created_by: companyId } });

//     if (!competency) return res.status(404).json({ success: false, message: "Not found" });

//     await competency.destroy();
//     res.json({ success: true, message: "Deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ success: false, message: "Server error", error: err.message });
//   }
// };




const Competency = require("../models/competency.model");
const PerformanceType = require("../models/performanceType.model");
const Employee = require("../models/employee.model");

// 🔹 Helper for tenant isolation
async function getCompanyId(req) {
  if (req.user?.creator_id) return req.user.creator_id;

  if (req.user?.type === 'Employee') {
    const emp = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ["created_by"]
    });
    return emp?.created_by;
  }

  return req.user?.id; // company login
}

function isCompanyUser(req) {
  const t = (req.user?.type || "").toLowerCase();
  return t === "company" || t === "admin";
}

// ---------------------------------------------------------
// Get all competencies
exports.getAll = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    let where = { created_by: companyId };

    // Employees only see company’s competencies (not others)
    if (!isCompanyUser(req)) {
      where.created_by = companyId;
    }

    const competencies = await Competency.findAll({
      where,
      include: [
        {
          model: PerformanceType,
          as: "performanceType",
          attributes: ["id", "name"],
        },
      ],
      order: [["id", "DESC"]],
    });

    res.json({ success: true, data: competencies });
  } catch (err) {
    console.error("❌ Get Competencies Error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// ---------------------------------------------------------
// Get by ID
exports.getById = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    const competency = await Competency.findOne({
      where: { id: req.params.id, created_by: companyId },
      include: [{ model: PerformanceType, as: "performanceType", attributes: ["id", "name"] }]
    });

    if (!competency) return res.status(404).json({ success: false, message: "Competency not found" });

    res.json({ success: true, data: competency });
  } catch (err) {
    console.error("❌ Get Competency Error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// ---------------------------------------------------------
// Create
exports.create = async (req, res) => {
  try {
    const { name, type } = req.body;
    const companyId = await getCompanyId(req);

    if (!name?.trim() || !type) {
      return res.status(400).json({ success: false, message: "Name and type are required" });
    }

    const newCompetency = await Competency.create({
      name: name.trim(),
      type,
      created_by: companyId,
    });

    res.status(201).json({ success: true, data: newCompetency });
  } catch (err) {
    console.error("❌ Create Competency Error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// ---------------------------------------------------------
// Update
exports.update = async (req, res) => {
  try {
    const { name, type } = req.body;
    const companyId = await getCompanyId(req);

    const competency = await Competency.findOne({ where: { id: req.params.id, created_by: companyId } });
    if (!competency) return res.status(404).json({ success: false, message: "Not found" });

    competency.name = name?.trim() || competency.name;
    competency.type = type || competency.type;
    await competency.save();

    res.json({ success: true, data: competency });
  } catch (err) {
    console.error("❌ Update Competency Error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// ---------------------------------------------------------
// Delete
exports.delete = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    const competency = await Competency.findOne({ where: { id: req.params.id, created_by: companyId } });

    if (!competency) return res.status(404).json({ success: false, message: "Not found" });

    await competency.destroy();
    res.json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    console.error("❌ Delete Competency Error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};
