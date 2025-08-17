const cloudinary = require('cloudinary').v2;

// The CLOUDINARY_URL environment variable is automatically recognized by the SDK.
// It contains your cloud_name, api_key, and api_secret.
cloudinary.config({
  secure: true, // Return https URLs by default
});

module.exports = cloudinary;
