const { body } = require('express-validator');

// exports.validateLeave = [
//   body('employee_id').isInt().withMessage('Employee ID must be an integer'),
//   body('leave_type_id').isInt().withMessage('Leave Type ID must be an integer'),
//   body('applied_on').isISO8601().withMessage('Applied on must be a valid date'),
//   body('start_date').isISO8601().withMessage('Start date must be a valid date'),
//   body('end_date').isISO8601().withMessage('End date must be a valid date'),
//   body('total_leave_days').notEmpty().withMessage('Total leave days required'),
//   body('leave_reason').notEmpty().withMessage('Leave reason is required'),
//   body('status').optional().isString().withMessage('Status must be a string'),
//   body('created_by').isInt().withMessage('Created by must be an integer')
// ];

exports.validateLeave = [
  body('employee_id').optional().isInt().withMessage('Employee ID must be an integer'),
  body('leave_type_id').isInt().withMessage('Leave type must be an integer'),
  body('applied_on').notEmpty().withMessage('Applied on is required'),
  body('start_date').notEmpty().withMessage('Start date is required'),
  body('end_date').notEmpty().withMessage('End date is required'),
  body('total_leave_days').notEmpty().withMessage('Total leave days is required'),
  body('leave_reason').notEmpty().withMessage('Leave reason is required')
  // 🚀 No created_by check, controller sets it
];
