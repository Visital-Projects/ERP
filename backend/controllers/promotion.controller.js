
// // controllers/promotion.controller.js
// const Promotion = require('../models/promotion.model');
// const Employee = require('../models/employee.model');
// const Designation = require('../models/designation.model');

// // =====================
// // Helper: format promotion response
// // =====================
// const formatPromotionResponse = async (promotion) => {
//   if (!promotion) return null;
//   const json = promotion.toJSON();
//   return {
//     id: json.id,
//     employee_id: json.employee_id,
//     designation_id: json.designation_id,
//     promotion_title: json.promotion_title,
//     promotion_date: json.promotion_date,
//     description: json.description,
//     created_by: json.created_by, // company_id
//     created_at: json.created_at,
//     updated_at: json.updated_at
//   };
// };

// // =====================
// // GET ALL PROMOTIONS
// // =====================
// exports.getAllPromotions = async (req, res) => {
//   try {
//     let whereClause = {};

//     if (req.user.type === 'company') {
//       whereClause.created_by = req.user.id;
//     } else if (req.user.type === 'Employee') {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (!emp)
//         return res
//           .status(403)
//           .json({ success: false, message: 'Employee profile not found' });
//       whereClause = { created_by: emp.created_by, employee_id: emp.employee_id };
//     } else {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (emp) whereClause.created_by = emp.created_by;
//     }

//     const promotions = await Promotion.findAll({
//       where: whereClause,
//       order: [['id', 'DESC']]
//     });

//     const responseData = await Promise.all(
//       promotions.map((p) => formatPromotionResponse(p))
//     );
//     res.json({ success: true, data: responseData });
//   } catch (error) {
//     console.error('Get All Promotions Error:', error);
//     res
//       .status(500)
//       .json({ success: false, message: 'Server error', error: error.message });
//   }
// };

// // =====================
// // GET PROMOTION BY ID
// // =====================
// exports.getPromotionById = async (req, res) => {
//   try {
//     let whereClause = { id: req.params.id };

//     if (req.user.type === 'company') {
//       whereClause.created_by = req.user.id;
//     } else if (req.user.type === 'Employee') {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (!emp)
//         return res
//           .status(403)
//           .json({ success: false, message: 'Employee profile not found' });
//       whereClause = {
//         id: req.params.id,
//         created_by: emp.created_by,
//         employee_id: emp.employee_id
//       };
//     } else {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (emp) whereClause.created_by = emp.created_by;
//     }

//     const promotion = await Promotion.findOne({ where: whereClause });
//     if (!promotion)
//       return res
//         .status(404)
//         .json({ success: false, message: 'Promotion not found' });

//     res.json({ success: true, data: await formatPromotionResponse(promotion) });
//   } catch (error) {
//     console.error('Get Promotion By ID Error:', error);
//     res
//       .status(500)
//       .json({ success: false, message: 'Server error', error: error.message });
//   }
// };

// // =====================
// // CREATE PROMOTION
// // =====================
// exports.createPromotion = async (req, res) => {
//   try {
//     const { employee_id, designation_id, promotion_title, promotion_date, description } = req.body;
//     if (!employee_id || !designation_id)
//       return res
//         .status(400)
//         .json({ success: false, message: 'employee_id and designation_id are required' });

//     let companyId;
//     if (req.user.type === 'company') {
//       companyId = req.user.id;
//     } else if (req.user.type === 'Employee') {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (!emp)
//         return res
//           .status(403)
//           .json({ success: false, message: 'Employee profile not found' });
//       companyId = emp.created_by;
//     } else {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (!emp)
//         return res
//           .status(403)
//           .json({ success: false, message: 'Employee profile not found' });
//       companyId = emp.created_by;
//     }

//     // ✅ Validate employee belongs to company
//     const targetEmployee = await Employee.findOne({
//       where: { employee_id, created_by: companyId }
//     });
//     if (!targetEmployee)
//       return res
//         .status(400)
//         .json({ success: false, message: 'Employee not found in your company' });

//     // ✅ Validate designation belongs to company
//     const targetDesignation = await Designation.findOne({
//       where: { id: designation_id, created_by: companyId }
//     });
//     if (!targetDesignation)
//       return res
//         .status(400)
//         .json({ success: false, message: 'Invalid designation for your company' });

//     const promotion = await Promotion.create({
//       employee_id,
//       designation_id,
//       promotion_title,
//       promotion_date,
//       description,
//       created_by: companyId,
//       created_at: new Date(),
//       updated_at: new Date()
//     });

//     res.status(201).json({
//       success: true,
//       message: 'Promotion created',
//       data: await formatPromotionResponse(promotion)
//     });
//   } catch (error) {
//     console.error('Create Promotion Error:', error);
//     res
//       .status(500)
//       .json({ success: false, message: 'Server error', error: error.message });
//   }
// };

// // =====================
// // UPDATE PROMOTION
// // =====================
// exports.updatePromotion = async (req, res) => {
//   try {
//     const promotionId = req.params.id;
//     const { employee_id, designation_id, promotion_title, promotion_date, description } = req.body;

//     let whereClause = { id: promotionId };

//     if (req.user.type === 'company') {
//       whereClause.created_by = req.user.id;
//     } else if (req.user.type === 'Employee') {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (!emp)
//         return res
//           .status(403)
//           .json({ success: false, message: 'Employee profile not found' });
//       whereClause = {
//         id: promotionId,
//         created_by: emp.created_by,
//         employee_id: emp.employee_id
//       };
//     } else {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (!emp)
//         return res
//           .status(403)
//           .json({ success: false, message: 'Employee profile not found' });
//       whereClause.created_by = emp.created_by;
//     }

//     const promotion = await Promotion.findOne({ where: whereClause });
//     if (!promotion)
//       return res
//         .status(404)
//         .json({ success: false, message: 'Promotion not found' });

//     // ✅ Validate employee belongs to same company if updating employee_id
//     if (employee_id) {
//       const targetEmployee = await Employee.findOne({
//         where: { employee_id, created_by: promotion.created_by }
//       });
//       if (!targetEmployee)
//         return res
//           .status(400)
//           .json({ success: false, message: 'Employee not found in your company' });
//       promotion.employee_id = employee_id;
//     }

