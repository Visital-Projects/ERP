// validators/attendance.validator.js

const { body } = require('express-validator');

exports.validateAttendance = [
  body('employee_id')
    .isInt().withMessage('Employee ID must be an integer'),

  body('date')
    .isISO8601().withMessage('Date must be in YYYY-MM-DD format'),

  body('status')
    .notEmpty().withMessage('Status is required'),

  body('clock_in')
    .matches(/^\d{2}:\d{2}(:\d{2})?$/).withMessage('Clock in must be in HH:MM or HH:MM:SS format'),

  body('clock_out')
    .matches(/^\d{2}:\d{2}(:\d{2})?$/).withMessage('Clock out must be in HH:MM or HH:MM:SS format'),

  body('late')
    .optional()
    .matches(/^\d{2}:\d{2}(:\d{2})?$/).withMessage('Late must be in HH:MM or HH:MM:SS format'),

  body('early_leaving')
    .optional()
    .matches(/^\d{2}:\d{2}(:\d{2})?$/).withMessage('Early leaving must be in HH:MM or HH:MM:SS format'),

  body('overtime')
    .optional()
    .matches(/^\d{2}:\d{2}(:\d{2})?$/).withMessage('Overtime must be in HH:MM or HH:MM:SS format'),

  body('total_rest')
    .optional()
    .matches(/^\d{2}:\d{2}(:\d{2})?$/).withMessage('Total rest must be in HH:MM or HH:MM:SS format'),

  body('created_by')
    .isInt().withMessage('Created by must be an integer'),
];
