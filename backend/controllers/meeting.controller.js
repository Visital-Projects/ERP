// const Meeting = require('../models/meeting.model');
// const MeetingEmployee = require('../models/meeting_employee.model');
// const Employee = require('../models/employee.model');
// const Branch = require('../models/branch.model');
// const Department = require('../models/department.model');

// exports.getAllMeetings = async (req, res) => {
//   try {
//     const meetings = await Meeting.findAll();
//     res.json({ success: true, data: meetings });
//   } catch (error) {
//     console.error('Error fetching meetings:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// exports.getMeetingById = async (req, res) => {
//   try {
//     const meeting = await Meeting.findByPk(req.params.id);
//     if (!meeting) {
//       return res.status(404).json({ success: false, message: 'Meeting not found' });
//     }

//     const employees = await MeetingEmployee.findAll({
//       where: { meeting_id: meeting.id }
//     });

//     res.json({ success: true, data: { meeting, employees } });
//   } catch (error) {
//     console.error('Error fetching meeting:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// exports.createMeeting = async (req, res) => {
//   try {
//     const {
//       branch_id,
//       department_id,
//       employee_id,
//       title,
//       date,
//       time,
//       note
//     } = req.body;

//     const created_by = req.user?.id || 1;

//     if (!branch_id || !title || !date || !time) {
//       return res.status(400).json({ message: 'Required fields are missing' });
//     }

//     const meeting = await Meeting.create({
//       branch_id,
//       department_id: JSON.stringify(department_id),
//       employee_id: JSON.stringify(employee_id),
//       title,
//       date,
//       time,
//       note,
//       created_by,
//       created_at: new Date(),
//       updated_at: new Date()
//     });

//     let employeeList = [];

//     if (employee_id.includes('0')) {
//       const departmentIds = department_id.includes('0') ? null : department_id;
//       employeeList = await Employee.findAll({
//         where: departmentIds
//           ? { department_id: departmentIds }
//           : {},
//         attributes: ['id']
//       });
//     } else {
//       employeeList = employee_id.map(id => ({ id }));
//     }

//     for (const emp of employeeList) {
//       await MeetingEmployee.create({
//         meeting_id: meeting.id,
//         employee_id: emp.id || emp,
//         created_by,
//         created_at: new Date(),
//         updated_at: new Date()
//       });
//     }

//     res.status(201).json({ message: 'Meeting created successfully', data: meeting });
//   } catch (error) {
//     console.error('Create meeting error:', error);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// exports.updateMeeting = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { title, date, time, note } = req.body;

//     const meeting = await Meeting.findByPk(id);
//     if (!meeting) {
//       return res.status(404).json({ message: 'Meeting not found' });
//     }

//     await meeting.update({
//       title,
//       date,
//       time,
//       note,
//       updated_at: new Date()
//     });

//     res.json({ message: 'Meeting updated successfully', data: meeting });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };

// exports.deleteMeeting = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const meeting = await Meeting.findByPk(id);
//     if (!meeting) {
//       return res.status(404).json({ message: 'Meeting not found' });
//     }

//     await MeetingEmployee.destroy({ where: { meeting_id: id } });
//     await meeting.destroy();

//     res.json({ message: 'Meeting deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// };















// const Meeting = require('../models/meeting.model');
// const MeetingEmployee = require('../models/meeting_employee.model');
// const Employee = require('../models/employee.model');
// const Branch = require('../models/branch.model');
// const Department = require('../models/department.model');

// // manual tenant utils
// function getCompanyId(req) {
//   return req.user?.id || null;
// }
// function isSuper(req) {
//   return req.user?.role === 'superadmin';
// }

// // =======================
// // GET ALL MEETINGS
// // =======================
// exports.getAllMeetings = async (req, res) => {
//   try {
//     const companyId = getCompanyId(req);
//     const where = isSuper(req) ? {} : { created_by: companyId };

//     const meetings = await Meeting.findAll({ where, order: [['id', 'DESC']] });

//     res.json({ success: true, data: meetings });
//   } catch (error) {
//     console.error('Error fetching meetings:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };

// // =======================
// // GET SINGLE MEETING
// // =======================
// exports.getMeetingById = async (req, res) => {
//   try {
//     const createdBy = req.user?.id; // company owner ID
//     const isSuper = req.user?.role === 'superadmin';

//     const where = isSuper
//       ? { id: req.params.id }
//       : { id: req.params.id, created_by: createdBy };

//     const meeting = await Meeting.findOne({ where });
//     if (!meeting) {
//       return res.status(404).json({ success: false, message: 'Meeting not found' });
//     }

//     // Fetch meeting employees (raw stored IDs)
//     const meetingEmployees = await MeetingEmployee.findAll({
//       where: { meeting_id: meeting.id }
//     });

//     const employeeIds = meetingEmployees.map(me => me.employee_id);

