const Indicator = require("../models/indicator.model");
const Branch = require("../models/branch.model");
const Department = require("../models/department.model");
const Designation = require("../models/designation.model");
const User = require("../models/user.model");

exports.getAll = async (req, res) => {
  try {
    const createdBy = req.user?.created_by || req.user?.id;
    const indicators = await Indicator.findAll({
      where: { created_by: createdBy },
      include: [
        { model: Branch, as: "branch_detail", attributes: ["id", "name"] },
        {
          model: Department,
          as: "department_detail",
          attributes: ["id", "name"],
        },
        {
          model: Designation,
          as: "designation_detail",
          attributes: ["id", "name"],
        },
        { model: User, as: "created_user_detail", attributes: ["id", "name"] },
      ],
    });
    res.json(indicators);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


exports.getIndicatorById = async (req, res) => {
    try {
      const indicator = await Indicator.findByPk(req.params.id, {
        include: [
          { model: Branch, as: "branch_detail", attributes: ["id", "name"] },
          { model: Department, as: "department_detail", attributes: ["id", "name"] },
          { model: Designation, as: "designation_detail", attributes: ["id", "name"] },
          { model: User, as: "created_user_detail", attributes: ["id", "name"] }
        ]
      });
  
      if (!indicator) {
        return res.status(404).json({ message: "Indicator not found" });
      }
  
      res.json(indicator);
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err.message });
    }
  };
  

exports.create = async (req, res) => {
  try {
    const {
      branch,
      department,
      designation,
      rating,
      customer_experience,
      marketing,
      administration,
      professionalism,
      integrity,
      attendance,
    } = req.body;

    const created_by = req.user?.created_by || req.user?.id;
    const created_user = req.user?.id;

    const indicator = await Indicator.create({
      branch,
      department,
      designation,
      rating: JSON.stringify(rating),
      customer_experience,
      marketing,
      administration,
      professionalism,
      integrity,
      attendance,
      created_by,
      created_user,
    });

    res.status(201).json(indicator);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const indicator = await Indicator.findByPk(req.params.id);
    if (!indicator) return res.status(404).json({ message: "Not found" });

    const {
      branch,
      department,
      designation,
      rating,
      customer_experience,
      marketing,
      administration,
      professionalism,
      integrity,
      attendance,
    } = req.body;

    indicator.branch = branch ?? indicator.branch;
    indicator.department = department ?? indicator.department;
    indicator.designation = designation ?? indicator.designation;
    indicator.rating = rating ? JSON.stringify(rating) : indicator.rating;
    indicator.customer_experience =
      customer_experience ?? indicator.customer_experience;
    indicator.marketing = marketing ?? indicator.marketing;
    indicator.administration = administration ?? indicator.administration;
    indicator.professionalism = professionalism ?? indicator.professionalism;
    indicator.integrity = integrity ?? indicator.integrity;
    indicator.attendance = attendance ?? indicator.attendance;

    await indicator.save();
    res.json(indicator);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const indicator = await Indicator.findByPk(req.params.id);
    if (!indicator) return res.status(404).json({ message: "Not found" });

    await indicator.destroy();
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

//---------------------------------------------------------------------------
// Get indicators by branch ID
exports.getByBranchId = async (req, res) => {
try {
const { branchId } = req.params;
const createdBy = req.user?.created_by || req.user?.id;

const indicators = await Indicator.findAll({
  where: {
    branch: branchId,
    created_by: createdBy,
  },
  include: [
    { model: Branch, as: 'branch_detail', attributes: ['id', 'name'] },
    { model: Department, as: 'department_detail', attributes: ['id', 'name'] },
    { model: Designation, as: 'designation_detail', attributes: ['id', 'name'] },
    { model: User, as: 'created_user_detail', attributes: ['id', 'name'] },
  ]
});

res.json(indicators);

} catch (error) {
res.status(500).json({ message: 'Server error', error: error.message });
}
};

//---------------------------------------------------------------------------












