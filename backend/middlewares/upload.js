// 📂 backend/middlewares/upload.js
const multer = require('multer');
const path = require('path');

// Configuration du stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/image_profils');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const baseName = path.basename(file.originalname, ext).replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const uniqueName = `${Date.now()}-${baseName}${ext}`;
    cb(null, uniqueName);
  }
});


// Vérification du type MIME (optionnel)
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
    cb(null, true);
  } else {
    const error = new Error('Seuls les fichiers .jpg, .jpeg et .png sont autorisés');
    console.error('Upload error:', error.message);
    cb(error, false);
  }
};


const upload = multer({ storage, fileFilter });

module.exports = upload;
