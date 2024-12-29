require('dotenv').config();
const AWS = require('aws-sdk');
const express = require('express');

// Serve the static webpage from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

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

// List contents of the bucket
router.get('/list', async (req, res) => {
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

module.exports = router;
