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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTransactionNotification = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
const sendEmail = (to, subject, html) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            html,
        });
    }
    catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
    }
});
exports.sendEmail = sendEmail;
const sendTransactionNotification = (email, transactionId, status, eventTitle) => __awaiter(void 0, void 0, void 0, function* () {
    const subject = `Transaction Update - ${eventTitle}`;
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Transaction Status Update</h2>
      <p>Your transaction for event <strong>${eventTitle}</strong> has been updated to: <strong>${status}</strong></p>
      <p>Transaction ID: ${transactionId}</p>
      <p>If you have any questions, please contact our support team.</p>
      <br>
      <p>Best regards,<br>Event Management Team</p>
    </div>
  `;
    yield (0, exports.sendEmail)(email, subject, html);
});
exports.sendTransactionNotification = sendTransactionNotification;
