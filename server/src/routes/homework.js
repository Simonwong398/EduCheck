const express = require('express');
const router = express.Router();
const multer = require('multer');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const Homework = require('../models/Homework');
const { analyzeHomework } = require('../services/homeworkAnalysis');
const { uploadToCloudinary } = require('../services/cloudinary');

// 配置multer
const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024 // 限制5MB
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('请上传jpg、jpeg或png格式的图片'));
    }
    cb(null, true);
  }
});

// 上传并分析作业
router.post('/',
  auth,
  upload.single('image'),
  [
    body('studentName').trim().notEmpty().withMessage('学生姓名不能为空'),
    body('subject').trim().notEmpty().withMessage('科目不能为空'),
    body('grade').optional().trim(),
    body('class').optional().trim()
  ],
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: '请上传作业图片'
        });
      }

      // 上传图片到Cloudinary
      const imageUrl = await uploadToCloudinary(req.file.buffer);

      // 创建作业记录
      const homework = new Homework({
        student: {
          name: req.body.studentName,
          grade: req.body.grade,
          class: req.body.class
        },
        subject: req.body.subject,
        imageUrl,
        submittedBy: req.user._id
      });

      // 分析作业
      const analysis = await analyzeHomework(imageUrl, req.body.subject);
      homework.analysis = analysis;
      homework.status = 'analyzed';

      await homework.save();

      res.status(201).json({
        success: true,
        data: {
          homework
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

// 获取作业列表
router.get('/', auth, async (req, res) => {
  try {
    const match = { submittedBy: req.user._id };
    
    // 筛选条件
    if (req.query.status) {
      match.status = req.query.status;
    }
    if (req.query.studentName) {
      match['student.name'] = new RegExp(req.query.studentName, 'i');
    }
    if (req.query.subject) {
      match.subject = req.query.subject;
    }

    // 分页
    const limit = parseInt(req.query.limit) || 10;
    const skip = parseInt(req.query.skip) || 0;

    const homeworks = await Homework.find(match)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Homework.countDocuments(match);

    res.json({
      success: true,
      data: {
        homeworks,
        total,
        limit,
        skip
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// 获取单个作业详情
router.get('/:id', auth, async (req, res) => {
  try {
    const homework = await Homework.findOne({
      _id: req.params.id,
      submittedBy: req.user._id
    });

    if (!homework) {
      return res.status(404).json({
        success: false,
        message: '作业不存在'
      });
    }

    res.json({
      success: true,
      data: {
        homework
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// 更新作业状态
router.patch('/:id', auth, async (req, res) => {
  try {
    const homework = await Homework.findOne({
      _id: req.params.id,
      submittedBy: req.user._id
    });

    if (!homework) {
      return res.status(404).json({
        success: false,
        message: '作业不存在'
      });
    }

    if (req.body.status) {
      homework.status = req.body.status;
    }

    await homework.save();

    res.json({
      success: true,
      data: {
        homework
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
