import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

const initSentryErrorReporting = () => {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    integrations: [new BrowserTracing()],
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    environment: process.env.NODE_ENV,
    release: process.env.REACT_APP_VERSION || 'dev',
    
    // 性能监控配置
    tracePropagationTargets: [
      "localhost", 
      /^https:\/\/educheck\.com/
    ],

    // 错误过滤和处理
    beforeSend(event, hint) {
      // 可以在此处添加额外的错误过滤逻辑
      const error = hint.originalException;
      
      // 过滤敏感信息
      if (error instanceof Error) {
        // 移除可能包含敏感信息的错误堆栈
        event.exception.values[0].stacktrace = null;
      }

      return event;
    },

    // 错误上下文信息
    beforeBreadcrumb(breadcrumb, hint) {
      // 添加额外的上下文信息
      if (breadcrumb.category === 'console') {
        breadcrumb.data = {
          ...breadcrumb.data,
          userId: localStorage.getItem('userId'),
          appVersion: process.env.REACT_APP_VERSION
        };
      }
      return breadcrumb;
    }
  });
};

// 自定义错误报告函数
export const reportError = (error, context = {}) => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.withScope((scope) => {
      // 添加额外的上下文信息
      Object.keys(context).forEach(key => {
        scope.setExtra(key, context[key]);
      });

      // 捕获并发送错误
      Sentry.captureException(error);
    });
  } else {
    // 开发环境详细日志
    console.error('Error Report:', error, context);
  }
};

// 性能追踪函数
export const startTransaction = (name) => {
  return Sentry.startTransaction({ name });
};

export default initSentryErrorReporting;
