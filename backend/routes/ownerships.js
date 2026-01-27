const express = require('express');
const router = express.Router();
const pool = require('../models/db');

// =====================================
// 1. GET all ownerships (Admin)
// =====================================
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.*, u.full_name, a.title AS asset_title
      FROM ownerships o
      JOIN users u ON o.user_id = u.id
      JOIN assets a ON o.asset_id = a.id
      ORDER BY a.title
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch ownerships' });
  }
});


// =====================================
// 2. GET ownerships by user
// =====================================
// router.get('/user/:userId', async (req, res) => {
//   const userId = req.params.userId;
//   try {
//     const result = await pool.query(`
//       SELECT o.*, a.title AS asset_title, a.image_url, a.category
//       FROM ownerships o
//       JOIN assets a ON o.asset_id = a.id
//       WHERE o.user_id = $1
//     `, [userId]);
//     res.json(result.rows);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Failed to fetch user ownerships' });
//   }
// });

router.get('/user/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const result = await pool.query(`
      SELECT 
        o.*, 
        a.title AS asset_title, 
        a.image_url, 
        a.category,
        ou.total_fractions,
        ou.used_fractions,
        (ou.total_fractions - COALESCE(ou.used_fractions, 0)) AS remaining_fractions
      FROM ownerships o
      JOIN assets a ON o.asset_id = a.id
      LEFT JOIN ownership_usage ou 
        ON ou.user_id = o.user_id AND ou.asset_id = o.asset_id
      WHERE o.user_id = $1
    `, [userId]);
    
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch user ownerships' });
  }
});



// =====================================
// 3. (Optional) GET ownerships by asset
// =====================================
router.get('/asset/:assetId', async (req, res) => {
  const assetId = req.params.assetId;
  try {
    const result = await pool.query(`
      SELECT o.*, u.full_name
      FROM ownerships o
      JOIN users u ON o.user_id = u.id
      WHERE o.asset_id = $1
    `, [assetId]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch asset ownerships' });
  }
});

module.exports = router;
