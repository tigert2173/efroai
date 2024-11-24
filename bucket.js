const https = require('https');
const fs = require('fs');
const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
require('dotenv').config();
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Load SSL certificates
const sslOptions = {
    key: fs.readFileSync('certs/private.key.pem'), // Path to your private key
    cert: fs.readFileSync('certs/domain.cert.pem'), // Path to your certificate
};

// Enable CORS for all routes
app.use(cors());

// Allow all origins with custom headers and methods
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE'); // Include all methods
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Include common headers
    next();
});
// // List of allowed domains from .env
// const allowedDomains = process.env.ALLOWED_DOMAINS.split(',');

// // Dynamic CORS handling
// app.use((req, res, next) => {
//     const origin = req.headers.origin;
//     if (allowedDomains.includes(origin)) {
//         res.setHeader('Access-Control-Allow-Origin', origin);
//     }
//     res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT');
//     res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
//     next();
// });

// Configure AWS SDK for IDrive e2 using environment variables
const s3 = new AWS.S3({
    endpoint: process.env.AWS_ENDPOINT,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    s3ForcePathStyle: true, // Needed for non-AWS S3 providers
});

// Set up Multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Route to upload a file
app.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded!' });
    }

    const params = {
        Bucket: process.env.IMG_S3_BUCKET_NAME, // Bucket name from .env
        Key: req.file.originalname, // File name in S3
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
    };

    try {
        const data = await s3.upload(params).promise();
        res.json({ message: 'File uploaded successfully!', data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to list files in a bucket
app.get('/files/:bucket', async (req, res) => {
    const bucketName = req.params.bucket;

    const params = {
        Bucket: bucketName,
    };

    try {
        const response = await s3.listObjectsV2(params).promise();
        const files = response.Contents.map((file) => ({
            key: file.Key,
            size: file.Size,
            lastModified: file.LastModified,
        }));
        res.json(files);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to generate a pre-signed URL for a file
app.get('/file-url/:bucket/:key', async (req, res) => {
    const { bucket, key } = req.params;

    const params = {
        Bucket: bucket,
        Key: key,
        Expires: 60 * 5, // URL expiration time (5 minutes)
    };

    try {
        const url = s3.getSignedUrl('getObject', params);
        res.json({ url });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to list buckets
app.get('/buckets', async (req, res) => {
    try {
        const response = await s3.listBuckets().promise();
        res.json(response.Buckets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to save user chats
app.post('/save-chat', express.json(), async (req, res) => {
    const { userId, chat } = req.body;

    if (!userId || !chat) {
        return res.status(400).json({ error: 'Missing userId or chat data!' });
    }

    const timestamp = Date.now();
    const fileName = `${userId}/${timestamp}.json`; // Organize chats by user and timestamp

    const params = {
        Bucket: process.env.S3_BUCKET_NAME || 'efai-savedchats', // Use bucket name from .env or default
        Key: fileName, // Unique file name in the bucket
        Body: JSON.stringify(chat, null, 2), // Convert chat object to JSON
        ContentType: 'application/json', // Set content type
    };

    try {
        const data = await s3.upload(params).promise();
        res.json({ message: 'Chat saved successfully!', data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Serve your HTML page
app.use(express.static('public'));

// Create HTTPS server
https.createServer(sslOptions, app).listen(PORT, () => {
    console.log(`Server running securely on https://localhost:${PORT}`);
});