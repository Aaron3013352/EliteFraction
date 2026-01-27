

const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();
const pool = require('../models/db'); // your database pool

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Compare plain-text password with stored hashed password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // If password matches, return success and user data
    res.json({ success: true, user });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
