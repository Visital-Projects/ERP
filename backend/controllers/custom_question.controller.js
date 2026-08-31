const CustomQuestion = require("../models/custom_question.model");

// Get all questions
exports.getAll = async (req, res) => {
  try {
    const createdBy = req.user?.created_by || req.user?.id;
    const questions = await CustomQuestion.findAll({
      where: { created_by: createdBy },
    });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get single question
exports.getById = async (req, res) => {
  try {
    const question = await CustomQuestion.findByPk(req.params.id);
    if (!question) return res.status(404).json({ message: "Not found" });
    res.json(question);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Create question
exports.create = async (req, res) => {
  try {
    const { question, is_required } = req.body;
    const created_by = req.user?.created_by || req.user?.id;

    if (!question) {
      return res.status(400).json({ message: "Question is required" });
    }

    const newQuestion = await CustomQuestion.create({
      question,
      is_required,
      created_by,
    });

    res.status(201).json(newQuestion);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update question
exports.update = async (req, res) => {
  try {
    const question = await CustomQuestion.findByPk(req.params.id);
    if (!question) return res.status(404).json({ message: "Not found" });

    const { question: qText, is_required } = req.body;
    question.question = qText ?? question.question;
    question.is_required = is_required ?? question.is_required;

    await question.save();
    res.json(question);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Delete question
exports.delete = async (req, res) => {
  try {
    const question = await CustomQuestion.findByPk(req.params.id);
    if (!question) return res.status(404).json({ message: "Not found" });

    await question.destroy();
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
