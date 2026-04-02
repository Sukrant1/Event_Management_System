const express = require('express');
const pool = require('../db/connection');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Book an event
router.post('/', authenticate, async (req, res) => {
  try {
    const { event_id } = req.body;

    if (!event_id) {
      return res.status(400).json({ message: 'Event ID is required.' });
    }

    // Check event exists
    const [events] = await pool.query(`
      SELECT e.*, (SELECT COUNT(*) FROM bookings WHERE event_id = e.id) as booked_count 
      FROM events e WHERE e.id = ?
    `, [event_id]);

    if (events.length === 0) {
      return res.status(404).json({ message: 'Event not found.' });
    }

    const event = events[0];

    // Check capacity
    if (event.booked_count >= event.max_attendees) {
      return res.status(400).json({ message: 'Event is fully booked.' });
    }

    // Check if already booked
    const [existing] = await pool.query(
      'SELECT id FROM bookings WHERE user_id = ? AND event_id = ?',
      [req.user.id, event_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: 'You have already booked this event.' });
    }

    // Create booking
    const [result] = await pool.query(
      'INSERT INTO bookings (user_id, event_id) VALUES (?, ?)',
      [req.user.id, event_id]
    );

    res.status(201).json({ id: result.insertId, message: 'Event booked successfully.' });
  } catch (error) {
    console.error('Book event error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get current user's bookings
router.get('/my', authenticate, async (req, res) => {
  try {
    const [bookings] = await pool.query(`
      SELECT b.id, b.booked_at, e.id as event_id, e.title, e.description, e.date, e.location
      FROM bookings b
      JOIN events e ON b.event_id = e.id
      WHERE b.user_id = ?
      ORDER BY e.date ASC
    `, [req.user.id]);

    res.json(bookings);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Cancel booking
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const [bookings] = await pool.query(
      'SELECT * FROM bookings WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    await pool.query('DELETE FROM bookings WHERE id = ?', [req.params.id]);
    res.json({ message: 'Booking cancelled successfully.' });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
