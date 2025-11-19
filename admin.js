
const express = require('express');
const router = express.Router();

// For now, all admin routes are open

// Endpoint for requesting access (now open to everyone)
router.post('/request-access', (req, res) => {
    const { username } = req.body;
    const clientIp = req.ip;
    console.log(`Access request from ${username} at IP: ${clientIp}`);
    res.send('Access request submitted. An admin will review it.');
});

// Endpoint for approving IPs (now open to everyone)
router.post('/approve-ip', (req, res) => {
    const { ip } = req.body;
    console.log(`IP ${ip} has been approved for access.`);
    res.send(`IP ${ip} has been approved.`);
});

// Admin dashboard (open to everyone)
router.get('/dashboard', (req, res) => {
    res.send('Welcome to the admin dashboard');
});

module.exports = { router };
