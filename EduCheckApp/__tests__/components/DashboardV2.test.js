import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '../../contexts/AuthContext';
import DashboardV2 from '../../components/DashboardV2';
import axios from '../../utils/axiosConfig';

// Mock axios and AuthContext
jest.mock('../../utils/axiosConfig');
jest.mock('../../contexts/AuthContext', () => ({
  ...jest.requireActual('../../contexts/AuthContext'),
  useAuth: () => ({
    user: {
      username: 'TestUser',
      id: '123'
    }
  })
}));

describe('DashboardV2 Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  test('renders dashboard with user data', async () => {
    // Mock successful dashboard data fetch
    axios.get.mockResolvedValueOnce({
      data: {
        learningProgress: 65,
        totalPoints: 1200,
        completedTasks: 15,
        unlockedAchievements: 7
      }
    });

    render(
      <AuthProvider>
        <DashboardV2 />
      </AuthProvider>
    );

    // Wait for dashboard to load
    await waitFor(() => {
      expect(screen.getByText(/欢迎回来, TestUser/i)).toBeInTheDocument();
      expect(screen.getByText('65%')).toBeInTheDocument();
      expect(screen.getByText('1200')).toBeInTheDocument();
    });
  });

  test('handles dashboard data fetch error', async () => {
    // Mock failed dashboard data fetch
    axios.get.mockRejectedValueOnce(new Error('Network Error'));

    render(
      <AuthProvider>
        <DashboardV2 />
      </AuthProvider>
    );

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText('仪表盘数据加载失败')).toBeInTheDocument();
    });
  });

  test('lazy loaded components render correctly', async () => {
    // Mock dashboard data and lazy loaded components
    axios.get.mockResolvedValueOnce({
      data: {
        learningProgress: 65,
        totalPoints: 1200,
        completedTasks: 15,
        unlockedAchievements: 7
      }
    });

    render(
      <AuthProvider>
        <DashboardV2 />
      </AuthProvider>
    );

    // Wait for lazy loaded sections
    await waitFor(() => {
      expect(screen.getByText('个人成就')).toBeInTheDocument();
      expect(screen.getByText('社交学习')).toBeInTheDocument();
      expect(screen.getByText('推荐课程')).toBeInTheDocument();
    });
  });

  test('progress bar color changes based on progress', async () => {
    // Mock dashboard data with different progress levels
    axios.get.mockResolvedValueOnce({
      data: {
        learningProgress: 30,
        totalPoints: 500,
        completedTasks: 5,
        unlockedAchievements: 2
      }
    });

    render(
      <AuthProvider>
        <DashboardV2 />
      </AuthProvider>
    );

    await waitFor(() => {
      const progressBar = screen.getByText('30%').previousSibling;
      expect(progressBar).toHaveStyle('backgroundColor: #FF9800');
    });

    // Cleanup and re-render with high progress
    jest.clearAllMocks();
    axios.get.mockResolvedValueOnce({
      data: {
        learningProgress: 75,
        totalPoints: 1500,
        completedTasks: 20,
        unlockedAchievements: 10
      }
    });

    render(
      <AuthProvider>
        <DashboardV2 />
      </AuthProvider>
    );

    await waitFor(() => {
      const progressBar = screen.getByText('75%').previousSibling;
      expect(progressBar).toHaveStyle('backgroundColor: #4CAF50');
    });
  });
});
