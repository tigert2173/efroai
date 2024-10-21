const express = require('express');
const https = require('https');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
const maxConcurrentUsers = 1; // Maximum concurrent users
let currentUsers = 0; // Track current active users

// Use CORS middleware
app.use(cors());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'docs')));

// Middleware to check user count before serving any page
const checkUserCount = (req, res, next) => {
  console.log(`Current users: ${currentUsers}`); // Log current user count

  if (currentUsers >= maxConcurrentUsers) {
    console.log('User limit reached, redirecting to waitlist...'); // Log when user limit is reached
    // Redirect to waitlist page
    return res.redirect('/capacity/capacity.html');
  }

  // Increment the current user count
  currentUsers++;
  console.log(`User added. New count: ${currentUsers}`); // Log new user count

  // Add a custom header to track user sessions
  res.setHeader('X-User-Session', currentUsers);

  // Store the session information (this is optional, just for reference)
  req.sessionId = currentUsers; // Use the current user count as a session ID

  // Set up a response interceptor to handle closing sessions
  res.on('finish', () => {
    // Here, we will decrement the count
    currentUsers--; // Decrement the count when the response is finished
    console.log(`User session closed. New count: ${currentUsers}`); // Log when a session is closed
  });

  next();
};

// Apply the middleware to the routes that need user count checks
app.get('/', checkUserCount, (req, res) => {
  res.sendFile(path.join(__dirname, 'docs', 'index.html')); // Serve the main application page
});

// Route for waitlist page
app.get('/capacity/capacity.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'docs', 'capacity/capacity.html')); // Serve the waitlist page
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

// Endpoint to close session (this should be called when a user closes the session)
app.post('/close-session', (req, res) => {
  currentUsers--;
  console.log(`User session closed. New count: ${currentUsers}`); // Log when a session is closed
  res.sendStatus(200); // Respond with success
});
