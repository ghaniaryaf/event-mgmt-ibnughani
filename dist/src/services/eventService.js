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
exports.EventService = void 0;
const prisma_1 = require("../utils/prisma");
class EventService {
    getEvents(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            const { page = 1, limit = 10, search, category, location, startDate, endDate, minPrice, maxPrice, } = filters;
            const skip = (page - 1) * limit;
            // Kumpulin filter ke array dulu
            const filtersArray = [];
            if (search) {
                filtersArray.push({
                    OR: [
                        { title: { contains: search, mode: 'insensitive' } },
                        { description: { contains: search, mode: 'insensitive' } },
                        { location: { contains: search, mode: 'insensitive' } },
                    ],
                });
            }
            if (category) {
                filtersArray.push({ category: { equals: category, mode: 'insensitive' } });
            }
            if (location) {
                filtersArray.push({ location: { contains: location, mode: 'insensitive' } });
            }
            if (startDate) {
                filtersArray.push({ startDate: { gte: new Date(startDate) } });
            }
            if (endDate) {
                filtersArray.push({ endDate: { lte: new Date(endDate) } });
            }
            if (minPrice !== undefined || maxPrice !== undefined) {
                const priceFilter = {};
                if (minPrice !== undefined)
                    priceFilter.gte = minPrice;
                if (maxPrice !== undefined)
                    priceFilter.lte = maxPrice;
                filtersArray.push({ basePrice: priceFilter });
            }
            const where = {
                isPublished: true,
                AND: filtersArray,
            };
            const [events, total] = yield Promise.all([
                prisma_1.prisma.event.findMany({
                    where,
                    include: {
                        organizer: {
                            select: {
                                id: true,
                                fullName: true,
                                profilePicture: true,
                            },
                        },
                        ticketTypes: true,
                        _count: {
                            select: {
                                reviews: true,
                                attendees: true,
                            },
                        },
                    },
                    orderBy: { startDate: 'asc' },
                    skip,
                    take: limit,
                }),
                prisma_1.prisma.event.count({ where }),
            ]);
            const totalPages = Math.ceil(total / limit);
            return {
                events,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                },
            };
        });
    }
    getEventById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.event.findUnique({
                where: { id },
                include: {
                    organizer: {
                        select: {
                            id: true,
                            fullName: true,
                            profilePicture: true,
                            email: true,
                            phoneNumber: true,
                        },
                    },
                    ticketTypes: true,
                    vouchers: {
                        where: {
                            startDate: { lte: new Date() },
                            endDate: { gte: new Date() },
                            usedCount: { lt: prisma_1.prisma.eventVoucher.fields.maxUsage },
                        },
                    },
                    reviews: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    fullName: true,
                                    profilePicture: true,
                                },
                            },
                        },
                        orderBy: { createdAt: 'desc' },
                    },
                    _count: {
                        select: {
                            attendees: true,
                            reviews: true,
                        },
                    },
                },
            });
        });
    }
    createEvent(organizerId, eventData, ticketTypes) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const event = yield tx.event.create({
                    data: Object.assign(Object.assign({}, eventData), { organizerId }),
                });
                yield tx.eventTicketType.createMany({
                    data: ticketTypes.map(ticketType => (Object.assign(Object.assign({}, ticketType), { eventId: event.id }))),
                });
                return event;
            }));
        });
    }
    updateEvent(id, organizerId, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            return prisma_1.prisma.event.update({
                where: { id, organizerId },
                data: updateData,
            });
        });
    }
    getOrganizerEvents(organizerId_1) {
        return __awaiter(this, arguments, void 0, function* (organizerId, page = 1, limit = 10) {
            const skip = (page - 1) * limit;
            const [events, total] = yield Promise.all([
                prisma_1.prisma.event.findMany({
                    where: { organizerId },
                    include: {
                        ticketTypes: true,
                        _count: {
                            select: {
                                transactions: true,
                                attendees: true,
                                reviews: true,
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: limit,
                }),
                prisma_1.prisma.event.count({ where: { organizerId } }),
            ]);
            const totalPages = Math.ceil(total / limit);
            return {
                events,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                },
            };
        });
    }
    getEventAnalytics(eventId, organizerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = yield prisma_1.prisma.event.findFirst({
                where: { id: eventId, organizerId },
                include: {
                    ticketTypes: {
                        include: {
                            _count: {
                                select: {
                                    transactionItems: true,
                                },
                            },
                        },
                    },
                    transactions: {
                        where: {
                            status: 'DONE',
                        },
                        include: {
                            items: true,
                        },
                    },
                    attendees: true,
                    reviews: {
                        select: {
                            rating: true,
                        },
                    },
                },
            });
            if (!event) {
                throw new Error('Event not found');
            }
            const totalRevenue = event.transactions.reduce((sum, transaction) => sum + transaction.finalAmount, 0);
            const averageRating = event.reviews.length > 0
                ? event.reviews.reduce((sum, review) => sum + review.rating, 0) / event.reviews.length
                : 0;
            const ticketSales = event.ticketTypes.map(ticketType => ({
                name: ticketType.name,
                sold: ticketType._count.transactionItems,
                total: ticketType.quantity,
                revenue: ticketType._count.transactionItems * ticketType.price,
            }));
            return {
                event: {
                    id: event.id,
                    title: event.title,
                    bookedSeats: event.bookedSeats,
                    availableSeats: event.availableSeats,
                },
                analytics: {
                    totalRevenue,
                    averageRating: Math.round(averageRating * 10) / 10,
                    totalTransactions: event.transactions.length,
                    totalAttendees: event.attendees.length,
                    totalReviews: event.reviews.length,
                    ticketSales,
                },
            };
        });
    }
}
exports.EventService = EventService;
