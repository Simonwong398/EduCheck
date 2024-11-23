const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const homeworkRoutes = require('./homework');

router.use('/auth', authRoutes);
router.use('/homework', homeworkRoutes);

// 健康检查端点
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
