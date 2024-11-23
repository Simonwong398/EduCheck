import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from '../utils/axiosConfig';
import { useAuth } from '../contexts/AuthContext';
import ErrorMessage from './ErrorMessage';
import LoadingSpinner from './LoadingSpinner';

function RecommendedCourses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecommendedCourses = async () => {
      try {
        const response = await axios.get('/recommendations/courses');
        setCourses(response.data);
        setLoading(false);
      } catch (err) {
        setError('推荐课程加载失败');
        setLoading(false);
      }
    };

    fetchRecommendedCourses();
  }, []);

  const handleCourseEnroll = async (courseId) => {
    try {
      await axios.post('/courses/enroll', { courseId });
      // 更新课程状态或重新获取推荐
      const updatedCourses = courses.map(course => 
        course._id === courseId 
          ? { ...course, enrolled: true } 
          : course
      );
      setCourses(updatedCourses);
    } catch (err) {
      setError('课程报名失败');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="recommended-courses">
      {courses.length === 0 ? (
        <div>暂无推荐课程</div>
      ) : (
        courses.map(course => (
          <motion.div
            key={course._id}
            whileHover={{ scale: 1.05 }}
            className="course-card"
          >
            <div className="course-header">
              <h3>{course.title}</h3>
              <span className="course-difficulty">
                难度：{course.difficulty}
              </span>
            </div>
            <div className="course-description">
              {course.description}
            </div>
            <div className="course-tags">
              {course.tags.map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
            <div className="course-actions">
              <button 
                onClick={() => handleCourseEnroll(course._id)}
                disabled={course.enrolled}
                className={course.enrolled ? 'enrolled' : ''}
              >
                {course.enrolled ? '已报名' : '立即报名'}
              </button>
              <span className="course-rating">
                ⭐ {course.rating}/5
              </span>
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
}

export default RecommendedCourses;
