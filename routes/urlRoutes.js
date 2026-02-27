const express = require('express');
const router = express.Router();
const { shortenUrl } = require('../controllers/urlController');

// POST /api/shorten - Create a shortened URL
router.post('/shorten', shortenUrl);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

module.exports = router;
