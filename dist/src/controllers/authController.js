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
exports.changePassword = exports.updateProfile = exports.getProfile = exports.login = exports.register = void 0;
const authService_1 = require("../services/authService");
const validation_1 = require("../middleware/validation");
const authService = new authService_1.AuthService();
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, validation_1.handleValidationErrors)(req, res, () => { });
        const result = yield authService.register(req.body);
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: result,
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, validation_1.handleValidationErrors)(req, res, () => { });
        const result = yield authService.login(req.body);
        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: result,
        });
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: error.message,
        });
    }
});
exports.login = login;
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'User not authenticated',
            });
            return;
        }
        const profile = yield authService.getProfile(req.user.id);
        res.status(200).json({
            success: true,
            message: 'Profile retrieved successfully',
            data: profile,
        });
    }
    catch (error) {
        res.status(404).json({
            success: false,
            message: error.message,
        });
    }
});
exports.getProfile = getProfile;
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'User not authenticated',
            });
            return;
        }
        const profile = yield authService.updateProfile(req.user.id, req.body);
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: profile,
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});
exports.updateProfile = updateProfile;
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'User not authenticated',
            });
            return;
        }
        const { currentPassword, newPassword } = req.body;
        yield authService.changePassword(req.user.id, currentPassword, newPassword);
        res.status(200).json({
            success: true,
            message: 'Password changed successfully',
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});
exports.changePassword = changePassword;
