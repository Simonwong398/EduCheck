import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '../../contexts/AuthContext';
import RecommendedCourses from '../../components/RecommendedCourses';
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

describe('RecommendedCourses Component', () => {
  const mockCourses = [
    {
      _id: '1',
      title: '机器学习入门',
      description: '零基础学习机器学习',
      difficulty: '初级',
      tags: ['AI', '编程'],
      rating: 4.5,
      enrolled: false
    },
    {
      _id: '2',
      title: '高级数据分析',
      description: '深入数据科学技术',
      difficulty: '高级',
      tags: ['数据科学', '统计'],
      rating: 4.8,
      enrolled: false
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders recommended courses successfully', async () => {
    // Mock successful courses fetch
    axios.get.mockResolvedValueOnce({ data: mockCourses });

    render(
      <AuthProvider>
        <RecommendedCourses />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('机器学习入门')).toBeInTheDocument();
      expect(screen.getByText('高级数据分析')).toBeInTheDocument();
    });
  });

  test('handles course enrollment', async () => {
    // Mock courses and enrollment
    axios.get.mockResolvedValueOnce({ data: mockCourses });
    axios.post.mockResolvedValueOnce({ data: { success: true } });

    render(
      <AuthProvider>
        <RecommendedCourses />
      </AuthProvider>
    );

    await waitFor(() => {
      const enrollButtons = screen.getAllByText('立即报名');
      fireEvent.click(enrollButtons[0]);
    });

    await waitFor(() => {
      const enrolledButton = screen.getByText('已报名');
      expect(enrolledButton).toBeInTheDocument();
    });
  });

  test('displays error message when courses fetch fails', async () => {
    // Mock failed courses fetch
    axios.get.mockRejectedValueOnce(new Error('Network Error'));

    render(
      <AuthProvider>
        <RecommendedCourses />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('推荐课程加载失败')).toBeInTheDocument();
    });
  });

  test('shows "暂无推荐课程" when no courses available', async () => {
    // Mock empty courses list
    axios.get.mockResolvedValueOnce({ data: [] });

    render(
      <AuthProvider>
        <RecommendedCourses />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('暂无推荐课程')).toBeInTheDocument();
    });
  });

  test('course card displays correct information', async () => {
    // Mock courses fetch
    axios.get.mockResolvedValueOnce({ data: mockCourses });

    render(
      <AuthProvider>
        <RecommendedCourses />
      </AuthProvider>
    );

    await waitFor(() => {
      const firstCourse = mockCourses[0];
      expect(screen.getByText(firstCourse.title)).toBeInTheDocument();
      expect(screen.getByText(firstCourse.description)).toBeInTheDocument();
      expect(screen.getByText(`难度：${firstCourse.difficulty}`)).toBeInTheDocument();
      expect(screen.getByText(`⭐ ${firstCourse.rating}/5`)).toBeInTheDocument();
    });
  });
});
