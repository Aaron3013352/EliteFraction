// routes/bookings.js
const express = require('express');
const router = express.Router();
const pool = require('../models/db');

// GET all bookings
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM bookings ORDER BY start_date ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// GET bookings for a specific user
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query('SELECT * FROM bookings WHERE user_id = $1 ORDER BY start_date ASC', [userId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user bookings' });
  }
});

// POST new booking (with date availability check)
router.post('/', async (req, res) => {
  const { user_id, asset_id, start_date, end_date, fraction_days } = req.body;
  try {
    // Ensure date range is not already booked
    const conflict = await pool.query(
      `SELECT * FROM bookings WHERE asset_id = $1 AND NOT (end_date < $2 OR start_date > $3)`,
      [asset_id, start_date, end_date]
    );

    if (conflict.rows.length > 0) {
      return res.status(409).json({ error: 'Selected dates are already booked.' });
    }

    // Insert booking
    await pool.query(
      `INSERT INTO bookings (user_id, asset_id, start_date, end_date, fraction_days)
       VALUES ($1, $2, $3, $4, $5)`,
      [user_id, asset_id, start_date, end_date, fraction_days]
    );

    // Update used_fractions in ownership_usage
    await pool.query(
      `UPDATE ownership_usage SET used_fractions = used_fractions + $1
       WHERE user_id = $2 AND asset_id = $3`,
      [fraction_days, user_id, asset_id]
    );

    res.json({ message: 'Booking created successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// routes/bookings.js
router.get('/asset/:assetId', async (req, res) => {
  const { assetId } = req.params;

  try {
    const result = await pool.query(`
      SELECT start_date, end_date FROM bookings WHERE asset_id = $1
    `, [assetId]);

    res.status(200).json({ bookings: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});


module.exports = router;