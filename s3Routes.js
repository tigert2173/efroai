const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');
require('dotenv').config();

const router = express.Router();

// Configure AWS SDK for IDrive e2
const s3 = new AWS.S3({
    endpoint: 'https://e3h2.ch11.idrivee2-15.com',
    accessKeyId: process.env.IDRIVE_ACCESS_KEY,
    secretAccessKey: process.env.IDRIVE_SECRET_KEY,
    s3ForcePathStyle: true, // Needed for non-AWS S3 providers
});

// Set up Multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Route to upload a file
router.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded!' });
    }

    const params = {
        Bucket: 'storagetestingbucket', // Replace with your bucket name
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
router.get('/files/:bucket', async (req, res) => {
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
router.get('/file-url/:bucket/:key', async (req, res) => {
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
router.get('/buckets', async (req, res) => {
    try {
        const response = await s3.listBuckets().promise();
        res.json(response.Buckets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