//     // Now fetch actual employees, returning business employee_id + name
//     const employees = await Employee.findAll({
//       where: isSuper ? { id: employeeIds } : { id: employeeIds, created_by: createdBy },
//       attributes: ['employee_id', 'name']
//     });

//     res.json({
//       success: true,
//       data: {
//         meeting,
//         employees
//       }
//     });
//   } catch (error) {
//     console.error('Error fetching meeting:', error);
//     res.status(500).json({ success: false, message: 'Server error', error: error.message });
//   }
// };


// // =======================
// // CREATE MEETING
// // =======================
// exports.createMeeting = async (req, res) => {
//   try {
//     const { branch_id, department_id, employee_id, title, date, time, note } = req.body;
//     const created_by = getCompanyId(req);

//     if (!branch_id || !title || !date || !time) {
//       return res.status(400).json({ message: 'Required fields are missing' });
//     }

//     // save base meeting
//     const meeting = await Meeting.create({
//       branch_id,
//       department_id: JSON.stringify(department_id),
//       employee_id: JSON.stringify(employee_id),
//       title,
//       date,
//       time,
//       note,
//       created_by,
//       created_at: new Date(),
//       updated_at: new Date()
//     });

//     // build employee list
//     let employeeList = [];
//     if (employee_id.includes('0')) {
//       const deptIds = department_id.includes('0') ? null : department_id;
//       employeeList = await Employee.findAll({
//         where: {
//           ...(deptIds ? { department_id: deptIds } : {}),
//           created_by
//         },
//         attributes: ['id', 'employee_id']
//       });
//     } else {
//       employeeList = await Employee.findAll({
//         where: { employee_id, created_by },
//         attributes: ['id', 'employee_id']
//       });
//     }

//     for (const emp of employeeList) {
//       await MeetingEmployee.create({
//         meeting_id: meeting.id,
//         employee_id: emp.id, // storing row PK in join table
//         created_by,
//         created_at: new Date(),
//         updated_at: new Date()
//       });
//     }

//     res.status(201).json({ success: true, message: 'Meeting created successfully', data: meeting });
//   } catch (error) {
//     console.error('Create meeting error:', error);
//     res.status(500).json({ success: false, message: 'Server error', error: error.message });
//   }
// };

// // =======================
// // UPDATE MEETING
// // =======================
// exports.updateMeeting = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const companyId = getCompanyId(req);
//     const where = isSuper(req) ? { id } : { id, created_by: companyId };

//     const meeting = await Meeting.findOne({ where });
//     if (!meeting) return res.status(404).json({ success: false, message: 'Meeting not found' });

//     const { title, date, time, note } = req.body;

//     await meeting.update({
//       title,
//       date,
//       time,
//       note,
//       updated_at: new Date()
//     });

//     res.json({ success: true, message: 'Meeting updated successfully', data: meeting });
//   } catch (error) {
//     console.error('Update meeting error:', error);
//     res.status(500).json({ success: false, message: 'Server error', error: error.message });
//   }
// };

// // =======================
// // DELETE MEETING
// // =======================
// exports.deleteMeeting = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const companyId = getCompanyId(req);
//     const where = isSuper(req) ? { id } : { id, created_by: companyId };

//     const meeting = await Meeting.findOne({ where });
//     if (!meeting) return res.status(404).json({ success: false, message: 'Meeting not found' });

//     await MeetingEmployee.destroy({ where: { meeting_id: id } });
//     await meeting.destroy();

//     res.json({ success: true, message: 'Meeting deleted successfully' });
//   } catch (error) {
//     console.error('Delete meeting error:', error);
//     res.status(500).json({ success: false, message: 'Server error', error: error.message });
//   }
// };























const Meeting = require('../models/meeting.model');
const MeetingEmployee = require('../models/meeting_employee.model');
const Employee = require('../models/employee.model');
const Branch = require('../models/branch.model');
const Department = require('../models/department.model');

// =======================
// Helpers
// =======================
async function getCompanyId(req) {
  if (req.user.type === 'company') return req.user.id;
  if (req.user.type === 'Employee') {
    const employee = await Employee.findOne({ where: { user_id: req.user.id } });
    if (!employee) throw new Error('Employee profile not found');
    return employee.created_by;
  }
  return null;
}

