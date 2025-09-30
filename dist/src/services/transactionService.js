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
exports.TransactionService = void 0;
const prisma_1 = require("../utils/prisma");
const helpers_1 = require("../utils/helpers");
class TransactionService {
    // ================== CREATE TRANSACTION ==================
    createTransaction(userId, transactionData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { eventId, ticketTypes, pointsUsed = 0, voucherCode, couponCode } = transactionData;
            return prisma_1.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d;
                // Validate event
                const event = yield tx.event.findFirst({
                    where: { id: eventId, isPublished: true },
                    include: { ticketTypes: true },
                });
                if (!event)
                    throw new Error('Event not found or not published');
                // Validate tickets & calculate total
                let totalAmount = 0;
                const ticketUpdates = [];
                for (const item of ticketTypes) {
                    const ticketType = event.ticketTypes.find((t) => t.id === item.ticketTypeId);
                    if (!ticketType)
                        throw new Error(`Ticket type ${item.ticketTypeId} not found`);
                    if (ticketType.soldQuantity + item.quantity > ticketType.quantity)
                        throw new Error(`Not enough tickets for ${ticketType.name}`);
                    totalAmount += item.quantity * ticketType.price;
                    ticketUpdates.push({ id: ticketType.id, quantity: item.quantity });
                }
                // Points
                let pointsDiscount = 0;
                if (pointsUsed > 0) {
                    const userPoints = yield tx.userPoint.aggregate({
                        where: { userId, isExpired: false, expiryDate: { gte: new Date() } },
                        _sum: { amount: true },
                    });
                    const availablePoints = (_a = userPoints._sum.amount) !== null && _a !== void 0 ? _a : 0;
                    if (pointsUsed > availablePoints)
                        throw new Error('Insufficient points');
                    pointsDiscount = Math.min(pointsUsed, totalAmount);
                }
                // Voucher
                let voucherDiscount = 0;
                let appliedVoucher = null;
                if (voucherCode) {
                    const voucher = yield tx.eventVoucher.findFirst({
                        where: { code: voucherCode, eventId, startDate: { lte: new Date() }, endDate: { gte: new Date() } },
                    });
                    if (!voucher)
                        throw new Error('Invalid or expired voucher');
                    if (totalAmount < voucher.minPurchaseAmount)
                        throw new Error(`Minimum purchase for voucher is ${voucher.minPurchaseAmount}`);
                    voucherDiscount = (0, helpers_1.calculateDiscount)(totalAmount, voucher.discountType, voucher.discountValue);
                    appliedVoucher = voucher;
                }
                // Coupon
                let couponDiscount = 0;
                let appliedCoupon = null;
                if (couponCode) {
                    const coupon = yield tx.userCoupon.findFirst({
                        where: { code: couponCode, userId, isUsed: false, expiryDate: { gte: new Date() } },
                        include: { couponTemplate: true },
                    });
                    if (!coupon)
                        throw new Error('Invalid or expired coupon');
                    const template = coupon.couponTemplate;
                    if (totalAmount < template.minPurchaseAmount)
                        throw new Error(`Minimum purchase for coupon is ${template.minPurchaseAmount}`);
                    const maxDiscountSafe = (_b = template.maxDiscountAmount) !== null && _b !== void 0 ? _b : undefined;
                    couponDiscount = (0, helpers_1.calculateDiscount)(totalAmount, template.discountType, template.discountValue, maxDiscountSafe);
                    appliedCoupon = coupon;
                }
                const finalAmount = Math.max(0, totalAmount - pointsDiscount - voucherDiscount - couponDiscount);
                // Create transaction
                const transaction = yield tx.transaction.create({
                    data: {
                        userId,
                        eventId,
                        invoiceNumber: (0, helpers_1.generateInvoiceNumber)(),
                        totalAmount,
                        pointsUsed: pointsDiscount,
                        voucherId: (_c = appliedVoucher === null || appliedVoucher === void 0 ? void 0 : appliedVoucher.id) !== null && _c !== void 0 ? _c : undefined,
                        voucherDiscount,
                        couponId: (_d = appliedCoupon === null || appliedCoupon === void 0 ? void 0 : appliedCoupon.id) !== null && _d !== void 0 ? _d : undefined,
                        couponDiscount,
                        finalAmount,
                        expiryTime: (0, helpers_1.addHours)(new Date(), 2),
                        items: {
                            create: ticketTypes.map((item) => {
                                const ticketType = event.ticketTypes.find((t) => t.id === item.ticketTypeId);
                                return {
                                    ticketTypeId: item.ticketTypeId,
                                    quantity: item.quantity,
                                    pricePerTicket: ticketType.price,
                                    subtotal: item.quantity * ticketType.price,
                                };
                            }),
                        },
                    },
                    include: {
                        items: true,
                        event: { select: { title: true, organizer: { select: { fullName: true, email: true } } } },
                    },
                });
                // Update tickets sold
                for (const update of ticketUpdates) {
                    yield tx.eventTicketType.update({ where: { id: update.id }, data: { soldQuantity: { increment: update.quantity } } });
                }
                // Update booked seats
                const totalTickets = ticketTypes.reduce((sum, item) => sum + item.quantity, 0);
                yield tx.event.update({ where: { id: eventId }, data: { bookedSeats: { increment: totalTickets } } });
                // Mark coupon as used
                if (appliedCoupon)
                    yield tx.userCoupon.update({ where: { id: appliedCoupon.id }, data: { isUsed: true } });
                // Update voucher usage
                if (appliedVoucher)
                    yield tx.eventVoucher.update({ where: { id: appliedVoucher.id }, data: { usedCount: { increment: 1 } } });
                // Deduct points
                if (pointsUsed > 0)
                    yield this.deductPoints(tx, userId, pointsDiscount);
                return transaction;
            }));
        });
    }
    // ================== DEDUCT POINTS ==================
    deductPoints(prisma, userId, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            const points = yield prisma.userPoint.findMany({
                where: { userId, isExpired: false, expiryDate: { gte: new Date() } },
                orderBy: { expiryDate: 'asc' },
            });
            let remainingAmount = amount;
            for (const point of points) {
                if (remainingAmount <= 0)
                    break;
                const deductAmount = Math.min(remainingAmount, point.amount);
                yield prisma.userPoint.update({ where: { id: point.id }, data: { amount: { decrement: deductAmount } } });
                remainingAmount -= deductAmount;
            }
        });
    }
    // ================== CONFIRM TRANSACTION ==================
    confirmTransaction(transactionId, organizerId, isAccepted) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const transaction = yield tx.transaction.findFirst({
                    where: { id: transactionId, event: { organizerId }, status: 'WAITING_FOR_CONFIRMATION' },
                    include: { event: true, user: true },
                });
                if (!transaction)
                    throw new Error('Transaction not found or invalid status');
                const newStatus = isAccepted ? 'DONE' : 'REJECTED';
                if (isAccepted) {
                    const totalTickets = yield tx.transactionItem.aggregate({ where: { transactionId }, _sum: { quantity: true } });
                    const ticketCount = (_a = totalTickets._sum.quantity) !== null && _a !== void 0 ? _a : 0;
                    yield tx.eventAttendee.create({
                        data: {
                            eventId: transaction.eventId,
                            userId: transaction.userId,
                            transactionId,
                            ticketCount,
                            totalPaid: transaction.finalAmount,
                        },
                    });
                }
                else {
                    yield this.rollbackTransaction(tx, transactionId);
                }
                return tx.transaction.update({ where: { id: transactionId }, data: { status: newStatus } });
            }));
        });
    }
    // ================== ROLLBACK ==================
    rollbackTransaction(prisma, transactionId) {
        return __awaiter(this, void 0, void 0, function* () {
            const transaction = yield prisma.transaction.findUnique({
                where: { id: transactionId },
                include: { items: true, voucher: true, coupon: true },
            });
            if (!transaction)
                return;
            for (const item of transaction.items) {
                yield prisma.eventTicketType.update({ where: { id: item.ticketTypeId }, data: { soldQuantity: { decrement: item.quantity } } });
            }
            const totalTickets = transaction.items.reduce((sum, item) => sum + item.quantity, 0);
            yield prisma.event.update({ where: { id: transaction.eventId }, data: { bookedSeats: { decrement: totalTickets } } });
            if (transaction.voucherId)
                yield prisma.eventVoucher.update({ where: { id: transaction.voucherId }, data: { usedCount: { decrement: 1 } } });
            if (transaction.couponId)
                yield prisma.userCoupon.update({ where: { id: transaction.couponId }, data: { isUsed: false } });
            if (transaction.pointsUsed > 0)
                yield this.restorePoints(prisma, transaction.userId, transaction.pointsUsed);
        });
    }
    // ================== RESTORE POINTS ==================
    restorePoints(prisma, userId, amount) {
        return __awaiter(this, void 0, void 0, function* () {
            const latestPoint = yield prisma.userPoint.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } });
            if (latestPoint) {
                yield prisma.userPoint.update({ where: { id: latestPoint.id }, data: { amount: { increment: amount } } });
            }
            else {
                yield prisma.userPoint.create({ data: { userId, amount, sourceType: 'REFUND', expiryDate: addMonths(new Date(), 3) } });
            }
        });
    }
    // ================== UPLOAD PAYMENT PROOF ==================
    uploadPaymentProof(transactionId, userId, paymentProofUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const transaction = yield tx.transaction.findFirst({
                    where: { id: transactionId, userId, status: 'WAITING_FOR_PAYMENT' },
                });
                if (!transaction)
                    throw new Error('Transaction not found or invalid status');
                if (new Date() > transaction.expiryTime) {
                    yield this.rollbackTransaction(tx, transactionId);
                    throw new Error('Transaction has expired');
                }
                const payment = yield tx.transactionPayment.upsert({
                    where: { transactionId },
                    update: { paymentProofUrl, updatedAt: new Date() },
                    create: { transactionId, paymentProofUrl },
                });
                yield tx.transaction.update({ where: { id: transactionId }, data: { status: 'WAITING_FOR_CONFIRMATION' } });
                return payment;
            }));
        });
    }
    // ================== GET USER TRANSACTIONS ==================
    getUserTransactions(userId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, page = 1, limit = 10) {
            const skip = (page - 1) * limit;
            const [transactions, total] = yield Promise.all([
                prisma_1.prisma.transaction.findMany({
                    where: { userId },
                    include: {
                        event: { select: { title: true, imageUrl: true, startDate: true, location: true } },
                        payment: true,
                        items: { include: { ticketType: { select: { name: true } } } },
                    },
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: limit,
                }),
                prisma_1.prisma.transaction.count({ where: { userId } }),
            ]);
            return { transactions, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
        });
    }
    // ================== GET EVENT TRANSACTIONS ==================
    getEventTransactions(eventId_1, organizerId_1) {
        return __awaiter(this, arguments, void 0, function* (eventId, organizerId, page = 1, limit = 10) {
            const skip = (page - 1) * limit;
            const [transactions, total] = yield Promise.all([
                prisma_1.prisma.transaction.findMany({
                    where: { eventId, event: { organizerId } },
                    include: {
                        user: { select: { id: true, fullName: true, email: true, profilePicture: true } },
                        payment: true,
                        items: { include: { ticketType: { select: { name: true } } } },
                    },
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: limit,
                }),
                prisma_1.prisma.transaction.count({ where: { eventId, event: { organizerId } } }),
            ]);
            return { transactions, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
        });
    }
}
exports.TransactionService = TransactionService;
// ================== ADD MONTHS HELPER ==================
function addMonths(date, months) {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
}
