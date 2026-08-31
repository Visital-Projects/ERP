
// const Training = require('../models/training.model');

// exports.getAll = async (req, res) => {
// try {
// const trainings = await Training.findAll();
// res.json(trainings);
// } catch (err) {
// res.status(500).json({ message: 'Server error', error: err.message });
// }
// };

// exports.getById = async (req, res) => {
// try {
// const training = await Training.findByPk(req.params.id);
// if (!training) return res.status(404).json({ message: 'Not found' });
// res.json(training);
// } catch (err) {
// res.status(500).json({ message: 'Error', error: err.message });
// }
// };

// exports.create = async (req, res) => {
// try {
// const data = req.body;
// data.created_by = req.user?.id || null;
// const training = await Training.create(data);
// res.status(201).json(training);
// } catch (err) {
// res.status(500).json({ message: 'Error creating training', error: err.message });
// }
// };

// exports.update = async (req, res) => {
// try {
// const training = await Training.findByPk(req.params.id);
// if (!training) return res.status(404).json({ message: 'Not found' });
// await training.update(req.body);
// res.json(training);
// } catch (err) {
// res.status(500).json({ message: 'Update failed', error: err.message });
// }
// };

// exports.delete = async (req, res) => {
// try {
// const training = await Training.findByPk(req.params.id);
// if (!training) return res.status(404).json({ message: 'Not found' });
// await training.destroy();
// res.json({ message: 'Deleted successfully' });
// } catch (err) {
// res.status(500).json({ message: 'Delete failed', error: err.message });
// }
// };









// const Training = require('../models/training.model');

// function getCompanyId(req) {
//   return req.user?.creator_id || req.user?.id;
// }
// function isSuper(req) {
//   return (req.user?.type || '').toLowerCase() === 'super admin';
// }

// exports.getAll = async (req, res) => {
//   try {
//     const where = isSuper(req) ? {} : { created_by: getCompanyId(req) };
//     const trainings = await Training.findAll({ where });
//     res.json({ success: true, data: trainings });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };

// exports.getById = async (req, res) => {
//   try {
//     const where = isSuper(req) 
//       ? { id: req.params.id }
//       : { id: req.params.id, created_by: getCompanyId(req) };

//     const training = await Training.findOne({ where });
//     if (!training) return res.status(404).json({ message: 'Not found' });

//     res.json({ success: true, data: training });
//   } catch (err) {
//     res.status(500).json({ message: 'Error', error: err.message });
//   }
// };

// exports.create = async (req, res) => {
//   try {
//     const data = { ...req.body, created_by: getCompanyId(req) };
//     const training = await Training.create(data);
//     res.status(201).json({ success: true, data: training });
//   } catch (err) {
//     res.status(500).json({ message: 'Error creating training', error: err.message });
//   }
// };

// exports.update = async (req, res) => {
//   try {
//     const where = isSuper(req) 
//       ? { id: req.params.id }
//       : { id: req.params.id, created_by: getCompanyId(req) };

//     const training = await Training.findOne({ where });
//     if (!training) return res.status(404).json({ message: 'Not found' });

//     await training.update(req.body);
//     res.json({ success: true, data: training });
//   } catch (err) {
//     res.status(500).json({ message: 'Update failed', error: err.message });
//   }
// };

// exports.delete = async (req, res) => {
//   try {
//     const where = isSuper(req) 
//       ? { id: req.params.id }
//       : { id: req.params.id, created_by: getCompanyId(req) };

//     const training = await Training.findOne({ where });
//     if (!training) return res.status(404).json({ message: 'Not found' });

//     await training.destroy();
//     res.json({ success: true, message: 'Deleted successfully' });
//   } catch (err) {
//     res.status(500).json({ message: 'Delete failed', error: err.message });
//   }
// };



















const Training = require('../models/training.model');
const Employee = require('../models/employee.model');
const Branch = require('../models/branch.model');
const Department = require('../models/department.model');
const TrainingType = require('../models/trainingType.model'); // assuming you have this
const Trainer = require('../models/trainer.model'); // assuming you have this

