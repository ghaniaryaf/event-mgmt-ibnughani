"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const eventController_1 = require("../controllers/eventController");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public routes
router.get('/', validation_1.validateEventQuery, validation_1.handleValidationErrors, auth_1.optionalAuth, eventController_1.getEvents);
router.get('/:id', eventController_1.getEventById);
// Protected routes
router.use(auth_1.authenticate);
// Organizer routes
router.post('/', (0, auth_1.authorize)('ORGANIZER'), validation_1.validateEventCreate, validation_1.handleValidationErrors, eventController_1.createEvent);
router.put('/:id', (0, auth_1.authorize)('ORGANIZER'), validation_1.validateEventUpdate, validation_1.handleValidationErrors, eventController_1.updateEvent);
router.get('/organizer/my-events', (0, auth_1.authorize)('ORGANIZER'), eventController_1.getOrganizerEvents);
router.get('/:id/analytics', (0, auth_1.authorize)('ORGANIZER'), eventController_1.getEventAnalytics);
exports.default = router;
