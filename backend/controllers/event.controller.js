// const Event = require('../models/event.model');
// const EventEmployee = require('../models/eventEmployee.model');

// exports.getAll = async (req, res) => {
//   try {
//     const events = await Event.findAll();
//     res.json(events);
//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };

// exports.getById = async (req, res) => {
//   try {
//     const event = await Event.findByPk(req.params.id);
//     if (!event) return res.status(404).json({ message: 'Not found' });
//     res.json(event);
//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };

// exports.create = async (req, res) => {
//   try {
//     const data = req.body;
//     data.created_by = req.user?.id || null;
//     const event = await Event.create(data);
//     res.status(201).json(event);
//   } catch (err) {
//     res.status(500).json({ message: 'Error creating event', error: err.message });
//   }
// };

// exports.update = async (req, res) => {
//   try {
//     const event = await Event.findByPk(req.params.id);
//     if (!event) return res.status(404).json({ message: 'Not found' });

//     await event.update(req.body);
//     res.json(event);
//   } catch (err) {
//     res.status(500).json({ message: 'Error updating event', error: err.message });
//   }
// };

// exports.delete = async (req, res) => {
//   try {
//     const event = await Event.findByPk(req.params.id);
//     if (!event) return res.status(404).json({ message: 'Not found' });

//     await event.destroy();
//     res.json({ message: 'Deleted successfully' });
//   } catch (err) {
//     res.status(500).json({ message: 'Error deleting event', error: err.message });
//   }
// };







const Event = require('../models/event.model');
const Employee = require('../models/employee.model');
const Branch = require('../models/branch.model');
const Department = require('../models/department.model');

// =====================
// Get All Events
// =====================
exports.getAll = async (req, res) => {
  try {
    let companyId = null;

    if (req.user.type === 'company') {
      companyId = req.user.id;
    } else if (req.user.type === 'Employee') {
      const employee = await Employee.findOne({ where: { user_id: req.user.id } });
      if (!employee) return res.status(403).json({ message: 'Employee profile not found' });
      companyId = employee.created_by;
    }

    const events = await Event.findAll({ where: { created_by: companyId } });
    res.json({ success: true, data: events });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// =====================
// Get Event By ID
// =====================
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    let companyId = null;

    if (req.user.type === 'company') {
      companyId = req.user.id;
    } else if (req.user.type === 'Employee') {
      const employee = await Employee.findOne({ where: { user_id: req.user.id } });
      if (!employee) return res.status(403).json({ message: 'Employee profile not found' });
      companyId = employee.created_by;
    }

    const event = await Event.findOne({ where: { id, created_by: companyId } });
    if (!event) return res.status(404).json({ message: 'Event not found' });

    res.json({ success: true, data: event });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// =====================
// Create Event
// =====================
exports.create = async (req, res) => {
  try {
    const data = req.body;
    let companyId = null;

    if (req.user.type === 'company') {
      companyId = req.user.id;
    } else if (req.user.type === 'Employee') {
      const employee = await Employee.findOne({ where: { user_id: req.user.id } });
      if (!employee) return res.status(403).json({ message: 'Employee profile not found' });
      
      companyId = employee.created_by; // ✅ company id
    }

    // ====================
    // 🔹 VALIDATION
    // ====================
    // 1. Check branch
    const branch = await Branch.findOne({ where: { id: data.branch_id, created_by: companyId } });
    if (!branch) {
      return res.status(400).json({ message: 'Invalid branch for this company' });
    }

    // 2. Check departments
    if (data.department_id) {
      const departmentIds = data.department_id.split(',').map(id => id.trim());
      const departments = await Department.findAll({ 
        where: { id: departmentIds, branch_id: data.branch_id, created_by: companyId } 
      });
      if (departments.length !== departmentIds.length) {
        return res.status(400).json({ message: 'One or more departments are invalid' });
      }
    }

    // 3. Employees (FIX: use employee_id instead of id)
    if (data.employee_id) {
      const employeeIds = data.employee_id.split(',').map(id => id.trim());
      const employees = await Employee.findAll({ 
        where: { employee_id: employeeIds, created_by: companyId } 
      });
      if (employees.length !== employeeIds.length) {
        return res.status(400).json({ message: 'One or more employees are invalid' });
      }
    }

    // ====================
    // Save event
    // ====================
    data.created_by = companyId;
    data.created_at = new Date();
    data.updated_at = new Date();

    const event = await Event.create(data);
    res.status(201).json({ success: true, message: 'Event created successfully', data: event });

  } catch (err) {
    res.status(500).json({ message: 'Error creating event', error: err.message });
  }
};

// ====================
// Update Event
// ====================
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    let companyId = null;

    if (req.user.type === 'company') {
      companyId = req.user.id;
    } else if (req.user.type === 'Employee') {
      const employee = await Employee.findOne({ where: { user_id: req.user.id } });
      if (!employee) return res.status(403).json({ message: 'Employee profile not found' });
      
      companyId = employee.created_by;
    }

    const event = await Event.findOne({ where: { id, created_by: companyId } });
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // 🔹 VALIDATION (same as create)
    if (data.branch_id) {
      const branch = await Branch.findOne({ where: { id: data.branch_id, created_by: companyId } });
      if (!branch) {
        return res.status(400).json({ message: 'Invalid branch for this company' });
      }
    }

    if (data.department_id) {
      const departmentIds = data.department_id.split(',').map(id => id.trim());
      const departments = await Department.findAll({ 
        where: { id: departmentIds, branch_id: data.branch_id || event.branch_id, created_by: companyId } 
      });
      if (departments.length !== departmentIds.length) {
        return res.status(400).json({ message: 'One or more departments are invalid' });
      }
    }

    if (data.employee_id) {
      const employeeIds = data.employee_id.split(',').map(id => id.trim());
      const employees = await Employee.findAll({ 
        where: { employee_id: employeeIds, created_by: companyId } 
      });
      if (employees.length !== employeeIds.length) {
        return res.status(400).json({ message: 'One or more employees are invalid' });
      }
    }

    // Update
    await event.update({ ...data, updated_at: new Date() });
    res.json({ success: true, message: 'Event updated successfully', data: event });

  } catch (err) {
    res.status(500).json({ message: 'Error updating event', error: err.message });
  }
};

// =====================
// Delete Event
// =====================
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    let companyId = null;

    if (req.user.type === 'company') {
      companyId = req.user.id;
    } else if (req.user.type === 'Employee') {
      const employee = await Employee.findOne({ where: { user_id: req.user.id } });
      if (!employee) return res.status(403).json({ message: 'Employee profile not found' });


      companyId = employee.created_by;
    }

    const event = await Event.findOne({ where: { id, created_by: companyId } });
    if (!event) return res.status(404).json({ message: 'Event not found' });

    await event.destroy();
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting event', error: err.message });
  }
};
