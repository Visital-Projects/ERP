// const WorkingZone = require('../models/workingZone.model');
// const PlantName = require('../models/plant_name.model');  // Make sure this model is imported

// exports.createWorkingZone = async (req, res) => {
//     try {
//         const { plant_id, name } = req.body;
//         const created_by = req.user.id;

//         const plant = await PlantName.findByPk(plant_id);
//         if (!plant) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Invalid plant_id: Plant does not exist'
//             });
//         }

//         const workingZone = await WorkingZone.create({ plant_name: plant_id, name, created_by });

//         res.status(201).json({ success: true, data: workingZone });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// };


// // Get All Working Zones
// exports.getAllWorkingZones = async (req, res) => {
//     try {
//         const workingZones = await WorkingZone.findAll({
//             include: { association: 'plant', attributes: ['id', 'name'] }
//         });
//         res.json({ success: true, data: workingZones });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// };

// // Get Working Zone by ID
// exports.getWorkingZoneById = async (req, res) => {
//     try {
//         const id = req.params.id;
//         const workingZone = await WorkingZone.findByPk(id, {
//             include: { association: 'plant', attributes: ['id', 'name'] }
//         });

//         if (!workingZone) {
//             return res.status(404).json({ success: false, message: 'Working Zone not found' });
//         }

//         res.json({ success: true, data: workingZone });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// };

// // // Update Working Zone
// // exports.updateWorkingZone = async (req, res) => {
// //     try {
// //         const id = req.params.id;
// //         const { plant_name, name, created_by } = req.body;

// //         const updated = await WorkingZone.update(
// //             { plant_name, name, created_by },
// //             { where: { id } }
// //         );

// //         if (updated[0] === 0) {
// //             return res.status(404).json({ success: false, message: 'Working Zone not found or no changes' });
// //         }

// //         const updatedZone = await WorkingZone.findByPk(id);
// //         res.json({ success: true, data: updatedZone });
// //     } catch (error) {
// //         res.status(500).json({ success: false, message: error.message });
// //     }
// // };
// exports.updateWorkingZone = async (req, res) => {
//     try {
//         const id = req.params.id;
//         const { plant_id, name } = req.body;
//         const created_by = req.user.id;

//         // Check if the Working Zone exists
//         const existingZone = await WorkingZone.findByPk(id);
//         if (!existingZone) {
//             return res.status(404).json({ success: false, message: 'Working Zone not found' });
//         }

//         // Optional: Validate plant_id
//         const plant = await PlantName.findByPk(plant_id);
//         if (!plant) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Invalid plant_id: Plant does not exist'
//             });
//         }

//         // Perform update
//         await WorkingZone.update(
//             { plant_name: plant_id, name, created_by, updated_at: new Date() },
//             { where: { id } }
//         );

//         const updatedZone = await WorkingZone.findByPk(id, {
//             include: { association: 'plant', attributes: ['id', 'name'] }
//         });

//         res.json({ success: true, data: updatedZone });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// };


// // Delete Working Zone
// exports.deleteWorkingZone = async (req, res) => {
//     try {
//         const id = req.params.id;
//         const deleted = await WorkingZone.destroy({ where: { id } });

//         if (!deleted) {
//             return res.status(404).json({ success: false, message: 'Working Zone not found' });
//         }

//         res.json({ success: true, message: 'Working Zone deleted successfully' });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// };





// // controllers/workingZone.controller.js
// const WorkingZone = require('../models/workingZone.model');
// const PlantName = require('../models/plant_name.model');
// const Employee = require('../models/employee.model');

// // ==============================
// // Helper: get root company id
// // ==============================
// async function getCompanyId(req) {
//   if (!req.user) return null;
//   const type = req.user.type?.toLowerCase();

//   // Company login
//   if (type === "company") return req.user.id;

//   // Employee login
//   if (type === "employee") {
//     const emp = await Employee.findOne({
//       where: { user_id: req.user.id },
//       attributes: ["created_by"],
//     });
//     if (emp?.created_by) return emp.created_by;
//   }

//   // Accountant/HR/Manager
//   const emp = await Employee.findOne({
//     where: { user_id: req.user.id },
//     attributes: ["created_by"],
//   });
//   if (emp?.created_by) return emp.created_by;

//   return req.user.id;
// }

// // ==============================
// // CREATE
// // ==============================
// exports.createWorkingZone = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     const { plant_id, name } = req.body;

//     // ✅ Validate plant belongs to same company
//     const plant = await PlantName.findOne({
//       where: { id: plant_id, created_by: companyId },
//     });
//     if (!plant) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid plant_id for this company",
//       });
//     }

//     const workingZone = await WorkingZone.create({
//       plant_name: plant_id,
//       name,
//       created_by: companyId,
//     });

//     res.status(201).json({ success: true, data: workingZone });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ==============================
// // GET ALL
// // ==============================
// exports.getAllWorkingZones = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);

