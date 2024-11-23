const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const Task = require('../models/Task');
const AIService = require('../services/AIService'); // 假设有一个AI服务进行错误分析

router.post('/analyze', async (req, res) => {
  const { studentId, homework } = req.body;

  try {
    const analysis = await AIService.analyzeErrors(homework);
    const feedback = new Feedback({
      studentId,
      date: new Date(),
      feedback: analysis.feedback,
      suggestions: analysis.suggestions
    });
    await feedback.save();

    const tasks = analysis.suggestions.map(suggestion => ({
      studentId,
      date: new Date(),
      task: suggestion.task
    }));
    await Task.insertMany(tasks);

    res.json({ success: true });
  } catch (error) {
    console.error('错误分析时出错', error);
    res.status(500).json({ success: false, message: '错误分析失败' });
  }
});

module.exports = router;
