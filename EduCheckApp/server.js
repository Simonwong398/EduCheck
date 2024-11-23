require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const redis = require('redis');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const multer = require('multer');
const upload = multer({ dest: './uploads/' });

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

// 安全配置
app.use((req, res, next) => {
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

// 连接MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
}).catch((err) => {
  console.error('MongoDB connection error', err);
});

// Redis客户端
const redisClient = redis.createClient();
redisClient.on('error', (err) => {
  console.error('Redis error', err);
});

// JWT密钥（建议使用环境变量）
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

// 授权中间件
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }

      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

// 角色授权中间件
const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: '权限不足' });
    }
    next();
  };
};

// 用户模型
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  points: { type: Number, default: 0 },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
  interests: [{ type: String }],
  achievements: [{
    achievementId: { type: mongoose.Schema.Types.ObjectId, ref: 'Achievement' },
    unlockedAt: { type: Date, default: Date.now }
  }],
  completedTasks: [{
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    completedAt: { type: Date, default: Date.now }
  }]
});

const User = mongoose.model('User', UserSchema);

// 成就模型
const AchievementSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  points: { type: Number, default: 0 },
  icon: { type: String, default: '' },
  category: { type: String, enum: ['学习', '互动', '进步'], required: true }
});

const Achievement = mongoose.model('Achievement', AchievementSchema);

// 任务模型
const TaskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  points: { type: Number, default: 0 },
  category: { type: String, enum: ['学习', '练习', '视频', '互动', '阅读'], required: true },
  difficulty: { type: String, enum: ['简单', '中等', '困难'], default: '中等' }
});

const Task = mongoose.model('Task', TaskSchema);

// 重置密码令牌模型
const PasswordResetToken = mongoose.model('PasswordResetToken', new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: '1h' }
}));

// 令牌验证中间件
const validateResetToken = async (req, res, next) => {
  const { token } = req.params;
  
  try {
    const resetToken = await PasswordResetToken.findOne({ token }).populate('userId');
    
    if (!resetToken) {
      return res.status(400).json({ message: '无效或已过期的重置令牌' });
    }

    req.user = resetToken.userId;
    next();
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
};

// 配置邮件服务
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// 用户注册路由
app.post('/register', [
  body('username')
    .trim()
    .isLength({ min: 3, max: 20 }).withMessage('用户名长度必须在3-20个字符之间')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('用户名只能包含字母、数字和下划线'),
  body('password')
    .isLength({ min: 6 }).withMessage('密码至少6位')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/)
    .withMessage('密码必须包含字母和数字')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;

  try {
    // 检查用户是否已存在
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: '用户名已存在' });
    }

    // 密码哈希
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 创建新用户
    const newUser = new User({
      username,
      password: hashedPassword,
      points: 0,
      role: 'student'
    });

    await newUser.save();

    res.status(201).json({ message: '注册成功' });
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 用户登录路由
app.post('/login', [
  body('username').trim().notEmpty().withMessage('用户名不能为空'),
  body('password').notEmpty().withMessage('密码不能为空')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;

  try {
    // 查找用户
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: '用户不存在' });
    }

    // 验证密码
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: '密码错误' });
    }

    // 生成JWT
    const token = jwt.sign(
      { 
        userId: user._id, 
        username: user.username, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      userId: user._id,
      username: user.username,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 重置密码请求路由
app.post('/reset-password', [
  body('email').isEmail().withMessage('无效的邮箱地址')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: '未找到该邮箱对应的用户' });
    }

    // 生成重置令牌
    const token = crypto.randomBytes(32).toString('hex');
    
    // 创建重置令牌记录
    const resetToken = new PasswordResetToken({
      userId: user._id,
      token
    });
    await resetToken.save();

    // 发送重置邮件
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    await transporter.sendMail({
      from: '"EduCheck" <noreply@educheck.com>',
      to: email,
      subject: 'EduCheck - 密码重置',
      html: `
        <p>您收到这封邮件是因为您申请了密码重置。</p>
        <p>请点击以下链接重置您的密码：</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>如果您没有申请密码重置，请忽略此邮件。</p>
      `
    });

    res.status(200).json({ message: '密码重置链接已发送' });
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 确认重置密码路由
app.post('/reset-password/:token', [
  body('newPassword')
    .isLength({ min: 6 }).withMessage('密码至少6位')
    .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/)
    .withMessage('密码必须包含字母和数字')
], validateResetToken, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { newPassword } = req.body;
  const user = req.user;

  try {
    // 密码哈希
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 更新用户密码
    user.password = hashedPassword;
    await user.save();

    // 删除重置令牌
    await PasswordResetToken.deleteMany({ userId: user._id });

    res.status(200).json({ message: '密码重置成功' });
  } catch (error) {
    res.status(500).json({ message: '服务器错误' });
  }
});

