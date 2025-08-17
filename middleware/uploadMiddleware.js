const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../utils/cloudinary');
const path = require('path');

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'media', // The name of the folder in your Cloudinary account
    format: async (req, file) => {
        const ext = path.extname(file.originalname).substring(1);
        return ['png', 'jpg', 'jpeg', 'gif'].includes(ext) ? ext : 'png';
    }, // supports promises as well
    public_id: (req, file) => 'image-' + Date.now(), // Creates a unique public_id
  },
});

// Initialize upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
    fileFilter: function(req, file, cb){
        checkFileType(file, cb);
    }
}).single('image'); // 'image' is the field name for the uploaded file

// Check file type
function checkFileType(file, cb){
    // Allowed extensions
    const filetypes = /jpeg|jpg|png|gif/;
    // Check extension
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime type
    const mimetype = filetypes.test(file.mimetype);

    if(mimetype && extname){
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
}

module.exports = upload;
