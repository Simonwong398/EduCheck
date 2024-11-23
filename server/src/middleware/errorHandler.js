const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: '数据验证失败',
      errors: Object.values(err.errors).map(error => error.message)
    });
  }

  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: '数据重复',
      field: Object.keys(err.keyPattern)[0]
    });
  }

  res.status(500).json({
    success: false,
    message: '服务器内部错误'
  });
};

module.exports = errorHandler;
