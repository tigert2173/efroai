const express = require('express');
const https = require('https');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
const maxConcurrentUsers = 1; // Maximum concurrent users
let currentUsers = 0; // Track current active users
const waitlist = []; // Array to track waitlisted users

// Use CORS middleware
app.use(cors());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'docs')));

// Middleware to handle concurrent user limit
app.use((req, res, next) => {
  if (currentUsers >= maxConcurrentUsers) {
    // Redirect to waitlist page
    return res.redirect('/waitlist.html');
  }

  // Increment the current user count
  currentUsers++;
  
  // Set up a response interceptor to decrement the count on response end
  res.on('finish', () => {
    currentUsers--;
    // If there are users waiting, allow the next one in
    if (waitlist.length > 0) {
      const nextUser = waitlist.shift(); // Remove the first user from the waitlist
      nextUser(); // Allow the next user in
    }
  });
  
  next();
});

// Route for waitlist page
app.get('/waitlist.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'docs', 'waitlist.html')); // Serve the waitlist page
});

// Read your SSL certificate and private key
const options = {
  key: fs.readFileSync('certs/private.key.pem'),
  cert: fs.readFileSync('certs/domain.cert.pem'),
};

// Start the HTTPS server
https.createServer(options, app).listen(443, () => {
  console.log('HTTPS Server running on port 443');
});
