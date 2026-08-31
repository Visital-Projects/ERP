const JobApplication = require("../models/job_application.model");

exports.getAllApplications = async (req, res) => {
  try {
    const apps = await JobApplication.findAll({
      where: { created_by: req.user.id },
      order: [["id", "DESC"]],
    });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getApplicationById = async (req, res) => {
  try {
    const app = await JobApplication.findByPk(req.params.id);
    if (!app) return res.status(404).json({ message: "Application not found" });
    res.json(app);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.createApplication = async (req, res) => {
  try {
    const data = {
      ...req.body,
      created_by: req.user.id,
    };
    const app = await JobApplication.create(data);
    res.status(201).json(app);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.updateApplication = async (req, res) => {
  try {
    const app = await JobApplication.findByPk(req.params.id);
    if (!app) return res.status(404).json({ message: "Application not found" });

    await app.update(req.body);
    res.json(app);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.deleteApplication = async (req, res) => {
  try {
    const app = await JobApplication.findByPk(req.params.id);
    if (!app) return res.status(404).json({ message: "Application not found" });

    await app.destroy();
    res.json({ message: "Application deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
