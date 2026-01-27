

const express = require('express');
const router = express.Router();
const pool = require('../models/db');

// 📥 CREATE: Add new asset
router.post('/', async (req, res) => {
  const {
    title,
    description,
    category,
    total_tokens,
    tokens_available,
    price_per_token,
    image_url,
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO assets (title, description, category, total_tokens, tokens_available, price_per_token, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [title, description, category, total_tokens, tokens_available, price_per_token, image_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating asset:', error);
    res.status(500).json({ error: 'Error creating asset' });
  }
});

// 📤 READ: Get all assets
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM assets ORDER BY id DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching assets:', error);
    res.status(500).json({ error: 'Error fetching assets' });
  }
});

// 📤 READ: Get single asset by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM assets WHERE id = $1', [id]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ message: 'Asset not found' });
    }
  } catch (error) {
    console.error('Error fetching asset by ID:', error);
    res.status(500).json({ error: 'Error fetching asset' });
  }
});

// ✏️ UPDATE: Update asset by ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    category,
    total_tokens,
    tokens_available,
    price_per_token,
    image_url,
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE assets
       SET title = $1,
           description = $2,
           category = $3,
           total_tokens = $4,
           tokens_available = $5,
           price_per_token = $6,
           image_url = $7
       WHERE id = $8
       RETURNING *`,
      [title, description, category, total_tokens, tokens_available, price_per_token, image_url, id]
    );

    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ message: 'Asset not found' });
    }
  } catch (error) {
    console.error('Error updating asset:', error);
    res.status(500).json({ error: 'Error updating asset' });
  }
});

// 🗑️ DELETE: Delete asset by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM assets WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length > 0) {
      res.json({ message: 'Asset deleted successfully', asset: result.rows[0] });
    } else {
      res.status(404).json({ message: 'Asset not found' });
    }
  } catch (error) {
    console.error('Error deleting asset:', error);
    res.status(500).json({ error: 'Error deleting asset' });
  }
});

module.exports = router;
