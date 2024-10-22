const express = require('express');
const https = require('https');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const WebSocket = require('ws'); // Import WebSocket library
const compression = require('compression'); // Import compression middleware
const zlib = require('zlib'); // Import zlib for custom compression levels

const app = express();
// Use CORS middleware
app.use(cors());

const blockedIps = [
  '::ffff:128.14.173.117', // /internal_forms_authentication && /identity  <<-- suspicious request 
  '::ffff:128.14.173.115',  // Path: /cf_scripts/scripts/ajax/ckeditor/ckeditor.js && Path: /Telerik.Web.UI.WebResource.axd && /static/historypage.js <<-- suspicious request 
  '::ffff:128.14.174.186', //Path: /showLogin.cc & /api/session/properties & /solr/ && /login.do <<-- suspicious request 
  '::ffff:128.14.173.116', //Path: /sugar_version.json && Path: /cgi-bin/authLogin.cgi && Path: /WebInterface/ <<-- suspicious request 
  '::ffff:128.14.173.114' //Path: /cgi-bin/config.exp && Path: /owa/ && /admin/ <<-- suspicious request 
]; 



// Add compression middleware with Brotli support
// app.use(
//   compression({
//     level: 9, // Set Gzip compression level (0-9)
//     brotli: {
//       enabled: true,
//       zlib: {
//         level: 11, // Set Brotli compression level (0-11)
//       },
//     },
//     threshold: 1024, // Minimum size in bytes to compress the response
//   })
// );
const getCompressionLevel = (req) => {
  // Define your logic here to determine compression level
  if (req.path.endsWith('.html')) {
    return 9; // Maximum compression for HTML
  } else if (req.path.endsWith('.css')) {
    return 6; // Moderate compression for CSS
  } else {
    return 9; // Fastest for JS or images
  }
};

app.use((req, res, next) => {
  const level = getCompressionLevel(req);
  // Apply compression dynamically
  compression({ level })(req, res, next);
});

// app.use((req, res, next) => {
//   // res.setHeader('Cache-Control', 'no-store');
//   // res.setHeader('Pragma', 'no-cache');
// //  res.setHeader('Expires', '0');
//   next();
// });

// Middleware to block specific IPs
app.use((req, res, next) => {
  // Get user's IP address
  
  const userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress; // Check headers or socket
  console.log(`Incoming request from IP: ${userIp}`);

  // Check if the IP is in the blocked list
  if (blockedIps.includes(userIp)) {
      console.log(`Blocked access from IP: ${userIp}`);
      return res.status(403).send('You have been IP banned for suspisous activity, if you think this is an issue reach us at: appeal@efroai.net'); // Return a 403 Forbidden response
  }
  next(); // Allow access for non-blocked IPs
});


// User tracking by IP
let activeUsers = new Map();
const waitingQueue = []; // Array to hold waiting users
const MAX_ACTIVE_USERS = 100; // Max active users
const RECONNECT_TIME_LIMIT = 5 * 60 * 1000; // 5 minutes
const TIMEOUT_LIMIT = 30 * 60 * 1000; // 30 minutes

// Middleware to check active users
app.use((req, res, next) => {
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
            activeUsers.delete(userIp);
            //return res.redirect('/capacity/capacity.html'); // Redirect if reconnecting too late
        }
    }

    if (activeUsers.size < MAX_ACTIVE_USERS) {
        // Allow the user to proceed
        activeUsers.set(userIp, Date.now()); // Update the last active time
        console.log(`User ${userIp} added to active users. Total active users: ${activeUsers.size}`);
        next(); // Proceed to the requested page
    } else {
        // Add user to waiting queue
        waitingQueue.push(userIp);
        console.log(`User ${userIp} added to the waiting queue. Waiting queue length: ${waitingQueue.length}`);
        res.redirect('/capacity/capacity.html'); // Redirect to waitlist page
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

// New endpoint to get waiting user count
app.get('/api/waiting-count', (req, res) => {
    const waitingCount = waitingQueue.length;
    res.json({ waitingCount });
});

// Cleanup inactive users based on their last active time
const cleanupInactiveUsers = () => {
    const now = Date.now();
    for (const [ip, lastActiveTime] of activeUsers) {
        if (now - lastActiveTime > TIMEOUT_LIMIT) {
            console.log(`User ${ip} is inactive and will be removed from active users.`);
            activeUsers.delete(ip); // Remove inactive users
            // If a user is removed from active, check the waiting queue
            if (waitingQueue.length > 0) {
                const nextUserIp = waitingQueue.shift(); // Get the next user in the queue
                console.log(`User ${nextUserIp} is being allowed in from the waiting queue.`);
                activeUsers.set(nextUserIp, Date.now()); // Add next user to active
                // Notify the user via WebSocket (if needed)
                // You can send a message to the user here if you have their WebSocket connection
            }
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
    
    // Send a ping every 30 seconds to check if the client is still connected
    const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send('ping'); // Send a ping message
        }
    }, 30000); // Ping every 30 seconds

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
