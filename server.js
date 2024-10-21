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

// Track the current number of users
let currentUsers = 0;
const maxConcurrentUsers = 30; // Set your maximum concurrent users

// Middleware to track user sessions
app.use((req, res, next) => {
  // Increment user count
  currentUsers++;

  // Check if current users exceed max concurrent users
  if (currentUsers > maxConcurrentUsers) {
    console.log('User limit reached, redirecting to waitlist...'); // Log when user limit is reached
    currentUsers--; // Decrement count before redirecting
    return res.redirect('/capacity/capacity.html'); // Redirect to the waitlist page
  }

  // Proceed to the next middleware/route handler
  next();

  // Decrement user count when the session ends
  res.on('finish', () => {
    currentUsers--;
  });
});

// Example route for your main application (e.g., home page)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'docs', 'index.html')); // Serve your main application page
});

// Start the HTTPS server
https.createServer(options, app).listen(443, () => {
  console.log('HTTPS Server running on port 443');
});
