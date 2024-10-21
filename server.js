const express = require('express');
const https = require('https');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
const maxConcurrentUsers = 0; // Maximum concurrent users
let currentUsers = 1; // Track current active users

// Use CORS middleware
app.use(cors());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'docs')));

// Middleware to handle concurrent user limit
app.use((req, res, next) => {
  if (currentUsers >= maxConcurrentUsers) {
    // Redirect to waitlist page
    return res.redirect('/capacity/capacity.html');
  }
  
  // Increment the current user count
  currentUsers++;
  
  // Set up a response interceptor to decrement the count on response end
  res.on('finish', () => {
    currentUsers--;
  });
  
  next();
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
