// const Job = require("../models/job.model");

// exports.getAllJobs = async (req, res) => {
//   try {
//     const jobs = await Job.findAll({
//       where: { created_by: req.user.created_by },
//     });
//     res.json(jobs);
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// exports.getJobById = async (req, res) => {
//   try {
//     const job = await Job.findByPk(req.params.id);
//     if (!job) return res.status(404).json({ message: "Job not found" });
//     res.json(job);
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// exports.createJob = async (req, res) => {
//   try {
//     const job = await Job.create({
//       ...req.body,
//       created_by: req.user.created_by,
//     });
//     res.status(201).json(job);
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// exports.updateJob = async (req, res) => {
//   try {
//     const job = await Job.findByPk(req.params.id);
//     if (!job) return res.status(404).json({ message: "Job not found" });

//     await job.update(req.body);
//     res.json(job);
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

// exports.deleteJob = async (req, res) => {
//   try {
//     const job = await Job.findByPk(req.params.id);
//     if (!job) return res.status(404).json({ message: "Job not found" });

//     await job.destroy();
//     res.json({ message: "Job deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };

const Job = require("../models/job.model");

exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.findAll({
      where: { created_by: req.user.id },
    });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.createJob = async (req, res) => {
  try {
    const job = await Job.create({
      ...req.body,
      created_by: req.user.id, // Fix: use req.user.id from token
    });
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    await job.update(req.body);
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findByPk(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    await job.destroy();
    res.json({ message: "Job deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
