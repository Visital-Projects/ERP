const Skill = require("../models/skill.model");

// -------------------- Create Skill --------------------
exports.createSkill = async (req, res) => {
  try {
    const { name, wages } = req.body;

    if (!name || !wages)
      return res.status(400).json({ success: false, message: "Skill name and wages are required" });

    const skill = await Skill.create({ name, wages });

    return res.status(201).json({ success: true, data: skill });
  } catch (error) {
    console.error("Create Skill Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------- Get All Skills --------------------
exports.getAllSkills = async (req, res) => {
  try {
    const skills = await Skill.findAll({
      order: [["id", "DESC"]],
    });

    return res.json({ success: true, data: skills });
  } catch (error) {
    console.error("Get Skills Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------- Get Skill By ID --------------------
exports.getSkillById = async (req, res) => {
  try {
    const { id } = req.params;

    const skill = await Skill.findByPk(id);
    if (!skill)
      return res.status(404).json({ success: false, message: "Skill not found" });

    return res.json({ success: true, data: skill });
  } catch (error) {
    console.error("Get Skill By ID Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------- Update Skill --------------------
exports.updateSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, wages } = req.body;

    const skill = await Skill.findByPk(id);
    if (!skill)
      return res.status(404).json({ success: false, message: "Skill not found" });

    await skill.update({ name, wages });

    return res.json({ success: true, data: skill });
  } catch (error) {
    console.error("Update Skill Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// -------------------- Delete Skill (Soft Delete) --------------------
exports.deleteSkill = async (req, res) => {
  try {
    const { id } = req.params;

    const skill = await Skill.findByPk(id);
    if (!skill)
      return res.status(404).json({ success: false, message: "Skill not found" });

    await skill.destroy();

    return res.json({ success: true, message: "Skill deleted successfully" });
  } catch (error) {
    console.error("Delete Skill Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