// 令牌验证路由
app.get('/validate-token/:token', validateResetToken, (req, res) => {
  res.status(200).json({ 
    valid: true,
    message: '令牌有效' 
  });
});

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// 分析学生提交的数据
function analyzeSubmission(answers) {
  return answers.map((answer, index) => {
    if (!answer) {
      return `请检查第${index + 1}题的答案。`;
    }
    // 可以添加更多复杂的分析逻辑
    return null;
  }).filter(Boolean);
}

// 提交作业后的反馈端点
app.post('/submit-assignment', [
  body('studentId').isString().notEmpty(),
  body('answers').isArray().notEmpty(),
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { studentId, answers } = req.body;
  const hints = analyzeSubmission(answers);
  res.json({ hints });
});

// 定义反思记录的模型
const Reflection = mongoose.model('Reflection', new mongoose.Schema({
  userId: { type: String, required: true },
  reflection: { type: String, required: true },
  date: { type: Date, default: Date.now },
}));

// 存储反思记录的函数
const saveReflectionToDatabase = async (userId, reflection) => {
  const newReflection = new Reflection({ userId, reflection });
  await newReflection.save();
};

// 提交反思的端点
app.post('/submit-reflection', [
  body('userId').isString().notEmpty(),
  body('reflection').isString().notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { userId, reflection } = req.body;
  try {
    await saveReflectionToDatabase(userId, reflection);
    res.status(200).send('反思记录已保存');
  } catch (err) {
    console.error('保存反思记录失败', err);
    res.status(500).send('保存失败');
  }
});

// 积分系统
const addPoints = async (userId, points) => {
  return await User.findByIdAndUpdate(userId, { $inc: { points } }, { new: true });
};

app.post('/complete-task', 
  authenticateJWT, 
  [
    body('userId').isString().notEmpty(),
    body('taskPoints').isInt({ min: 1 }),
  ], 
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userId, taskPoints } = req.body;
    try {
      // 确保只能操作自己的用户数据
      if (req.user.userId !== userId) {
        return res.status(403).json({ message: '无权操作' });
      }

      const updatedUser = await addPoints(userId, taskPoints);
      res.status(200).json({ message: '积分已增加', points: updatedUser.points });
    } catch (err) {
      console.error('增加积分失败', err);
      res.status(500).json({ message: '操作失败' });
    }
  }
);

// 成就系统
const unlockAchievement = async (userId, achievementType) => {
  return await Achievement.findOneAndUpdate(
    { userId, type: achievementType },
    { unlocked: true, dateUnlocked: new Date() },
    { new: true, upsert: true }
  );
};

app.post('/unlock-achievement', [
  body('userId').isString().notEmpty(),
  body('achievementType').isString().notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { userId, achievementType } = req.body;
  try {
    const updatedAchievement = await unlockAchievement(userId, achievementType);
    res.status(200).json({ message: '成就已解锁', achievement: updatedAchievement });
  } catch (err) {
    console.error('解锁成就失败', err);
    res.status(500).json({ message: '操作失败' });
  }
});

// 竞赛管理
const Competition = mongoose.model('Competition', new mongoose.Schema({
  name: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}));

app.post('/create-competition', [
  body('name').isString().notEmpty(),
  body('startDate').isISO8601().toDate(),
  body('endDate').isISO8601().toDate(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, startDate, endDate } = req.body;
  const newCompetition = new Competition({ name, startDate, endDate });
  try {
    await newCompetition.save();
    res.status(200).json({ message: '竞赛已创建', competition: newCompetition });
  } catch (err) {
    console.error('创建竞赛失败', err);
    res.status(500).json({ message: '操作失败' });
  }
});

