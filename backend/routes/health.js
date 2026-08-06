const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Cab Booking Portal API is operational'
  });
});

module.exports = router;