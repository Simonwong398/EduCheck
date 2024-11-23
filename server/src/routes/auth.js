const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// 注册新用户
router.post('/register',
  [
    body('name').trim().notEmpty().withMessage('姓名不能为空'),
    body('email').isEmail().withMessage('邮箱格式不正确'),
    body('password').isLength({ min: 6 }).withMessage('密码至少6个字符'),
    body('role').isIn(['teacher', 'parent']).withMessage('角色无效')
  ],
  async (req, res) => {
    try {
      const { name, email, password, role, students } = req.body;

      // 检查邮箱是否已存在
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: '该邮箱已被注册'
        });
      }

      // 创建新用户
      const user = new User({
        name,
        email,
        password,
        role,
        students: students || []
      });

      await user.save();

      // 生成JWT令牌
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.status(201).json({
        success: true,
        data: {
          user,
          token
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
);

// 用户登录
router.post('/login',
  [
    body('email').isEmail().withMessage('邮箱格式不正确'),
    body('password').notEmpty().withMessage('密码不能为空')
  ],
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // 查找用户
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: '用户不存在'
        });
      }

      // 验证密码
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: '密码错误'
        });
      }

      // 生成JWT令牌
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.status(200).json({
        success: true,
        data: {
          user,
          token
        }
      });
    } catch (error) {
      console.error('登录失败:', error);
      res.status(500).json({
        success: false,
        message: '服务器错误'
      });
    }
  }
);

// 获取当前用户信息
router.get('/me', auth, async (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user
    }
  });
});

// 更新用户信息
router.patch('/me', auth,
  [
    body('name').optional().trim().notEmpty().withMessage('姓名不能为空'),
    body('students').optional().isArray().withMessage('学生信息格式错误')
  ],
  async (req, res) => {
    try {
      const updates = ['name', 'students'];
      const allowedUpdates = updates.filter(update => req.body[update] !== undefined);

      allowedUpdates.forEach(update => {
        req.user[update] = req.body[update];
      });

      await req.user.save();

      res.json({
        success: true,
        data: {
          user: req.user
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
);

module.exports = router;
