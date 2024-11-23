import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import PropTypes from 'prop-types';
import ErrorFallback from './ErrorFallback';

const GlobalErrorBoundary = ({ children }) => {
  const handleError = (error, errorInfo) => {
    // 记录错误日志
    console.error('Caught an error:', error, errorInfo);
    
    // TODO: 集成错误监控服务（如Sentry）
    // Sentry.captureException(error);
  };

  return (
    <ErrorBoundary 
      FallbackComponent={ErrorFallback}
      onError={handleError}
      onReset={() => {
        // 可以在这里执行重置逻辑
        window.location.reload();
      }}
    >
      {children}
    </ErrorBoundary>
  );
};

GlobalErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired
};

export default GlobalErrorBoundary;
