const express = require('express');
const router = express.Router();
const User = require('../models/User');
const DailyTask = require('../models/DailyTask');
const Achievement = require('../models/Achievement');
const authMiddleware = require('../middleware/authMiddleware');

// 获取每日任务
router.get('/daily-tasks', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 获取今日任务
    const dailyTasks = await DailyTask.find({
      $or: [
        { assignedTo: userId },
        { assignedTo: null } // 通用任务
      ],
      difficulty: { $lte: req.user.learningLevel } // 根据用户学习水平推荐任务
    });

    // 标记已完成的任务
    const completedTasks = await DailyTask.find({
      _id: { $in: dailyTasks.map(task => task._id) },
      completedBy: userId,
      completedAt: { $gte: today }
    });

    const tasksWithCompletion = dailyTasks.map(task => ({
      ...task.toObject(),
      completed: completedTasks.some(
        completed => completed._id.toString() === task._id.toString()
      )
    }));

    res.json(tasksWithCompletion);
  } catch (error) {
    res.status(500).json({ message: '获取每日任务失败', error: error.message });
  }
});

// 完成任务
router.post('/complete-task', authMiddleware, async (req, res) => {
  try {
    const { taskId } = req.body;
    const userId = req.user.id;

    const task = await DailyTask.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: '任务不存在' });
    }

    // 检查任务是否已完成
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingCompletion = await DailyTask.findOne({
      _id: taskId,
      completedBy: userId,
      completedAt: { $gte: today }
    });

    if (existingCompletion) {
      return res.status(400).json({ message: '任务已完成' });
    }

    // 更新任务完成状态
    task.completedBy.push(userId);
    task.completedAt = new Date();
    await task.save();

    // 更新用户积分和成就
    const user = await User.findById(userId);
    user.points += task.points;
    
    // 检查是否解锁新成就
    const unlockedAchievements = await checkAchievements(user);

    await user.save();

    res.json({
      message: '任务完成',
      points: task.points,
      unlockedAchievements
    });
  } catch (error) {
    res.status(500).json({ message: '完成任务失败', error: error.message });
  }
});

// 检查并解锁成就
async function checkAchievements(user) {
  const unlockedAchievements = [];
  
  // 获取所有未解锁的成就
  const achievements = await Achievement.find({
    'condition.type': 'POINTS',
    'condition.threshold': { $lte: user.points },
    '_id': { $nin: user.achievements }
  });

  for (const achievement of achievements) {
    unlockedAchievements.push(achievement);
    user.achievements.push(achievement._id);
  }

  return unlockedAchievements;
}

// 获取用户成就
router.get('/achievements', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('achievements');
    
    res.json(user.achievements);
  } catch (error) {
    res.status(500).json({ message: '获取成就失败', error: error.message });
  }
});

// 排行榜
router.get('/leaderboard', authMiddleware, async (req, res) => {
  try {
    const leaderboard = await User.find()
      .sort({ points: -1 })
      .select('username avatar points')
      .limit(50);
    
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: '获取排行榜失败', error: error.message });
  }
});

module.exports = router;
