const express = require('express');
const router = express.Router();
const pool = require('../models/db');

router.post('/', async (req, res) => {
  const { user_id, asset_id, token_amount, total_paid, tx_hash } = req.body;

  const client = await pool.connect();
  try {
    // Use user_id directly, no need to lookup user by email
    const user_id = req.body.user_id;

    await client.query('BEGIN');

    // 1. Insert transaction
    await client.query(
      `INSERT INTO transactions (user_id, asset_id, token_amount, total_paid, type, tx_hash)
       VALUES ($1, $2, $3, $4, 'buy', $5)`,
      [user_id, asset_id, token_amount, total_paid, tx_hash]
    );

    // 2. Decrease available tokens
    await client.query(
      `UPDATE assets SET tokens_available = tokens_available - $1 WHERE id = $2`,
      [token_amount, asset_id]
    );

    // 3. Upsert ownership
    await client.query(
      `INSERT INTO ownerships (user_id, asset_id, token_count)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, asset_id)
       DO UPDATE SET token_count = ownerships.token_count + $3`,
      [user_id, asset_id, token_amount]
    );

    // 4. Upsert ownership usage
    await client.query(
      `INSERT INTO ownership_usage (user_id, asset_id, total_fractions)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, asset_id)
       DO UPDATE SET total_fractions = ownership_usage.total_fractions + $3`,
      [user_id, asset_id, token_amount]
    );

    await client.query('COMMIT');
    res.status(200).json({ success: true });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: 'Transaction processing failed' });
  } finally {
    client.release();
  }
});



// =====================================
// 2. GET all transactions (Admin use)
// =====================================
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, u.full_name, a.title AS asset_title
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      JOIN assets a ON t.asset_id = a.id
      ORDER BY t.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});


// =====================================
// 3. GET transactions for a specific user
// =====================================
router.get('/user/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const result = await pool.query(`
      SELECT t.*, a.title AS asset_title
      FROM transactions t
      JOIN assets a ON t.asset_id = a.id
      WHERE t.user_id = $1
      ORDER BY t.created_at DESC
    `, [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user transactions' });
  }
});


// =====================================
// 4. (Optional) GET transactions for a specific asset
// =====================================
router.get('/asset/:assetId', async (req, res) => {
  const assetId = req.params.assetId;
  try {
    const result = await pool.query(`
      SELECT t.*, u.full_name
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      WHERE t.asset_id = $1
      ORDER BY t.created_at DESC
    `, [assetId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch asset transactions' });
  }
});

module.exports = router;

