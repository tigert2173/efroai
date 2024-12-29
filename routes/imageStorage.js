require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');

// Configure iDrive instance using .env variables
const iDriveConfig = {
  host: process.env.IDRIVE_HOST, // iDrive endpoint from .env
  accessKey: process.env.IDRIVE_ACCESS_KEY, // Access key from .env
  secretKey: process.env.IDRIVE_SECRET_KEY, // Secret key from .env
};
const bucketName = process.env.BUCKET_NAME; // Bucket name from .env

const iDrive = new IDrive(iDriveConfig);
const router = express.Router();

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Upload an image to the bucket
router.post('/:user/:characterid/:imageId', upload.single('image'), async (req, res) => {
  const { user, characterid, imageId } = req.params;

  if (!req.file) {
    return res.status(400).send('No image file uploaded');
  }

  try {
    // Build the path
    const imagePath = `${user}/${characterid}/${imageId}${path.extname(req.file.originalname)}`;

    // Upload the image to iDrive bucket
    await iDrive.putObject({
      Bucket: bucketName,
      Key: imagePath,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    });

    res.status(200).send(`Image uploaded successfully to ${imagePath}`);
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).send('Error uploading image');
  }
});

module.exports = router;