//     // ✅ Validate designation belongs to same company if updating designation_id
//     if (designation_id) {
//       const targetDesignation = await Designation.findOne({
//         where: { id: designation_id, created_by: promotion.created_by }
//       });
//       if (!targetDesignation)
//         return res
//           .status(400)
//           .json({ success: false, message: 'Invalid designation for your company' });
//       promotion.designation_id = designation_id;
//     }

//     await promotion.update({
//       promotion_title,
//       promotion_date,
//       description,
//       updated_at: new Date()
//     });

//     res.json({
//       success: true,
//       message: 'Promotion updated',
//       data: await formatPromotionResponse(promotion)
//     });
//   } catch (error) {
//     console.error('Update Promotion Error:', error);
//     res
//       .status(500)
//       .json({ success: false, message: 'Server error', error: error.message });
//   }
// };

// // =====================
// // DELETE PROMOTION
// // =====================
// exports.deletePromotion = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (req.user.type === 'company') {
//       const promotion = await Promotion.findOne({
//         where: { id, created_by: req.user.id }
//       });
//       if (!promotion)
//         return res.status(404).json({
//           success: false,
//           message: 'Promotion not found in your company'
//         });

//       await promotion.destroy();
//       return res.json({
//         success: true,
//         message: 'Promotion deleted',
//         data: { id }
//       });
//     }

//     if (req.user.type === 'Employee') {
//       const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//       if (!emp)
//         return res
//           .status(403)
//           .json({ success: false, message: 'Employee profile not found' });

//       const promotion = await Promotion.findOne({
//         where: {
//           id,
//           created_by: emp.created_by,
//           employee_id: emp.employee_id
//         }
//       });
//       if (!promotion)
//         return res
//           .status(404)
//           .json({ success: false, message: 'Promotion not found for you' });

//       await promotion.destroy();
//       return res.json({
//         success: true,
//         message: 'Your promotion deleted',
//         data: { id }
//       });
//     }

//     const emp = await Employee.findOne({ where: { user_id: req.user.id } });
//     if (!emp)
//       return res
//         .status(403)
//         .json({ success: false, message: 'Employee profile not found' });

//     const promotion = await Promotion.findOne({
//       where: { id, created_by: emp.created_by }
//     });
//     if (!promotion)
//       return res
//         .status(404)
//         .json({ success: false, message: 'Promotion not found in your company' });

//     await promotion.destroy();
//     return res.json({
//       success: true,
//       message: 'Promotion deleted',
//       data: { id }
//     });
//   } catch (error) {
//     console.error('Delete Promotion Error:', error);
//     res
//       .status(500)
//       .json({ success: false, message: 'Server error', error: error.message });
//   }
// };


















// // controllers/promotion.controller.js
// const { Op } = require('sequelize');
// const Promotion = require('../models/promotion.model');
// const Employee = require('../models/employee.model');
// const Designation = require('../models/designation.model');
// const User = require('../models/user.model');

// // =====================
// // 🔹 Helpers
// // =====================
// async function getCompanyId(req) {
//   if (!req.user) return null;
//   const type = (req.user.type || '').toLowerCase();

//   if (['company', 'admin', 'super admin'].includes(type)) return req.user.id;

//   try {
//     const emp = await Employee.findOne({
//       where: { user_id: req.user.id },
//       attributes: ['created_by'],
//       raw: true,
//     });
//     if (emp?.created_by) return Number(emp.created_by);
//   } catch (err) {
//     console.error('getCompanyId Employee lookup failed:', err.message);
//   }

//   return req.user.creator_id || req.user.id;
// }

// function isSuper(req) {
//   return (req.user?.roles || []).some(
//     (r) => (r.name || '').toLowerCase() === 'super admin'
//   );
// }
// function isCompany(req) {
//   return (req.user?.type || '').toLowerCase() === 'company';
// }
// function isEmployee(req) {
//   return (req.user?.type || '').toLowerCase() === 'employee';
// }

// // 🔹 Get branch of current user
// async function getUserBranchId(userId) {
//   const emp = await Employee.findOne({
//     where: { user_id: userId },
//     attributes: ['branch_id'],
//     raw: true,
//   });
//   return emp?.branch_id || null;
// }

// // 🔹 Get all user IDs under company (+ optional branch filtering)
// async function getAllUserIdsUnderCompanyBranch(companyId, branchId) {
//   if (!companyId) return [];

//   const users = await User.findAll({
//     where: { created_by: companyId },
//     attributes: ['id'],
//     raw: true,
//   });

//   const userIds = users.map((u) => Number(u.id));
//   const baseSet = new Set([Number(companyId), ...userIds]);

//   if (branchId) {
//     if (userIds.length === 0) return [Number(companyId)];

//     const emps = await Employee.findAll({
//       where: {
//         user_id: { [Op.in]: userIds },
//         branch_id: branchId,
//       },
//       attributes: ['user_id'],
//       raw: true,
//     });

//     const branchUserIds = emps.map((e) => Number(e.user_id));
//     return [...new Set([Number(companyId), ...branchUserIds])];
//   }

//   return Array.from(baseSet);
// }

// // =====================
// // 🔹 Format Promotion Response
// // =====================
// const formatPromotionResponse = async (promotion) => {
//   if (!promotion) return null;
//   const json = promotion.toJSON();
//   return {
//     id: json.id,
//     employee_id: json.employee_id,
//     designation_id: json.designation_id,
//     promotion_title: json.promotion_title,
//     promotion_date: json.promotion_date,
//     description: json.description,
//     created_by: json.created_by,
//     created_at: json.created_at,
//     updated_at: json.updated_at,
//   };
// };

// // =====================
// // 🔹 GET ALL PROMOTIONS (Exclude Soft Deleted)
// // =====================
// exports.getAllPromotions = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     if (!companyId && !isSuper(req)) {
//       return res.status(403).json({ success: false, message: 'Unauthorized' });
//     }