// =====================
// Get All Trainings
// =====================
exports.getAll = async (req, res) => {
  try {
    let companyId = null;

    if (req.user.type === 'company') {
      companyId = req.user.id;
    } else if (req.user.type === 'Employee') {
      const employee = await Employee.findOne({ where: { user_id: req.user.id } });
      if (!employee) return res.status(403).json({ message: 'Employee profile not found' });
      companyId = employee.created_by;
    }

    const trainings = await Training.findAll({ where: { created_by: companyId } });
    res.json({ success: true, data: trainings });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// =====================
// Get Training By ID
// =====================
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    let companyId = null;

    if (req.user.type === 'company') {
      companyId = req.user.id;
    } else if (req.user.type === 'Employee') {
      const employee = await Employee.findOne({ where: { user_id: req.user.id } });
      if (!employee) return res.status(403).json({ message: 'Employee profile not found' });
      companyId = employee.created_by;
    }

    const training = await Training.findOne({ where: { id, created_by: companyId } });
    if (!training) return res.status(404).json({ message: 'Training not found' });

    res.json({ success: true, data: training });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// =====================
// Create Training
// =====================
exports.create = async (req, res) => {
  try {
    const data = req.body;
    let companyId = null;

    if (req.user.type === 'company') {
      companyId = req.user.id;
    } else if (req.user.type === 'Employee') {
      const employee = await Employee.findOne({ where: { user_id: req.user.id } });
      if (!employee) return res.status(403).json({ message: 'Employee profile not found' });

      companyId = employee.created_by;
    }

    // ====================
    // 🔹 VALIDATION
    // ====================
    // Branch check
    if (data.branch) {
      const branch = await Branch.findOne({ where: { id: data.branch, created_by: companyId } });
      if (!branch) return res.status(400).json({ message: 'Invalid branch for this company' });
    }

    // Training type check
    if (data.training_type) {
      const trainingType = await TrainingType.findOne({ where: { id: data.training_type, created_by: companyId } });
      if (!trainingType) return res.status(400).json({ message: 'Invalid training type for this company' });
    }

    // Trainer check
    if (data.trainer) {
      const trainer = await Trainer.findOne({ where: { id: data.trainer, created_by: companyId } });
      if (!trainer) return res.status(400).json({ message: 'Invalid trainer for this company' });
    }

    // Employee check
    if (data.employee) {
      const emp = await Employee.findOne({ where: { employee_id: data.employee, created_by: companyId } });
      if (!emp) return res.status(400).json({ message: 'Invalid employee for this company' });
    }

    // Save training
    data.created_by = companyId;
    data.created_at = new Date();
    data.updated_at = new Date();

    const training = await Training.create(data);
    res.status(201).json({ success: true, message: 'Training created successfully', data: training });

  } catch (err) {
    res.status(500).json({ message: 'Error creating training', error: err.message });
  }
};

// =====================
// Update Training
// =====================
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    let companyId = null;

    if (req.user.type === 'company') {
      companyId = req.user.id;
    } else if (req.user.type === 'Employee') {
      const employee = await Employee.findOne({ where: { user_id: req.user.id } });
      if (!employee) return res.status(403).json({ message: 'Employee profile not found' });

      companyId = employee.created_by;
    }

    const training = await Training.findOne({ where: { id, created_by: companyId } });
    if (!training) return res.status(404).json({ message: 'Training not found' });

    // 🔹 VALIDATION (same as create)
    if (data.branch) {
      const branch = await Branch.findOne({ where: { id: data.branch, created_by: companyId } });
      if (!branch) return res.status(400).json({ message: 'Invalid branch for this company' });
    }

    if (data.training_type) {
      const trainingType = await TrainingType.findOne({ where: { id: data.training_type, created_by: companyId } });
      if (!trainingType) return res.status(400).json({ message: 'Invalid training type for this company' });
    }

    if (data.trainer) {
      const trainer = await Trainer.findOne({ where: { id: data.trainer, created_by: companyId } });
      if (!trainer) return res.status(400).json({ message: 'Invalid trainer for this company' });
    }

    if (data.employee) {
      const emp = await Employee.findOne({ where: { employee_id: data.employee, created_by: companyId } });
      if (!emp) return res.status(400).json({ message: 'Invalid employee for this company' });
    }

    await training.update({ ...data, updated_at: new Date() });
    res.json({ success: true, message: 'Training updated successfully', data: training });

  } catch (err) {
    res.status(500).json({ message: 'Error updating training', error: err.message });
  }
};

// =====================
// Delete Training
// =====================
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    let companyId = null;

    if (req.user.type === 'company') {
      companyId = req.user.id;
    } else if (req.user.type === 'Employee') {
      const employee = await Employee.findOne({ where: { user_id: req.user.id } });
      if (!employee) return res.status(403).json({ message: 'Employee profile not found' });

      companyId = employee.created_by;
    }

    const training = await Training.findOne({ where: { id, created_by: companyId } });
    if (!training) return res.status(404).json({ message: 'Training not found' });

    await training.destroy();
    res.json({ success: true, message: 'Training deleted successfully' });

  } catch (err) {
    res.status(500).json({ message: 'Error deleting training', error: err.message });
  }
};
