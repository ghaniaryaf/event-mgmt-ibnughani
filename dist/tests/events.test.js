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
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../src/app"));
const prisma_1 = require("../src/utils/prisma");
describe('Events API', () => {
    let authToken;
    let organizerToken;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield prisma_1.prisma.$connect();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield prisma_1.prisma.$disconnect();
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        // Clean up database
        yield prisma_1.prisma.event.deleteMany();
        yield prisma_1.prisma.user.deleteMany();
        // Create test users
        const customerResponse = yield (0, supertest_1.default)(app_1.default)
            .post('/api/auth/register')
            .send({
            email: 'customer@example.com',
            password: 'password123',
            fullName: 'Test Customer',
        });
        authToken = customerResponse.body.data.token;
        const organizerResponse = yield (0, supertest_1.default)(app_1.default)
            .post('/api/auth/register')
            .send({
            email: 'organizer@example.com',
            password: 'password123',
            fullName: 'Test Organizer',
        });
        organizerToken = organizerResponse.body.data.token;
        // Update user role to organizer
        yield prisma_1.prisma.user.update({
            where: { email: 'organizer@example.com' },
            data: { role: 'ORGANIZER' },
        });
    }));
    describe('GET /api/events', () => {
        it('should get events with pagination', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .get('/api/events')
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.pagination).toBeDefined();
        }));
        it('should filter events by category', () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app_1.default)
                .get('/api/events?category=Music')
                .expect(200);
            expect(response.body.success).toBe(true);
        }));
    });
    describe('POST /api/events', () => {
        it('should create event as organizer', () => __awaiter(void 0, void 0, void 0, function* () {
            const eventData = {
                title: 'Test Event',
                description: 'Test Description',
                category: 'Music',
                location: 'Jakarta',
                address: 'Test Address',
                startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
                endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days from now
                availableSeats: 100,
                basePrice: 100000,
                ticketTypes: [
                    {
                        name: 'Regular',
                        price: 100000,
                        quantity: 100,
                        description: 'Regular ticket',
                    },
                ],
            };
            const response = yield (0, supertest_1.default)(app_1.default)
                .post('/api/events')
                .set('Authorization', `Bearer ${organizerToken}`)
                .send(eventData)
                .expect(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.event.title).toBe(eventData.title);
        }));
        it('should not create event as customer', () => __awaiter(void 0, void 0, void 0, function* () {
            const eventData = {
                title: 'Test Event',
                description: 'Test Description',
                category: 'Music',
                location: 'Jakarta',
                address: 'Test Address',
                startDate: new Date().toISOString(),
                endDate: new Date().toISOString(),
                availableSeats: 100,
                basePrice: 100000,
            };
            const response = yield (0, supertest_1.default)(app_1.default)
                .post('/api/events')
                .set('Authorization', `Bearer ${authToken}`)
                .send(eventData)
                .expect(403);
            expect(response.body.success).toBe(false);
        }));
    });
});