//     let where = { deleted_at: null };

//     if (!isSuper(req)) {
//       if (isCompany(req)) {
//         const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, null);
//         where.created_by = { [Op.in]: allowedCreatedBy };
//       } else {
//         const branchId = await getUserBranchId(req.user.id);
//         if (!branchId)
//           return res
//             .status(403)
//             .json({ success: false, message: 'No branch assigned' });

//         const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(
//           companyId,
//           branchId
//         );
//         where.created_by = { [Op.in]: allowedCreatedBy };
//       }
//     }

//     const promotions = await Promotion.findAll({
//       where,
//       order: [['id', 'DESC']],
//     });

//     const responseData = await Promise.all(
//       promotions.map((p) => formatPromotionResponse(p))
//     );
//     res.json({ success: true, data: responseData });
//   } catch (error) {
//     console.error('Get All Promotions Error:', error);
//     res
//       .status(500)
//       .json({ success: false, message: 'Server error', error: error.message });
//   }
// };

// // =====================
// // 🔹 GET PROMOTION BY ID (Exclude Soft Deleted)
// // =====================
// exports.getPromotionById = async (req, res) => {
//   try {
//     const promotion = await Promotion.findOne({
//       where: {
//         id: req.params.id,
//         deleted_at: null,
//       },
//     });

//     if (!promotion) {
//       return res
//         .status(404)
//         .json({ success: false, message: 'Promotion not found or deleted' });
//     }

//     if (!isSuper(req)) {
//       const companyId = await getCompanyId(req);
//       if (!companyId)
//         return res.status(403).json({ success: false, message: 'Unauthorized' });

//       const branchId = isCompany(req)
//         ? null
//         : await getUserBranchId(req.user.id);
//       const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(
//         companyId,
//         branchId
//       );

//       if (
//         !allowedCreatedBy.map(String).includes(String(promotion.created_by))
//       ) {
//         return res
//           .status(403)
//           .json({ success: false, message: 'Forbidden: not your record' });
//       }
//     }

//     res.json({ success: true, data: await formatPromotionResponse(promotion) });
//   } catch (error) {
//     console.error('Get Promotion By ID Error:', error);
//     res
//       .status(500)
//       .json({ success: false, message: 'Server error', error: error.message });
//   }
// };

// // =====================
// // 🔹 CREATE PROMOTION
// // =====================
// exports.createPromotion = async (req, res) => {
//   try {
//     const {
//       employee_id,
//       designation_id,
//       promotion_title,
//       promotion_date,
//       description,
//     } = req.body;

//     if (!employee_id || !designation_id)
//       return res
//         .status(400)
//         .json({
//           success: false,
//           message: 'employee_id and designation_id are required',
//         });

//     const creatorId = req.user.id;

//     // Validate employee exists
//     const targetEmployee = await Employee.findOne({ where: { employee_id } });
//     if (!targetEmployee)
//       return res
//         .status(400)
//         .json({ success: false, message: 'Employee not found' });

//     // Validate designation exists
//     const targetDesignation = await Designation.findOne({
//       where: { id: designation_id },
//     });
//     if (!targetDesignation)
//       return res
//         .status(400)
//         .json({ success: false, message: 'Designation not found' });

//     const promotion = await Promotion.create({
//       employee_id,
//       designation_id,
//       promotion_title,
//       promotion_date,
//       description,
//       created_by: creatorId,
//       created_at: new Date(),
//       updated_at: new Date(),
//     });

//     res.status(201).json({
//       success: true,
//       message: 'Promotion created',
//       data: await formatPromotionResponse(promotion),
//     });
//   } catch (error) {
//     console.error('Create Promotion Error:', error);
//     res
//       .status(500)
//       .json({ success: false, message: 'Server error', error: error.message });
//   }
// };

// // =====================
// // 🔹 UPDATE PROMOTION
// // =====================
// exports.updatePromotion = async (req, res) => {
//   try {
//     const promotionId = req.params.id;
//     const {
//       employee_id,
//       designation_id,
//       promotion_title,
//       promotion_date,
//       description,
//     } = req.body;

//     const promotion = await Promotion.findOne({
//       where: { id: promotionId, deleted_at: null },
//     });

//     if (!promotion)
//       return res
//         .status(404)
//         .json({ success: false, message: 'Promotion not found' });

//     // Validate employee if updating
//     if (employee_id) {
//       const emp = await Employee.findOne({ where: { employee_id } });
//       if (!emp)
//         return res
//           .status(400)
//           .json({ success: false, message: 'Employee not found' });
//       promotion.employee_id = employee_id;
//     }

//     // Validate designation if updating
//     if (designation_id) {
//       const desig = await Designation.findOne({ where: { id: designation_id } });
//       if (!desig)
//         return res
//           .status(400)
//           .json({ success: false, message: 'Designation not found' });
//       promotion.designation_id = designation_id;
//     }

//     await promotion.update({
//       promotion_title: promotion_title || promotion.promotion_title,
//       promotion_date: promotion_date || promotion.promotion_date,
//       description: description || promotion.description,
//       updated_at: new Date(),
//     });

//     res.json({
//       success: true,
//       message: 'Promotion updated',
//       data: await formatPromotionResponse(promotion),
//     });
//   } catch (error) {
//     console.error('Update Promotion Error:', error);
//     res
//       .status(500)
//       .json({ success: false, message: 'Server error', error: error.message });
//   }
// };

// // =====================
// // 🔹 DELETE PROMOTION (Soft Delete)
// // =====================
// exports.deletePromotion = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const promotion = await Promotion.findOne({ where: { id } });
//     if (!promotion)
//       return res
//         .status(404)
//         .json({ success: false, message: 'Promotion not found' });

//     if (promotion.deleted_at) {
//       return res
//         .status(400)
//         .json({ success: false, message: 'Promotion already deleted' });
//     }

//     promotion.deleted_at = new Date();
//     await promotion.save();

