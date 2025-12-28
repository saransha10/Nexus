const pool = require('../config/database');

// Get all events
const getAllEvents = async (req, res) => {
  try {
    const { type, search } = req.query;
    
    let query = `
      SELECT e.*, u.name as organizer_name, u.email as organizer_email
      FROM events e
      LEFT JOIN users u ON e.organizer_id = u.user_id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (type) {
      query += ` AND e.type = $${paramCount}`;
      params.push(type);
      paramCount++;
    }

    if (search) {
      query += ` AND (e.title ILIKE $${paramCount} OR e.description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    query += ' ORDER BY e.start_time ASC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

// Get single event
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT e.*, u.name as organizer_name, u.email as organizer_email
       FROM events e
       LEFT JOIN users u ON e.organizer_id = u.user_id
       WHERE e.event_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
};

// Create event (organizer/admin only)
const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      start_time,
      end_time,
      location,
      streaming_url,
      ticket_price,
      max_attendees,
      is_free
    } = req.body;

    const organizer_id = req.user.userId;

    // Validation
    if (!title || !type || !start_time || !end_time) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    if (new Date(start_time) >= new Date(end_time)) {
      return res.status(400).json({ error: 'End time must be after start time' });
    }

    const result = await pool.query(
      `INSERT INTO events (title, description, type, start_time, end_time, 
       location, streaming_url, organizer_id, ticket_price, max_attendees, is_free)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [title, description, type, start_time, end_time, location, 
       streaming_url, organizer_id, ticket_price || 0, max_attendees, is_free !== false]
    );

    res.status(201).json({
      message: 'Event created successfully',
      event: result.rows[0]
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
};

// Update event
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Check if event exists and user is organizer or admin
    const eventCheck = await pool.query(
      'SELECT * FROM events WHERE event_id = $1',
      [id]
    );

    if (eventCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (eventCheck.rows[0].organizer_id !== userId && userRole !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to update this event' });
    }

    const {
      title,
      description,
      type,
      start_time,
      end_time,
      location,
      streaming_url,
      ticket_price,
      max_attendees,
      is_free
    } = req.body;

    const result = await pool.query(
      `UPDATE events SET
       title = COALESCE($1, title),
       description = COALESCE($2, description),
       type = COALESCE($3, type),
       start_time = COALESCE($4, start_time),
       end_time = COALESCE($5, end_time),
       location = COALESCE($6, location),
       streaming_url = COALESCE($7, streaming_url),
       ticket_price = COALESCE($8, ticket_price),
       max_attendees = COALESCE($9, max_attendees),
       is_free = COALESCE($10, is_free)
       WHERE event_id = $11
       RETURNING *`,
      [title, description, type, start_time, end_time, location,
       streaming_url, ticket_price, max_attendees, is_free, id]
    );

    res.json({
      message: 'Event updated successfully',
      event: result.rows[0]
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
};

// Delete event
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Check if event exists and user is organizer or admin
    const eventCheck = await pool.query(
      'SELECT * FROM events WHERE event_id = $1',
      [id]
    );

    if (eventCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (eventCheck.rows[0].organizer_id !== userId && userRole !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this event' });
    }

    await pool.query('DELETE FROM events WHERE event_id = $1', [id]);

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
};

// Get events by organizer
const getOrganizerEvents = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `SELECT * FROM events 
       WHERE organizer_id = $1 
       ORDER BY start_time DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get organizer events error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getOrganizerEvents
};
