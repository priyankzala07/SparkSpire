const express = require('express')
const {protect , admin }=require('../Middleware/Auth.middleware')
const router = express.Router()
const { GetAllEvents, GetEventById , CreateEvent , DeleteEvent , UpdateEvent } = require('../Controllers/Event.controller')
const multer = require('multer');
const cloudinary = require('../config/cloudinary');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
})

router.post('/upload-image', protect, admin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' });
    }

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: 'eventora/events', resource_type: 'image' },
        (error, result) => (error ? reject(error) : resolve(result))
      ).end(req.file.buffer);
    });

    res.json({ image: result.secure_url, publicId: result.public_id });
  } catch (error) {
  console.error('Cloudinary upload error:', error);
  res.status(500).json({
    message: 'Image upload failed',
    error: error.message,
  });
}
});
router.get('/', GetAllEvents);

router.get('/:id', GetEventById);

router.post('/', protect, admin, CreateEvent);

router.put('/:id', protect, admin, UpdateEvent);

router.delete('/:id', protect, admin, DeleteEvent);

module.exports = router 