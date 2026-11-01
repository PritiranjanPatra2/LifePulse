const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME || 'dv9xxdri4',
  api_key: process.env.CLOUDINARY_API_KEY || '656739487951442',
  api_secret: process.env.CLOUDINARY_SECRET_KEY || 'vSuIiKm_MnK0lfVDyAmZc5IRcl4',
});

module.exports = cloudinary;

