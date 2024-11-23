import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { HelmetProvider } from 'react-helmet-async';

// 错误边界和错误报告
import GlobalErrorBoundary from './components/ErrorBoundary/GlobalErrorBoundary';
import initSentryErrorReporting, { reportError } from './services/errorReporting';

// 性能监控和性能优化
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';

// 懒加载页面组件
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const CourseList = lazy(() => import('./pages/CourseList'));
const Profile = lazy(() => import('./pages/Profile'));

// 加载指示器组件
const LoadingIndicator = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh' 
  }}>
    加载中...
  </div>
);

// 初始化主题
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif'
    ].join(','),
  }
});

// 应用程序初始化
const initializeApp = () => {
  try {
    // 初始化Sentry错误监控
    initSentryErrorReporting();

    // 其他初始化逻辑
    // 例如：检查用户认证状态、加载全局配置等
  } catch (error) {
    // 报告初始化错误
    reportError(error, { 
      context: 'App Initialization', 
      severity: 'critical' 
    });
  }
};

const App = () => {
  // 应用程序初始化
  React.useEffect(() => {
    initializeApp();
  }, []);

  return (
    <HelmetProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalErrorBoundary>
          <Suspense fallback={<LoadingIndicator />}>
            <Router>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/courses" element={<CourseList />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </Router>
          </Suspense>
        </GlobalErrorBoundary>
        
        {/* 性能监控 */}
        <SpeedInsights />
        <Analytics />
      </ThemeProvider>
    </HelmetProvider>
  );
};

export default App;
