

// controllers/vender.controller.js
const Vender = require("../models/vender.model");
const User = require("../models/user.model");

// ===============================
// CREATE VENDOR (auto vendor_id per company)
// ===============================
exports.create = async (req, res) => {
  try {
    const companyId = req.user.id; // logged-in user (company)
    if (!companyId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // Ensure the user is a company
    const company = await User.findByPk(companyId);
    if (!company || company.type.toLowerCase() !== "company") {
      return res.status(403).json({ success: false, message: "User is not a company" });
    }

    // Find last vendor under this company to increment vendor_id
    const lastVender = await Vender.findOne({
      where: { created_by: companyId },
      order: [["vender_id", "DESC"]],
    });

    const newVenderId = lastVender ? lastVender.vender_id + 1 : 1;

    const data = {
      ...req.body,
      vender_id: newVenderId, // per-company serial
      created_by: companyId,  // link to company user
      is_active: 1,
      created_at: new Date(),
      updated_at: new Date(),
    };

    const vender = await Vender.create(data);

    res.status(201).json({
      success: true,
      message: "Vendor created successfully",
      data: vender,
    });
  } catch (err) {
    console.error("Error creating vendor:", err);
    res.status(500).json({
      success: false,
      message: "Failed to create vendor",
      error: err.message,
    });
  }
};

// ===============================
// GET ALL VENDORS (with creator info)
// ===============================
exports.getAll = async (req, res) => {
  try {
    const venders = await Vender.findAll({
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["id", "DESC"]],
    });

    res.status(200).json({ success: true, data: venders });
  } catch (err) {
    console.error("Error fetching vendors:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch vendors",
      error: err.message,
    });
  }
};

// ===============================
// GET SINGLE VENDOR BY ID
// ===============================
exports.getById = async (req, res) => {
  try {
    const vender = await Vender.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    if (!vender) {
      return res.status(404).json({ success: false, message: "Vendor not found" });
    }

    res.status(200).json({ success: true, data: vender });
  } catch (err) {
    console.error("Error fetching vendor:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch vendor",
      error: err.message,
    });
  }
};

// ===============================
// UPDATE VENDOR
// ===============================
exports.update = async (req, res) => {
  try {
    const vender = await Vender.findByPk(req.params.id);
    if (!vender) {
      return res.status(404).json({ success: false, message: "Vendor not found" });
    }

    await vender.update({ ...req.body, updated_at: new Date() });

    res.status(200).json({ success: true, message: "Vendor updated successfully", data: vender });
  } catch (err) {
    console.error("Error updating vendor:", err);
    res.status(500).json({ success: false, message: "Failed to update vendor", error: err.message });
  }
};

// ===============================
// DELETE VENDOR
// ===============================
exports.delete = async (req, res) => {
  try {
    const vender = await Vender.findByPk(req.params.id);
    if (!vender) {
      return res.status(404).json({ success: false, message: "Vendor not found" });
    }

    await vender.destroy();

    res.status(200).json({ success: true, message: "Vendor deleted successfully" });
  } catch (err) {
    console.error("Error deleting vendor:", err);
    res.status(500).json({ success: false, message: "Failed to delete vendor", error: err.message });
  }
};
