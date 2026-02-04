const pool = require('../config/database');

// Get Q&A for an event
const getEventQuestions = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { status = 'all' } = req.query; // all, approved, pending, answered

    let query = `
      SELECT q.question_id, q.question_text, q.answer_text, q.is_answered, 
             q.is_approved, q.created_at, q.answered_at,
             u.name as asker_name, u.profile_picture as asker_picture,
             a.name as answerer_name
      FROM questions q
      JOIN users u ON q.user_id = u.user_id
      LEFT JOIN users a ON q.answered_by = a.user_id
      WHERE q.event_id = $1
    `;

    const params = [eventId];

    if (status === 'approved') {
      query += ' AND q.is_approved = true';
    } else if (status === 'pending') {
      query += ' AND q.is_approved = false';
    } else if (status === 'answered') {
      query += ' AND q.is_answered = true';
    }

    query += ' ORDER BY q.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
};

// Submit a question
const submitQuestion = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { questionText } = req.body;
    const userId = req.user.userId;

    if (!questionText || questionText.trim().length === 0) {
      return res.status(400).json({ error: 'Question text is required' });
    }

    if (questionText.length > 1000) {
      return res.status(400).json({ error: 'Question too long (max 1000 characters)' });
    }

    // Check if user has access to this event
    const accessCheck = await pool.query(
      `SELECT 1 FROM tickets WHERE user_id = $1 AND event_id = $2 AND status = 'active'
       UNION
       SELECT 1 FROM events WHERE organizer_id = $1 AND event_id = $2`,
      [userId, eventId]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied to this event' });
    }

    // Auto-approve questions (you can change this logic)
    const isApproved = true; // Set to false if you want manual moderation

    const result = await pool.query(
      `INSERT INTO questions (event_id, user_id, question_text, is_approved)
       VALUES ($1, $2, $3, $4)
       RETURNING question_id, question_text, is_approved, created_at`,
      [eventId, userId, questionText.trim(), isApproved]
    );

    // Get user info
    const userInfo = await pool.query(
      'SELECT name, profile_picture FROM users WHERE user_id = $1',
      [userId]
    );

    const question = {
      ...result.rows[0],
      asker_name: userInfo.rows[0].name,
      asker_picture: userInfo.rows[0].profile_picture,
      is_answered: false,
      answer_text: null,
      answerer_name: null,
      answered_at: null
    };

    res.status(201).json(question);
  } catch (error) {
    console.error('Submit question error:', error);
    res.status(500).json({ error: 'Failed to submit question' });
  }
};

// Answer a question (organizer only)
const answerQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { answerText } = req.body;
    const userId = req.user.userId;

    if (!answerText || answerText.trim().length === 0) {
      return res.status(400).json({ error: 'Answer text is required' });
    }

    // Check if user is organizer of the event containing this question
    const questionCheck = await pool.query(
      `SELECT q.*, e.organizer_id, e.event_id, e.title as event_title, u.email as asker_email, u.name as asker_name
       FROM questions q
       JOIN events e ON q.event_id = e.event_id
       JOIN users u ON q.user_id = u.user_id
       WHERE q.question_id = $1`,
      [questionId]
    );

    if (questionCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    if (questionCheck.rows[0].organizer_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only event organizers can answer questions' });
    }

    const question = questionCheck.rows[0];

    await pool.query(
      `UPDATE questions 
       SET answer_text = $1, answered_by = $2, is_answered = true, answered_at = CURRENT_TIMESTAMP
       WHERE question_id = $3`,
      [answerText.trim(), userId, questionId]
    );

    // Send notifications
    try {
      const { createNotification } = require('./notificationController');
      const { sendQAAnswerEmail } = require('../utils/email');
      
      // Check user preferences
      const prefsResult = await pool.query(
        'SELECT * FROM notification_preferences WHERE user_id = $1',
        [question.user_id]
      );
      const prefs = prefsResult.rows[0] || {};

      // Send in-app notification
      if (prefs.in_app_notifications !== false) {
        await createNotification(
          question.user_id,
          'qa_answer',
          'Your Question Was Answered',
          `Your question in "${question.event_title}" has been answered`,
          question.event_id
        );
      }

      // Send email notification
      if (prefs.email_qa_answer !== false) {
        await sendQAAnswerEmail(
          question.asker_email,
          question.asker_name,
          { title: question.event_title, event_id: question.event_id },
          question.question_text,
          answerText.trim()
        );
      }
    } catch (notifError) {
      console.error('Failed to send Q&A notification:', notifError);
    }

    res.json({ message: 'Question answered successfully' });
  } catch (error) {
    console.error('Answer question error:', error);
    res.status(500).json({ error: 'Failed to answer question' });
  }
};

// Approve/reject question (organizer only)
const moderateQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { approved } = req.body;
    const userId = req.user.userId;

    // Check if user is organizer of the event containing this question
    const questionCheck = await pool.query(
      `SELECT q.*, e.organizer_id 
       FROM questions q
       JOIN events e ON q.event_id = e.event_id
       WHERE q.question_id = $1`,
      [questionId]
    );

    if (questionCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    if (questionCheck.rows[0].organizer_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only event organizers can moderate questions' });
    }

    await pool.query(
      'UPDATE questions SET is_approved = $1 WHERE question_id = $2',
      [approved, questionId]
    );

    res.json({ 
      message: `Question ${approved ? 'approved' : 'rejected'} successfully`,
      approved 
    });
  } catch (error) {
    console.error('Moderate question error:', error);
    res.status(500).json({ error: 'Failed to moderate question' });
  }
};

// Delete question
const deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Get question details
    const questionCheck = await pool.query(
      `SELECT q.*, e.organizer_id 
       FROM questions q
       JOIN events e ON q.event_id = e.event_id
       WHERE q.question_id = $1`,
      [questionId]
    );

    if (questionCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const question = questionCheck.rows[0];

    // Check permissions: question owner, event organizer, or admin
    if (question.user_id !== userId && 
        question.organizer_id !== userId && 
        userRole !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this question' });
    }

    await pool.query('DELETE FROM questions WHERE question_id = $1', [questionId]);

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ error: 'Failed to delete question' });
  }
};

module.exports = {
  getEventQuestions,
  submitQuestion,
  answerQuestion,
  moderateQuestion,
  deleteQuestion
};