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

// Upload an image for a user and character with automatic numbering
// Upload an image for a user and character, replacing if it already exists
router.post('/:user/:characterid/upload', upload.single('image'), async (req, res) => {
    const { user, characterid } = req.params;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        const params = {
            Bucket: BUCKET_NAME,
            Prefix: `${user}/${characterid}/`,
        };

        const data = await s3.listObjectsV2(params).promise();
        const imageFiles = data.Contents.filter(item => item.Key.endsWith('.jpg') || item.Key.endsWith('.png'));
        let highestNumber = 0;
        let existingImageKey = null;

        // Find the highest numbered image for the character and check if any existing image should be replaced
        imageFiles.forEach(file => {
            const match = file.Key.match(/(\d+)\.(jpg|png)$/);
            if (match) {
                const number = parseInt(match[1]);
                if (number > highestNumber) {
                    highestNumber = number;
                }
                if (file.Key.includes(req.file.originalname)) { // Check if a file with same name exists
                    existingImageKey = file.Key; // Set key to delete old image
                }
            }
        });

        const nextNumber = highestNumber + 1;
        const fileExtension = path.extname(file.originalname);
        const key = `${user}/${characterid}/${nextNumber}${fileExtension}`;

        // If the image exists already, delete it before uploading the new one
        if (existingImageKey) {
            const deleteParams = {
                Bucket: BUCKET_NAME,
                Key: existingImageKey,
            };
            await s3.deleteObject(deleteParams).promise();
        }

        // Upload the new image
        const uploadParams = {
            Bucket: BUCKET_NAME,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'public-read',
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
        // Check if the image exists before attempting to delete
        const params = {
            Bucket: BUCKET_NAME,
            Key: key,
        };

        const fileExists = await s3.headObject(params).promise().catch(() => false);

        if (!fileExists) {
            return res.status(404).json({ error: 'Image not found' });
        }

        // Delete the image from the bucket
        await s3.deleteObject(params).promise();
        res.status(200).json({ message: `Image ${imagename} deleted successfully` });
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({ error: `Failed to delete image ${imagename}` });
    }
});


// Retrieve a list of all uploaded images for a user and character (slots 1-10)
router.get('/:user/:characterid/images', async (req, res) => {
    const { user, characterid } = req.params;
    const params = {
        Bucket: BUCKET_NAME,
        Prefix: `${user}/${characterid}/`,
    };

    try {
        const data = await s3.listObjectsV2(params).promise();

        // Filter the images by slot numbers
        const imageFiles = data.Contents.filter(item => {
            const match = item.Key.match(/(\d+)\.(jpg|png)$/);
            return match && parseInt(match[1]) <= 10;
        });

        // Sort files by the number in the file name (slot number)
        const sortedFiles = imageFiles.sort((a, b) => {
            const numA = parseInt(a.Key.match(/(\d+)\./)[1]);
            const numB = parseInt(b.Key.match(/(\d+)\./)[1]);
            return numA - numB;
        });

        res.json(sortedFiles.map(file => ({
            slot: parseInt(file.Key.match(/(\d+)\./)[1]),
            url: `/bucket/${user}/${characterid}/${file.Key.split('/')[2]}`,
        })));
    } catch (error) {
        console.error('Error retrieving images:', error);
        res.status(500).json({ error: 'Failed to retrieve images' });
    }
});

module.exports = router;
