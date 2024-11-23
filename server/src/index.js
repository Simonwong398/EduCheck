require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// 中间件配置
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由配置
app.use('/api', routes);

// 错误处理中间件
app.use(errorHandler);

// 数据库连接
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB连接成功');
  // 启动服务器
  app.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
  });
})
.catch((error) => {
  console.error('MongoDB连接失败:', error);
  process.exit(1);
});
