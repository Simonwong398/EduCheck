const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 身份验证中间件
const authMiddleware = async (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      success: false,
      message: '未提供身份验证令牌'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '无效的身份验证令牌'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('身份验证失败:', error);
    res.status(401).json({
      success: false,
      message: '身份验证失败'
    });
  }
};

// 角色检查中间件
const roleCheckMiddleware = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: '无权限访问此资源'
      });
    }
    next();
  };
};

module.exports = {
  authMiddleware,
  roleCheckMiddleware
};
