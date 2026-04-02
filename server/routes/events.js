const express = require('express');
const pool = require('../db/connection');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all events
router.get('/', async (req, res) => {
  try {
    const [events] = await pool.query(`
      SELECT e.*, u.name as creator_name,
        (SELECT COUNT(*) FROM bookings WHERE event_id = e.id) as booked_count
      FROM events e
      LEFT JOIN users u ON e.created_by = u.id
      ORDER BY e.date ASC
    `);
    res.json(events);
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get single event
router.get('/:id', async (req, res) => {
  try {
    const [events] = await pool.query(`
      SELECT e.*, u.name as creator_name,
        (SELECT COUNT(*) FROM bookings WHERE event_id = e.id) as booked_count
      FROM events e
      LEFT JOIN users u ON e.created_by = u.id
      WHERE e.id = ?
    `, [req.params.id]);

    if (events.length === 0) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    res.json(events[0]);
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Create event (admin only)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, description, date, location, max_attendees } = req.body;

    if (!title || !date || !location) {
      return res.status(400).json({ message: 'Title, date, and location are required.' });
    }

    const [result] = await pool.query(
      'INSERT INTO events (title, description, date, location, max_attendees, created_by) VALUES (?, ?, ?, ?, ?, ?)',
      [title, description || '', date, location, max_attendees || 100, req.user.id]
    );

    res.status(201).json({ id: result.insertId, message: 'Event created successfully.' });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Update event (admin only)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, description, date, location, max_attendees } = req.body;

    const [existing] = await pool.query('SELECT id FROM events WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    await pool.query(
      'UPDATE events SET title = ?, description = ?, date = ?, location = ?, max_attendees = ? WHERE id = ?',
      [title, description, date, location, max_attendees, req.params.id]
    );

    res.json({ message: 'Event updated successfully.' });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Delete event (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT id FROM events WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    await pool.query('DELETE FROM events WHERE id = ?', [req.params.id]);
    res.json({ message: 'Event deleted successfully.' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
