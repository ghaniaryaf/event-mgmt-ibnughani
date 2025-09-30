import { Response, NextFunction } from 'express';
import { body, query } from 'express-validator';
import { validationResult } from 'express-validator/src/validation-result';
import { AuthRequest } from '../types';

export const handleValidationErrors = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
    return;
  }
  next();
};

// Auth validations
export const validateRegister = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('fullName').notEmpty().trim(),
  body('phoneNumber').optional().isMobilePhone('any'),
  body('referralCode').optional().isLength({ min: 6, max: 6 }),
];

export const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

// Event validations
export const validateEventCreate = [
  body('title').notEmpty().trim().isLength({ max: 200 }),
  body('description').notEmpty().trim(),
  body('category').notEmpty().trim(),
  body('location').notEmpty().trim(),
  body('address').notEmpty().trim(),
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
  body('availableSeats').isInt({ min: 1 }),
  body('basePrice').isFloat({ min: 0 }),
  body('ticketTypes').isArray({ min: 1 }),
  body('ticketTypes.*.name').notEmpty().trim(),
  body('ticketTypes.*.price').isFloat({ min: 0 }),
  body('ticketTypes.*.quantity').isInt({ min: 1 }),
];

export const validateEventUpdate = [
  body('title').optional().notEmpty().trim().isLength({ max: 200 }),
  body('description').optional().notEmpty().trim(),
  body('category').optional().notEmpty().trim(),
  body('location').optional().notEmpty().trim(),
  body('address').optional().notEmpty().trim(),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
  body('availableSeats').optional().isInt({ min: 1 }),
  body('basePrice').optional().isFloat({ min: 0 }),
];

// Transaction validations
export const validateTransactionCreate = [
  body('eventId').isUUID(),
  body('ticketTypes').isArray({ min: 1 }),
  body('ticketTypes.*.ticketTypeId').isUUID(),
  body('ticketTypes.*.quantity').isInt({ min: 1 }),
  body('pointsUsed').optional().isFloat({ min: 0 }),
  body('voucherCode').optional().isLength({ min: 1 }),
  body('couponCode').optional().isLength({ min: 1 }),
];

// Review validations
export const validateReviewCreate = [
  body('rating').isInt({ min: 1, max: 5 }),
  body('comment').optional().trim().isLength({ max: 1000 }),
  body('transactionId').isUUID(),  // Required untuk validasi attendance
];

// Query validations
export const validateEventQuery = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().trim(),
  query('category').optional().trim(),
  query('location').optional().trim(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('minPrice').optional().isFloat({ min: 0 }),
  query('maxPrice').optional().isFloat({ min: 0 }),
];