const express = require('express');
const pool = require('../db/connection');
const { authenticate } = require('../middleware/auth');
const Razorpay = require('razorpay');

const router = express.Router();

// Create Razorpay order
router.post('/create-razorpay-order', authenticate, async (req, res) => {
  try {
    const { amount } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder',
    });

    const options = {
      amount: Math.round(amount * 100), // amount in smallest currency unit
      currency: "USD",
      receipt: "rcpt_" + Date.now(),
    };

    const order = await instance.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error('Razorpay order error:', error);
    res.status(500).json({ message: 'Failed to initialize payment gateway. Check Razorpay keys.' });
  }
});

// Book an event
router.post('/', authenticate, async (req, res) => {
  try {
    const { event_id, ticket_type } = req.body;

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
      'INSERT INTO bookings (user_id, event_id, ticket_type) VALUES (?, ?, ?)',
      [req.user.id, event_id, ticket_type || 'general']
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
      SELECT b.id, b.booked_at, b.ticket_type, e.id as event_id, e.title, e.description, e.date, e.location
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
