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
const app_1 = __importDefault(require("./app"));
const prisma_1 = require("./utils/prisma");
const PORT = process.env.PORT || 3000;
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('🔧 Starting server...');
        // Test database connection
        console.log('📡 Connecting to database...');
        yield prisma_1.prisma.$connect();
        console.log('✅ Database connected successfully');
        // Start server
        const server = app_1.default.listen(PORT, () => {
            console.log('='.repeat(50));
            console.log('🚀 Server STARTED SUCCESSFULLY!');
            console.log('='.repeat(50));
            console.log(`📍 Local: http://localhost:${PORT}`);
            console.log(`🌐 Network: http://0.0.0.0:${PORT}`);
            console.log(`🔗 Health: http://localhost:${PORT}/health`);
            console.log(`🎯 API: http://localhost:${PORT}/api`);
            console.log(`📊 Environment: ${process.env.NODE_ENV}`);
            console.log('='.repeat(50));
        });
        // Handle server errors
        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`❌ Port ${PORT} is already in use`);
            }
            else {
                console.error('❌ Server error:', error);
            }
            process.exit(1);
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
});
// Handle graceful shutdown
process.on('SIGINT', () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('\n🛑 Shutting down server gracefully...');
    yield prisma_1.prisma.$disconnect();
    process.exit(0);
}));
process.on('SIGTERM', () => __awaiter(void 0, void 0, void 0, function* () {
    console.log('\n🛑 Shutting down server gracefully...');
    yield prisma_1.prisma.$disconnect();
    process.exit(0);
}));
// Start the server
console.log('🔄 Initializing server...');
startServer();