//     return res.json({
//       success: true,
//       message: 'Promotion soft deleted successfully',
//       data: { id, deleted_at: promotion.deleted_at },
//     });
//   } catch (error) {
//     console.error('Delete Promotion Error:', error);
//     res
//       .status(500)
//       .json({ success: false, message: 'Server error', error: error.message });
//   }
// };
















// // controllers/promotion.controller.js
// const { Op } = require('sequelize');
// const Promotion = require('../models/promotion.model');
// const Employee = require('../models/employee.model');
// const Designation = require('../models/designation.model');
// const User = require('../models/user.model');

// // =====================
// // 🔹 Helpers
// // =====================
// async function getCompanyId(req) {
//   if (!req.user) return null;
//   const type = (req.user.type || '').toLowerCase();

//   if (['company', 'admin', 'super admin'].includes(type)) return req.user.id;

//   try {
//     const emp = await Employee.findOne({
//       where: { user_id: req.user.id },
//       attributes: ['created_by'],
//       raw: true,
//     });
//     if (emp?.created_by) return Number(emp.created_by);
//   } catch (err) {
//     console.error('getCompanyId Employee lookup failed:', err.message);
//   }

//   return req.user.creator_id || req.user.id;
// }

// function isSuper(req) {
//   return (req.user?.roles || []).some(
//     (r) => (r.name || '').toLowerCase() === 'super admin'
//   );
// }
// function isCompany(req) {
//   return (req.user?.type || '').toLowerCase() === 'company';
// }
// function isEmployee(req) {
//   return (req.user?.type || '').toLowerCase() === 'employee';
// }

// // 🔹 Get branch of current user
// async function getUserBranchId(userId) {
//   const emp = await Employee.findOne({
//     where: { user_id: userId },
//     attributes: ['branch_id'],
//     raw: true,
//   });
//   return emp?.branch_id || null;
// }

// // 🔹 Get all user IDs under company (+ optional branch filtering)
// async function getAllUserIdsUnderCompanyBranch(companyId, branchId) {
//   if (!companyId) return [];

//   const users = await User.findAll({
//     where: { created_by: companyId },
//     attributes: ['id'],
//     raw: true,
//   });

//   const userIds = users.map((u) => Number(u.id));
//   const baseSet = new Set([Number(companyId), ...userIds]);

//   if (branchId) {
//     if (userIds.length === 0) return [Number(companyId)];

//     const emps = await Employee.findAll({
//       where: {
//         user_id: { [Op.in]: userIds },
//         branch_id: branchId,
//       },
//       attributes: ['user_id'],
//       raw: true,
//     });

//     const branchUserIds = emps.map((e) => Number(e.user_id));
//     return [...new Set([Number(companyId), ...branchUserIds])];
//   }

//   return Array.from(baseSet);
// }

// // =====================
// // 🔹 Format Promotion Response
// // =====================
// const formatPromotionResponse = async (promotion) => {
//   if (!promotion) return null;
//   const json = promotion.toJSON();
//   return {
//     id: json.id,
//     employee_id: json.employee_id,
//     designation_id: json.designation_id,
//     promotion_title: json.promotion_title,
//     promotion_date: json.promotion_date,
//     description: json.description,
//     created_by: json.created_by,
//     created_at: json.created_at,
//     updated_at: json.updated_at,
//   };
// };

// // =====================
// // 🔹 GET ALL PROMOTIONS (Exclude Soft Deleted)
// // =====================
// exports.getAllPromotions = async (req, res) => {
//   try {
//     const companyId = await getCompanyId(req);
//     if (!companyId && !isSuper(req)) {
//       return res.status(403).json({ success: false, message: 'Unauthorized' });
//     }

//     let where = { deleted_at: null };

//     if (!isSuper(req)) {
//       if (isCompany(req)) {
//         const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, null);
//         where.created_by = { [Op.in]: allowedCreatedBy };
//       } else {
//         const branchId = await getUserBranchId(req.user.id);
//         if (!branchId)
//           return res
//             .status(403)
//             .json({ success: false, message: 'No branch assigned' });

//         const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(
//           companyId,
//           branchId
//         );
//         where.created_by = { [Op.in]: allowedCreatedBy };
//       }
//     }

//     const promotions = await Promotion.findAll({
//       where,
//       order: [['id', 'DESC']],
//     });

//     const responseData = await Promise.all(
//       promotions.map((p) => formatPromotionResponse(p))
//     );
//     res.json({ success: true, data: responseData });
//   } catch (error) {
//     console.error('Get All Promotions Error:', error);
//     res
//       .status(500)
//       .json({ success: false, message: 'Server error', error: error.message });
//   }
// };

// // =====================
// // 🔹 GET PROMOTION BY ID (Exclude Soft Deleted)
// // =====================
// exports.getPromotionById = async (req, res) => {
//   try {
//     const promotion = await Promotion.findOne({
//       where: {
//         id: req.params.id,
//         deleted_at: null,
//       },
//     });

//     if (!promotion) {
//       return res
//         .status(404)
//         .json({ success: false, message: 'Promotion not found or deleted' });
//     }

//     if (!isSuper(req)) {
//       const companyId = await getCompanyId(req);
//       if (!companyId)
//         return res.status(403).json({ success: false, message: 'Unauthorized' });

//       const branchId = isCompany(req)
//         ? null
//         : await getUserBranchId(req.user.id);
//       const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(
//         companyId,
//         branchId
//       );

//       if (
//         !allowedCreatedBy.map(String).includes(String(promotion.created_by))
//       ) {
//         return res
//           .status(403)
//           .json({ success: false, message: 'Forbidden: not your record' });
//       }
//     }

//     res.json({ success: true, data: await formatPromotionResponse(promotion) });
//   } catch (error) {
//     console.error('Get Promotion By ID Error:', error);
//     res
//       .status(500)
//       .json({ success: false, message: 'Server error', error: error.message });
//   }
// };

// // =====================
// // 🔹 CREATE PROMOTION
// // =====================
// exports.createPromotion = async (req, res) => {
//   try {
//     const {
//       employee_id,
//       designation_id,
//       promotion_title,
//       promotion_date,
//       description,
//     } = req.body;

