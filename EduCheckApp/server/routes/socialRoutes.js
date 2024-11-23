const express = require('express');
const router = express.Router();
const User = require('../models/User');
const FriendRequest = require('../models/FriendRequest');
const LearningGroup = require('../models/LearningGroup');
const authMiddleware = require('../middleware/authMiddleware');
const { body, validationResult } = require('express-validator');

// 用户搜索
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const { query } = req.query;
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    }).select('username email avatar learningProgress');
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: '用户搜索失败', error: error.message });
  }
});

// 发送好友请求
router.post('/friend-request', 
  authMiddleware,
  [
    body('targetUserId').notEmpty().withMessage('目标用户ID不能为空')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { targetUserId } = req.body;
      const senderId = req.user.id;

      // 检查是否已经是好友
      const existingFriendship = await User.findOne({
        _id: senderId,
        friends: targetUserId
      });

      if (existingFriendship) {
        return res.status(400).json({ message: '你们已经是好友' });
      }

      // 创建好友请求
      const friendRequest = new FriendRequest({
        sender: senderId,
        recipient: targetUserId,
        status: 'PENDING'
      });

      await friendRequest.save();
      res.status(201).json({ message: '好友请求已发送' });
    } catch (error) {
      res.status(500).json({ message: '发送好友请求失败', error: error.message });
    }
});

// 接受好友请求
router.post('/accept-friend-request', 
  authMiddleware,
  [
    body('requestId').notEmpty().withMessage('请求ID不能为空')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { requestId } = req.body;
      const userId = req.user.id;

      const friendRequest = await FriendRequest.findById(requestId)
        .populate('sender recipient');

      if (!friendRequest || friendRequest.recipient._id.toString() !== userId) {
        return res.status(403).json({ message: '无效的好友请求' });
      }

      // 更新用户好友列表
      await User.findByIdAndUpdate(userId, {
        $addToSet: { friends: friendRequest.sender._id }
      });

      await User.findByIdAndUpdate(friendRequest.sender._id, {
        $addToSet: { friends: userId }
      });

      // 更新好友请求状态
      friendRequest.status = 'ACCEPTED';
      await friendRequest.save();

      res.json({ message: '好友请求已接受' });
    } catch (error) {
      res.status(500).json({ message: '接受好友请求失败', error: error.message });
    }
});

// 获取好友列表
router.get('/friends', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('friends', 'username email avatar learningProgress');
    
    res.json(user.friends);
  } catch (error) {
    res.status(500).json({ message: '获取好友列表失败', error: error.message });
  }
});

// 创建学习小组
router.post('/learning-group', 
  authMiddleware,
  [
    body('name').notEmpty().withMessage('小组名称不能为空'),
    body('subject').notEmpty().withMessage('学习主题不能为空')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, subject, members = [] } = req.body;
      
      // 添加创建者为小组成员
      members.push(req.user.id);

      const learningGroup = new LearningGroup({
        name,
        subject,
        members: [...new Set(members)], // 去重
        creator: req.user.id,
        createdAt: new Date()
      });

      await learningGroup.save();
      res.status(201).json(learningGroup);
    } catch (error) {
      res.status(500).json({ message: '创建学习小组失败', error: error.message });
    }
});

// 获取学习伙伴
router.get('/learning-buddies', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // 根据学习兴趣和进度匹配学习伙伴
    const learningBuddies = await User.find({
      _id: { $ne: user._id }, // 排除当前用户
      interests: { $in: user.interests }, // 共同兴趣
      learningProgress: {
        $gte: user.learningProgress - 20, // 进度相近
        $lte: user.learningProgress + 20
      }
    }).select('username email avatar interests learningProgress');

    res.json(learningBuddies);
  } catch (error) {
    res.status(500).json({ message: '获取学习伙伴失败', error: error.message });
  }
});

module.exports = router;
