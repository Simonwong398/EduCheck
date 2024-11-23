import React from 'react';
import PropTypes from 'prop-types';
import { Button, Typography, Box, Container, Alert } from '@mui/material';

const ErrorFallback = ({ error, resetErrorBoundary }) => {
  const handleReportError = () => {
    // 发送错误报告到监控系统
    console.error('错误报告:', error);
    // TODO: 集成Sentry或其他错误追踪服务
  };

  return (
    <Container maxWidth="sm">
      <Box 
        sx={{
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center'
        }}
      >
        <Alert 
          severity="error" 
          sx={{ 
            width: '100%', 
            marginBottom: 2,
            backgroundColor: '#ffebee',
            color: '#d32f2f'
          }}
        >
          <Typography variant="h5" gutterBottom>
            系统遇到了一个意外错误
          </Typography>
        </Alert>

        <Box 
          sx={{
            backgroundColor: '#f5f5f5',
            padding: 3,
            borderRadius: 2,
            marginBottom: 2,
            width: '100%'
          }}
        >
          <Typography variant="body1" color="error" gutterBottom>
            错误信息：{error.message}
          </Typography>
          {process.env.NODE_ENV === 'development' && (
            <Typography variant="caption" color="textSecondary">
              技术细节：{error.stack}
            </Typography>
          )}
        </Box>

        <Box 
          sx={{
            display: 'flex', 
            justifyContent: 'center', 
            gap: 2
          }}
        >
          <Button 
            variant="contained" 
            color="primary" 
            onClick={resetErrorBoundary}
          >
            重新加载页面
          </Button>
          <Button 
            variant="outlined" 
            color="secondary" 
            onClick={handleReportError}
          >
            报告错误
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

ErrorFallback.propTypes = {
  error: PropTypes.instanceOf(Error).isRequired,
  resetErrorBoundary: PropTypes.func.isRequired
};

export default ErrorFallback;
