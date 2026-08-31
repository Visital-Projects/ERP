





const EmployeeDocument = require("../models/employee_document.model");
const Document = require("../models/document.model");
const User = require("../models/user.model");

// Get all employee documents
exports.getAll = async (req, res) => {
  try {
    const { employee_id } = req.query;
    const where = {};
    if (employee_id) where.employee_id = employee_id;

    const employeeDocuments = await EmployeeDocument.findAll({
      where,
      include: [
        {
          model: Document,
          as: "document",
          attributes: ["id", "name", "is_required"],
        },
        { model: User, as: "employee", attributes: ["id", "name", "email"] },
      ],
    });

    res.json(employeeDocuments);
  } catch (error) {
    console.error("Error fetching employee documents:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get by ID
exports.getById = async (req, res) => {
  try {
    const employeeDocument = await EmployeeDocument.findByPk(req.params.id, {
      include: [
        {
          model: Document,
          as: "document",
          attributes: ["id", "name", "is_required"],
        },
        { model: User, as: "employee", attributes: ["id", "name", "email"] },
      ],
    });

    if (!employeeDocument) {
      return res.status(404).json({ message: "Employee document not found" });
    }

    res.json(employeeDocument);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Create (with files)
// exports.create = async (req, res) => {
//   try {
//     const { employee_id, document_id } = req.body;
//     const created_by = req.user?.id || null;
//     const files = req.files?.document_value;

//     if (!employee_id || !document_id || !files || files.length === 0) {
//       return res.status(400).json({
//         message: "employee_id, document_id, and document file are required",
//       });
//     }

//     const documentIds = Array.isArray(document_id)
//       ? document_id
//       : document_id.split(",");

//     if (documentIds.length !== files.length) {
//       return res.status(400).json({
//         message: "Mismatch between number of documents and files uploaded",
//       });
//     }

//     const records = [];

//     for (let i = 0; i < files.length; i++) {
//       const record = await EmployeeDocument.create({
//         employee_id,
//         document_id: documentIds[i],
//         document_value: files[i].filename,
//         created_by,
//         created_at: new Date(),
//         updated_at: new Date(),
//       });
//       records.push(record);
//     }

//     res.status(201).json({
//       message: "Documents uploaded successfully",
//       data: records,
//     });
//   } catch (error) {
//     console.error("Error uploading employee documents:", error);
//     res.status(500).json({ message: "Server Error", error: error.message });
//   }
// };


//--------------------------------------------------------------------------------
exports.create = async (req, res) => {
  try {
    const { employee_id, document_id } = req.body;
    const created_by = req.user?.id || null;
    const files = req.files?.document_value;

    if (!employee_id || !document_id || !files || files.length === 0) {
      return res.status(400).json({
        message: "employee_id, document_id, and document file are required",
      });
    }

    const documentIds = Array.isArray(document_id)
      ? document_id
      : document_id.split(",");

    if (documentIds.length !== files.length) {
      return res.status(400).json({
        message: "Mismatch between number of documents and files uploaded",
      });
    }

    const records = [];

    for (let i = 0; i < files.length; i++) {
      const record = await EmployeeDocument.create({
        employee_id,
        document_id: documentIds[i],
        document_value: files[i].filename,
        created_by,
        created_at: new Date(),
        updated_at: new Date(),
      });
      records.push(record);
    }

    // ✅ Update the documents column in employees table
    const Employee = require("../models/employee.model");
    await Employee.update(
      { documents: documentIds.join(",") },
      { where: { id: employee_id } }
    );

    res.status(201).json({
      message: "Documents uploaded successfully",
      data: records,
    });
  } catch (error) {
    console.error("Error uploading employee documents:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
//--------------------------------------------------------------------------------




exports.update = async (req, res) => {
try {
const { id } = req.params;
const file = req.file; // document_value file
if (!file) {
return res.status(400).json({ message: "No file uploaded" });
}
const doc = await EmployeeDocument.findByPk(id);
if (!doc) {
  return res.status(404).json({ message: "Employee document not found" });
}

await doc.update({
  document_value: file.filename,
  updated_at: new Date(),
});

res.json({ message: "Document updated successfully", data: doc });

} catch (error) {
res.status(500).json({ message: "Server Error", error: error.message });
}
};



// Delete
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await EmployeeDocument.findByPk(id);
    if (!doc) {
      return res.status(404).json({ message: "Employee document not found" });
    }

    await doc.destroy();
    res.json({ message: "Document deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};




//-----------------------------------------------------------------------------
// controllers/employee_document.controller.js
exports.getByEmployeeId = async (req, res) => {
  try {
    // 1) Validate & parse employeeId path param
    const employeeId = parseInt(req.params.employeeId, 10);
    if (isNaN(employeeId)) {
      return res.status(400).json({ success: false, message: 'Invalid employeeId parameter' });
    }

    // 2) Optional query filters: document_id, pagination
    const { document_id, limit, offset } = req.query;
    const where = { employee_id: employeeId };
    if (document_id) where.document_id = document_id;

    // 3) Build find options
    const findOptions = {
      where,
      include: [
        {
          model: Document,
          as: "document",
          attributes: ["id", "name", "is_required"],
        },
        {
          model: User,
          as: "employee",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["created_at", "DESC"]],
    };

    if (limit) {
      const l = parseInt(limit, 10);
      if (!isNaN(l) && l > 0) findOptions.limit = l;
    }
    if (offset) {
      const o = parseInt(offset, 10);
      if (!isNaN(o) && o >= 0) findOptions.offset = o;
    }

    // 4) Query
    const docs = await EmployeeDocument.findAll(findOptions);

    // 5) Return results (200 always, empty array if none)
    return res.status(200).json({ success: true, data: docs });
  } catch (error) {
    console.error("Error fetching documents by employee id:", error);
    return res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};


//-----------------------------------------------------------------------------






