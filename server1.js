  const express = require('express');
  const https = require('https');
  const fs = require('fs');
  const cors = require('cors');
  const path = require('path');
  const WebSocket = require('ws'); // Import WebSocket library
  const compression = require('compression'); // Import compression middleware

  const app = express();
  // Use CORS middleware
  app.use(cors());

  const blockedIps = [
    '128.14.173.117', // /internal_forms_authentication && /identity  <<-- suspicious request 
    '128.14.173.115',  // Path: /cf_scripts/scripts/ajax/ckeditor/ckeditor.js && Path: /Telerik.Web.UI.WebResource.axd && /static/historypage.js <<-- suspicious request 
    '128.14.174.186', //Path: /showLogin.cc & /api/session/properties & /solr/ && /login.do <<-- suspicious request 
    '128.14.173.116', //Path: /sugar_version.json && Path: /cgi-bin/authLogin.cgi && Path: /WebInterface/ <<-- suspicious request 
    '128.14.173.114', //Path: /cgi-bin/config.exp && Path: /owa/ && /admin/ <<-- suspicious request 
    '::ffff:159.203.92.168', //requested /.env
    '::ffff:87.120.126.202', //requested /php_profiler
    '149.88.23.77', // //wp1/wp-includes/wlwmanifest.xml
    '::ffff:47.88.94.161', //Path: /static/admin/javascript/hetong.js

    '159.203.92.168', //requested /.env
    '::ffff:92.255.57.58', //accessing directly
    '45.148.10.206', //requested /.env
    '85.31.47.61', //port scanning
    '::ffff:78.153.140.224', //crm/.env /cron/.env /cronlab/.env /css/.env /custom/.env /docker.env
    '::ffff:78.153.140.223', // /.env
    '204.110.223.51', // SchoScure
    '::ffff:147.182.196.136' // /.env
]; 


// // Middleware to make URLs case-insensitive
// app.use((req, res, next) => {
//   req.url = req.url.toLowerCase();
//   next();
// });

// Middleware to make /efrotales and subdirectories case-insensitive
app.use((req, res, next) => {
    // Check if the request path, in lowercase, starts with '/efrotales'
    if (req.path.toLowerCase().startsWith('/efrotales')) {
        // Serve files from the 'EFROTales' directory without changing the URL
        const filePath = path.join(__dirname, 'docs', 'EFROTales', req.path.slice('/efrotales'.length));
        res.sendFile(filePath, (err) => {
            if (err) {
                next(); // If there's an error, proceed to next middleware/404 handler
            }
        });
    } else {
        next(); // Not a /efrotales request, continue with other routes
    }
});

// Optional: Define a fallback route for requests to /EFROTales or /efrotales root path
app.get(['/EFROTales', '/efrotales'], (req, res) => {
    res.sendFile(path.join(__dirname, 'docs', 'EFROTales', 'hub.html'));
});

  // Use compression middleware with Brotli support
app.use(compression({
  // Custom options for Brotli compression
  level: 1, // Compression level (0-11), 11 is maximum
}));

  //Add compression middleware with Brotli support
  // app.use((req, res, next) => {
  //   // res.setHeader('Cache-Control', 'no-store');
  //   // res.setHeader('Pragma', 'no-cache');
  // //  res.setHeader('Expires', '0');
  //   next();
  // });

  // Middleware to block specific IPs
  app.use((req, res, next) => {
    // Get user's IP address
    
    //const userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress; // Check headers or socket
    const forwarded = req.headers['cf-connecting-ip'];
    const userIp = forwarded || req.connection.remoteAddress;

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
  const MAX_ACTIVE_USERS = 120; // Max active users
  const RECONNECT_TIME_LIMIT = 5 * 60 * 1000; // 5 minutes
  const TIMEOUT_LIMIT = 30 * 60 * 1000; // 30 minutes

  // Middleware to check active users
  app.use((req, res, next) => {
    const forwarded = req.headers['cf-connecting-ip'];
    const userIp = forwarded || req.connection.remoteAddress;
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

  // Function to determine if a request is for an external source
const isExternalRequest = (path) => {
  // Define external sources (you can adjust this based on your requirements)
  const externalSources = [
      /^https?:\/\//, // Matches any URL starting with http or https
  ];
  return externalSources.some(regex => regex.test(path));
};


// Serve static files from the public directory with caching headers
app.use(express.static(path.join(__dirname, 'docs'), {
  setHeaders: (res, path) => {

    // res.setHeader('Cache-Control', 'no-store');
    // res.setHeader('Pragma', 'no-cache');
    // res.setHeader('Expires', '0');

      // Do not cache external requests
      if (isExternalRequest(path)) {
          return; // Skip setting headers for external requests
      }
    //   Set Cache-Control and Expires headers for caching
    //   res.setHeader('Cache-Control', 'public, max-age=604800000'); // Cache for 1 week
    //   res.setHeader('Expires', new Date(Date.now() + 604800000).toUTCString()); // Expires in 1 week
    res.setHeader('Cache-Control', 'public, max-age=60'); // Cache for 5 minutes
    res.setHeader('Expires', new Date(Date.now() + 60000).toUTCString()); // Expires in 5 minutes    
  }
}));


  // // Serve static files from the public directory
  // app.use(express.static(path.join(__dirname, 'docs')));

  // Serve the waitlist page
  app.get('/capacity/capacity.html', (req, res) => {
      console.log(`Serving waitlist page to IP: ${userIp}`);
      res.sendFile(path.join(__dirname, 'docs', 'capacity', 'capacity.html'), (err) => {
          if (err) {
              console.error('Error serving waitlist page:', err);
              res.status(err.status).end(); // End the response with the error status
          }
      });
  });

  // Example route for the main page
  app.get('/', (req, res) => {
      console.log(`Serving main page to IP: ${userIp}`);
      res.sendFile(path.join(__dirname, 'docs', 'hub.html'));
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
     // const userIp = req.socket.remoteAddress; // Get the user's IP address
     const forwarded = req.headers['cf-connecting-ip'];
     const userIp = forwarded || req.connection.remoteAddress;
     
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
