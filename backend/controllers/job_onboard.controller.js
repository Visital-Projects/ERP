const JobOnBoard = require("../models/job_onboard.model");
const JobApplication = require("../models/job_application.model");

exports.getAllJobOnBoards = async (req, res) => {
  try {
    const data = await JobOnBoard.findAll({
      where: { created_by: req.user.created_by || req.user.id },
      include: [{ model: JobApplication, as: "application_data" }],
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getJobOnBoardById = async (req, res) => {
  try {
    const jobBoard = await JobOnBoard.findByPk(req.params.id, {
      include: [{ model: JobApplication, as: "application_data" }],
    });
    if (!jobBoard)
      return res.status(404).json({ message: "JobOnBoard not found" });
    res.json(jobBoard);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.createJobOnBoard = async (req, res) => {
  try {
    const data = await JobOnBoard.create({
      ...req.body,
      created_by: req.user.created_by || req.user.id,
    });
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.updateJobOnBoard = async (req, res) => {
  try {
    const jobBoard = await JobOnBoard.findByPk(req.params.id);
    if (!jobBoard)
      return res.status(404).json({ message: "JobOnBoard not found" });

    await jobBoard.update(req.body);
    res.json(jobBoard);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.deleteJobOnBoard = async (req, res) => {
  try {
    const jobBoard = await JobOnBoard.findByPk(req.params.id);
    if (!jobBoard)
      return res.status(404).json({ message: "JobOnBoard not found" });

    await jobBoard.destroy();
    res.json({ message: "JobOnBoard deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
