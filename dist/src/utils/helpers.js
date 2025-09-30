"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatCurrency = exports.addDays = exports.addHours = exports.addMonths = exports.isDateInPast = exports.isDateInFuture = exports.calculateDiscount = exports.generateCouponCode = exports.generateReferralCode = exports.generateInvoiceNumber = void 0;
const generateInvoiceNumber = () => {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `INV-${timestamp}-${random}`;
};
exports.generateInvoiceNumber = generateInvoiceNumber;
const generateReferralCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};
exports.generateReferralCode = generateReferralCode;
const generateCouponCode = () => {
    return `CPN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
};
exports.generateCouponCode = generateCouponCode;
const calculateDiscount = (amount, discountType, discountValue, maxDiscount) => {
    let discount = 0;
    if (discountType === 'PERCENTAGE') {
        discount = (amount * discountValue) / 100;
        if (maxDiscount && discount > maxDiscount) {
            discount = maxDiscount;
        }
    }
    else {
        discount = discountValue;
    }
    return Math.min(discount, amount);
};
exports.calculateDiscount = calculateDiscount;
const isDateInFuture = (date) => {
    return new Date(date) > new Date();
};
exports.isDateInFuture = isDateInFuture;
const isDateInPast = (date) => {
    return new Date(date) < new Date();
};
exports.isDateInPast = isDateInPast;
const addMonths = (date, months) => {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
};
exports.addMonths = addMonths;
const addHours = (date, hours) => {
    const result = new Date(date);
    result.setHours(result.getHours() + hours);
    return result;
};
exports.addHours = addHours;
const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};
exports.addDays = addDays;
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
};
exports.formatCurrency = formatCurrency;
