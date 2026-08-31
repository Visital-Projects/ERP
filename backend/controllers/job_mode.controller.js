// const JobMode = require('../models/job_mode.model');
// const Employee = require('../models/employee.model');

// async function getCompanyId(req) {
//   if (req.user?.creator_id) return req.user.creator_id;

//   if (req.user?.type === 'Employee') {
//     const emp = await Employee.findOne({
//       where: { user_id: req.user.id },
//       attributes: ['created_by']
//     });
//     return emp?.created_by;
//   }

//   return req.user?.id;
// }


// exports.create = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     const { name } = req.body;

//     if (!name || !String(name).trim()) {
//       return res.status(400).json({ message: 'name is required' });
//     }

    
//     const payload = {
//       name: String(name).trim(),
//       created_by: companyId
//     };

//     const data = await JobMode.create(payload);
//     return res.status(200).json({ success: true, data });
//   } catch (err) {
//     console.error('Error creating job mode:', err);
//     return res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };


// exports.getAll = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);

//     const data = await JobMode.findAll({
//       where: { created_by: companyId },
//       order: [['id', 'DESC']]
//     });

//     return res.json({ success: true, data });
//   } catch (err) {
//     console.error('Error fetching job modes:', err);
//     return res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };


// exports.getById = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);

//     const data = await JobMode.findOne({
//       where: { id: req.params.id, created_by: companyId }
//     });

//     if (!data) return res.status(404).json({ message: 'Job mode not found' });

//     return res.json({ success: true, data });
//   } catch (err) {
//     console.error('Error fetching job mode:', err);
//     return res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };


// exports.update = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);

//     const data = await JobMode.findOne({
//       where: { id: req.params.id, created_by: companyId }
//     });
//     if (!data) return res.status(404).json({ message: 'Job mode not found' });

   
//     const payload = { ...req.body };
//     delete payload.created_by;
    
//     payload.created_by = companyId;

//     if (payload.name !== undefined) payload.name = String(payload.name).trim();

//     await data.update(payload);

//     return res.json({ success: true, data });
//   } catch (err) {
//     console.error('Error updating job mode:', err);
//     return res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };


// exports.remove = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);

//     const data = await JobMode.findOne({
//       where: { id: req.params.id, created_by: companyId }
//     });
//     if (!data) return res.status(404).json({ message: 'Job mode not found' });

//     await data.destroy();
//     return res.json({ success: true, message: 'Deleted successfully' });
//   } catch (err) {
//     console.error('Error deleting job mode:', err);
//     return res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };




// // controllers/job_mode.controller.js
// const JobMode = require('../models/job_mode.model');
// const Employee = require('../models/employee.model');

// // =====================
// // Helper: resolve company id from request
// // =====================
// async function getCompanyId(req) {
//   // if token/session contains an explicit creator_id (some flows have this)
//   if (req.user?.creator_id) return req.user.creator_id;

//   // if logged-in user is an employee, resolve their company
//   if (req.user?.type === 'Employee') {
//     const emp = await Employee.findOne({
//       where: { user_id: req.user.id },
//       attributes: ['created_by']
//     });
//     return emp?.created_by;
//   }

//   // otherwise user id itself is the company id (company users)
//   return req.user?.id;
// }

// // =====================
// // Helper: format job mode response
// // =====================
// const formatJobModeResponse = (jm) => {
//   if (!jm) return null;
//   const json = jm.toJSON();
//   return {
//     id: json.id,
//     name: json.name,
//     created_by: json.created_by,
//     created_at: json.created_at,
//     updated_at: json.updated_at
//   };
// };

// // =====================
// // GET ALL JOB MODES
// // =====================
// exports.getAll = async (req, res) => {
//   try {
//     let whereClause = {};

//     if (req.user.type === 'company') {
//       whereClause.created_by = req.user.id;
//     } else if (req.user.type === 'Employee') {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (!emp) return res.status(403).json({ success: false, message: 'Employee profile not found' });
//       whereClause.created_by = emp.created_by;
//     } else {
//       // other roles (HR/Manager etc.) — scope to their company if possible
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (emp) whereClause.created_by = emp.created_by;
//     }

//     const data = await JobMode.findAll({ where: whereClause, order: [['id', 'DESC']] });
//     const responseData = data.map(d => formatJobModeResponse(d));
//     return res.json({ success: true, data: responseData });
//   } catch (err) {
//     console.error('Get All Job Modes Error:', err);
//     return res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };

// // =====================
// // GET JOB MODE BY ID
// // =====================
// exports.getById = async (req, res) => {
//   try {
//     let whereClause = { id: req.params.id };

//     if (req.user.type === 'company') {
//       whereClause.created_by = req.user.id;
//     } else if (req.user.type === 'Employee') {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (!emp) return res.status(403).json({ success: false, message: 'Employee profile not found' });
//       whereClause = { id: req.params.id, created_by: emp.created_by };
//     } else {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (emp) whereClause.created_by = emp.created_by;
//     }

