const express = require('express');
const router = express.Router();
const HomeworkHistory = require('../models/HomeworkHistory');

// 查询作业历史记录
router.get('/history/:studentId', async (req, res) => {
  const { studentId } = req.params;

  try {
    const history = await HomeworkHistory.find({ studentId }).sort({ date: -1 });
    res.json(history);
  } catch (error) {
    console.error('获取作业历史记录时出错', error);
    res.status(500).json({ success: false, message: '获取作业历史记录失败' });
  }
});

module.exports = router;
