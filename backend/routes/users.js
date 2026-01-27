const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const pool = require('../models/db');

// Get all users
router.get('/', async (req, res) => {
  const result = await pool.query('SELECT id, full_name, email, role FROM users');
  res.json(result.rows);
});

// Create user (with password hashing and default role)
router.post('/', async (req, res) => {
  const { full_name, email, password, role = 'user' } = req.body;

  try {
    // Hash the password
    const password_hash = await bcrypt.hash(password, 10);

    // Insert user into database
    const result = await pool.query(
      'INSERT INTO users (full_name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, full_name, email, role, created_at',
      [full_name, email, password_hash, role]
    );

    // Respond with created user (excluding password hash)
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user (including optional password update)
router.put('/:id', async (req, res) => {
  const { full_name, email, role, password } = req.body;

  try {
    let query = 'UPDATE users SET full_name=$1, email=$2, role=$3';
    const values = [full_name, email, role];

    // If password is provided, hash it and include in update
    if (password) {
      const password_hash = await bcrypt.hash(password, 10);
      query += ', password_hash=$4 WHERE id=$5 RETURNING id, full_name, email, role, created_at';
      values.push(password_hash, req.params.id);
    } else {
      query += ' WHERE id=$4 RETURNING id, full_name, email, role, created_at';
      values.push(req.params.id);
    }

    const result = await pool.query(query, values);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});


// Delete user
router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM users WHERE id=$1', [req.params.id]);
  res.json({ message: 'User deleted' });
});

module.exports = router;
