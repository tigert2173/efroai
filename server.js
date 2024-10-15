const express = require('express');
const https = require('https');
const fs = require('fs');
const cors = require('cors')
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

// Apply the middleware globally
app.use(checkSuspension);

// Start the HTTPS server
https.createServer(options, app).listen(443, () => {
  console.log('HTTPS Server running on port 443');
});
