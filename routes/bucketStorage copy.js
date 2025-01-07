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

// Configure AWS SDK for iDrive E2
const s3 = new AWS.S3({
    endpoint: IDRIVE_E2_ENDPOINT,
    accessKeyId: IDRIVE_E2_ACCESS_KEY,
    secretAccessKey: IDRIVE_E2_SECRET_KEY,
    s3ForcePathStyle: true, // Necessary for iDrive E2
});

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage(); // Store file in memory (can use diskStorage if needed)
const upload = multer({ storage: storage, limits: { fileSize: 10 * 1024 * 1024 } }); // Max 10MB file size

// Serve the test webpage for /bucket/list
router.get('/list', (req, res) => {
    res.sendFile('hub.html', { root: './public' });
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

// Upload an image for a user and character with automatic numbering
router.post('/:user/:characterid/upload', upload.single('image'), async (req, res) => {
    const { user, characterid } = req.params;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        // List files for this user and character
        const params = {
            Bucket: BUCKET_NAME,
            Prefix: `${user}/${characterid}/`,
        };

        const data = await s3.listObjectsV2(params).promise();

        // Find the highest numbered image for the character
        const imageFiles = data.Contents.filter(item => item.Key.endsWith('.jpg') || item.Key.endsWith('.png'));
        let highestNumber = 0;

        imageFiles.forEach(file => {
            const match = file.Key.match(/(\d+)\.(jpg|png)$/); // Match file names like 1.jpg, 2.png, etc.
            if (match) {
                const number = parseInt(match[1]);
                if (number > highestNumber) {
                    highestNumber = number;
                }
            }
        });

        // Set the next number
        const nextNumber = highestNumber + 1;
        const fileExtension = path.extname(file.originalname);
        const key = `${user}/${characterid}/${nextNumber}${fileExtension}`;

        // Upload the new image
        const uploadParams = {
            Bucket: BUCKET_NAME,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'public-read', // Make file publicly accessible (adjust as needed)
        };

        const uploadResult = await s3.upload(uploadParams).promise();

        res.status(200).json({
            message: 'File uploaded successfully',
            file: uploadResult,
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: 'Failed to upload file' });
    }
});

// Remove an image for a user and character
router.delete('/:user/:characterid/:imagename', async (req, res) => {
    const { user, characterid, imagename } = req.params;
    const key = `${user}/${characterid}/${imagename}`;

    try {
        // Delete the image from the bucket
        const params = {
            Bucket: BUCKET_NAME,
            Key: key,
        };

        await s3.deleteObject(params).promise();
        res.status(200).json({ message: `Image ${imagename} deleted successfully` });
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({ error: `Failed to delete image ${imagename}` });
    }
});

module.exports = router;
