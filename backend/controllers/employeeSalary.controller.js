



// const EmployeeSalary = require('../models/employeeSalary.model');
// const Employee = require('../models/employee.model');
// const User = require('../models/user.model');

// // GET /api/salaries
// exports.getAllSalaries = async (req, res) => {
// try {
// const salaries = await EmployeeSalary.findAll({
// include: [
// { model: Employee, as: 'employee', attributes: ['id', 'name', 'email'] },
// { model: User, as: 'creator', attributes: ['id', 'name'] }
// ]
// });
// res.json(salaries);
// } catch (err) {
// console.error('Error fetching salaries:', err.message);
// res.status(500).json({ message: 'Server error', error: err.message });
// }
// };

// // GET /api/salaries/:id
// exports.getSalaryById = async (req, res) => {
// try {
// const salary = await EmployeeSalary.findByPk(req.params.id, {
// include: [
// { model: Employee, as: 'employee', attributes: ['id', 'name', 'email'] },
// { model: User, as: 'creator', attributes: ['id', 'name'] }
// ]
// });
// if (!salary) return res.status(404).json({ message: 'Salary record not found' });
// res.json(salary);
// } catch (err) {
// console.error('Error fetching salary:', err.message);
// res.status(500).json({ message: 'Server error', error: err.message });
// }
// };

// // POST /api/salaries
// exports.createSalary = async (req, res) => {
// try {
// const data = req.body;
// const createdSalary = await EmployeeSalary.create({
// ...data,
// created_by: req.user?.id || null
// });
// res.status(201).json(createdSalary);
// } catch (err) {
// console.error('Error creating salary:', err.message);
// res.status(500).json({ message: 'Server error', error: err.message });
// }
// };

// // PUT /api/salaries/:id
// exports.updateSalary = async (req, res) => {
// try {
// const salary = await EmployeeSalary.findByPk(req.params.id);
// if (!salary) return res.status(404).json({ message: 'Salary record not found' });


// await salary.update(req.body);
// res.json({ message: 'Salary updated successfully', salary });
// } catch (err) {
// console.error('Error updating salary:', err.message);
// res.status(500).json({ message: 'Server error', error: err.message });
// }
// };

// // DELETE /api/salaries/:id
// exports.deleteSalary = async (req, res) => {
// try {
// const salary = await EmployeeSalary.findByPk(req.params.id);
// if (!salary) return res.status(404).json({ message: 'Salary record not found' });


// await salary.destroy();
// res.json({ message: 'Salary deleted successfully' });
// } catch (err) {
// console.error('Error deleting salary:', err.message);
// res.status(500).json({ message: 'Server error', error: err.message });
// }
// };




const EmployeeSalary = require('../models/employeeSalary.model');
const Employee = require('../models/employee.model');
const User = require('../models/user.model');

// ==============================
// Helper: Multi-tenancy isolation
// ==============================
async function getCompanyId(req) {
  if (req.user?.creator_id) return req.user.creator_id;

  if (req.user?.type === 'Employee') {
    const emp = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['created_by']
    });
    return emp?.created_by;
  }

  return req.user?.id;
}

// ==============================
// GET ALL
// ==============================
exports.getAllSalaries = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);

    let where = { created_by: companyId };

    // employee → only their own salary
    if (req.user.type === 'Employee') {
      const self = await Employee.findOne({ where: { user_id: req.user.id } });
      if (!self) return res.status(404).json({ message: 'Employee not found' });
      where.employee_id = self.employee_id;
    }

    const salaries = await EmployeeSalary.findAll({
      where,
      include: [
        { model: Employee, as: 'employee', attributes: ['employee_id', 'name', 'email'] },
        { model: User, as: 'creator', attributes: ['id', 'name'] }
      ]
    });

    res.json({ success: true, data: salaries });
  } catch (err) {
    console.error('Error fetching salaries:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ==============================
// GET BY ID
// ==============================
exports.getSalaryById = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);

    const salary = await EmployeeSalary.findOne({
      where: { id: req.params.id, created_by: companyId },
      include: [
        { model: Employee, as: 'employee', attributes: ['employee_id', 'name', 'email'] },
        { model: User, as: 'creator', attributes: ['id', 'name'] }
      ]
    });

    if (!salary) return res.status(404).json({ message: 'Salary record not found' });

    // employee → must only see their own salary
    if (req.user.type === 'Employee') {
      const self = await Employee.findOne({ where: { user_id: req.user.id } });
      if (!self || salary.employee_id !== self.employee_id) {
        return res.status(403).json({ message: 'Not allowed to view others salary' });
      }
    }

    res.json({ success: true, data: salary });
  } catch (err) {
    console.error('Error fetching salary by id:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ==============================
// CREATE
// ==============================
exports.createSalary = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);
    const payload = { ...req.body, created_by: companyId };

    if (req.user.type === 'Employee') {
      // employees cannot assign salaries to others
      const self = await Employee.findOne({ where: { user_id: req.user.id } });
      if (!self) return res.status(404).json({ message: 'Employee not found' });
      payload.employee_id = self.employee_id;
    } else {
      if (!payload.employee_id) {
        return res.status(400).json({ message: 'employee_id is required' });
      }

      // ensure employee belongs to this company
      const emp = await Employee.findOne({
        where: { employee_id: payload.employee_id, created_by: companyId }
      });
      if (!emp) {
        return res.status(400).json({ message: 'Employee not found in your company' });
      }
    }

    const createdSalary = await EmployeeSalary.create(payload);
    res.status(201).json({ success: true, data: createdSalary });
  } catch (err) {
    console.error('Error creating salary:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ==============================
// UPDATE
// ==============================
exports.updateSalary = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);

    const salary = await EmployeeSalary.findOne({
      where: { id: req.params.id, created_by: companyId }
    });
    if (!salary) return res.status(404).json({ message: 'Salary record not found' });

    if (req.user.type === 'Employee') {
      const self = await Employee.findOne({ where: { user_id: req.user.id } });
      if (!self || salary.employee_id !== self.employee_id) {
        return res.status(403).json({ message: 'Not allowed to update others salary' });
      }
      delete req.body.employee_id; // prevent spoofing
    } else if (req.body.employee_id) {
      // validate target employee
      const emp = await Employee.findOne({
        where: { employee_id: req.body.employee_id, created_by: companyId }
      });
      if (!emp) {
        return res.status(400).json({ message: 'Employee not found in your company' });
      }
    }

    await salary.update(req.body);
    res.json({ success: true, message: 'Salary updated successfully', data: salary });
  } catch (err) {
    console.error('Error updating salary:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ==============================
// DELETE
// ==============================
exports.deleteSalary = async (req, res) => {
  try {
    const companyId = await getCompanyId(req);

    const salary = await EmployeeSalary.findOne({
      where: { id: req.params.id, created_by: companyId }
    });
    if (!salary) return res.status(404).json({ message: 'Salary record not found' });

    if (req.user.type === 'Employee') {
      const self = await Employee.findOne({ where: { user_id: req.user.id } });
      if (!self || salary.employee_id !== self.employee_id) {
        return res.status(403).json({ message: 'Not allowed to delete others salary' });
      }
    }

    await salary.destroy();
    res.json({ success: true, message: 'Salary deleted successfully' });
  } catch (err) {
    console.error('Error deleting salary:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


