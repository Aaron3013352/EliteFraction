// routes/ownershipUsage.js
const express = require('express');
const router = express.Router();
const pool = require('../models/db');

// GET all ownership usage records
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ownership_usage');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch ownership usage records' });
  }
});

// GET ownership usage for a specific user
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM ownership_usage WHERE user_id = $1',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch ownership usage for user' });
  }
});

// ✅ NEW: GET ownership usage for a specific asset and user
router.get('/:userId/:assetId', async (req, res) => {
  const { assetId, userId } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM ownership_usage WHERE asset_id = $1 AND user_id = $2',
      [assetId, userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No usage found for the specified asset and user' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch ownership usage for asset and user' });
  }
});

// UPDATE used_fractions after booking
router.put('/', async (req, res) => {
  const { user_id, asset_id, increment } = req.body;
  try {
    await pool.query(
      'UPDATE ownership_usage SET used_fractions = used_fractions + $1 WHERE user_id = $2 AND asset_id = $3',
      [increment, user_id, asset_id]
    );
    res.json({ message: 'Used fractions updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update used fractions' });
  }
});

module.exports = router;
