const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    cb(null, `${basename}-${uniqueSuffix}${ext}`);
  },
});

// File filter – allow images, PDFs, docs
const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);

  if (ext && mime) {
    return cb(null, true);
  }
  cb(new Error('Invalid file type'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
});

/**
 * Upload single file middleware
 * Usage: upload.single('file')
 */
module.exports = upload;

/**
 * Optional: Additional middleware to validate club admin rights on file uploads (used in routes)
 */
const requireClubAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ status: 'error', message: 'Unauthorized' });
  }

  const clubId = req.params.clubId || req.body.clubId;
  if (!clubId) {
    return res.status(400).json({ status: 'error', message: 'Club ID required' });
  }

  if (req.user.globalRole === 'super_admin') {
    return next();
  }

  const Membership = require('../Models/Membership');
  const membership = await Membership.findOne({
    where: { user_id: req.user.id, club_id: clubId, club_role: 'club_admin', status: 'approved' },
  });

  if (!membership) {
    return res.status(403).json({ status: 'error', message: 'Club admin access required' });
  }

  next();
};

module.exports = { upload, requireClubAdmin };
