const pool = require('../config/database');

// Get ticket types for an event
const getEventTicketTypes = async (req, res) => {
  try {
    const { eventId } = req.params;

    const result = await pool.query(
      `SELECT * FROM ticket_types 
       WHERE event_id = $1 
       ORDER BY price ASC`,
      [eventId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get ticket types error:', error);
    res.status(500).json({ error: 'Failed to fetch ticket types' });
  }
};

// Create ticket types for an event (organizer only)
const createTicketTypes = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { ticketTypes } = req.body; // Array of ticket types
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
      return res.status(403).json({ error: 'Not authorized to manage this event' });
    }

    // Delete existing ticket types for this event
    await pool.query('DELETE FROM ticket_types WHERE event_id = $1', [eventId]);

    // Insert new ticket types
    const createdTypes = [];
    for (const type of ticketTypes) {
      const result = await pool.query(
        `INSERT INTO ticket_types (event_id, type_name, price, quantity_available, description)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [eventId, type.type_name, type.price, type.quantity_available || null, type.description || null]
      );
      createdTypes.push(result.rows[0]);
    }

    res.status(201).json({
      message: 'Ticket types created successfully',
      ticketTypes: createdTypes
    });
  } catch (error) {
    console.error('Create ticket types error:', error);
    res.status(500).json({ error: 'Failed to create ticket types' });
  }
};

// Update ticket type
const updateTicketType = async (req, res) => {
  try {
    const { ticketTypeId } = req.params;
    const { type_name, price, quantity_available, description } = req.body;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Check if ticket type exists and user is authorized
    const typeCheck = await pool.query(
      `SELECT tt.*, e.organizer_id 
       FROM ticket_types tt
       JOIN events e ON tt.event_id = e.event_id
       WHERE tt.ticket_type_id = $1`,
      [ticketTypeId]
    );

    if (typeCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket type not found' });
    }

    if (typeCheck.rows[0].organizer_id !== userId && userRole !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const result = await pool.query(
      `UPDATE ticket_types SET
       type_name = COALESCE($1, type_name),
       price = COALESCE($2, price),
       quantity_available = COALESCE($3, quantity_available),
       description = COALESCE($4, description)
       WHERE ticket_type_id = $5
       RETURNING *`,
      [type_name, price, quantity_available, description, ticketTypeId]
    );

    res.json({
      message: 'Ticket type updated successfully',
      ticketType: result.rows[0]
    });
  } catch (error) {
    console.error('Update ticket type error:', error);
    res.status(500).json({ error: 'Failed to update ticket type' });
  }
};

// Delete ticket type
const deleteTicketType = async (req, res) => {
  try {
    const { ticketTypeId } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Check authorization
    const typeCheck = await pool.query(
      `SELECT tt.*, e.organizer_id 
       FROM ticket_types tt
       JOIN events e ON tt.event_id = e.event_id
       WHERE tt.ticket_type_id = $1`,
      [ticketTypeId]
    );

    if (typeCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Ticket type not found' });
    }

    if (typeCheck.rows[0].organizer_id !== userId && userRole !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await pool.query('DELETE FROM ticket_types WHERE ticket_type_id = $1', [ticketTypeId]);

    res.json({ message: 'Ticket type deleted successfully' });
  } catch (error) {
    console.error('Delete ticket type error:', error);
    res.status(500).json({ error: 'Failed to delete ticket type' });
  }
};

module.exports = {
  getEventTicketTypes,
  createTicketTypes,
  updateTicketType,
  deleteTicketType
};