//     if (!employee_id || !designation_id)
//       return res
//         .status(400)
//         .json({
//           success: false,
//           message: 'employee_id and designation_id are required',
//         });

//     const creatorId = req.user.id;

//     // Validate employee exists
//     const targetEmployee = await Employee.findOne({ where: { employee_id } });
//     if (!targetEmployee)
//       return res
//         .status(400)
//         .json({ success: false, message: 'Employee not found' });

//     // Validate designation exists
//     const targetDesignation = await Designation.findOne({
//       where: { id: designation_id },
//     });
//     if (!targetDesignation)
//       return res
//         .status(400)
//         .json({ success: false, message: 'Designation not found' });

//     const promotion = await Promotion.create({
//       employee_id,
//       designation_id,
//       promotion_title,
//       promotion_date,
//       description,
//       created_by: creatorId,
//       created_at: new Date(),
//       updated_at: new Date(),
//     });

//     res.status(201).json({
//       success: true,
//       message: 'Promotion created',
//       data: await formatPromotionResponse(promotion),
//     });
//   } catch (error) {
//     console.error('Create Promotion Error:', error);
//     res
//       .status(500)
//       .json({ success: false, message: 'Server error', error: error.message });
//   }
// };

// // =====================
// // 🔹 UPDATE PROMOTION
// // =====================
// exports.updatePromotion = async (req, res) => {
//   try {
//     const promotionId = req.params.id;
//     const {
//       employee_id,
//       designation_id,
//       promotion_title,
//       promotion_date,
//       description,
//     } = req.body;

//     const promotion = await Promotion.findOne({
//       where: { id: promotionId, deleted_at: null },
//     });

//     if (!promotion)
//       return res
//         .status(404)
//         .json({ success: false, message: 'Promotion not found' });

//     // Validate employee if updating
//     if (employee_id) {
//       const emp = await Employee.findOne({ where: { employee_id } });
//       if (!emp)
//         return res
//           .status(400)
//           .json({ success: false, message: 'Employee not found' });
//       promotion.employee_id = employee_id;
//     }

//     // Validate designation if updating
//     if (designation_id) {
//       const desig = await Designation.findOne({ where: { id: designation_id } });
//       if (!desig)
//         return res
//           .status(400)
//           .json({ success: false, message: 'Designation not found' });
//       promotion.designation_id = designation_id;
//     }

//     await promotion.update({
//       promotion_title: promotion_title || promotion.promotion_title,
//       promotion_date: promotion_date || promotion.promotion_date,
//       description: description || promotion.description,
//       updated_at: new Date(),
//     });

//     res.json({
//       success: true,
//       message: 'Promotion updated',
//       data: await formatPromotionResponse(promotion),
//     });
//   } catch (error) {
//     console.error('Update Promotion Error:', error);
//     res
//       .status(500)
//       .json({ success: false, message: 'Server error', error: error.message });
//   }
// };

// // =====================
// // 🔹 DELETE PROMOTION (Soft Delete)
// // =====================
// exports.deletePromotion = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const promotion = await Promotion.findOne({ where: { id } });
//     if (!promotion)
//       return res
//         .status(404)
//         .json({ success: false, message: 'Promotion not found' });

//     if (promotion.deleted_at) {
//       return res
//         .status(400)
//         .json({ success: false, message: 'Promotion already deleted' });
//     }

//     promotion.deleted_at = new Date();
//     await promotion.save();

//     return res.json({
//       success: true,
//       message: 'Promotion soft deleted successfully',
//       data: { id, deleted_at: promotion.deleted_at },
//     });
//   } catch (error) {
//     console.error('Delete Promotion Error:', error);
//     res
//       .status(500)
//       .json({ success: false, message: 'Server error', error: error.message });
//   }
// };

// controllers/promotion.controller.js
const { Op } = require('sequelize');
const Promotion = require('../models/promotion.model');
const Employee = require('../models/employee.model');
const Designation = require('../models/designation.model');
const User = require('../models/user.model');


async function getCompanyId(req) {
  try {
    if (!req.user) return null;
    
    // ???? Pehle check karo user khud company hai ya nahi
    const type = (req.user.type || '').toLowerCase();
    if (['company', 'admin', 'super admin'].includes(type)) {
      return req.user.id;
    }

    // ???? Agar employee hai (employees table mein entry hai)
    const emp = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['created_by'],
      raw: true,
    });
    if (emp?.created_by) return Number(emp.created_by);
    
    // ???? FIX: Branchless users (jaise accountant) ke liye users table se created_by lekar aao
    const userRecord = await User.findOne({
      where: { id: req.user.id },
      attributes: ['created_by'],
      raw: true,
    });
    
    console.log('???? User Record created_by:', userRecord?.created_by);
    return Number(userRecord?.created_by) || null;
    
  } catch (err) {
    console.error('getCompanyId Error:', err);
    return null;
  }
}

function isSuper(req) {
  return (req.user?.roles || []).some(r => (r.name || '').toLowerCase() === 'super admin');
}
function isCompany(req) {
  return (req.user?.type || '').toLowerCase() === 'company';
}
function isEmployee(req) {
  return (req.user?.type || '').toLowerCase() === 'employee';
}

async function getUserBranchId(userId) {
  if (!userId) return null;
  const emp = await Employee.findOne({
    where: { user_id: userId },
    attributes: ['branch_id'],
    raw: true,
  });
  return emp?.branch_id || null;
}

async function getAllUserIdsUnderCompanyBranch(companyId, branchId = null) {
  if (!companyId) return [];

  const users = await User.findAll({
    where: { created_by: companyId },
    attributes: ['id'],
    raw: true,
  });
  const userIds = users.map(u => Number(u.id));
  const baseSet = new Set([Number(companyId), ...userIds]);

  if (branchId) {
    if (userIds.length === 0) return [Number(companyId)];
    const emps = await Employee.findAll({
      where: {
        user_id: { [Op.in]: userIds },
        branch_id: branchId,
      },
      attributes: ['user_id'],
      raw: true
    });
    const branchUserIds = emps.map(e => Number(e.user_id));
    return [...new Set([Number(companyId), ...branchUserIds])];
  }

  return Array.from(baseSet);
}


