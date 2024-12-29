require('dotenv').config();
const AWS = require('aws-sdk');
const express = require('express');
const bodyParser = require('body-parser');
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

// Express setup
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Upload image to bucket
app.post('/upload/:user/:characterid/:imagename', async (req, res) => {
    const { user, characterid, imagename } = req.params;
    const fileContent = req.body.file; // Expecting base64-encoded image content

    if (!fileContent) {
        return res.status(400).json({ error: 'File content is required' });
    }

    const key = `${user}/${characterid}/${imagename}`;

    try {
        const params = {
            Bucket: BUCKET_NAME,
            Key: key,
            Body: Buffer.from(fileContent, 'base64'),
            ContentType: 'image/jpeg', // Adjust based on your image type
            ACL: 'public-read', // Make the file publicly readable
        };

        await s3.upload(params).promise();
        const fileUrl = `${IDRIVE_E2_ENDPOINT}/${BUCKET_NAME}/${key}`;

        res.json({ message: 'File uploaded successfully', url: fileUrl });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: 'Failed to upload file' });
    }
});

// Retrieve image from bucket
app.get('/:user/:characterid/:imagename', async (req, res) => {
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

// List contents of the bucket
app.get('/list', async (req, res) => {
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

const path = require('path');

// Serve the test webpage
app.use(express.static(path.join(__dirname, 'public')));

// Start server
const PORT = 3001; // Adjust the port if needed
app.listen(PORT, () => {
    console.log(`Bucket storage server running on port ${PORT}`);
});

module.exports = app;
