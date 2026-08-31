// controllers/shift.controller.js
const Shift = require("../models/shift.model");

// Create a new shift
exports.createShift = async (req, res) => {
  try {
    const { title, start_time, end_time, break_minutes } = req.body;

    if (!title || !start_time || !end_time) {
      return res
        .status(400)
        .json({ success: false, message: "Title, start_time, and end_time are required" });
    }

    // Dynamically set created_by from logged-in user
    // Example: middleware adds req.user = { id: 101, role: 'HR' }
    const createdBy = req.user?.id || null;

    const shift = await Shift.create({
      title,
      start_time,
      end_time,
      break_minutes: break_minutes || 0,
      created_by: createdBy,
    });

    res.status(201).json({ success: true, data: shift });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get all shifts
exports.getAllShifts = async (req, res) => {
  try {
    const shifts = await Shift.findAll({ order: [["id", "ASC"]] });
    res.json({ success: true, data: shifts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get a shift by ID
exports.getShiftById = async (req, res) => {
  try {
    const shift = await Shift.findByPk(req.params.id);
    if (!shift) return res.status(404).json({ success: false, message: "Shift not found" });
    res.json({ success: true, data: shift });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update shift
exports.updateShift = async (req, res) => {
  try {
    const { title, start_time, end_time, break_minutes } = req.body;
    const shift = await Shift.findByPk(req.params.id);

    if (!shift) return res.status(404).json({ success: false, message: "Shift not found" });

    shift.title = title || shift.title;
    shift.start_time = start_time || shift.start_time;
    shift.end_time = end_time || shift.end_time;
    shift.break_minutes = break_minutes ?? shift.break_minutes;

    await shift.save();

    res.json({ success: true, data: shift });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete shift
exports.deleteShift = async (req, res) => {
  try {
    const shift = await Shift.findByPk(req.params.id);
    if (!shift) return res.status(404).json({ success: false, message: "Shift not found" });

    await shift.destroy();
    res.json({ success: true, message: "Shift deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