const formatPromotionResponse = async (promotion) => {
  if (!promotion) return null;
  const json = promotion.toJSON ? promotion.toJSON() : promotion;

  // Get employee details
  const employee = await Employee.findOne({
    where: { employee_id: String(json.employee_id), deleted_at: null },
    attributes: ['id', 'employee_id', 'name', 'branch_id', 'department_id'],
    raw: true
  });

  // Get designation details
  let designation = null;
  if (json.designation_id) {
    const d = await Designation.findByPk(json.designation_id, { raw: true });
    if (d) designation = { id: d.id, name: d.name };
  }

  return {
    id: json.id,
    employee_id: json.employee_id,
    employee: employee ? {
      id: employee.id,
      employee_id: employee.employee_id,
      name: employee.name,
      branch_id: employee.branch_id,
      department_id: employee.department_id
    } : null,
    designation_id: json.designation_id,
    designation: designation,
    promotion_title: json.promotion_title,
    promotion_date: json.promotion_date,
    description: json.description,
    created_by: json.created_by,
    created_at: json.created_at,
    updated_at: json.updated_at
  };
};


exports.createPromotion = async (req, res) => {
  try {
    console.log('???? START createPromotion');
    console.log('???? User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const { employee_id, designation_id, promotion_title, promotion_date, description } = req.body;
    if (!employee_id || !designation_id) {
      return res.status(400).json({ success: false, message: 'employee_id and designation_id are required' });
    }

    const companyId = await getCompanyId(req);
    if (!companyId && !isSuper(req)) return res.status(403).json({ success: false, message: 'Unauthorized' });

    // ???? Check if user exists in employees table (has branch)
    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id', 'created_by'],
      raw: true,
    });

    console.log('???? User Employee Record:', userEmployeeRecord);

    let userBranchId = null;

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // ???? CASE 1: User has employee record with branch ? branch-level access
      console.log('???? Branch User - Creating promotion');
      userBranchId = userEmployeeRecord.branch_id;
    } else {
      // ???? CASE 2: User doesn't have employee record (no branch) ? company-wide access
      console.log('???? Branchless User - Creating promotion');
      // No branch restriction for branchless users
    }

    // ???? FIX: Only require branch for branch users, not branchless users
    if (!isCompany(req) && !isSuper(req) && userEmployeeRecord && !userBranchId && !isEmployee(req)) {
      return res.status(403).json({ success: false, message: 'No branch assigned' });
    }

    // Determine allowed creators within company/branch
    const allowedCreatedBy = await getAllUserIdsUnderCompanyBranch(companyId, isCompany(req) ? null : userBranchId);

    // Find target employee by business employee_id
    const employeeRecord = await Employee.findOne({
      where: { employee_id: String(employee_id), deleted_at: null }
    });
    if (!employeeRecord) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Ensure the employee belongs to the current scope
    // - employeeRecord.created_by should be in allowedCreatedBy (company / branch users)
    // - branch users must be in same branch
    if (!isSuper(req)) {
      if (!allowedCreatedBy.map(String).includes(String(employeeRecord.created_by))) {
        return res.status(403).json({ success: false, message: 'Employee not in your company/branch scope' });
      }

      if (userEmployeeRecord && userEmployeeRecord.branch_id && !isCompany(req) && !isEmployee(req)) {
        // branch-level user: employee must be in same branch
        if (String(employeeRecord.branch_id) !== String(userBranchId)) {
          return res.status(403).json({ success: false, message: 'Employee not in your branch' });
        }
      }
    }

    // Employee users can only create promotions for themselves
    if (isEmployee(req)) {
      const self = await Employee.findOne({ where: { user_id: req.user.id, deleted_at: null } });
      if (!self || String(self.employee_id) !== String(employee_id)) {
        return res.status(403).json({ success: false, message: 'Employees can only create promotions for themselves' });
      }
    }

    // Validate designation belongs to the company
    const designationRecord = await Designation.findOne({
      where: { id: designation_id, deleted_at: null }
    });
    if (!designationRecord) {
      return res.status(400).json({ success: false, message: 'Invalid designation' });
    }
    
    //---------------------------------------------------------
    try {
      console.log('🔄 Updating employee designation in employee table...');
      console.log('🔍 Employee ID:', employeeRecord.id);
      console.log('🔍 New Designation ID:', designation_id);
      
      // Update the employee's designation in the employee table
      await Employee.update(
        { 
          designation_id: designation_id,
          updated_at: new Date()
        },
        { 
          where: { 
            id: employeeRecord.id,
            deleted_at: null 
          } 
        }
      );
      
      console.log('✅ Employee designation updated successfully');
    } catch (updateError) {
      console.error('❌ Error updating employee designation:', updateError);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update employee designation', 
        error: updateError.message 
      });
    }
    
    //---------------------------------------------------------
    // Create promotion
    const promotion = await Promotion.create({
      employee_id: String(employee_id),
      designation_id,
      promotion_title: promotion_title || null,
      promotion_date: promotion_date || new Date(),
      description: description || null,
      created_by: req.user.id,
      created_at: new Date(),
      updated_at: new Date()
    });

    const data = await formatPromotionResponse(promotion);
    console.log('? Promotion created successfully');
    return res.status(201).json({ success: true, message: 'Promotion created', data });
  } catch (err) {
    console.error('? Create Promotion Error:', err);
    return res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};


