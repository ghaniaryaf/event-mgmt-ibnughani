"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("./auth"));
const events_1 = __importDefault(require("./events"));
const transactions_1 = __importDefault(require("./transactions"));
const router = (0, express_1.Router)();
router.use('/auth', auth_1.default);
router.use('/events', events_1.default);
router.use('/transactions', transactions_1.default);
exports.default = router;
