const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const { checkRole } = require('../middlewares/roleCheck');
const {
  registerForEvent,
  getUserTickets,
  getTicketById,
  cancelTicket,
  checkRegistration,
  getEventAttendees,
  validateQRCode
} = require('../controllers/ticketController');

// All routes require authentication
router.post('/register/:eventId', authenticate, registerForEvent);
router.get('/my-tickets', authenticate, getUserTickets);
router.get('/:ticketId', authenticate, getTicketById);
router.delete('/:ticketId', authenticate, cancelTicket);
router.get('/check/:eventId', authenticate, checkRegistration);
router.get('/event/:eventId/attendees', authenticate, checkRole('organizer', 'admin'), getEventAttendees);

// QR Code validation (for organizers/admins at event entry)
router.post('/validate-qr', authenticate, checkRole('organizer', 'admin'), validateQRCode);

module.exports = router;
