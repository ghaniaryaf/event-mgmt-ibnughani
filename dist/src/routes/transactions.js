"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const transactionController_1 = require("../controllers/transactionController");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate);
// Customer routes
router.post('/', (0, auth_1.authorize)('CUSTOMER'), validation_1.validateTransactionCreate, validation_1.handleValidationErrors, transactionController_1.createTransaction);
router.post('/:transactionId/payment-proof', (0, auth_1.authorize)('CUSTOMER'), upload_1.uploadPaymentProof, transactionController_1.uploadPaymentProof);
router.get('/user/my-transactions', (0, auth_1.authorize)('CUSTOMER'), transactionController_1.getUserTransactions);
// Organizer routes
router.post('/:transactionId/confirm', (0, auth_1.authorize)('ORGANIZER'), transactionController_1.confirmTransaction);
router.get('/event/:eventId', (0, auth_1.authorize)('ORGANIZER'), transactionController_1.getEventTransactions);
exports.default = router;