exports.getAllPromotions = async (req, res) => {
  try {
    console.log('???? START getAllPromotions');
    console.log('???? User Info - ID:', req.user.id, 'Type:', req.user.type);

    // ???? SUPER ADMIN: Full access
    if (isSuper(req)) {
      console.log('???? Super Admin Access');
      const promotions = await Promotion.findAll({
        where: { deleted_at: null },
        order: [['id', 'DESC']],
      });
      console.log('???? Super Admin Promotions Count:', promotions.length);
      const data = await Promise.all(promotions.map(p => formatPromotionResponse(p)));
      return res.json({ success: true, data });
    }

    // ???? Check if user exists in employees table (has branch)
    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id', 'created_by'],
      raw: true,
    });

    console.log('???? User Employee Record:', userEmployeeRecord);

    let promotions = [];

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // ???? CASE 1: User has employee record with branch ? branch-level access
      console.log('???? Branch User Access');
      const branchId = userEmployeeRecord.branch_id;
      console.log('???? Branch ID:', branchId);
      
      // Get company ID for branch users
      const companyId = await getCompanyId(req);
      console.log('???? Company ID for Branch User:', companyId);
      
      if (!companyId) return res.status(403).json({ success: false, message: 'Unauthorized' });

      // ???? STEP 1: Get ALL EMPLOYEES in the same branch under this company
      const branchEmployees = await Employee.findAll({
        where: {
          branch_id: branchId,
          deleted_at: null,
        },
        attributes: ['employee_id'],
        raw: true,
      });

      const branchEmployeeIds = branchEmployees.map(e => String(e.employee_id));
      console.log('???? Branch Employee IDs:', branchEmployeeIds);

      // ???? STEP 2: Fetch promotions for employees in the same branch
      promotions = await Promotion.findAll({
        where: {
          deleted_at: null,
          employee_id: { [Op.in]: branchEmployeeIds },
        },
        order: [['id', 'DESC']],
      });

    } else {
      // ???? CASE 2: User doesn't have employee record (no branch) ? FULL DATABASE ACCESS
      console.log('???? Branchless User Access (FULL DATABASE)');
      
      // ???? DIRECTLY GET ALL PROMOTIONS - no company filter
      promotions = await Promotion.findAll({
        where: { deleted_at: null },
        order: [['id', 'DESC']],
      });
      
      console.log('???? Branchless User - All Promotions Count:', promotions.length);
    }

    console.log('???? Final Promotions Count:', promotions.length);
    const data = await Promise.all(promotions.map(p => formatPromotionResponse(p)));
    console.log('? END getAllPromotions - Success');
    return res.json({ success: true, data });

  } catch (err) {
    console.error('? Get All Promotions Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message,
    });
  }
};


exports.getPromotionById = async (req, res) => {
  try {
    console.log('???? START getPromotionById');
    console.log('???? User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const promotion = await Promotion.findOne({
      where: { id: req.params.id, deleted_at: null },
    });

    if (!promotion) {
      return res.status(404).json({ success: false, message: 'Promotion not found' });
    }

    // ???? Super Admin ? full access
    if (isSuper(req)) {
      const data = await formatPromotionResponse(promotion);
      return res.json({ success: true, data });
    }

    // ???? Check if user exists in employees table (has branch)
    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id', 'created_by'],
      raw: true,
    });

    console.log('???? User Employee Record:', userEmployeeRecord);

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // ???? CASE 1: User has employee record with branch ? branch-level access
      const companyId = await getCompanyId(req);
      if (!companyId) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }

      // ???? STEP 1: Get the employee linked to the promotion
      const promotionEmployee = await Employee.findOne({
        where: { employee_id: String(promotion.employee_id), deleted_at: null },
        raw: true,
      });

      if (!promotionEmployee) {
        return res.status(404).json({ success: false, message: 'Employee linked to promotion not found' });
      }

      // ???? STEP 2: Check if the promotion employee belongs to the same branch as the current user
      const employeeBranchId = promotionEmployee.branch_id || null;
      
      console.log('???? Promotion Employee Branch ID:', employeeBranchId);
      console.log('???? Current User Branch ID:', userEmployeeRecord.branch_id);

      if (String(employeeBranchId) !== String(userEmployeeRecord.branch_id)) {
        return res.status(403).json({ success: false, message: 'Forbidden: promotion belongs to different branch' });
      }

    } else {
      // ???? CASE 2: User doesn't have employee record (no branch) ? FULL ACCESS
      console.log('???? Branchless User - Full promotion access');
      // No additional checks needed - branchless users can access any promotion
    }

    // ? Return formatted promotion
    const data = await formatPromotionResponse(promotion);
    console.log('? END getPromotionById - Success');
    return res.json({ success: true, data });

  } catch (err) {
    console.error('? Get Promotion By ID Error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message,
    });
  }
};


