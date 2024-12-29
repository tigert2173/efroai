require('dotenv').config();
const AWS = require('aws-sdk');
const express = require('express');
const multer = require('multer');
const path = require('path');

// Load environment variables
const {
    IDRIVE_E2_ACCESS_KEY,
    IDRIVE_E2_SECRET_KEY,
    IDRIVE_E2_ENDPOINT,
    BUCKET_NAME,
} = process.env;

// Configure AWS SDK for iDrive e2
const s3 = new AWS.S3({
    endpoint: IDRIVE_E2_ENDPOINT,
    accessKeyId: IDRIVE_E2_ACCESS_KEY,
    secretAccessKey: IDRIVE_E2_SECRET_KEY,
    s3ForcePathStyle: true, // Necessary for iDrive e2
});

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage(); // Store file in memory (can use diskStorage if needed)
const upload = multer({ storage: storage, limits: { fileSize: 10 * 1024 * 1024 } }); // Max 10MB file size

// Serve the test webpage for /bucket/list
router.get('/list', (req, res) => {
    res.sendFile('index.html', { root: './public' });
});

// Serve the test webpage for /bucket/list
router.get('/list/upload', (req, res) => {
    res.sendFile('upload.html', { root: './public' });
});

// List contents of the bucket
router.get('/list/files', async (req, res) => {
    try {
        const params = {
            Bucket: BUCKET_NAME,
        };

        const data = await s3.listObjectsV2(params).promise();
        const files = data.Contents.map(item => ({
            key: item.Key,
            lastModified: item.LastModified,
            size: item.Size,
        }));

        res.json(files);
    } catch (error) {
        console.error('Error listing bucket contents:', error);
        res.status(500).json({ error: 'Failed to list bucket contents' });
    }
});

// Retrieve an image from the bucket
router.get('/:user/:characterid/:imagename', async (req, res) => {
    const { user, characterid, imagename } = req.params;
    const key = `${user}/${characterid}/${imagename}`;

    try {
        const params = {
            Bucket: BUCKET_NAME,
            Key: key,
        };

        const file = await s3.getObject(params).promise();
        res.setHeader('Content-Type', file.ContentType);
        res.send(file.Body);
    } catch (error) {
        console.error('Error retrieving file:', error);
        res.status(404).json({ error: 'File not found' });
    }
});

// Upload an image for a user and character
router.post('/:user/:characterid/upload', upload.single('image'), async (req, res) => {
    const { user, characterid } = req.params;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const key = `${user}/${characterid}/${file.originalname}`;

    const params = {
        Bucket: BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read', // Make file publicly accessible (adjust as needed)
    };

    try {
        const uploadResult = await s3.upload(params).promise();
        res.status(200).json({
            message: 'File uploaded successfully',
            file: uploadResult,
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: 'Failed to upload file' });
    }
});

module.exports = router;
