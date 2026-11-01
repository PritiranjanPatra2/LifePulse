const express = require('express');
const router = express.Router();
const cloudinary = require('../config/cloudinary');
const { protect } = require('../middleware/auth');
const User = require('../models/User');

router.post('/', protect, async (req, res, next) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an image in base64/data-uri format',
      });
    }

    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: 'lifepulse',
      transformation: [{ width: 500, height: 500, crop: 'limit' }],
    });

    res.status(200).json({
      success: true,
      url: uploadResponse.secure_url,
      publicId: uploadResponse.public_id,
    });
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Image upload failed',
    });
  }
});

// Route to update profile photo directly
router.post('/avatar', protect, async (req, res, next) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an avatar image',
      });
    }

    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: 'lifepulse/avatars',
      transformation: [{ width: 250, height: 250, crop: 'fill', gravity: 'face' }],
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json({
      success: true,
      avatarUrl: uploadResponse.secure_url,
      user,
    });
  } catch (err) {
    console.error('Cloudinary avatar upload error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Avatar upload failed',
    });
  }
});

module.exports = router;

