const express = require('express');
const router = express.Router();

// Exemple route
router.get('/', (req, res) => {
  res.send('Test route');
});

module.exports = router; // ← Important !