app.post('/join-competition', [
  body('userId').isString().notEmpty(),
  body('competitionId').isString().notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { userId, competitionId } = req.body;
  try {
    await Competition.findByIdAndUpdate(competitionId, { $push: { participants: userId } });
    res.status(200).json({ message: '已加入竞赛' });
  } catch (err) {
    console.error('加入竞赛失败', err);
    res.status(500).json({ message: '操作失败' });
  }
});

// 管理员专用API
app.get('/admin/users', 
  authenticateJWT, 
  authorizeRole(['admin']), 
  async (req, res) => {
    try {
      const users = await User.find({}, '-password');
      res.json(users);
    } catch (err) {
      res.status(500).json({ message: '获取用户列表失败' });
    }
  }
);

// 用户资料路由
app.get('/user/profile', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: '获取用户资料失败' });
  }
});

app.put('/user/profile', authenticateJWT, upload.single('avatar'), async (req, res) => {
  try {
    const { username, email, bio, interests } = JSON.parse(req.body.username);
    
    const updateData = { 
      username, 
      email, 
      bio, 
      interests 
    };

    if (req.file) {
      updateData.avatar = req.file.path;
    }

    const user = await User.findByIdAndUpdate(
      req.user.userId, 
      updateData, 
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: '更新用户资料失败' });
  }
});

// 游戏化路由
app.get('/gamification/daily-tasks', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const dailyTasks = await Task.find({ category: { $in: ['学习', '练习', '视频', '互动', '阅读'] } });
    
    res.json({
      dailyTasks,
      completedTasks: user.completedTasks,
      totalPoints: user.points
    });
  } catch (error) {
    res.status(500).json({ message: '获取每日任务失败' });
  }
});

app.post('/gamification/complete-task', authenticateJWT, async (req, res) => {
  try {
    const { taskId } = req.body;
    const task = await Task.findById(taskId);
    
    if (!task) {
      return res.status(404).json({ message: '任务不存在' });
    }

    const user = await User.findById(req.user.userId);
    
    // 防止重复完成任务
    const isTaskCompleted = user.completedTasks.some(
      t => t.taskId.toString() === taskId
    );

    if (isTaskCompleted) {
      return res.status(400).json({ message: '任务已完成' });
    }

    // 更新用户积分和完成任务
    user.points += task.points;
    user.completedTasks.push({ taskId });
    await user.save();

    res.json({ 
      message: '任务完成', 
      totalPoints: user.points 
    });
  } catch (error) {
    res.status(500).json({ message: '完成任务失败' });
  }
});

app.get('/gamification/achievements', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const availableAchievements = await Achievement.find();
    
    res.json({
      availableAchievements,
      userAchievements: user.achievements
    });
  } catch (error) {
    res.status(500).json({ message: '获取成就失败' });
  }
});

app.get('/gamification/check-achievements', authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const achievements = await Achievement.find();
    const unlockedAchievements = [];

    // 检查并解锁成就
    for (const achievement of achievements) {
      const isUnlocked = checkAchievementCondition(user, achievement);
      
      if (isUnlocked && !user.achievements.some(a => a.achievementId.toString() === achievement._id.toString())) {
        user.achievements.push({ 
          achievementId: achievement._id 
        });
        unlockedAchievements.push(achievement);
      }
    }

    await user.save();

    res.json({ unlockedAchievements });
  } catch (error) {
    res.status(500).json({ message: '检查成就失败' });
  }
});

// 成就解锁条件检查函数
function checkAchievementCondition(user, achievement) {
  switch (achievement.name) {
    case '学习新手':
      return user.completedTasks.length > 0;
    case '知识猎人':
      // 连续7天学习的逻辑
      return false; // 需要更复杂的日期计算
    case '多面学习者':
      const uniqueCategories = new Set(
        user.completedTasks.map(task => task.category)
      );
      return uniqueCategories.size >= 3;
    default:
      return false;
  }
}

// 统一错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// 启动服务器
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
