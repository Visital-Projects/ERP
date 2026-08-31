const GoalTracking = require("../models/goalTracking.model");
const Branch = require("../models/branch.model");
const GoalType = require("../models/goal_type.model");

exports.getAll = async (req, res) => {
  try {
    const createdBy = req.user?.created_by || req.user?.id;
    const goals = await GoalTracking.findAll({
      where: { created_by: createdBy },
      include: [
        { model: Branch, as: "branch_detail", attributes: ["id", "name"] },
        { model: GoalType, as: "goal_type_detail", attributes: ["id", "name"] },
      ],
    });
    res.json(goals);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const goal = await GoalTracking.findByPk(req.params.id, {
      include: [
        { model: Branch, as: "branch_detail" },
        { model: GoalType, as: "goal_type_detail" },
      ],
    });
    if (!goal) return res.status(404).json({ message: "Not found" });
    res.json(goal);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const created_by = req.user?.created_by || req.user?.id;
    const goal = await GoalTracking.create({
      ...req.body,
      created_by,
    });
    res.status(201).json(goal);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const goal = await GoalTracking.findByPk(req.params.id);
    if (!goal) return res.status(404).json({ message: "Not found" });

    await goal.update(req.body);
    res.json(goal);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const goal = await GoalTracking.findByPk(req.params.id);
    if (!goal) return res.status(404).json({ message: "Not found" });

    await goal.destroy();
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
