const express = require('express');
const router = express.Router();
const uploadPdf = require('../middlewares/uploadPdf');
const { ajoutXassida } = require('../controllers/adminController');

// Route pour ajouter un Xassida
router.post('/admin/ajouter-xassida', uploadPdf.single('pdf'), ajoutXassida);

module.exports = router;
