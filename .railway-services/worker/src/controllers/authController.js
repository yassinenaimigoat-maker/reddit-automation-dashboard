const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Simple admin authentication
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'changeme123';

    if (username !== adminUsername) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // In production, hash the password in env
    const isValid = password === adminPassword;

    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { username, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { username, role: 'admin' }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verify = (req, res) => {
  res.json({ user: req.user });
};
