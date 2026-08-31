// const Unit = require('../models/unit.model');
// const Employee = require('../models/employee.model');

// // =====================
// // Helper: resolve company id from request
// // =====================
// async function getCompanyId(req) {
//   if (req.user?.type?.toLowerCase() === 'company') {
//     return req.user.id; // company users → their own id
//   }

//   // employee/HR/manager etc. → find via employee record
//   const emp = await Employee.findOne({
//     where: { user_id: req.user.id },
//     attributes: ['created_by']
//   });

//   return emp?.created_by || null;
// }

// // =====================
// // Format Unit Response
// // =====================
// function formatUnitResponse(unit) {
//   if (!unit) return null;
//   const json = unit.toJSON ? unit.toJSON() : unit;
//   return {
//     id: json.id,
//     name: json.name,
//     created_by: json.created_by,
//     created_at: json.created_at,
//     updated_at: json.updated_at
//   };
// }

// const UnitController = {
//   async getAll(req, res) {
//     try {
//       const companyId = await getCompanyId(req);
//       if (!companyId) {
//         return res.status(403).json({ success: false, message: 'Unable to resolve company' });
//       }

//       const units = await Unit.findAll({
//         where: { created_by: companyId },
//         order: [['id', 'DESC']]
//       });

//       res.json({
//         success: true,
//         data: units.map(formatUnitResponse)
//       });
//     } catch (error) {
//       res.status(500).json({ success: false, message: 'Server error', error: error.message });
//     }
//   },

//   async getById(req, res) {
//     try {
//       const companyId = await getCompanyId(req);
//       if (!companyId) {
//         return res.status(403).json({ success: false, message: 'Unable to resolve company' });
//       }

//       const unit = await Unit.findOne({
//         where: { id: req.params.id, created_by: companyId }
//       });

//       if (!unit) return res.status(404).json({ success: false, message: 'Unit not found' });

//       res.json({ success: true, data: formatUnitResponse(unit) });
//     } catch (error) {
//       res.status(500).json({ success: false, message: 'Server error', error: error.message });
//     }
//   },

//   async create(req, res) {
//     try {
//       const { name } = req.body;
//       if (!name || !String(name).trim()) {
//         return res.status(400).json({ success: false, message: 'name is required' });
//       }

//       const companyId = await getCompanyId(req);
//       if (!companyId) {
//         return res.status(403).json({ success: false, message: 'Unable to resolve company for user' });
//       }

//       const unit = await Unit.create({
//         name: String(name).trim(),
//         created_by: companyId
//       });

//       res.status(201).json({
//         success: true,
//         message: 'Unit created successfully',
//         data: formatUnitResponse(unit)
//       });
//     } catch (error) {
//       res.status(500).json({ success: false, message: 'Failed to create unit', error: error.message });
//     }
//   },

//   async update(req, res) {
//     try {
//       const companyId = await getCompanyId(req);
//       if (!companyId) {
//         return res.status(403).json({ success: false, message: 'Unable to resolve company' });
//       }

//       const unit = await Unit.findOne({
//         where: { id: req.params.id, created_by: companyId }
//       });
//       if (!unit) return res.status(404).json({ success: false, message: 'Unit not found' });

//       const { name } = req.body;
//       if (name !== undefined) {
//         if (!String(name).trim()) {
//           return res.status(400).json({ success: false, message: 'name cannot be empty' });
//         }
//         unit.name = String(name).trim();
//       }

//       await unit.save();
//       res.json({
//         success: true,
//         message: 'Unit updated successfully',
//         data: formatUnitResponse(unit)
//       });
//     } catch (error) {
//       res.status(500).json({ success: false, message: 'Failed to update unit', error: error.message });
//     }
//   },

//   async delete(req, res) {
//     try {
//       const companyId = await getCompanyId(req);
//       if (!companyId) {
//         return res.status(403).json({ success: false, message: 'Unable to resolve company' });
//       }

//       const unit = await Unit.findOne({
//         where: { id: req.params.id, created_by: companyId }
//       });
//       if (!unit) return res.status(404).json({ success: false, message: 'Unit not found' });

//       await unit.destroy();
//       res.json({
//         success: true,
//         message: 'Unit deleted successfully',
//         data: { id: req.params.id }
//       });
//     } catch (error) {
//       res.status(500).json({ success: false, message: 'Failed to delete unit', error: error.message });
//     }
//   },
// };

// module.exports = UnitController;

// controllers/unit.controller.js
const Unit = require('../models/unit.model');

// ================================
// GET ALL UNITS
// ================================
exports.getAll = async (req, res) => {
  try {
    const units = await Unit.findAll({
      where: { is_active: true },
      order: [['id', 'DESC']],
    });
    return res.status(200).json({ success: true, data: units });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ================================
// GET UNIT BY ID
// ================================
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const unit = await Unit.findByPk(id);
    if (!unit) return res.status(404).json({ success: false, message: 'Unit not found' });

    return res.status(200).json({ success: true, data: unit });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ================================
// CREATE UNIT
// ================================
exports.create = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    const existing = await Unit.findOne({ where: { name } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Unit already exists' });
    }

    const unit = await Unit.create({
      name,
      created_by: req.user?.id || 0,
    });

    return res.status(201).json({ success: true, message: 'Unit created successfully', data: unit });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ================================
// UPDATE UNIT
// ================================
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const unit = await Unit.findByPk(id);
    if (!unit) return res.status(404).json({ success: false, message: 'Unit not found' });

    await unit.update({
      name: name || unit.name,
      updated_by: req.user?.id || 0,
    });

    return res.status(200).json({ success: true, message: 'Unit updated successfully', data: unit });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ================================
// DELETE UNIT
// ================================
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const unit = await Unit.findByPk(id);
    if (!unit) return res.status(404).json({ success: false, message: 'Unit not found' });

    await unit.destroy();
    return res.status(200).json({ success: true, message: 'Unit deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

