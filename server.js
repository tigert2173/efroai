const express = require('express');
const https = require('https');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const WebSocket = require('ws'); // Import WebSocket library

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
const MAX_ACTIVE_USERS = 5; // Set to 5 for production
const RECONNECT_TIME_LIMIT = 60 * 1000; // 1 minute

// Middleware to check active users
app.use((req, res, next) => {
    // Get the user's IP address
    const userIp = req.ip; // Use req.headers['x-forwarded-for'] for proxies
    console.log(`Request from IP: ${userIp}, Path: ${req.path}`);

    // Check if the request is for static assets (do not count as active users)
    if (['/capacity/capacity.html', '/capacity/styles.css', '/images/AtCapacityBotTransparent.png', '/images/logotransparent.png'].includes(req.path)) {
        return next();
    }

    // Clean up inactive users
    cleanupInactiveUsers();

    // Check if the user is already active
    if (activeUsers.has(userIp)) {
        const lastActiveTime = activeUsers.get(userIp);
        console.log(`User ${userIp} is already active. Last active time: ${new Date(lastActiveTime).toLocaleString()}`);
        
        // Allow access if the user is within the reconnect time limit
        if (Date.now() - lastActiveTime <= RECONNECT_TIME_LIMIT) {
            console.log(`User ${userIp} is within the reconnect grace period. Allowing access.`);
            return next(); // Allow access without redirecting
        } else {
            console.log(`User ${userIp} redirected to waitlist due to reconnect timeout.`);
            return res.redirect('/capacity/capacity.html'); // Redirect if reconnecting too late
        }
    }

    if (activeUsers.size < MAX_ACTIVE_USERS) {
        // Allow the user to proceed
        activeUsers.set(userIp, Date.now()); // Update the last active time
        console.log(`User ${userIp} added to active users. Total active users: ${activeUsers.size}`);
        next(); // Proceed to the requested page
    } else {
        // Redirect to waitlist page with 302 status
        console.log(`User ${userIp} redirected to waitlist due to user limit exceeded. Active users: ${activeUsers.size}`);
        res.redirect('/capacity/capacity.html');
    }
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'docs')));

// Serve the waitlist page
app.get('/capacity/capacity.html', (req, res) => {
    console.log(`Serving waitlist page to IP: ${req.ip}`);
    res.sendFile(path.join(__dirname, 'docs', 'capacity', 'capacity.html'), (err) => {
        if (err) {
            console.error('Error serving waitlist page:', err);
            res.status(err.status).end(); // End the response with the error status
        }
    });
});

// Example route for the main page
app.get('/', (req, res) => {
    console.log(`Serving main page to IP: ${req.ip}`);
    res.sendFile(path.join(__dirname, 'docs', 'index.html'));
});

// Cleanup inactive users based on their last active time
const cleanupInactiveUsers = () => {
    const now = Date.now();
    for (const [ip, lastActiveTime] of activeUsers) {
        if (now - lastActiveTime > RECONNECT_TIME_LIMIT) {
            console.log(`User ${ip} is inactive and will be removed from active users.`);
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
const server = https.createServer(options, app).listen(443, () => {
    console.log('HTTPS Server running on port 443');
});

// Create a WebSocket server
const wss = new WebSocket.Server({ server });

// Handle WebSocket connections
wss.on('connection', (ws, req) => {
    const userIp = req.socket.remoteAddress; // Get the user's IP address

    console.log(`WebSocket connection established for IP: ${userIp}`);
    
    // Send a ping every 10 seconds to check if the client is still connected
    const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send('ping'); // Send a ping message
        }
    }, 10000); // Ping every 10 seconds

    // Handle incoming messages from the client
    ws.on('message', (message) => {
        console.log(`Received message from ${userIp}: ${message}`);
    });

    // Handle WebSocket closure
    ws.on('close', () => {
        clearInterval(pingInterval);
        console.log(`WebSocket connection closed for IP: ${userIp}`);
    });
});
