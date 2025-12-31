const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const { checkRole } = require('../middlewares/roleCheck');
const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getOrganizerEvents
} = require('../controllers/eventController');

// Public routes
router.get('/', getAllEvents);

// Protected routes (require authentication and specific roles)
// Note: Specific routes must come before parameterized routes
router.get('/organizer/my-events', authenticate, checkRole('organizer', 'admin'), getOrganizerEvents);
router.post('/', authenticate, checkRole('organizer', 'admin'), createEvent);

// Public route for single event (must come after specific routes)
router.get('/:id', getEventById);

// Protected routes for update/delete
router.put('/:id', authenticate, updateEvent);
router.delete('/:id', authenticate, deleteEvent);

module.exports = router;
