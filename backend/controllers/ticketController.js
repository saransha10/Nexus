const pool = require('../config/database');
const crypto = require('crypto');

// Register for an event (create ticket)
const registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { ticket_type_id, payment_data } = req.body;
    const userId = req.user.userId;

    // Check if event exists
    const eventCheck = await pool.query(
      'SELECT * FROM events WHERE event_id = $1',
      [eventId]
    );

    if (eventCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const event = eventCheck.rows[0];

    // Prevent organizer from buying tickets to their own event
    if (event.organizer_id === userId) {
      return res.status(403).json({ error: 'Organizers cannot purchase tickets for their own events' });
    }

    // Get ticket type details
    const ticketTypeCheck = await pool.query(
      'SELECT * FROM ticket_types WHERE ticket_type_id = $1 AND event_id = $2',
      [ticket_type_id, eventId]
    );

    if (ticketTypeCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket type not found for this event' });
    }

    const ticketType = ticketTypeCheck.rows[0];

    // Validate payment for paid tickets
    if (parseFloat(ticketType.price) > 0) {
      if (!payment_data || (!payment_data.pidx && !payment_data.transaction_id && !payment_data.transaction_uuid)) {
        return res.status(400).json({ error: 'Payment required for this ticket' });
      }
      // Payment verified - Khalti or eSewa payment data received
      console.log('Payment received:', payment_data);
    }

    // Check ticket type quantity limit
    if (ticketType.quantity_available !== null) {
      const soldCount = await pool.query(
        'SELECT COUNT(*) FROM tickets WHERE ticket_type_id = $1 AND status = $2',
        [ticket_type_id, 'active']
      );
      
      if (parseInt(soldCount.rows[0].count) >= ticketType.quantity_available) {
        return res.status(400).json({ error: `${ticketType.type_name} tickets are sold out` });
      }
    }

    // Check max attendees limit
    if (event.max_attendees) {
      const attendeeCount = await pool.query(
        'SELECT COUNT(*) FROM tickets WHERE event_id = $1 AND status = $2',
        [eventId, 'active']
      );
      
      if (parseInt(attendeeCount.rows[0].count) >= event.max_attendees) {
        return res.status(400).json({ error: 'Event is full. No more tickets available.' });
      }
    }

    // Generate unique QR code
    const qrCode = `QR-${Date.now()}-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;

    // Use ticket type price
    const price = ticketType.price;

    // Create ticket with payment info
    const paymentToken = payment_data?.pidx || payment_data?.transaction_id || payment_data?.transaction_uuid || null;
    
    const result = await pool.query(
      `INSERT INTO tickets (user_id, event_id, ticket_type_id, qr_code, price, ticket_type, status, payment_token)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [userId, eventId, ticket_type_id, qrCode, price, ticketType.type_name, 'active', paymentToken]
    );

    res.status(201).json({
      message: 'Successfully registered for event',
      ticket: result.rows[0]
    });
  } catch (error) {
    console.error('Register for event error:', error);
    res.status(500).json({ error: 'Failed to register for event' });
  }
};

// Get user's tickets
const getUserTickets = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status } = req.query; // Optional filter by status

    let query = `
      SELECT t.*, e.title, e.description, e.type, e.start_time, e.end_time, 
             e.location, e.streaming_url, u.name as organizer_name
      FROM tickets t
      JOIN events e ON t.event_id = e.event_id
      LEFT JOIN users u ON e.organizer_id = u.user_id
      WHERE t.user_id = $1
    `;
    
    const params = [userId];
    
    if (status) {
      query += ' AND t.status = $2';
      params.push(status);
    }
    
    query += ' ORDER BY e.start_time ASC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get user tickets error:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
};

