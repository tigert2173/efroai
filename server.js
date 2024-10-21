const express = require('express');
const https = require('https');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
// Use CORS middleware
app.use(cors());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'docs')));

// Read your SSL certificate and private key
const options = {
  key: fs.readFileSync('certs/private.key.pem'),
  cert: fs.readFileSync('certs/domain.cert.pem'),
};

// User tracking
let activeUsers = [];
const MAX_ACTIVE_USERS = 1;

// Middleware to check active users
app.use((req, res, next) => {
  const sessionId = req.headers['x-session-id'] || Date.now().toString();

  // Check if the user is already on the waitlist page
  if (req.path === '/waitlist.html') {
    return next(); // Allow access to the waitlist page
  }

  if (activeUsers.length < MAX_ACTIVE_USERS) {
    // Allow the user to proceed
    if (!activeUsers.includes(sessionId)) {
      activeUsers.push(sessionId);
    }
    res.setHeader('x-session-id', sessionId); // Send session ID back to the client
    next();
  } else {
    // Redirect to waitlist page
    res.redirect('/waitlist.html');
  }
});

// Serve the waitlist page
app.get('/waitlist.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'docs', 'capacity', 'capacity.html'));
});

// Example route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'docs', 'index.html'));
});

// Start the HTTPS server
https.createServer(options, app).listen(443, () => {
  console.log('HTTPS Server running on port 443');
});

// Cleanup active users on disconnect if needed
const cleanupUser = (sessionId) => {
  activeUsers = activeUsers.filter(user => user !== sessionId);
};

// Here you can implement WebSocket or other mechanisms to track user disconnects and call cleanupUser(sessionId)
