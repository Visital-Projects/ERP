// const VendorName = require('../models/vendorName.model');
// const WorkingZone = require('../models/workingZone.model');

// // // Create Vendor Name
// // exports.createVendorName = async (req, res) => {
// //     try {
// //         const { working_zone, name } = req.body;
// //         const created_by = req.user.id;

// //         // ? Validate working_zone exists
// //         const zone = await WorkingZone.findByPk(working_zone);
// //         if (!zone) {
// //             return res.status(400).json({
// //                 success: false,
// //                 message: 'Invalid working_zone: Working Zone does not exist'
// //             });
// //         }

// //         const vendor = await VendorName.create({ working_zone, name, created_by });

// //         res.status(201).json({ success: true, data: vendor });
// //     } catch (error) {
// //         res.status(500).json({ success: false, message: error.message });
// //     }
// // };

// exports.createVendorName = async (req, res) => {
//     try {
//         const { working_zone_id, name } = req.body;
//         const created_by = req.user.id;

//         // Validate working_zone exists
//         const zone = await WorkingZone.findByPk(working_zone_id);
//         if (!zone) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Invalid working_zone_id: Working Zone does not exist'
//             });
//         }

//         const vendor = await VendorName.create({ working_zone: working_zone_id, name, created_by });

//         res.status(201).json({ success: true, data: vendor });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// };


// // Get All Vendor Names
// exports.getAllVendorNames = async (req, res) => {
//     try {
//         const vendors = await VendorName.findAll({
//             include: { association: 'workingZone', attributes: ['id', 'name'] }
//         });

//         res.json({ success: true, data: vendors });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// };

// // Get Vendor by ID
// exports.getVendorNameById = async (req, res) => {
//     try {
//         const id = req.params.id;
//         const vendor = await VendorName.findByPk(id, {
//             include: { association: 'workingZone', attributes: ['id', 'name'] }
//         });

//         if (!vendor) {
//             return res.status(404).json({ success: false, message: 'Vendor not found' });
//         }

//         res.json({ success: true, data: vendor });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// };

// // // Update Vendor Name
// // exports.updateVendorName = async (req, res) => {
// //     try {
// //         const id = req.params.id;
// //         const { working_zone, name } = req.body;

// //         const zone = await WorkingZone.findByPk(working_zone);
// //         if (!zone) {
// //             return res.status(400).json({
// //                 success: false,
// //                 message: 'Invalid working_zone: Working Zone does not exist'
// //             });
// //         }

// //         const updated = await VendorName.update(
// //             { working_zone, name },
// //             { where: { id } }
// //         );

// //         if (updated[0] === 0) {
// //             return res.status(404).json({ success: false, message: 'Vendor not found or no changes' });
// //         }

// //         const updatedVendor = await VendorName.findByPk(id);
// //         res.json({ success: true, data: updatedVendor });
// //     } catch (error) {
// //         res.status(500).json({ success: false, message: error.message });
// //     }
// // };
// exports.updateVendorName = async (req, res) => {
//     try {
//         const id = req.params.id;
//         const { working_zone_id, name } = req.body;

//         // Validate working_zone exists
//         const zone = await WorkingZone.findByPk(working_zone_id);
//         if (!zone) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Invalid working_zone_id: Working Zone does not exist'
//             });
//         }

//         // Check if vendor exists
//         const vendor = await VendorName.findByPk(id);
//         if (!vendor) {
//             return res.status(404).json({ success: false, message: 'Vendor not found' });
//         }

//         // Perform update
//         vendor.working_zone = working_zone_id;
//         vendor.name = name;
//         await vendor.save();

//         const updatedVendor = await VendorName.findByPk(id, {
//             include: { association: 'workingZone', attributes: ['id', 'name'] }
//         });

//         res.json({ success: true, data: updatedVendor });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// };


// // Delete Vendor Name
// exports.deleteVendorName = async (req, res) => {
//     try {
//         const id = req.params.id;
//         const deleted = await VendorName.destroy({ where: { id } });

//         if (!deleted) {
//             return res.status(404).json({ success: false, message: 'Vendor not found' });
//         }