//     const workingZones = await WorkingZone.findAll({
//       where: { created_by: companyId },
//       include: { association: "plant", attributes: ["id", "name"] },
//     });

//     res.json({ success: true, data: workingZones });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ==============================
// // GET BY ID
// // ==============================
// exports.getWorkingZoneById = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     const id = req.params.id;

//     const workingZone = await WorkingZone.findOne({
//       where: { id, created_by: companyId },
//       include: { association: "plant", attributes: ["id", "name"] },
//     });

//     if (!workingZone) {
//       return res.status(404).json({
//         success: false,
//         message: "Working Zone not found for this company",
//       });
//     }

//     res.json({ success: true, data: workingZone });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ==============================
// // UPDATE
// // ==============================
// exports.updateWorkingZone = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     const id = req.params.id;
//     const { plant_id, name } = req.body;

//     const existingZone = await WorkingZone.findOne({
//       where: { id, created_by: companyId },
//     });
//     if (!existingZone) {
//       return res.status(404).json({
//         success: false,
//         message: "Working Zone not found for this company",
//       });
//     }

//     // ✅ Validate plant_id
//     const plant = await PlantName.findOne({
//       where: { id: plant_id, created_by: companyId },
//     });
//     if (!plant) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid plant_id for this company",
//       });
//     }

//     await WorkingZone.update(
//       { plant_name: plant_id, name, created_by: companyId, updated_at: new Date() },
//       { where: { id } }
//     );

//     const updatedZone = await WorkingZone.findByPk(id, {
//       include: { association: "plant", attributes: ["id", "name"] },
//     });

//     res.json({ success: true, data: updatedZone });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // ==============================
// // DELETE
// // ==============================
// exports.deleteWorkingZone = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     const id = req.params.id;

//     const deleted = await WorkingZone.destroy({
//       where: { id, created_by: companyId },
//     });

//     if (!deleted) {
//       return res.status(404).json({
//         success: false,
//         message: "Working Zone not found for this company",
//       });
//     }

//     res.json({ success: true, message: "Working Zone deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };







const WorkingZone = require('../models/workingZone.model');
const Branch = require('../models/branch.model');
const Employee = require('../models/employee.model');

// ==============================
// Helper: get root company id
// ==============================
async function getCompanyId(req) {
  if (!req.user) return null;
  const type = req.user.type?.toLowerCase();

  if (type === "company") return req.user.id;

  const emp = await Employee.findOne({
    where: { user_id: req.user.id },
    attributes: ["created_by"],
  });
  if (emp?.created_by) return emp.created_by;

  return req.user.id;
}

// ==============================
// CREATE
// ==============================
exports.createWorkingZone = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    const { branch_id, name } = req.body;

    // ✅ Validate branch belongs to same company
    const branch = await Branch.findOne({
      where: { id: branch_id, created_by: companyId },
    });
    if (!branch) {
      return res.status(400).json({
        success: false,
        message: "Invalid branch_id for this company",
      });
    }

    const workingZone = await WorkingZone.create({
      branch_id,
      name,
      created_by: companyId,
    });

    res.status(201).json({ success: true, data: workingZone });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==============================
// GET ALL
// ==============================
exports.getAllWorkingZones = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);

    const workingZones = await WorkingZone.findAll({
      where: { created_by: companyId },
      include: { association: "branch", attributes: ["id", "name"] },
    });

    res.json({ success: true, data: workingZones });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==============================
// GET BY ID
// ==============================
exports.getWorkingZoneById = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    const id = req.params.id;

    const workingZone = await WorkingZone.findOne({
      where: { id, created_by: companyId },
      include: { association: "branch", attributes: ["id", "name"] },
    });

    if (!workingZone) {
      return res.status(404).json({
        success: false,
        message: "Working Zone not found for this company",
      });
    }

    res.json({ success: true, data: workingZone });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==============================
// UPDATE
// ==============================
exports.updateWorkingZone = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    const id = req.params.id;
    const { branch_id, name } = req.body;

    const existingZone = await WorkingZone.findOne({
      where: { id, created_by: companyId },
    });
    if (!existingZone) {
      return res.status(404).json({
        success: false,
        message: "Working Zone not found for this company",
      });
    }

    // ✅ Validate branch_id
    const branch = await Branch.findOne({
      where: { id: branch_id, created_by: companyId },
    });
    if (!branch) {
      return res.status(400).json({
        success: false,
        message: "Invalid branch_id for this company",
      });
    }

    await WorkingZone.update(
      { branch_id, name, created_by: companyId, updated_at: new Date() },
      { where: { id } }
    );

    const updatedZone = await WorkingZone.findByPk(id, {
      include: { association: "branch", attributes: ["id", "name"] },
    });

    res.json({ success: true, data: updatedZone });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==============================
// DELETE
// ==============================
exports.deleteWorkingZone = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    const id = req.params.id;

    const deleted = await WorkingZone.destroy({
      where: { id, created_by: companyId },
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Working Zone not found for this company",
      });
    }

    res.json({ success: true, message: "Working Zone deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
