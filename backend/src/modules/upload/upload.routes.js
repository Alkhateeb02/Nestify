import express from 'express';
import { protect } from '../../middlewares/auth.middleware.js';
import { upload } from '../../middlewares/upload.middleware.js';

const router = express.Router();

// Protect all upload routes to ensure req.user exists
router.use(protect);

// 1. Profile Picture upload
router.post('/profile-image', upload.single('profile_image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  const filePath = req.file.path.replace(/\\/g, '/');
  res.status(200).json({
    success: true,
    message: 'Profile picture uploaded successfully',
    filePath,
  });
});

// 2. Property Picture upload (propertyId is optional for new listings)
router.post('/property-image/:propertyId?', upload.single('properties_image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  const filePath = req.file.path.replace(/\\/g, '/');
  res.status(200).json({
    success: true,
    message: 'Property image uploaded successfully',
    filePath,
  });
});

// 3. Unit Picture upload (propertyId is required, unitId is optional for new units)
router.post('/unit-image/:propertyId/:unitId?', upload.single('units_image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  const filePath = req.file.path.replace(/\\/g, '/');
  res.status(200).json({
    success: true,
    message: 'Unit image uploaded successfully',
    filePath,
  });
});

// 4. Maintenance Ticket Image upload
router.post('/maintenance-image', upload.single('maintenance_image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  const filePath = req.file.path.replace(/\\/g, '/');
  res.status(200).json({
    success: true,
    message: 'Maintenance image uploaded successfully',
    filePath,
  });
});

export default router;