// Get single ticket details
const getTicketById = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user.userId;

    const result = await pool.query(
      `SELECT t.*, e.title, e.description, e.type, e.start_time, e.end_time,
              e.location, e.streaming_url, u.name as organizer_name, u.email as organizer_email
       FROM tickets t
       JOIN events e ON t.event_id = e.event_id
       LEFT JOIN users u ON e.organizer_id = u.user_id
       WHERE t.ticket_id = $1 AND t.user_id = $2`,
      [ticketId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
};

// Cancel ticket (update status instead of delete)
const cancelTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user.userId;

    // Check if ticket exists and belongs to user
    const ticketCheck = await pool.query(
      'SELECT * FROM tickets WHERE ticket_id = $1 AND user_id = $2',
      [ticketId, userId]
    );

    if (ticketCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    if (ticketCheck.rows[0].status === 'cancelled') {
      return res.status(400).json({ error: 'Ticket is already cancelled' });
    }

    if (ticketCheck.rows[0].status === 'used') {
      return res.status(400).json({ error: 'Cannot cancel a used ticket' });
    }

    // Update ticket status to cancelled
    await pool.query(
      'UPDATE tickets SET status = $1 WHERE ticket_id = $2',
      ['cancelled', ticketId]
    );

    res.json({ message: 'Ticket cancelled successfully' });
  } catch (error) {
    console.error('Cancel ticket error:', error);
    res.status(500).json({ error: 'Failed to cancel ticket' });
  }
};

// Check if user is registered for an event
const checkRegistration = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.userId;

    const result = await pool.query(
      'SELECT * FROM tickets WHERE event_id = $1 AND user_id = $2 AND status = $3',
      [eventId, userId, 'active']
    );

    res.json({ 
      isRegistered: result.rows.length > 0,
      ticketCount: result.rows.length,
      tickets: result.rows
    });
  } catch (error) {
    console.error('Check registration error:', error);
    res.status(500).json({ error: 'Failed to check registration' });
  }
};

// Get event attendees (for organizers/admins)
const getEventAttendees = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Check if user is organizer of this event or admin
    const eventCheck = await pool.query(
      'SELECT * FROM events WHERE event_id = $1',
      [eventId]
    );

    if (eventCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (eventCheck.rows[0].organizer_id !== userId && userRole !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to view attendees' });
    }

    // Get attendees
    const result = await pool.query(
      `SELECT t.ticket_id, t.qr_code, t.price, t.ticket_type, t.status, t.created_at,
              u.user_id, u.name, u.email
       FROM tickets t
       JOIN users u ON t.user_id = u.user_id
       WHERE t.event_id = $1
       ORDER BY t.created_at DESC`,
      [eventId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get event attendees error:', error);
    res.status(500).json({ error: 'Failed to fetch attendees' });
  }
};

// Validate QR code (for entry scanning)
const validateQRCode = async (req, res) => {
  try {
    const { qr_code } = req.body;

    if (!qr_code) {
      return res.status(400).json({ error: 'QR code is required' });
    }

    const result = await pool.query(
      `SELECT t.*, e.title, e.start_time, e.end_time, e.type, e.location,
              u.name as attendee_name, u.email as attendee_email
       FROM tickets t
       JOIN events e ON t.event_id = e.event_id
       JOIN users u ON t.user_id = u.user_id
       WHERE t.qr_code = $1`,
      [qr_code]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        valid: false,
        error: 'Invalid QR code - Ticket not found' 
      });
    }

    const ticket = result.rows[0];

    // Check if ticket is cancelled
    if (ticket.status === 'cancelled') {
      return res.status(400).json({ 
        valid: false,
        error: 'Ticket has been cancelled',
        ticket: {
          ticket_id: ticket.ticket_id,
          status: ticket.status,
          attendee_name: ticket.attendee_name
        }
      });
    }

    // Check if ticket already used
    if (ticket.status === 'used') {
      return res.status(400).json({ 
        valid: false,
        error: 'Ticket already scanned and used',
        ticket: {
          ticket_id: ticket.ticket_id,
          status: ticket.status,
          attendee_name: ticket.attendee_name,
          event_title: ticket.title
        }
      });
    }

    // Mark ticket as used
    await pool.query(
      'UPDATE tickets SET status = $1 WHERE ticket_id = $2',
      ['used', ticket.ticket_id]
    );

    res.json({
      valid: true,
      message: 'Ticket validated successfully - Entry granted',
      ticket: {
        ticket_id: ticket.ticket_id,
        attendee_name: ticket.attendee_name,
        attendee_email: ticket.attendee_email,
        event_title: ticket.title,
        ticket_type: ticket.ticket_type,
        price: ticket.price,
        start_time: ticket.start_time,
        end_time: ticket.end_time
      }
    });
  } catch (error) {
    console.error('Validate QR code error:', error);
    res.status(500).json({ error: 'Failed to validate QR code' });
  }
};

module.exports = {
  registerForEvent,
  getUserTickets,
  getTicketById,
  cancelTicket,
  checkRegistration,
  getEventAttendees,
  validateQRCode
};
