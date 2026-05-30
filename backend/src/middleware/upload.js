const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload folder exists securely
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Sanitize filename to prevent directory traversal attacks
    const sanitizedExt = path.extname(file.originalname).toLowerCase().replace(/[^.a-z0-9]/g, '');
    const sanitizedBase = path.basename(file.originalname, sanitizedExt)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_');
      
    // Generate secure timestamped filename
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1E9)}`;
    cb(null, `${sanitizedBase}_${uniqueSuffix}${sanitizedExt}`);
  }
});

// Multer Filter Configuration
const fileFilter = (req, file, cb) => {
  // Enforce rigid extension and MIME type policies to block execution scripts (.js, .exe, .sh)
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf'];
  
  const fileExt = path.extname(file.originalname).toLowerCase();
  
  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(fileExt)) {
    cb(null, true);
  } else {
    cb(new Error('Secure Access Block: Only JPEG, PNG images and PDF documents are allowed!'), false);
  }
};

// Main Upload Middleware instance (Max 5MB file limit)
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 Megabytes max
  }
});

module.exports = upload;
