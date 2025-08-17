const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');

// @route   POST /api/upload
// @desc    Upload an image
// @access  Public (or Private, depending on your needs)
router.post('/', (req, res) => {
    upload(req, res, (err) => {
        if(err){
            res.status(400).json({ message: err });
        } else {
            if(req.file == undefined){
                res.status(400).json({ message: 'Error: No File Selected!' });
            } else {
                res.status(200).json({
                    message: 'File uploaded successfully',
                    filePath: req.file.path // The secure URL is available at req.file.path
                });
            }
        }
    });
});

module.exports = router;
