import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ApiError } from '../utils/ApiError.js';

// Setup storage
const storage = multer.diskStorage({
  destination(req, file, cb) {
    try {
      // 1. Resolve role folder
      const roleFolder = req.user?.role === 'landlord' ? 'LandLords_Uploads' : 'Student_Uploads';
      
      // 2. Resolve user folder
      const userFolder = `user_${req.user?.id || 'anonymous'}`;
      
      // 3. Resolve base destination
      let destDir = path.join('Users_uploads', roleFolder, userFolder);
      
      // 4. Resolve subfolders depending on route path
      if (req.originalUrl.includes('profile-image')) {
        destDir = path.join(destDir, 'Profile_Pics');
      } else if (req.originalUrl.includes('maintenance-image')) {
        destDir = path.join(destDir, 'Maintenance_Tickets');
      } else if (req.originalUrl.includes('property-image')) {
        const propertyId = req.params.propertyId || req.query.propertyId;
        if (propertyId) {
          destDir = path.join(destDir, 'Properties', `Propertie_${propertyId}`);
        } else {
          destDir = path.join(destDir, 'Properties', 'temp');
        }
      } else if (req.originalUrl.includes('unit-image')) {
        const { propertyId, unitId } = req.params;
        if (propertyId) {
          if (unitId) {
            destDir = path.join(destDir, 'Properties', `Propertie_${propertyId}`, 'units', `Unit_${unitId}`);
          } else {
            destDir = path.join(destDir, 'Properties', `Propertie_${propertyId}`, 'units', 'temp');
          }
        } else {
          destDir = path.join(destDir, 'Properties', 'temp');
        }
      }
      
      // Ensure folder structure exists
      fs.mkdirSync(destDir, { recursive: true });
      
      cb(null, destDir);
    } catch (error) {
      cb(error);
    }
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// Check file type
function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|webp|gif|svg/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new ApiError(400, 'Images only (png, jpg, jpeg, webp, gif, svg)!'));
  }
}

export const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB limit
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});
