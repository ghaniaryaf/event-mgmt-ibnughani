"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEventTransactions = exports.getUserTransactions = exports.confirmTransaction = exports.uploadPaymentProof = exports.createTransaction = void 0;
const transactionService_1 = require("../services/transactionService");
const validation_1 = require("../middleware/validation");
const transactionService = new transactionService_1.TransactionService();
const createTransaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, validation_1.handleValidationErrors)(req, res, () => { });
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'User not authenticated',
            });
            return;
        }
        const transaction = yield transactionService.createTransaction(req.user.id, req.body);
        res.status(201).json({
            success: true,
            message: 'Transaction created successfully',
            data: transaction,
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});
exports.createTransaction = createTransaction;
const uploadPaymentProof = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'User not authenticated',
            });
            return;
        }
        if (!req.file) {
            res.status(400).json({
                success: false,
                message: 'Payment proof file is required',
            });
            return;
        }
        const { transactionId } = req.params;
        const paymentProofUrl = `/uploads/${req.file.filename}`;
        const payment = yield transactionService.uploadPaymentProof(transactionId, req.user.id, paymentProofUrl);
        res.status(200).json({
            success: true,
            message: 'Payment proof uploaded successfully',
            data: payment,
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});
exports.uploadPaymentProof = uploadPaymentProof;
const confirmTransaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'User not authenticated',
            });
            return;
        }
        const { transactionId } = req.params;
        const { isAccepted } = req.body;
        const transaction = yield transactionService.confirmTransaction(transactionId, req.user.id, isAccepted);
        const statusMessage = isAccepted ? 'accepted' : 'rejected';
        res.status(200).json({
            success: true,
            message: `Transaction ${statusMessage} successfully`,
            data: transaction,
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});
exports.confirmTransaction = confirmTransaction;
const getUserTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'User not authenticated',
            });
            return;
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const result = yield transactionService.getUserTransactions(req.user.id, page, limit);
        res.status(200).json({
            success: true,
            message: 'User transactions retrieved successfully',
            data: result.transactions,
            pagination: result.pagination,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});
exports.getUserTransactions = getUserTransactions;
const getEventTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'User not authenticated',
            });
            return;
        }
        const { eventId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const result = yield transactionService.getEventTransactions(eventId, req.user.id, page, limit);
        res.status(200).json({
            success: true,
            message: 'Event transactions retrieved successfully',
            data: result.transactions,
            pagination: result.pagination,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});
exports.getEventTransactions = getEventTransactions;
