const express = require('express');
const cors = require('cors'); // Import the cors middleware
const app = express();
const path = require('path');

// Enable CORS for all routes
app.use(cors());

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Start the server on port 80
const port = 80;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
