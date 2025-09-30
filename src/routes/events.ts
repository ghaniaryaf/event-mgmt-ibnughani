import { Router } from 'express';
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  getOrganizerEvents,
  getEventAnalytics,
} from '../controllers/eventController';
import {
  validateEventCreate,
  validateEventUpdate,
  validateEventQuery,
  handleValidationErrors,
} from '../middleware/validation';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', validateEventQuery, handleValidationErrors, optionalAuth, getEvents);
router.get('/:id', getEventById);

// Protected routes
router.use(authenticate);

// Organizer routes
router.post(
  '/',
  authorize('ORGANIZER'),
  validateEventCreate,
  handleValidationErrors,
  createEvent
);
router.put(
  '/:id',
  authorize('ORGANIZER'),
  validateEventUpdate,
  handleValidationErrors,
  updateEvent
);
router.get('/organizer/my-events', authorize('ORGANIZER'), getOrganizerEvents);
router.get('/:id/analytics', authorize('ORGANIZER'), getEventAnalytics);

export default router;