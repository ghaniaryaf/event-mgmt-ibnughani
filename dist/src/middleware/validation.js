"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEventQuery = exports.validateReviewCreate = exports.validateTransactionCreate = exports.validateEventUpdate = exports.validateEventCreate = exports.validateLogin = exports.validateRegister = exports.handleValidationErrors = void 0;
const express_validator_1 = require("express-validator");
const validation_result_1 = require("express-validator/src/validation-result");
const handleValidationErrors = (req, res, next) => {
    const errors = (0, validation_result_1.validationResult)(req);
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
exports.handleValidationErrors = handleValidationErrors;
// Auth validations
exports.validateRegister = [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password').isLength({ min: 6 }),
    (0, express_validator_1.body)('fullName').notEmpty().trim(),
    (0, express_validator_1.body)('phoneNumber').optional().isMobilePhone('any'),
    (0, express_validator_1.body)('referralCode').optional().isLength({ min: 6, max: 6 }),
];
exports.validateLogin = [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password').notEmpty(),
];
// Event validations
exports.validateEventCreate = [
    (0, express_validator_1.body)('title').notEmpty().trim().isLength({ max: 200 }),
    (0, express_validator_1.body)('description').notEmpty().trim(),
    (0, express_validator_1.body)('category').notEmpty().trim(),
    (0, express_validator_1.body)('location').notEmpty().trim(),
    (0, express_validator_1.body)('address').notEmpty().trim(),
    (0, express_validator_1.body)('startDate').isISO8601(),
    (0, express_validator_1.body)('endDate').isISO8601(),
    (0, express_validator_1.body)('availableSeats').isInt({ min: 1 }),
    (0, express_validator_1.body)('basePrice').isFloat({ min: 0 }),
    (0, express_validator_1.body)('ticketTypes').isArray({ min: 1 }),
    (0, express_validator_1.body)('ticketTypes.*.name').notEmpty().trim(),
    (0, express_validator_1.body)('ticketTypes.*.price').isFloat({ min: 0 }),
    (0, express_validator_1.body)('ticketTypes.*.quantity').isInt({ min: 1 }),
];
exports.validateEventUpdate = [
    (0, express_validator_1.body)('title').optional().notEmpty().trim().isLength({ max: 200 }),
    (0, express_validator_1.body)('description').optional().notEmpty().trim(),
    (0, express_validator_1.body)('category').optional().notEmpty().trim(),
    (0, express_validator_1.body)('location').optional().notEmpty().trim(),
    (0, express_validator_1.body)('address').optional().notEmpty().trim(),
    (0, express_validator_1.body)('startDate').optional().isISO8601(),
    (0, express_validator_1.body)('endDate').optional().isISO8601(),
    (0, express_validator_1.body)('availableSeats').optional().isInt({ min: 1 }),
    (0, express_validator_1.body)('basePrice').optional().isFloat({ min: 0 }),
];
// Transaction validations
exports.validateTransactionCreate = [
    (0, express_validator_1.body)('eventId').isUUID(),
    (0, express_validator_1.body)('ticketTypes').isArray({ min: 1 }),
    (0, express_validator_1.body)('ticketTypes.*.ticketTypeId').isUUID(),
    (0, express_validator_1.body)('ticketTypes.*.quantity').isInt({ min: 1 }),
    (0, express_validator_1.body)('pointsUsed').optional().isFloat({ min: 0 }),
    (0, express_validator_1.body)('voucherCode').optional().isLength({ min: 1 }),
    (0, express_validator_1.body)('couponCode').optional().isLength({ min: 1 }),
];
// Review validations
exports.validateReviewCreate = [
    (0, express_validator_1.body)('rating').isInt({ min: 1, max: 5 }),
    (0, express_validator_1.body)('comment').optional().trim().isLength({ max: 1000 }),
];
// Query validations
exports.validateEventQuery = [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }),
    (0, express_validator_1.query)('search').optional().trim(),
    (0, express_validator_1.query)('category').optional().trim(),
    (0, express_validator_1.query)('location').optional().trim(),
    (0, express_validator_1.query)('startDate').optional().isISO8601(),
    (0, express_validator_1.query)('endDate').optional().isISO8601(),
    (0, express_validator_1.query)('minPrice').optional().isFloat({ min: 0 }),
    (0, express_validator_1.query)('maxPrice').optional().isFloat({ min: 0 }),
];
