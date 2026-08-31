
// const Trainer = require('../models/trainer.model');

// exports.getAll = async (req, res) => {
// try {
// const trainers = await Trainer.findAll();
// res.json(trainers);
// } catch (err) {
// res.status(500).json({ message: 'Server error', error: err.message });
// }
// };

// exports.getById = async (req, res) => {
// try {
// const trainer = await Trainer.findByPk(req.params.id);
// if (!trainer) return res.status(404).json({ message: 'Trainer not found' });
// res.json(trainer);
// } catch (err) {
// res.status(500).json({ message: 'Server error', error: err.message });
// }
// };

// exports.create = async (req, res) => {
// try {
// const data = req.body;
// data.created_by = req.user?.id || null;
// const trainer = await Trainer.create(data);
// res.status(201).json(trainer);
// } catch (err) {
// res.status(500).json({ message: 'Error creating trainer', error: err.message });
// }
// };

// exports.update = async (req, res) => {
// try {
// const trainer = await Trainer.findByPk(req.params.id);
// if (!trainer) return res.status(404).json({ message: 'Trainer not found' });
// await trainer.update(req.body);
// res.json(trainer);
// } catch (err) {
// res.status(500).json({ message: 'Error updating trainer', error: err.message });
// }
// };

// exports.delete = async (req, res) => {
// try {
// const trainer = await Trainer.findByPk(req.params.id);
// if (!trainer) return res.status(404).json({ message: 'Trainer not found' });
// await trainer.destroy();
// res.json({ message: 'Trainer deleted' });
// } catch (err) {
// res.status(500).json({ message: 'Error deleting trainer', error: err.message });
// }
// };










// const Trainer = require('../models/trainer.model');
// const User = require('../models/user.model');

// // ==========================
// // CREATE TRAINER
// // ==========================
// exports.createTrainer = async (req, res) => {
//   try {
//     if (!req.user?.id) {
//       return res.status(400).json({ message: "User ID not found in request" });
//     }

//     const now = new Date();

//     const trainer = await Trainer.create({
//       ...req.body,
//       created_by: req.user.id, // ✅ enforce created_by
//       created_at: now,         // ✅ set created_at
//       updated_at: now          // ✅ set updated_at
//     });

//     res.status(201).json(trainer);
//   } catch (error) {
//     console.error("❌ Create Trainer Error:", error);
//     res.status(500).json({ message: "Error creating trainer", error: error.message });
//   }
// };

// // ==========================
// // GET ALL TRAINERS
// // ==========================
// exports.getAll = async (req, res) => {
//   try {
//     const userId = req.user?.id;   // safely extract user id
//     if (!userId) {
//       return res.status(400).json({ message: "User ID missing from request" });
//     }

//     const trainers = await Trainer.findAll({
//       where: { created_by: userId },
//       order: [['id', 'DESC']]
//     });

//     res.json(trainers);
//   } catch (err) {
//     console.error("❌ Get Trainers Error:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };


// // ==========================
// // GET TRAINER BY ID
// // ==========================
// exports.getById = async (req, res) => {
//   try {
//     if (!req.user?.id) {
//       return res.status(400).json({ message: "User ID not found in request" });
//     }

//     const trainer = await Trainer.findOne({
//       where: { id: req.params.id, created_by: req.user.id }, // ✅ restrict by created_by
//       include: [{ model: User, as: 'creator', attributes: ['id', 'name', 'email'] }]
//     });

//     if (!trainer) return res.status(404).json({ message: "Trainer not found" });
//     res.json(trainer);
//   } catch (error) {
//     console.error("❌ Get Trainer By ID Error:", error);
//     res.status(500).json({ message: "Error fetching trainer", error: error.message });
//   }
// };

// // ==========================
// // UPDATE TRAINER
// // ==========================
// exports.updateTrainer = async (req, res) => {
//   try {
//     if (!req.user?.id) {
//       return res.status(400).json({ message: "User ID not found in request" });
//     }

//     const [updated] = await Trainer.update(
//       { ...req.body, updated_at: new Date() }, // ✅ update updated_at
//       { where: { id: req.params.id, created_by: req.user.id } } // ✅ restrict update
//     );

