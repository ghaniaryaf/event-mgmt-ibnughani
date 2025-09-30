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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEventAnalytics = exports.getOrganizerEvents = exports.updateEvent = exports.createEvent = exports.getEventById = exports.getEvents = void 0;
const eventService_1 = require("../services/eventService");
const validation_1 = require("../middleware/validation");
const eventService = new eventService_1.EventService();
const getEvents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, validation_1.handleValidationErrors)(req, res, () => { });
        const filters = {
            page: parseInt(req.query.page) || 1,
            limit: parseInt(req.query.limit) || 10,
            search: req.query.search,
            category: req.query.category,
            location: req.query.location,
            startDate: req.query.startDate ? new Date(req.query.startDate) : undefined,
            endDate: req.query.endDate ? new Date(req.query.endDate) : undefined,
            minPrice: req.query.minPrice ? parseFloat(req.query.minPrice) : undefined,
            maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice) : undefined,
        };
        const result = yield eventService.getEvents(filters);
        res.status(200).json({
            success: true,
            message: 'Events retrieved successfully',
            data: result.events,
            pagination: result.pagination,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});
exports.getEvents = getEvents;
const getEventById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const event = yield eventService.getEventById(id);
        if (!event) {
            res.status(404).json({
                success: false,
                message: 'Event not found',
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Event retrieved successfully',
            data: event,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});
exports.getEventById = getEventById;
const createEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, validation_1.handleValidationErrors)(req, res, () => { });
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'User not authenticated',
            });
            return;
        }
        const _a = req.body, { ticketTypes } = _a, eventData = __rest(_a, ["ticketTypes"]);
        const result = yield eventService.createEvent(req.user.id, eventData, ticketTypes);
        res.status(201).json({
            success: true,
            message: 'Event created successfully',
            data: result,
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});
exports.createEvent = createEvent;
const updateEvent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        (0, validation_1.handleValidationErrors)(req, res, () => { });
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'User not authenticated',
            });
            return;
        }
        const { id } = req.params;
        const event = yield eventService.updateEvent(id, req.user.id, req.body);
        res.status(200).json({
            success: true,
            message: 'Event updated successfully',
            data: event,
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
});
exports.updateEvent = updateEvent;
const getOrganizerEvents = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'User not authenticated',
            });
            return;
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const result = yield eventService.getOrganizerEvents(req.user.id, page, limit);
        res.status(200).json({
            success: true,
            message: 'Organizer events retrieved successfully',
            data: result.events,
            pagination: result.pagination,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});
exports.getOrganizerEvents = getOrganizerEvents;
const getEventAnalytics = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'User not authenticated',
            });
            return;
        }
        const { id } = req.params;
        const analytics = yield eventService.getEventAnalytics(id, req.user.id);
        res.status(200).json({
            success: true,
            message: 'Event analytics retrieved successfully',
            data: analytics,
        });
    }
    catch (error) {
        res.status(404).json({
            success: false,
            message: error.message,
        });
    }
});
exports.getEventAnalytics = getEventAnalytics;