exports.updatePromotion = async (req, res) => {
  try {
    console.log('???? START updatePromotion');
    console.log('???? User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const { id } = req.params;
    const { employee_id, designation_id, promotion_title, promotion_date, description } = req.body;

    const companyId = await getCompanyId(req);
    if (!companyId && !isSuper(req))
      return res
        .status(403)
        .json({ success: false, message: 'Unauthorized' });

    // ???? Check if user exists in employees table (has branch)
    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id', 'created_by'],
      raw: true,
    });

    console.log('???? User Employee Record:', userEmployeeRecord);

    let userBranchId = null;

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // ???? CASE 1: User has employee record with branch ? branch-level access
      console.log('???? Branch User - Updating promotion');
      userBranchId = userEmployeeRecord.branch_id;
    } else {
      // ???? CASE 2: User doesn't have employee record (no branch) ? company-wide access
      console.log('???? Branchless User - Updating promotion');
      // No branch restriction for branchless users
    }

    const promotion = await Promotion.findOne({
      where: { id, deleted_at: null },
    });
    if (!promotion)
      return res
        .status(404)
        .json({ success: false, message: 'Promotion not found' });

    const promotionEmployee = await Employee.findOne({
      where: { employee_id: String(promotion.employee_id), deleted_at: null },
    });

    // Determine allowed creators within company/branch
    const allowedUserIds = await getAllUserIdsUnderCompanyBranch(companyId, isCompany(req) ? null : userBranchId);

    // ???? Access validation
    if (!isSuper(req)) {
      if (
        !promotionEmployee ||
        !allowedUserIds.map(String).includes(String(promotionEmployee.created_by))
      ) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: not your branch/company record',
        });
      }

      if (userEmployeeRecord && userEmployeeRecord.branch_id && !isCompany(req) && !isEmployee(req)) {
        // branch-level user: employee must be in same branch
        if (String(promotionEmployee.branch_id) !== String(userBranchId)) {
          return res.status(403).json({
            success: false,
            message: 'Forbidden: different branch',
          });
        }
      }
    }

    // Employee users can only update promotions for themselves
    if (isEmployee(req)) {
      const self = await Employee.findOne({ where: { user_id: req.user.id, deleted_at: null } });
      if (!self || String(self.employee_id) !== String(promotion.employee_id)) {
        return res.status(403).json({ success: false, message: 'Employees can only update their own promotions' });
      }
    }

    // Validate designation belongs to the company (if designation_id is being updated)
    if (designation_id && designation_id !== promotion.designation_id) {
      const designationRecord = await Designation.findOne({
        where: { id: designation_id, deleted_at: null }
      });
      if (!designationRecord) {
        return res.status(400).json({ success: false, message: 'Invalid designation' });
      }
    }

    // ? If updating employee_id, check if valid and belongs to company
    if (employee_id && employee_id !== promotion.employee_id) {
      const newEmployeeRecord = await Employee.findOne({
        where: { employee_id: String(employee_id), deleted_at: null }
      });
      
      if (!newEmployeeRecord) {
        return res.status(400).json({ success: false, message: 'Employee not found' });
      }

      // Validate new employee belongs to same scope
      if (!isSuper(req)) {
        if (!allowedUserIds.map(String).includes(String(newEmployeeRecord.created_by))) {
          return res.status(403).json({ success: false, message: 'New employee not in your company/branch scope' });
        }

        if (userEmployeeRecord && userEmployeeRecord.branch_id && !isCompany(req) && !isEmployee(req)) {
          if (String(newEmployeeRecord.branch_id) !== String(userBranchId)) {
            return res.status(403).json({ success: false, message: 'New employee not in your branch' });
          }
        }
      }
    }
    
    //---------------------------------------------------------
    
    if (designation_id && designation_id !== promotion.designation_id) {
      try {
        console.log('🔄 Updating employee designation in employee table...');
        
        // Determine which employee record to update
        let employeeToUpdate;
        if (employee_id && employee_id !== promotion.employee_id) {
          // If employee_id is being changed, update the new employee
          employeeToUpdate = await Employee.findOne({
            where: { employee_id: String(employee_id), deleted_at: null }
          });
        } else {
          // Otherwise update the current employee
          employeeToUpdate = promotionEmployee;
        }
        
        if (employeeToUpdate) {
          await Employee.update(
            { 
              designation_id: designation_id,
              updated_at: new Date()
            },
            { 
              where: { 
                id: employeeToUpdate.id,
                deleted_at: null 
              } 
            }
          );
          console.log('✅ Employee designation updated successfully in employee table');
        }
      } catch (updateError) {
        console.error('❌ Error updating employee designation:', updateError);
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to update employee designation', 
          error: updateError.message 
        });
      }
    }
    //---------------------------------------------------------

    // ???? Perform update
    await promotion.update({
      employee_id: employee_id ?? promotion.employee_id,
      designation_id: designation_id ?? promotion.designation_id,
      promotion_title: promotion_title ?? promotion.promotion_title,
      promotion_date: promotion_date ?? promotion.promotion_date,
      description: description ?? promotion.description,
      updated_at: new Date(),
    });

    const data = await formatPromotionResponse(promotion);
    console.log('? Promotion updated successfully');
    return res.json({
      success: true,
      message: 'Promotion updated successfully',
      data,
    });
  } catch (err) {
    console.error('? Update Promotion Error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Server error', error: err.message });
  }
};


exports.deletePromotion = async (req, res) => {
  try {
    console.log('???? START deletePromotion');
    console.log('???? User Info - ID:', req.user.id, 'Type:', req.user.type);
    
    const { id } = req.params;

    const companyId = await getCompanyId(req);
    if (!companyId && !isSuper(req))
      return res
        .status(403)
        .json({ success: false, message: 'Unauthorized' });

    // ???? Check if user exists in employees table (has branch)
    const userEmployeeRecord = await Employee.findOne({
      where: { user_id: req.user.id },
      attributes: ['branch_id', 'created_by'],
      raw: true,
    });

    console.log('???? User Employee Record:', userEmployeeRecord);

    let branchId = null;

    if (userEmployeeRecord && userEmployeeRecord.branch_id) {
      // ???? CASE 1: User has employee record with branch ? branch-level access
      branchId = userEmployeeRecord.branch_id;
    } else {
      // ???? CASE 2: User doesn't have employee record (no branch) ? company-wide access
      console.log('???? Branchless User - Deleting promotion');
    }

    const promotion = await Promotion.findOne({
      where: { id, deleted_at: null },
    });
    if (!promotion)
      return res
        .status(404)
        .json({ success: false, message: 'Promotion not found' });

    const promotionEmployee = await Employee.findOne({
      where: { employee_id: String(promotion.employee_id), deleted_at: null },
    });

    const allowedUserIds = await getAllUserIdsUnderCompanyBranch(
      companyId,
      isCompany(req) ? null : branchId
    );

    // ???? Access validation
    if (!isSuper(req)) {
      if (
        !promotionEmployee ||
        !allowedUserIds.map(String).includes(String(promotionEmployee.created_by))
      ) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: not your branch/company record',
        });
      }
      if (!isCompany(req) && branchId !== null) {
        if (String(promotionEmployee.branch_id) !== String(branchId)) {
          return res.status(403).json({
            success: false,
            message: 'Forbidden: different branch',
          });
        }
      }
    }

    await promotion.destroy();
    console.log('? Promotion deleted successfully');
    return res.json({
      success: true,
      message: 'Promotion deleted successfully',
      data: { id },
    });
  } catch (err) {
    console.error('? Delete Promotion Error:', err);
    return res
      .status(500)
      .json({ success: false, message: 'Server error', error: err.message });
  }
};




