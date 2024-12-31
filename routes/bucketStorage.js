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
    res.sendFile('index.html', { root: './public' });
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

// Upload or Replace an image in a slot (1-10)
router.post('/:user/:characterid/upload', upload.single('image'), async (req, res) => {
    const { user, characterid } = req.params;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const slotNumber = req.body.slotNumber; // The slot to replace, should be from 1 to 10

    if (slotNumber < 1 || slotNumber > 10) {
        return res.status(400).json({ error: 'Slot number must be between 1 and 10' });
    }

    try {
        const fileExtension = path.extname(file.originalname);
        const key = `${user}/${characterid}/${slotNumber}${fileExtension}`;

        // Upload or replace the image
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

// Retrieve the images in slots 1 to 10
router.get('/:user/:characterid/slots', async (req, res) => {
    const { user, characterid } = req.params;
    const slotImages = [];

    try {
        for (let slot = 1; slot <= 10; slot++) {
            const key = `${user}/${characterid}/${slot}.jpg`; // Or .png based on your requirements

            try {
                const params = { Bucket: BUCKET_NAME, Key: key };
                const file = await s3.getObject(params).promise();
                const imageUrl = `https://s3.amazonaws.com/${BUCKET_NAME}/${key}`;
                slotImages.push({ slot, imageUrl });
            } catch (error) {
                // If image not found, skip the slot
                slotImages.push({ slot, imageUrl: null });
            }
        }

        res.status(200).json(slotImages); // Return the list of images in slots
    } catch (error) {
        console.error('Error retrieving slot images:', error);
        res.status(500).json({ error: 'Failed to retrieve slot images' });
    }
});

module.exports = router;
