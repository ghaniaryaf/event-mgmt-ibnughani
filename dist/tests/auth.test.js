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
describe('Auth API', () => {
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield prisma_1.prisma.$connect();
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield prisma_1.prisma.$disconnect();
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        // Clean up database before each test
        yield prisma_1.prisma.user.deleteMany();
    }));
    describe('POST /api/auth/register', () => {
        it('should register a new user', () => __awaiter(void 0, void 0, void 0, function* () {
            const userData = {
                email: 'test@example.com',
                password: 'password123',
                fullName: 'Test User',
                phoneNumber: '081234567890',
            };
            const response = yield (0, supertest_1.default)(app_1.default)
                .post('/api/auth/register')
                .send(userData)
                .expect(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data.user.email).toBe(userData.email);
            expect(response.body.data.user.fullName).toBe(userData.fullName);
            expect(response.body.data.token).toBeDefined();
        }));
        it('should not register user with existing email', () => __awaiter(void 0, void 0, void 0, function* () {
            const userData = {
                email: 'test@example.com',
                password: 'password123',
                fullName: 'Test User',
            };
            // First registration
            yield (0, supertest_1.default)(app_1.default).post('/api/auth/register').send(userData);
            // Second registration with same email
            const response = yield (0, supertest_1.default)(app_1.default)
                .post('/api/auth/register')
                .send(userData)
                .expect(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('already exists');
        }));
    });
    describe('POST /api/auth/login', () => {
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            // Create a user for login tests
            yield (0, supertest_1.default)(app_1.default).post('/api/auth/register').send({
                email: 'test@example.com',
                password: 'password123',
                fullName: 'Test User',
            });
        }));
        it('should login with valid credentials', () => __awaiter(void 0, void 0, void 0, function* () {
            const loginData = {
                email: 'test@example.com',
                password: 'password123',
            };
            const response = yield (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send(loginData)
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.user.email).toBe(loginData.email);
            expect(response.body.data.token).toBeDefined();
        }));
        it('should not login with invalid password', () => __awaiter(void 0, void 0, void 0, function* () {
            const loginData = {
                email: 'test@example.com',
                password: 'wrongpassword',
            };
            const response = yield (0, supertest_1.default)(app_1.default)
                .post('/api/auth/login')
                .send(loginData)
                .expect(401);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Invalid');
        }));
    });
});