// =======================
// GET ALL MEETINGS
// =======================
exports.getAllMeetings = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    const meetings = await Meeting.findAll({
      where: { created_by: companyId },
      order: [['id', 'DESC']]
    });

    res.json({ success: true, data: meetings });
  } catch (error) {
    console.error('Error fetching meetings:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// =======================
// GET SINGLE MEETING
// =======================
exports.getMeetingById = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = await getCompanyId(req);

    const meeting = await Meeting.findOne({ where: { id, created_by: companyId } });
    if (!meeting) {
      return res.status(404).json({ success: false, message: 'Meeting not found' });
    }

    // Fetch meeting employees
    const meetingEmployees = await MeetingEmployee.findAll({
      where: { meeting_id: meeting.id }
    });

    const employeeIds = meetingEmployees.map(me => me.employee_id);

    const employees = await Employee.findAll({
      where: { id: employeeIds, created_by: companyId },
      attributes: ['employee_id', 'name']
    });

    res.json({
      success: true,
      data: { meeting, employees }
    });
  } catch (error) {
    console.error('Error fetching meeting:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// =======================
// CREATE MEETING
// =======================
exports.createMeeting = async (req, res) => {
  try {
    const data = req.body;
    const companyId = await getCompanyId(req);

    if (!data.branch_id || !data.title || !data.date || !data.time) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    // 🔹 VALIDATION (same as Event controller)
    // 1. Check branch
    const branch = await Branch.findOne({ where: { id: data.branch_id, created_by: companyId } });
    if (!branch) return res.status(400).json({ message: 'Invalid branch for this company' });

    // 2. Check departments
    if (data.department_id) {
      const departmentIds = Array.isArray(data.department_id)
        ? data.department_id
        : data.department_id.split(',').map(id => id.trim());

      const departments = await Department.findAll({
        where: { id: departmentIds, branch_id: data.branch_id, created_by: companyId }
      });
      if (departments.length !== departmentIds.length) {
        return res.status(400).json({ message: 'One or more departments are invalid' });
      }
    }

    // 3. Check employees
    if (data.employee_id) {
      const employeeIds = Array.isArray(data.employee_id)
        ? data.employee_id
        : data.employee_id.split(',').map(id => id.trim());

      const employees = await Employee.findAll({
        where: { employee_id: employeeIds, created_by: companyId }
      });
      if (employees.length !== employeeIds.length) {
        return res.status(400).json({ message: 'One or more employees are invalid' });
      }
    }

    // Save meeting
    data.created_by = companyId;
    data.created_at = new Date();
    data.updated_at = new Date();

    const meeting = await Meeting.create(data);

    // Store mapping in MeetingEmployee
    if (data.employee_id) {
      const employeeIds = Array.isArray(data.employee_id)
        ? data.employee_id
        : data.employee_id.split(',').map(id => id.trim());

      const employees = await Employee.findAll({
        where: { employee_id: employeeIds, created_by: companyId },
        attributes: ['id', 'employee_id']
      });

      for (const emp of employees) {
        await MeetingEmployee.create({
          meeting_id: meeting.id,
          employee_id: emp.id, // storing row PK in join table
          created_by: companyId,
          created_at: new Date(),
          updated_at: new Date()
        });
      }
    }

    res.status(201).json({ success: true, message: 'Meeting created successfully', data: meeting });
  } catch (error) {
    console.error('Create meeting error:', error);
    res.status(500).json({ success: false, message: 'Error creating meeting', error: error.message });
  }
};

// =======================
// UPDATE MEETING
// =======================
exports.updateMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const companyId = await getCompanyId(req);

    const meeting = await Meeting.findOne({ where: { id, created_by: companyId } });
    if (!meeting) return res.status(404).json({ success: false, message: 'Meeting not found' });

    // 🔹 VALIDATION (same as create)
    if (data.branch_id) {
      const branch = await Branch.findOne({ where: { id: data.branch_id, created_by: companyId } });
      if (!branch) return res.status(400).json({ message: 'Invalid branch for this company' });
    }

    if (data.department_id) {
      const departmentIds = Array.isArray(data.department_id)
        ? data.department_id
        : data.department_id.split(',').map(id => id.trim());

      const departments = await Department.findAll({
        where: { id: departmentIds, branch_id: data.branch_id || meeting.branch_id, created_by: companyId }
      });
      if (departments.length !== departmentIds.length) {
        return res.status(400).json({ message: 'One or more departments are invalid' });
      }
    }

    if (data.employee_id) {
      const employeeIds = Array.isArray(data.employee_id)
        ? data.employee_id
        : data.employee_id.split(',').map(id => id.trim());

      const employees = await Employee.findAll({
        where: { employee_id: employeeIds, created_by: companyId }
      });
      if (employees.length !== employeeIds.length) {
        return res.status(400).json({ message: 'One or more employees are invalid' });
      }
    }

    await meeting.update({ ...data, updated_at: new Date() });
    res.json({ success: true, message: 'Meeting updated successfully', data: meeting });
  } catch (error) {
    console.error('Update meeting error:', error);
    res.status(500).json({ success: false, message: 'Error updating meeting', error: error.message });
  }
};

// =======================
// DELETE MEETING
// =======================
exports.deleteMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = await getCompanyId(req);

    const meeting = await Meeting.findOne({ where: { id, created_by: companyId } });
    if (!meeting) return res.status(404).json({ success: false, message: 'Meeting not found' });

    await MeetingEmployee.destroy({ where: { meeting_id: id } });
    await meeting.destroy();

    res.json({ success: true, message: 'Meeting deleted successfully' });
  } catch (error) {
    console.error('Delete meeting error:', error);
    res.status(500).json({ success: false, message: 'Error deleting meeting', error: error.message });
  }
};