//     if (!updated) return res.status(404).json({ message: "Trainer not found or not authorized" });

//     const trainer = await Trainer.findOne({ where: { id: req.params.id } });
//     res.json(trainer);
//   } catch (error) {
//     console.error("❌ Update Trainer Error:", error);
//     res.status(500).json({ message: "Error updating trainer", error: error.message });
//   }
// };

// // ==========================
// // DELETE TRAINER
// // ==========================
// exports.deleteTrainer = async (req, res) => {
//   try {
//     if (!req.user?.id) {
//       return res.status(400).json({ message: "User ID not found in request" });
//     }

//     const deleted = await Trainer.destroy({
//       where: { id: req.params.id, created_by: req.user.id } // ✅ restrict delete
//     });

//     if (!deleted) return res.status(404).json({ message: "Trainer not found or not authorized" });

//     res.json({ message: "Trainer deleted successfully" });
//   } catch (error) {
//     console.error("❌ Delete Trainer Error:", error);
//     res.status(500).json({ message: "Error deleting trainer", error: error.message });
//   }
// };



















const Trainer = require('../models/trainer.model');
const Employee = require('../models/employee.model');
const Branch = require('../models/branch.model');
const User = require('../models/user.model');

// =====================
// Get Company ID (helper)
// =====================
async function getCompanyId(req) {
  if (req.user.type === 'company') {
    return req.user.id;
  } else if (req.user.type === 'Employee') {
    const employee = await Employee.findOne({ where: { user_id: req.user.id } });
    if (!employee) return null;
    return employee.created_by;
  }
  return null;
}

// =====================
// Get All Trainers
// =====================
exports.getAll = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ message: 'Unauthorized' });

    const trainers = await Trainer.findAll({ where: { created_by: companyId } });
    res.json({ success: true, data: trainers });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// =====================
// Get Trainer By ID
// =====================
exports.getById = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ message: 'Unauthorized' });

    const trainer = await Trainer.findOne({ 
      where: { id: req.params.id, created_by: companyId },
      include: [{ model: User, as: 'creator', attributes: ['id', 'name', 'email'] }]
    });

    if (!trainer) return res.status(404).json({ message: 'Trainer not found' });
    res.json({ success: true, data: trainer });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// =====================
// Create Trainer
// =====================
exports.createTrainer = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ message: 'Unauthorized' });

    const data = req.body;

    // 🔹 Validation: Branch check
    if (data.branch) {
      const branch = await Branch.findOne({ where: { id: data.branch, created_by: companyId } });
      if (!branch) return res.status(400).json({ message: 'Invalid branch for this company' });
    }

    data.created_by = companyId;
    data.created_at = new Date();
    data.updated_at = new Date();

    const trainer = await Trainer.create(data);
    res.status(201).json({ success: true, message: 'Trainer created successfully', data: trainer });
  } catch (err) {
    res.status(500).json({ message: 'Error creating trainer', error: err.message });
  }
};

// =====================
// Update Trainer
// =====================
exports.updateTrainer = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ message: 'Unauthorized' });

    const { id } = req.params;
    const data = req.body;

    const trainer = await Trainer.findOne({ where: { id, created_by: companyId } });
    if (!trainer) return res.status(404).json({ message: 'Trainer not found' });

    // 🔹 Validation: Branch check
    if (data.branch) {
      const branch = await Branch.findOne({ where: { id: data.branch, created_by: companyId } });
      if (!branch) return res.status(400).json({ message: 'Invalid branch for this company' });
    }

    await trainer.update({ ...data, updated_at: new Date() });
    res.json({ success: true, message: 'Trainer updated successfully', data: trainer });
  } catch (err) {
    res.status(500).json({ message: 'Error updating trainer', error: err.message });
  }
};

// =====================
// Delete Trainer
// =====================
exports.deleteTrainer = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) return res.status(403).json({ message: 'Unauthorized' });

    const { id } = req.params;
    const trainer = await Trainer.findOne({ where: { id, created_by: companyId } });
    if (!trainer) return res.status(404).json({ message: 'Trainer not found' });

    await trainer.destroy();
    res.json({ success: true, message: 'Trainer deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting trainer', error: err.message });
  }
};
