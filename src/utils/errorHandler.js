import { reportError } from '../services/errorReporting';

// 网络请求错误处理
export const handleNetworkError = (error, context = {}) => {
  const defaultContext = {
    type: 'NetworkError',
    timestamp: new Date().toISOString()
  };

  const mergedContext = { ...defaultContext, ...context };

  // 根据错误类型进行不同处理
  if (error.response) {
    // 服务器返回错误
    mergedContext.status = error.response.status;
    mergedContext.data = error.response.data;
  } else if (error.request) {
    // 请求发送失败
    mergedContext.requestFailed = true;
  } else {
    // 其他类型错误
    mergedContext.message = error.message;
  }

  // 上报错误
  reportError(error, mergedContext);

  // 返回友好的错误消息
  return {
    success: false,
    message: '网络请求发生错误，请稍后重试',
    details: mergedContext
  };
};

// 表单验证错误处理
export const handleValidationError = (errors, context = {}) => {
  const defaultContext = {
    type: 'ValidationError',
    timestamp: new Date().toISOString()
  };

  const mergedContext = { ...defaultContext, ...context, errors };

  // 上报验证错误
  reportError(new Error('Validation Error'), mergedContext);

  return {
    success: false,
    message: '表单验证未通过',
    errors: errors
  };
};

// 业务逻辑错误处理
export const handleBusinessError = (error, context = {}) => {
  const defaultContext = {
    type: 'BusinessError',
    timestamp: new Date().toISOString()
  };

  const mergedContext = { ...defaultContext, ...context };

  // 上报业务错误
  reportError(error, mergedContext);

  return {
    success: false,
    message: error.message || '业务处理发生错误',
    details: mergedContext
  };
};

// 全局异常捕获
export const globalErrorHandler = (error, info) => {
  const context = {
    type: 'UnhandledError',
    componentStack: info.componentStack,
    timestamp: new Date().toISOString()
  };

  // 上报全局异常
  reportError(error, context);

  // 可以根据需要返回一些处理建议
  return {
    message: '系统发生未知错误',
    suggestion: '请刷新页面或稍后重试'
  };
};

// 异步错误处理装饰器
export const withErrorHandling = (fn) => async (...args) => {
  try {
    return await fn(...args);
  } catch (error) {
    // 根据错误类型选择合适的处理方法
    if (error.isAxiosError) {
      return handleNetworkError(error);
    } else if (error.name === 'ValidationError') {
      return handleValidationError(error.errors);
    } else {
      return handleBusinessError(error);
    }
  }
};

// 日志记录函数
export const logError = (error, context = {}) => {
  console.error('Error Log:', error, context);
  
  // 在开发环境提供详细日志
  if (process.env.NODE_ENV === 'development') {
    console.table({
      Message: error.message,
      Name: error.name,
      Context: JSON.stringify(context)
    });
  }
};
