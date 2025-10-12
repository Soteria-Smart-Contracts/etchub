
const express = require('express');
const router = express.Router();

let allowedIps = []; // In-memory store for allowed IPs

// Middleware for IP whitelisting
const ipWhitelist = (req, res, next) => {
    const clientIp = req.ip;
    if (allowedIps.includes(clientIp)) {
        next();
    } else {
        res.status(403).send('Forbidden: IP not whitelisted');
    }
};

// Endpoint for requesting access
router.post('/request-access', (req, res) => {
    const { username } = req.body;
    const clientIp = req.ip;
    console.log(`Access request from ${username} at IP: ${clientIp}`);
    res.send('Access request submitted. An admin will review it.');
});

// Endpoint for approving IPs (for admin use)
router.post('/approve-ip', (req, res) => {
    const { ip } = req.body;
    if (ip && !allowedIps.includes(ip)) {
        allowedIps.push(ip);
        console.log(`IP ${ip} has been whitelisted.`);
        res.send(`IP ${ip} has been whitelisted.`);
    } else {
        res.status(400).send('Invalid or duplicate IP.');
    }
});

// Example of a protected route
router.get('/dashboard', ipWhitelist, (req, res) => {
    res.send('Welcome to the admin dashboard');
});

module.exports = { router, ipWhitelist };
