import express from 'express';
import { getOrganizerDashboard, getEventAttendees } from '../controllers/dashboardController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

router.get('/organizer', authenticate, authorize(['organizer']), getOrganizerDashboard);
router.get('/events/:eventId/attendees', authenticate, authorize(['organizer']), getEventAttendees);

export default router;