// const DocumentUpload = require("../models/document_upload.model");
// const Role = require("../models/role.model");

// exports.getAll = async (req, res) => {
//   try {
//     const docs = await DocumentUpload.findAll();
//     res.json(docs);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.getById = async (req, res) => {
//   try {
//     const doc = await DocumentUpload.findByPk(req.params.id);
//     if (!doc) return res.status(404).json({ message: "Not found" });
//     res.json(doc);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.create = async (req, res) => {
//   try {
//     const { name, role, description } = req.body;
//     const document = req.file?.filename || null;
//     const created_by = req.user?.id || null;

//     if (!name || !role || !document) {
//       return res
//         .status(400)
//         .json({ message: "All fields (name, role, document) are required" });
//     }

//     const newDoc = await DocumentUpload.create({
//       name,
//       role,
//       document,
//       description,
//       created_by,
//       created_at: new Date(),
//       updated_at: new Date(),
//     });

//     res.status(201).json({ message: "Uploaded successfully", data: newDoc });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.update = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const doc = await DocumentUpload.findByPk(id);
//     if (!doc) return res.status(404).json({ message: "Not found" });

//     const { name, role, description } = req.body;
//     const file = req.file?.filename;

//     await doc.update({
//       name,
//       role,
//       description,
//       ...(file && { document: file }),
//       updated_at: new Date(),
//     });

//     res.json({ message: "Updated successfully", data: doc });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// exports.remove = async (req, res) => {
//   try {
//     const doc = await DocumentUpload.findByPk(req.params.id);
//     if (!doc) return res.status(404).json({ message: "Not found" });

//     await doc.destroy();
//     res.json({ message: "Deleted successfully" });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };












// controllers/document_upload.controller.js
const DocumentUpload = require("../models/document_upload.model");
const Employee = require("../models/employee.model");
const Role = require("../models/role.model");

// =====================
// Helper: format document response
// =====================
const formatDocumentResponse = async (doc) => {
  if (!doc) return null;
  const json = doc.toJSON();
  return {
    id: json.id,
    name: json.name,
    role: json.role,
    description: json.description,
    document: json.document,
    created_by: json.created_by,
    created_at: json.created_at,
    updated_at: json.updated_at,
  };
};

// =====================
// GET ALL DOCUMENTS
// =====================
exports.getAllDocuments = async (req, res) => {
  try {
    let whereClause = {};

    if (req.user.type === "company") {
      whereClause.created_by = req.user.id;
    } else if (req.user.type === "Employee") {
      const emp = await Employee.findOne({ where: { user_id: req.user.id } });
      if (!emp) {
        return res
          .status(403)
          .json({ success: false, message: "Employee profile not found" });
      }
      whereClause = { created_by: emp.created_by };
    } else {
      const emp = await Employee.findOne({ where: { user_id: req.user.id } });
      if (emp) whereClause.created_by = emp.created_by;
    }

    const docs = await DocumentUpload.findAll({
      where: whereClause,
      order: [["id", "DESC"]],
    });

    const responseData = await Promise.all(
      docs.map((d) => formatDocumentResponse(d))
    );

    res.json({ success: true, data: responseData });
  } catch (error) {
    console.error("Get All Documents Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// =====================
// GET DOCUMENT BY ID
// =====================
exports.getDocumentById = async (req, res) => {
  try {
    let whereClause = { id: req.params.id };

    if (req.user.type === "company") {
      whereClause.created_by = req.user.id;
    } else if (req.user.type === "Employee") {
      const emp = await Employee.findOne({ where: { user_id: req.user.id } });
      if (!emp)
        return res
          .status(403)
          .json({ success: false, message: "Employee profile not found" });
      whereClause = { id: req.params.id, created_by: emp.created_by };
    } else {
      const emp = await Employee.findOne({ where: { user_id: req.user.id } });
      if (emp) whereClause.created_by = emp.created_by;
    }

    const doc = await DocumentUpload.findOne({ where: whereClause });
    if (!doc)
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });

    res.json({ success: true, data: await formatDocumentResponse(doc) });
  } catch (error) {
    console.error("Get Document By ID Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// =====================
// CREATE DOCUMENT
// =====================
exports.createDocument = async (req, res) => {
  try {
    const { name, role, description } = req.body;
    const document = req.file?.filename || null;

    if (!name || !role || !document) {
      return res.status(400).json({
        success: false,
        message: "All fields (name, role, document) are required",
      });
    }

    let companyId;
    if (req.user.type === "company") {
      companyId = req.user.id;
    } else {
      const emp = await Employee.findOne({ where: { user_id: req.user.id } });
      if (!emp)
        return res
          .status(403)
          .json({ success: false, message: "Employee profile not found" });
      companyId = emp.created_by;
    }


    const newDoc = await DocumentUpload.create({
      name,
      role,
      description,
      document,
      created_by: companyId,
      created_at: new Date(),
      updated_at: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Document uploaded successfully",
      data: await formatDocumentResponse(newDoc),
    });
  } catch (error) {
    console.error("Create Document Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// =====================
// UPDATE DOCUMENT
// =====================
exports.updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, description } = req.body;
    const file = req.file?.filename;

    let whereClause = { id };

    if (req.user.type === "company") {
      whereClause.created_by = req.user.id;
    } else {
      const emp = await Employee.findOne({ where: { user_id: req.user.id } });
      if (!emp)
        return res
          .status(403)
          .json({ success: false, message: "Employee profile not found" });
      whereClause.created_by = emp.created_by;
    }

    const doc = await DocumentUpload.findOne({ where: whereClause });
    if (!doc)
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });

 

    await doc.update({
      name,
      role,
      description,
      ...(file && { document: file }),
      updated_at: new Date(),
    });

    res.json({
      success: true,
      message: "Document updated successfully",
      data: await formatDocumentResponse(doc),
    });
  } catch (error) {
    console.error("Update Document Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// =====================
// DELETE DOCUMENT
// =====================
exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    let whereClause = { id };

    if (req.user.type === "company") {
      whereClause.created_by = req.user.id;
    } else {
      const emp = await Employee.findOne({ where: { user_id: req.user.id } });
      if (!emp)
        return res
          .status(403)
          .json({ success: false, message: "Employee profile not found" });
      whereClause.created_by = emp.created_by;
    }

    const doc = await DocumentUpload.findOne({ where: whereClause });
    if (!doc)
      return res
        .status(404)
        .json({ success: false, message: "Document not found" });

    await doc.destroy();
    res.json({ success: true, message: "Document deleted", data: { id } });
  } catch (error) {
    console.error("Delete Document Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};