//         res.json({ success: true, message: 'Vendor deleted successfully' });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// };





// controllers/vendor.controller.js
const VendorName = require("../models/vendorName.model");
const WorkingZone = require("../models/workingZone.model");
const Employee = require("../models/employee.model");

// ==============================
// Multi-tenant company helper
// ==============================
async function getCompanyId(req) {
  if (!req.user) return null;

  const type = req.user.type?.toLowerCase();

  if (type === "company") return req.user.id;

  if (type === "employee") {
    const emp = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ["created_by"],
    });
    if (emp?.created_by) return emp.created_by;
  }

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
exports.create = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId)
      return res.status(403).json({ message: "Unable to resolve company" });

    if (req.user.type?.toLowerCase() === "employee") {
      return res
        .status(403)
        .json({ message: "Not allowed to create Vendor" });
    }

    const { working_zone_id, name } = req.body;
    if (!working_zone_id || !name) {
      return res.status(400).json({ message: "working_zone_id & name are required" });
    }

    // Validate working zone belongs to same company
    const zone = await WorkingZone.findOne({
      where: { id: working_zone_id, created_by: companyId },
    });
    if (!zone) {
      return res.status(400).json({
        message: "Invalid working_zone_id for this company",
      });
    }

    const vendor = await VendorName.create({
      working_zone: working_zone_id,
      name,
      created_by: companyId,
    });

    return res.status(201).json({ success: true, data: vendor });
  } catch (error) {
    console.error("Error creating vendor:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==============================
// GET ALL
// ==============================
exports.getAll = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId)
      return res.status(403).json({ message: "Unable to resolve company" });

    const vendors = await VendorName.findAll({
      where: { created_by: companyId },
      include: { association: "workingZone", attributes: ["id", "name"] },
      order: [["id", "DESC"]],
    });

    res.json({ success: true, data: vendors });
  } catch (error) {
    console.error("Error fetching vendors:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==============================
// GET BY ID
// ==============================
exports.getById = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId)
      return res.status(403).json({ message: "Unable to resolve company" });

    const vendor = await VendorName.findOne({
      where: { id: req.params.id, created_by: companyId },
      include: { association: "workingZone", attributes: ["id", "name"] },
    });

    if (!vendor) {
      return res.status(404).json({ success: false, message: "Vendor not found" });
    }

    res.json({ success: true, data: vendor });
  } catch (error) {
    console.error("Error fetching vendor:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==============================
// UPDATE
// ==============================
exports.update = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId)
      return res.status(403).json({ message: "Unable to resolve company" });

    if (req.user.type?.toLowerCase() === "employee") {
      return res
        .status(403)
        .json({ message: "Not allowed to update Vendor" });
    }

    const { working_zone_id, name } = req.body;

    const vendor = await VendorName.findOne({
      where: { id: req.params.id, created_by: companyId },
    });
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    if (working_zone_id) {
      const zone = await WorkingZone.findOne({
        where: { id: working_zone_id, created_by: companyId },
      });
      if (!zone) {
        return res.status(400).json({
          message: "Invalid working_zone_id for this company",
        });
      }
      vendor.working_zone = working_zone_id;
    }

    if (name !== undefined) vendor.name = name;

    await vendor.save();

    const updatedVendor = await VendorName.findOne({
      where: { id: vendor.id, created_by: companyId },
      include: { association: "workingZone", attributes: ["id", "name"] },
    });

    res.json({ success: true, data: updatedVendor });
  } catch (error) {
    console.error("Error updating vendor:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==============================
// DELETE
// ==============================
exports.remove = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId)
      return res.status(403).json({ message: "Unable to resolve company" });

    if (req.user.type?.toLowerCase() === "employee") {
      return res
        .status(403)
        .json({ message: "Not allowed to delete Vendor" });
    }

    const vendor = await VendorName.findOne({
      where: { id: req.params.id, created_by: companyId },
    });
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    await vendor.destroy();
    return res.json({ success: true, message: "Vendor deleted successfully" });
  } catch (error) {
    console.error("Error deleting vendor:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
