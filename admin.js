
const express = require('express');
const router = express.Router();

// For now, all admin routes are open

// Admin dashboard (open to everyone)
router.get('/dashboard', (req, res) => {
    res.send('Welcome to the admin dashboard');
});

module.exports = { router };
