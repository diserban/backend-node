const { body, query, param } = require('express-validator');

const validateUser = [
  body('username')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters long')
];

const validateExercise = [
  param('_id').isMongoId().withMessage('Invalid user ID'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('duration')
    .isInt({ min: 1 })
    .withMessage('Duration must be a positive number'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format')
];

const validateLogs = [
  param('_id').isMongoId().withMessage('Invalid user ID'),
  query('from').optional().isISO8601().withMessage('Invalid from date'),
  query('to').optional().isISO8601().withMessage('Invalid to date'),
  query('limit').optional().isInt({ min: 1 }).withMessage('Invalid limit')
];

module.exports = { validateUser, validateExercise, validateLogs };