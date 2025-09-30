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
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../utils/prisma");
const helpers_1 = require("../utils/helpers");
class AuthService {
    // Helper untuk generate JWT
    generateToken(payload) {
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret)
            throw new Error('JWT_SECRET is not defined');
        // expiresIn dalam detik (7 hari default)
        const expiresIn = Number(process.env.JWT_EXPIRES_IN) || 7 * 24 * 60 * 60;
        return jsonwebtoken_1.default.sign(payload, jwtSecret, { expiresIn });
    }
    register(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password, fullName, phoneNumber, address, referralCode } = userData;
            return prisma_1.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const existingUser = yield tx.user.findUnique({ where: { email } });
                if (existingUser)
                    throw new Error('User already exists with this email');
                const hashedPassword = yield bcryptjs_1.default.hash(password, 12);
                // Generate unique referral code
                let referralCodeGenerated = (0, helpers_1.generateReferralCode)();
                while (yield tx.user.findUnique({ where: { referralCode: referralCodeGenerated } })) {
                    referralCodeGenerated = (0, helpers_1.generateReferralCode)();
                }
                // Create user
                const user = yield tx.user.create({
                    data: { email, password: hashedPassword, fullName, phoneNumber, address, referralCode: referralCodeGenerated },
                });
                let referralReward = null;
                // Handle referral
                if (referralCode) {
                    const referrer = yield tx.user.findUnique({ where: { referralCode } });
                    if (referrer && referrer.id !== user.id) {
                        const referral = yield tx.referral.create({ data: { referrerId: referrer.id, refereeId: user.id, codeUsed: referralCode } });
                        yield tx.userPoint.create({
                            data: { userId: referrer.id, amount: 10000, sourceType: 'REFERRAL', sourceId: referral.id, expiryDate: (0, helpers_1.addMonths)(new Date(), 3) },
                        });
                        let couponTemplate = yield tx.couponTemplate.findFirst({ where: { name: 'Referral Welcome Coupon' } });
                        if (!couponTemplate) {
                            couponTemplate = yield tx.couponTemplate.create({
                                data: {
                                    name: 'Referral Welcome Coupon',
                                    description: 'Welcome coupon for referred users',
                                    discountType: 'PERCENTAGE',
                                    discountValue: 10,
                                    minPurchaseAmount: 100000,
                                    maxDiscountAmount: 50000,
                                },
                            });
                        }
                        const userCoupon = yield tx.userCoupon.create({
                            data: { userId: user.id, couponTemplateId: couponTemplate.id, referralId: referral.id, code: (0, helpers_1.generateCouponCode)(), expiryDate: (0, helpers_1.addMonths)(new Date(), 3) },
                        });
                        referralReward = { points: 10000, coupon: userCoupon };
                    }
                }
                // Generate token
                const token = this.generateToken({ id: user.id, email: user.email, role: user.role });
                return {
                    user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role, referralCode: user.referralCode },
                    token,
                    referralReward,
                };
            }));
        });
    }
    login(loginData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = loginData;
            const user = yield prisma_1.prisma.user.findUnique({ where: { email } });
            if (!user)
                throw new Error('Invalid email or password');
            const isPasswordValid = yield bcryptjs_1.default.compare(password, user.password);
            if (!isPasswordValid)
                throw new Error('Invalid email or password');
            const token = this.generateToken({ id: user.id, email: user.email, role: user.role });
            return {
                user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role, profilePicture: user.profilePicture, referralCode: user.referralCode },
                token,
            };
        });
    }
    getProfile(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield prisma_1.prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true, email: true, fullName: true, role: true, profilePicture: true,
                    phoneNumber: true, address: true, referralCode: true, isVerified: true,
                    createdAt: true, updatedAt: true,
                },
            });
            if (!user)
                throw new Error('User not found');
            const points = yield prisma_1.prisma.userPoint.aggregate({
                where: { userId, isExpired: false, expiryDate: { gte: new Date() } },
                _sum: { amount: true },
            });
            const coupons = yield prisma_1.prisma.userCoupon.findMany({
                where: { userId, isUsed: false, expiryDate: { gte: new Date() } },
                include: { couponTemplate: true },
            });
            return Object.assign(Object.assign({}, user), { pointsBalance: points._sum.amount || 0, activeCoupons: coupons });
        });
    }
    updateProfile(userId, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.user.update({
                where: { id: userId },
                data: updateData,
                select: { id: true, email: true, fullName: true, role: true, profilePicture: true, phoneNumber: true, address: true, referralCode: true, isVerified: true },
            });
        });
    }
    changePassword(userId, currentPassword, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield prisma_1.prisma.user.findUnique({ where: { id: userId } });
            if (!user)
                throw new Error('User not found');
            const isCurrentPasswordValid = yield bcryptjs_1.default.compare(currentPassword, user.password);
            if (!isCurrentPasswordValid)
                throw new Error('Current password is incorrect');
            const hashedNewPassword = yield bcryptjs_1.default.hash(newPassword, 12);
            yield prisma_1.prisma.user.update({ where: { id: userId }, data: { password: hashedNewPassword } });
            return { message: 'Password updated successfully' };
        });
    }
}
exports.AuthService = AuthService;