//     const data = await JobMode.findOne({ where: whereClause });
//     if (!data) return res.status(404).json({ success: false, message: 'Job mode not found' });

//     return res.json({ success: true, data: formatJobModeResponse(data) });
//   } catch (err) {
//     console.error('Get Job Mode By ID Error:', err);
//     return res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };

// // =====================
// // CREATE JOB MODE
// // =====================
// exports.create = async (req, res) => {
//   try {
//     const { name } = req.body;
//     if (!name || !String(name).trim()) {
//       return res.status(400).json({ success: false, message: 'name is required' });
//     }

//     const companyId = await getCompanyId(req);
//     if (!companyId) {
//       return res.status(403).json({ success: false, message: 'Unable to resolve company for user' });
//     }

//     const payload = {
//       name: String(name).trim(),
//       created_by: companyId,
//       created_at: new Date(),
//       updated_at: new Date()
//     };

//     const data = await JobMode.create(payload);
//     return res.status(201).json({ success: true, message: 'Job mode created', data: formatJobModeResponse(data) });
//   } catch (err) {
//     console.error('Create Job Mode Error:', err);
//     return res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };

// // =====================
// // UPDATE JOB MODE
// // =====================
// exports.update = async (req, res) => {
//   try {
//     const jobModeId = req.params.id;
//     const { name } = req.body;

//     // Build where clause according to role scope
//     let whereClause = { id: jobModeId };
//     if (req.user.type === 'company') {
//       whereClause.created_by = req.user.id;
//     } else if (req.user.type === 'Employee') {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (!emp) return res.status(403).json({ success: false, message: 'Employee profile not found' });
//       whereClause = { id: jobModeId, created_by: emp.created_by };
//     } else {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (!emp) return res.status(403).json({ success: false, message: 'Employee profile not found' });
//       whereClause.created_by = emp.created_by;
//     }

//     const data = await JobMode.findOne({ where: whereClause });
//     if (!data) return res.status(404).json({ success: false, message: 'Job mode not found' });

//     const payload = {};
//     if (name !== undefined) {
//       if (!String(name || '').trim()) {
//         return res.status(400).json({ success: false, message: 'name cannot be empty' });
//       }
//       payload.name = String(name).trim();
//     }

//     // update timestamp
//     payload.updated_at = new Date();

//     await data.update(payload);
//     return res.json({ success: true, message: 'Job mode updated', data: formatJobModeResponse(data) });
//   } catch (err) {
//     console.error('Update Job Mode Error:', err);
//     return res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };

// // =====================
// // DELETE JOB MODE
// // =====================
// exports.remove = async (req, res) => {
//   try {
//     const jobModeId = req.params.id;

//     // Build where clause according to role scope
//     let whereClause = { id: jobModeId };
//     if (req.user.type === 'company') {
//       whereClause.created_by = req.user.id;
//     } else if (req.user.type === 'Employee') {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (!emp) return res.status(403).json({ success: false, message: 'Employee profile not found' });
//       whereClause = { id: jobModeId, created_by: emp.created_by };
//     } else {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (!emp) return res.status(403).json({ success: false, message: 'Employee profile not found' });
//       whereClause.created_by = emp.created_by;
//     }

//     const data = await JobMode.findOne({ where: whereClause });
//     if (!data) return res.status(404).json({ success: false, message: 'Job mode not found' });

//     await data.destroy();
//     return res.json({ success: true, message: 'Job mode deleted', data: { id: jobModeId } });
//   } catch (err) {
//     console.error('Delete Job Mode Error:', err);
//     return res.status(500).json({ success: false, message: 'Server error', error: err.message });
//   }
// };



// controllers/job_mode.controller.js
const JobMode = require('../models/job_mode.model');
const Employee = require('../models/employee.model');


const Branch = require('../models/branch.model'); 


// =====================
// Helper: resolve company id from request
// =====================
async function getCompanyId(req) {
  if (req.user?.type?.toLowerCase() === 'company') {
    return req.user.id; // company users → their own id
  }

  // employee/HR/manager etc. → find via employee record
  const emp = await Employee.findOne({
    where: { user_id: req.user.id },
    attributes: ['created_by']
  });

  return emp?.created_by || null;
}







// =====================
// Helper: format job mode response
// =====================
function formatJobModeResponse(jm) {
  if (!jm) return null;
  const json = jm.toJSON();
  return {
    id: json.id,
    name: json.name,
    created_by: json.created_by,
    created_at: json.created_at,
    updated_at: json.updated_at
  };
}

