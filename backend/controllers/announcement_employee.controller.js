// const AnnouncementEmployee = require('../models/announcement_employee.model');
// const Announcement = require('../models/announcement.model');
// const Employee = require('../models/employee.model');

// /*// 🔹 Create associations between announcement and multiple employees
// exports.assignEmployeesToAnnouncement = async (req, res) => {
//   try {
//     const { announcement_id, employee_ids, created_by } = req.body;

//     if (!announcement_id || !Array.isArray(employee_ids) || employee_ids.length === 0) {
//       return res.status(400).json({ message: 'announcement_id and employee_ids are required' });
//     }

//     const bulkData = employee_ids.map(empId => ({
//       announcement_id,
//       employee_id: empId,
//       created_by,
//     }));

//     await AnnouncementEmployee.bulkCreate(bulkData);

//     res.status(200).json({
//       message: 'Employees assigned to announcement successfully',
//     });
//   } catch (error) {
//     console.error('Error assigning employees:', error);
//     res.status(500).json({ message: 'Server Error', error: error.message });
//   }
// };
// */


// // 🔹 Create associations between announcement and multiple employees
// exports.assignEmployeesToAnnouncement = async (req, res) => {
//   try {
//     const { announcement_id, employee_ids } = req.body;

//     if (!announcement_id || !Array.isArray(employee_ids) || employee_ids.length === 0) {
//       return res.status(400).json({ message: 'announcement_id and employee_ids are required' });
//     }

//     const bulkData = employee_ids.map(empId => ({
//       announcement_id,
//       employee_id: empId,
//       created_by: req.user.id,   // ✅ logged in user
//     }));

//     await AnnouncementEmployee.bulkCreate(bulkData);

//     res.status(200).json({
//       message: 'Employees assigned to announcement successfully',
//     });
//   } catch (error) {
//     console.error('Error assigning employees:', error);
//     res.status(500).json({ message: 'Server Error', error: error.message });
//   }
// };


// // 🔹 Get employees assigned to an announcement
// exports.getEmployeesByAnnouncement = async (req, res) => {
//   try {
//     const { announcement_id } = req.params;

//     const announcement = await Announcement.findByPk(announcement_id, {
//       include: [
//         {
//           model: Employee,
//           through: { attributes: [] },
//         },
//       ],
//     });

//     if (!announcement) {
//       return res.status(404).json({ message: 'Announcement not found' });
//     }

//     res.status(200).json({
//       announcement_id,
//       employees: announcement.Employees,
//     });
//   } catch (error) {
//     console.error('Error fetching assigned employees:', error);
//     res.status(500).json({ message: 'Server Error', error: error.message });
//   }
// };

// // 🔹 Remove an employee from an announcement
// exports.removeEmployeeFromAnnouncement = async (req, res) => {
//   try {
//     const { announcement_id, employee_id } = req.body;

//     const deleted = await AnnouncementEmployee.destroy({
//       where: { announcement_id, employee_id },
//     });

//     if (!deleted) {
//       return res.status(404).json({ message: 'Record not found or already deleted' });
//     }

//     res.status(200).json({ message: 'Employee removed from announcement' });
//   } catch (error) {
//     console.error('Error removing employee:', error);
//     res.status(500).json({ message: 'Server Error', error: error.message });
//   }
// };




