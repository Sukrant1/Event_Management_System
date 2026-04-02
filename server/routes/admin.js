const express = require('express');
const pool = require('../db/connection');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get admin stats
router.get('/stats', authenticate, requireAdmin, async (req, res) => {
  try {
    const [userCount] = await pool.query('SELECT COUNT(*) as count FROM users');
    const [eventCount] = await pool.query('SELECT COUNT(*) as count FROM events');
    const [bookingCount] = await pool.query('SELECT COUNT(*) as count FROM bookings');

    res.json({
      totalUsers: userCount[0].count,
      totalEvents: eventCount[0].count,
      totalBookings: bookingCount[0].count
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get all users
router.get('/users', authenticate, requireAdmin, async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Get all bookings (with details)
router.get('/bookings', authenticate, requireAdmin, async (req, res) => {
  try {
    const [bookings] = await pool.query(`
      SELECT b.id, b.booked_at, 
        u.name as user_name, u.email as user_email,
        e.title as event_title, e.date as event_date
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN events e ON b.event_id = e.id
      ORDER BY b.booked_at DESC
    `);
    res.json(bookings);
  } catch (error) {
    console.error('Get all bookings error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
