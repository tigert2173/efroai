const express = require('express');
const https = require('https');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
// Use CORS middleware
app.use(cors());

// Disable caching for all responses
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
});

// User tracking by IP
let activeUsers = new Map();
const MAX_ACTIVE_USERS = 15; // Set to 5 for production
const RECONNECT_TIME_LIMIT = 60 * 1000; // 1 minute

// Middleware to check active users
app.use((req, res, next) => {
    // Get the user's IP address
    const userIp = req.ip; // Use req.headers['x-forwarded-for'] for proxies

    // Check if the request is for static assets (do not count as active users)
    if (['/capacity/capacity.html', '/capacity/styles.css', '/images/AtCapacityBotTransparent.png', '/images/logotransparent.png'].includes(req.path)) {
        return next();
    }

    // Clean up inactive users
    cleanupInactiveUsers();

    // Check if the user is already active
    if (activeUsers.has(userIp)) {
        const lastActiveTime = activeUsers.get(userIp);
        // Check if the user is still within the reconnect time limit
        if (Date.now() - lastActiveTime < RECONNECT_TIME_LIMIT) {
            return res.redirect('/capacity/capacity.html'); // Redirect if reconnecting too soon
        } else {
            // Remove the user if the reconnect time limit has expired
            activeUsers.delete(userIp);
        }
    }

    if (activeUsers.size < MAX_ACTIVE_USERS) {
        // Allow the user to proceed
        activeUsers.set(userIp, Date.now()); // Update the last active time
        next(); // Proceed to the requested page
    } else {
        // Redirect to waitlist page with 302 status
        res.redirect('/capacity/capacity.html');
    }
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'docs')));

// Serve the waitlist page
app.get('/capacity/capacity.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'docs', 'capacity', 'capacity.html'), (err) => {
        if (err) {
            console.error('Error serving waitlist page:', err);
            res.status(err.status).end(); // End the response with the error status
        }
    });
});

// Example route for the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'docs', 'index.html'));
});

// Cleanup inactive users based on their last active time
const cleanupInactiveUsers = () => {
    const now = Date.now();
    for (const [ip, lastActiveTime] of activeUsers) {
        if (now - lastActiveTime > RECONNECT_TIME_LIMIT) {
            activeUsers.delete(ip); // Remove inactive users
        }
    }
};

// Read your SSL certificate and private key
const options = {
    key: fs.readFileSync('certs/private.key.pem'),
    cert: fs.readFileSync('certs/domain.cert.pem'),
};

// Start the HTTPS server
https.createServer(options, app).listen(443, () => {
    console.log('HTTPS Server running on port 443');
});

// Here you can implement WebSocket or other mechanisms to track user disconnects