// =====================
// GET ALL
// =====================
exports.getAll = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) {
      return res.status(403).json({ success: false, message: 'Unable to resolve company' });
    }

    const data = await JobMode.findAll({
      where: { created_by: companyId },
      order: [['id', 'DESC']]
    });

    return res.json({
      success: true,
      data: data.map(d => formatJobModeResponse(d))
    });
  } catch (err) {
    console.error('Get All Job Modes Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// =====================
// GET BY ID
// =====================
exports.getById = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    if (!companyId) {
      return res.status(403).json({ success: false, message: 'Unable to resolve company' });
    }

    const data = await JobMode.findOne({
      where: { id: req.params.id, created_by: companyId }
    });

    if (!data) {
      return res.status(404).json({ success: false, message: 'Job mode not found' });
    }

    return res.json({ success: true, data: formatJobModeResponse(data) });
  } catch (err) {
    console.error('Get Job Mode By ID Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// =====================
// CREATE
// =====================
exports.create = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ success: false, message: 'name is required' });
    }

    const companyId = await getCompanyId(req);
    if (!companyId) {
      return res.status(403).json({ success: false, message: 'Unable to resolve company for user' });
    }

    const payload = {
      name: String(name).trim(),
      created_by: companyId,
      created_at: new Date(),
      updated_at: new Date()
    };

    const data = await JobMode.create(payload);
    return res.status(201).json({
      success: true,
      message: 'Job mode created',
      data: formatJobModeResponse(data)
    });
  } catch (err) {
    console.error('Create Job Mode Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// =====================
// UPDATE
// =====================
exports.update = async (req, res) => {
  try {
    const jobModeId = req.params.id;
    const { name } = req.body;

    const companyId = await getCompanyId(req);
    if (!companyId) {
      return res.status(403).json({ success: false, message: 'Unable to resolve company' });
    }

    const data = await JobMode.findOne({
      where: { id: jobModeId, created_by: companyId }
    });
    if (!data) {
      return res.status(404).json({ success: false, message: 'Job mode not found' });
    }

    const payload = {};
    if (name !== undefined) {
      if (!String(name).trim()) {
        return res.status(400).json({ success: false, message: 'name cannot be empty' });
      }
      payload.name = String(name).trim();
    }
    payload.updated_at = new Date();

    await data.update(payload);

    return res.json({
      success: true,
      message: 'Job mode updated',
      data: formatJobModeResponse(data)
    });
  } catch (err) {
    console.error('Update Job Mode Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// =====================
// DELETE
// =====================
exports.remove = async (req, res) => {
  try {
    const jobModeId = req.params.id;
    const companyId = await getCompanyId(req);
    if (!companyId) {
      return res.status(403).json({ success: false, message: 'Unable to resolve company' });
    }

    const data = await JobMode.findOne({
      where: { id: jobModeId, created_by: companyId }
    });
    if (!data) {
      return res.status(404).json({ success: false, message: 'Job mode not found' });
    }

    await data.destroy();
    return res.json({
      success: true,
      message: 'Job mode deleted',
      data: { id: jobModeId }
    });
  } catch (err) {
    console.error('Delete Job Mode Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

//-------------------------------------------------------------------------------------------------------------------------





// --------------------
// Helper: format branch response
// --------------------
function formatBranchResponse(b) {
  if (!b) return null;
  const json = b.toJSON ? b.toJSON() : b;
  return {
    id: json.id,
    name: json.name,
    created_by: json.created_by,
    created_at: json.created_at,
    updated_at: json.updated_at
  };
}

// --------------------
// GET branches by job mode id
// Route: GET /api/job-mode/:id/branches
// --------------------
exports.getBranchesByJobMode = async (req, res) => {
  try {
    const jobModeId = Number(req.params.id);
    if (!jobModeId) {
      return res.status(400).json({ success: false, message: 'Invalid job mode id' });
    }

    const companyId = await getCompanyId(req);
    if (!companyId) {
      return res.status(403).json({ success: false, message: 'Unable to resolve company' });
    }

    // If the logged-in user is an employee, restrict to their branch only
    let employeeBranchId = null;
    if ((req.user?.type || '').toLowerCase() === 'employee') {
      const me = await Employee.findOne({ where: { user_id: req.user.id }, attributes: ['branch_id'], raw: true });
      if (!me) return res.status(404).json({ success: false, message: 'Employee record not found' });
      employeeBranchId = me.branch_id;
    }

    // Find employees that match the job mode (and company)
    const empWhere = { job_mode_id: jobModeId, created_by: companyId };
    if (employeeBranchId) empWhere.branch_id = employeeBranchId;

    const employees = await Employee.findAll({
      where: empWhere,
      attributes: ['branch_id'],
      raw: true
    });

    const branchIds = [...new Set(employees.map(e => e.branch_id).filter(Boolean))];

    if (branchIds.length === 0) {
      return res.json({ success: true, data: [] });
    }

    // Fetch branch details
    const branches = await Branch.findAll({
      where: { id: branchIds, created_by: companyId },
      order: [['id', 'DESC']]
    });

    return res.json({
      success: true,
      data: branches.map(formatBranchResponse)
    });
  } catch (err) {
    console.error('Get Branches By JobMode Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};









